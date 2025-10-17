import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/applications - Get all applications for the authenticated company
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('applications')
      .select(
        `
        *,
        jobs!inner(id, title, created_by)
      `
      )
      .eq('jobs.created_by', user.id)
      .order('created_at', { ascending: false });

    // Filter by job_id if provided
    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for creating an application
const createApplicationSchema = z.object({
  job_id: z.string().uuid(),
  candidate_profile_id: z.string().uuid().optional(),
  candidate_name: z.string().min(1).max(255),
  candidate_email: z.string().email(),
  candidate_phone: z.string().optional(),
  resume_url: z.string().url().optional(),
  cover_letter: z.string().max(5000).optional(),
});

// POST /api/applications - Create a new application (public endpoint)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    // Validate request body
    const validatedData = createApplicationSchema.parse(body);

    // Verify job exists and is active
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('id', validatedData.job_id)
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

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert({
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
