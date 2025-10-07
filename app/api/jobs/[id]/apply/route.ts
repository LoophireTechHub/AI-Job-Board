import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for job application submission
const applicationSchema = z.object({
  candidate_profile_id: z.string().uuid().optional(),
  candidate_name: z.string().min(1).max(255),
  candidate_email: z.string().email(),
  candidate_phone: z.string().optional(),
  resume_url: z.string().url().optional(),
  cover_letter: z.string().max(5000).optional(),
});

// POST /api/jobs/[id]/apply - Submit an application to a job
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: jobId } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = applicationSchema.parse(body);

    // Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, title, status')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'active') {
      return NextResponse.json(
        { error: 'This job is not accepting applications' },
        { status: 400 }
      );
    }

    // Check if candidate has already applied (by email)
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('candidate_email', validatedData.candidate_email)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      );
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        ...validatedData,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    // Log application submission
    await supabase.from('audit_logs').insert({
      entity_type: 'application',
      entity_id: application.id,
      action: 'application_submitted',
      metadata: {
        job_id: jobId,
        job_title: job.title,
        candidate_email: validatedData.candidate_email,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
