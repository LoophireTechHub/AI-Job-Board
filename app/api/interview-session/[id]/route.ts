import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const submitAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  answer: z.string().min(1, 'Answer cannot be empty').max(5000, 'Answer too long'),
});

/**
 * PUT /api/interview-session/[id]
 * Submit candidate answer and get next question
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();

    const body = await request.json();
    const validatedData = submitAnswerSchema.parse(body);

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        applications!inner (
          id,
          job_id
        )
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Interview already completed' },
        { status: 400 }
      );
    }

    // Get question template
    const { data: questionTemplate } = await supabase
      .from('question_templates')
      .select('questions')
      .eq('job_id', session.applications.job_id)
      .single();

    if (!questionTemplate || !questionTemplate.questions) {
      return NextResponse.json(
        { success: false, error: 'Questions not found' },
        { status: 404 }
      );
    }

    const questions = questionTemplate.questions as any[];

    // Add user's answer to conversation history
    const conversationHistory = (session.conversation_history as any[]) || [];
    conversationHistory.push({
      role: 'user',
      content: validatedData.answer,
      timestamp: new Date().toISOString(),
      questionId: validatedData.questionId,
    });

    // TODO: In Issue #39, this will be replaced with Claude AI analysis
    // For now, just move to next question
    const currentIndex = session.current_question_index;
    const nextIndex = currentIndex + 1;

    // Check if interview is complete
    if (nextIndex >= questions.length) {
      // Interview complete
      const completionMessage = "Thank you so much for your time today. We'll review your responses and get back to you within a few days. Best of luck!";

      conversationHistory.push({
        role: 'assistant',
        content: completionMessage,
        timestamp: new Date().toISOString(),
      });

      await supabase
        .from('interview_sessions')
        .update({
          conversation_history: conversationHistory,
          status: 'completed',
          completed_at: new Date().toISOString(),
          current_question_index: nextIndex,
        })
        .eq('id', sessionId);

      // Update application status to 'screening'
      await supabase
        .from('applications')
        .update({ status: 'screening', updated_at: new Date().toISOString() })
        .eq('id', session.application_id);

      // Log completion
      await supabase.from('audit_logs').insert({
        entity_type: 'interview_session',
        entity_id: sessionId,
        action: 'interview_completed',
        metadata: {
          questions_answered: questions.length,
        },
      });

      return NextResponse.json({
        success: true,
        message: completionMessage,
        isComplete: true,
        progress: 100,
        questionsRemaining: 0,
        sessionSummary: {
          questionsAnswered: questions.length,
        },
      });
    }

    // Get next question
    const nextQuestion = questions[nextIndex];

    // TODO: In Issue #39, Claude will generate natural transition message
    const transitionMessage = `That's great, thank you for sharing. Let's move on to the next question:`;

    conversationHistory.push({
      role: 'assistant',
      content: transitionMessage,
      timestamp: new Date().toISOString(),
    });

    conversationHistory.push({
      role: 'assistant',
      content: nextQuestion.text,
      timestamp: new Date().toISOString(),
      questionId: nextQuestion.id,
    });

    // Update session
    await supabase
      .from('interview_sessions')
      .update({
        conversation_history: conversationHistory,
        current_question_index: nextIndex,
      })
      .eq('id', sessionId);

    // Store AI response (placeholder for now, will be replaced in Issue #39)
    await supabase.from('ai_responses').insert({
      application_id: session.application_id,
      question_id: validatedData.questionId,
      question_text: questions[currentIndex].text,
      candidate_response: validatedData.answer,
      ai_analysis: {
        score: 0, // Placeholder
        strengths: [],
        concerns: [],
        needsFollowUp: false,
      },
      response_score: 0,
    });

    const progress = Math.round(((nextIndex) / questions.length) * 100);

    return NextResponse.json({
      success: true,
      message: transitionMessage,
      isFollowUp: false,
      nextQuestion: {
        id: nextQuestion.id,
        text: nextQuestion.text,
        type: nextQuestion.type,
      },
      isComplete: false,
      progress,
      questionsRemaining: questions.length - nextIndex,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
