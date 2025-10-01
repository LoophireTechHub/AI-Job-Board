// API Route: Interview Session Management

import { NextRequest, NextResponse } from 'next/server';
import { InterviewConversationManager } from '@/lib/claude/conversation-manager';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { StartInterviewSessionRequest, SubmitAnswerRequest } from '@/types/api';
import { Question } from '@/types/database';

// POST: Start a new interview session
export async function POST(req: NextRequest) {
  try {
    const body: StartInterviewSessionRequest = await req.json();

    if (!body.applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'applicationId is required',
        },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get application and job details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*, jobs(*)')
      .eq('id', body.applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        {
          success: false,
          error: 'Application not found',
        },
        { status: 404 }
      );
    }

    // Get question template for the job
    const { data: questionTemplate, error: qtError } = await supabase
      .from('question_templates')
      .select('*')
      .eq('job_id', application.job_id)
      .eq('is_active', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (qtError || !questionTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: 'No question template found for this job. Please generate questions first.',
        },
        { status: 404 }
      );
    }

    // Initialize conversation manager
    const manager = new InterviewConversationManager(
      application.candidate_name,
      questionTemplate.questions as Question[]
    );

    const { message, questionId, tokensUsed } = await manager.getOpeningMessage();

    // Create interview session in database
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        application_id: body.applicationId,
        session_type: body.sessionType || 'screening',
        status: 'in_progress',
        conversation_history: manager.getHistory(),
        current_question_index: 0,
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Log the AI interaction
    await supabase.from('audit_logs').insert({
      entity_type: 'interview_session',
      entity_id: session.id,
      action: 'start_session',
      ai_model_used: 'claude-3-5-haiku-20241022',
      tokens_used: tokensUsed,
      metadata: {
        application_id: body.applicationId,
        session_type: body.sessionType,
        total_questions: questionTemplate.questions.length,
      },
    });

    // Find the first question
    const firstQuestion = (questionTemplate.questions as Question[]).find(q => q.id === questionId);

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      message,
      firstQuestion: firstQuestion ? {
        id: firstQuestion.id,
        text: firstQuestion.text,
        type: firstQuestion.type,
      } : null,
      totalQuestions: questionTemplate.questions.length,
      progress: 0,
    });
  } catch (error) {
    console.error('Error starting interview session:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to start interview session',
      },
      { status: 500 }
    );
  }
}

// PUT: Submit an answer and get next question
export async function PUT(req: NextRequest) {
  try {
    const body: SubmitAnswerRequest = await req.json();

    if (!body.sessionId || !body.answer) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId and answer are required',
        },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Get session and related data
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*, applications(candidate_name, job_id)')
      .eq('id', body.sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found',
        },
        { status: 404 }
      );
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json(
        {
          success: false,
          error: 'Session is not in progress',
        },
        { status: 400 }
      );
    }

    // Get question template
    const { data: questionTemplate } = await supabase
      .from('question_templates')
      .select('questions')
      .eq('job_id', session.applications.job_id)
      .eq('is_active', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (!questionTemplate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Question template not found',
        },
        { status: 404 }
      );
    }

    // Restore conversation manager from state
    const manager = InterviewConversationManager.fromState(
      session.applications.candidate_name,
      {
        conversationHistory: session.conversation_history,
        remainingQuestions: questionTemplate.questions.filter(
          (q: Question) => !session.conversation_history.some(
            (msg: any) => msg.metadata?.question_id === q.id
          )
        ),
        currentQuestionId: session.conversation_history[session.conversation_history.length - 1]?.metadata?.question_id || null,
        isFollowUp: false,
      }
    );

    // Process the answer
    const { message, questionId, isFollowUp, tokensUsed } = await manager.processResponse(body.answer);

    const isComplete = manager.isComplete();
    const totalQuestions = (questionTemplate.questions as Question[]).length;
    const progress = manager.getProgress(totalQuestions);

    // Update session in database
    const updateData: any = {
      conversation_history: manager.getHistory(),
      current_question_index: totalQuestions - manager.getRemainingQuestionsCount(),
    };

    if (isComplete) {
      updateData.status = 'completed';
      updateData.completed_at = new Date().toISOString();
    }

    await supabase
      .from('interview_sessions')
      .update(updateData)
      .eq('id', body.sessionId);

    // If we asked a real question (not follow-up), save the response for analysis later
    if (body.questionId && !isFollowUp) {
      const question = (questionTemplate.questions as Question[]).find(q => q.id === body.questionId);

      if (question) {
        // Import analyzer
        const { analyzeInterviewResponse } = await import('@/lib/claude/response-analyzer');

        const analysisResult = await analyzeInterviewResponse({
          questionText: question.text,
          questionType: question.type,
          lookingFor: question.lookingFor,
          scoringKeywords: question.scoringKeywords,
          candidateResponse: body.answer,
          questionWeight: question.weight,
        });

        await supabase.from('ai_responses').insert({
          application_id: session.application_id,
          question_id: body.questionId,
          question_text: question.text,
          candidate_response: body.answer,
          ai_analysis: analysisResult.analysis,
          response_score: analysisResult.analysis.score,
          keywords_matched: analysisResult.analysis.keywordMatches,
        });
      }
    }

    // Log the AI interaction
    await supabase.from('audit_logs').insert({
      entity_type: 'interview_session',
      entity_id: body.sessionId,
      action: 'submit_answer',
      ai_model_used: 'claude-3-5-sonnet-20241022',
      tokens_used: tokensUsed,
      metadata: {
        is_follow_up: isFollowUp,
        is_complete: isComplete,
        progress,
      },
    });

    // Find the next question details if available
    const nextQuestion = questionId
      ? (questionTemplate.questions as Question[]).find(q => q.id === questionId)
      : null;

    const response: any = {
      success: true,
      message,
      isFollowUp,
      nextQuestion: nextQuestion ? {
        id: nextQuestion.id,
        text: nextQuestion.text,
        type: nextQuestion.type,
      } : null,
      isComplete,
      progress,
      questionsRemaining: manager.getRemainingQuestionsCount(),
    };

    // If complete, generate session summary
    if (isComplete) {
      const { data: responses } = await supabase
        .from('ai_responses')
        .select('*')
        .eq('application_id', session.application_id);

      if (responses && responses.length > 0) {
        const totalScore = responses.reduce((sum, r) => sum + (r.response_score || 0), 0) / responses.length;

        await supabase
          .from('interview_sessions')
          .update({ total_score: totalScore })
          .eq('id', body.sessionId);

        response.sessionSummary = {
          totalScore,
          questionsAnswered: responses.length,
          averageScore: totalScore,
        };
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit answer',
      },
      { status: 500 }
    );
  }
}

// GET: Get interview session details
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'sessionId query parameter is required',
        },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('*, applications(candidate_name, candidate_email, jobs(title))')
      .eq('id', sessionId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        sessionType: session.session_type,
        conversationHistory: session.conversation_history,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        totalScore: session.total_score,
        candidate: {
          name: session.applications.candidate_name,
          email: session.applications.candidate_email,
        },
        job: {
          title: session.applications.jobs?.title,
        },
      },
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve session',
      },
      { status: 500 }
    );
  }
}
