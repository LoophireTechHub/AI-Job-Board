import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/jobs/[id] - Get a single job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch job (no auth required for public jobs)
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user is authenticated and owns the job
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If not owner and job is not active, don't show it
    if (job.status !== 'active' && (!user || user.id !== job.created_by)) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/jobs/[id] - Update a job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (existingJob.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();

    // Update job
    const { data: job, error } = await supabase
      .from('jobs')
      .update({
        title: body.title,
        department: body.department,
        location_type: body.location_type,
        location_city: body.location_city,
        location_state: body.location_state,
        location_country: body.location_country,
        job_type: body.job_type,
        experience_level: body.experience_level,
        salary_min: body.salary_min,
        salary_max: body.salary_max,
        salary_currency: body.salary_currency,
        description: body.description,
        requirements: body.requirements,
        benefits: body.benefits,
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }

    return NextResponse.json({ job }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in PUT /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id] - Delete a job (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: existingJob, error: fetchError } = await supabase
      .from('jobs')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (existingJob.created_by !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete by setting status to 'deleted'
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting job:', error);
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Job deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/jobs/[id]:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
