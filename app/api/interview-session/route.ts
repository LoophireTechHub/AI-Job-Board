import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schemas
const startSessionSchema = z.object({
  applicationId: z.string().uuid('Invalid application ID'),
  sessionType: z.enum(['screening', 'technical', 'behavioral', 'final']).default('screening'),
});

const getSessionSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});

/**
 * POST /api/interview-session
 * Start a new conversational interview session
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get user (candidate) - sessions can be started without auth for public applications
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const validatedData = startSessionSchema.parse(body);

    // Verify application exists
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, job_id, candidate_name, candidate_email, candidate_profile_id')
      .eq('id', validatedData.applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if session already exists for this application
    const { data: existingSession } = await supabase
      .from('interview_sessions')
      .select('id, status')
      .eq('application_id', validatedData.applicationId)
      .eq('session_type', validatedData.sessionType)
      .single();

    if (existingSession) {
      if (existingSession.status === 'completed') {
        return NextResponse.json(
          { success: false, error: 'Interview already completed' },
          { status: 400 }
        );
      }

      // Return existing session if in progress
      return NextResponse.json(
        {
          success: true,
          sessionId: existingSession.id,
          message: 'Resuming existing interview session',
          isResume: true
        },
        { status: 200 }
      );
    }

    // Get question template for the job
    const { data: questionTemplate, error: qtError } = await supabase
      .from('question_templates')
      .select('id, questions')
      .eq('job_id', application.job_id)
      .single();

    if (qtError || !questionTemplate || !questionTemplate.questions) {
      return NextResponse.json(
        { success: false, error: 'Interview questions not generated for this job' },
        { status: 400 }
      );
    }

    const questions = questionTemplate.questions as any[];

    // Create interview session
    const { data: session, error: sessionError} = await supabase
      .from('interview_sessions')
      .insert({
        application_id: validatedData.applicationId,
        session_type: validatedData.sessionType,
        status: 'in_progress',
        conversation_history: [],
        current_question_index: 0,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('Error creating session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create interview session' },
        { status: 500 }
      );
    }

    // Generate initial greeting and first question
    // TODO: This will be replaced with Claude AI conversation manager in Issue #39
    const greeting = `Hi ${application.candidate_name}! Thanks for taking the time to interview with us today. I'll be asking you a few questions to learn more about your experience and qualifications.`;

    const firstQuestion = questions[0];

    // Update session with initial conversation
    const initialConversation = [
      {
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toISOString(),
      },
      {
        role: 'assistant',
        content: firstQuestion.text,
        timestamp: new Date().toISOString(),
        questionId: firstQuestion.id,
      },
    ];

    await supabase
      .from('interview_sessions')
      .update({ conversation_history: initialConversation })
      .eq('id', session.id);

    // Update application status to 'interviewing'
    await supabase
      .from('applications')
      .update({ status: 'interviewing', updated_at: new Date().toISOString() })
      .eq('id', validatedData.applicationId);

    // Log to audit_logs
    await supabase.from('audit_logs').insert({
      entity_type: 'interview_session',
      entity_id: session.id,
      action: 'interview_started',
      metadata: {
        application_id: validatedData.applicationId,
        session_type: validatedData.sessionType,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      message: greeting,
      firstQuestion: {
        id: firstQuestion.id,
        text: firstQuestion.text,
        type: firstQuestion.type,
      },
      totalQuestions: questions.length,
      progress: 0,
    }, { status: 201 });

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

/**
 * GET /api/interview-session?sessionId={sessionId}
 * Retrieve interview session details
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const validatedData = getSessionSchema.parse({
      sessionId: searchParams.get('sessionId'),
    });

    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select(`
        *,
        applications!inner (
          id,
          candidate_name,
          candidate_email,
          jobs!inner (
            id,
            title
          )
        )
      `)
      .eq('id', validatedData.sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        sessionType: session.session_type,
        conversationHistory: session.conversation_history || [],
        currentQuestionIndex: session.current_question_index,
        startedAt: session.started_at,
        completedAt: session.completed_at,
        totalScore: session.total_score,
        candidate: {
          name: session.applications.candidate_name,
          email: session.applications.candidate_email,
        },
        job: {
          id: session.applications.jobs.id,
          title: session.applications.jobs.title,
        },
      },
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
