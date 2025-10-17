import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateScreeningQuestions } from '@/lib/actions/generate-questions';

// GET /api/jobs - List jobs (with optional filters)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('jobs')
      .select('*, application_count:applications(count)')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: jobs, error } = await query;

    if (error) {
      console.error('Error fetching jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // Transform data to include application count
    const jobsWithCount = jobs.map((job: any) => ({
      ...job,
      application_count: job.application_count?.[0]?.count || 0,
    }));

    return NextResponse.json({ jobs: jobsWithCount }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/jobs:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'experience_level', 'location_type'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Transform form data to match database schema

    // Build location string
    const locationParts = [body.location_city, body.location_state, body.location_country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : null;

    // Build salary range string
    let salaryRange = null;
    if (body.salary_min || body.salary_max) {
      const currency = body.salary_currency || 'USD';
      if (body.salary_min && body.salary_max) {
        salaryRange = `${currency} ${body.salary_min} - ${body.salary_max}`;
      } else if (body.salary_min) {
        salaryRange = `${currency} ${body.salary_min}+`;
      } else {
        salaryRange = `Up to ${currency} ${body.salary_max}`;
      }
    }

    // Convert requirements string to array
    const requirements = body.requirements
      ? body.requirements.split('\n').filter((line: string) => line.trim())
      : [];

    // Use job_type as industry if provided, otherwise use department or default
    const industry = body.job_type || body.department || 'General';

    // Create job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        created_by: user.id,
        title: body.title,
        industry: industry,
        department: body.department || null,
        remote_policy: body.location_type,
        location: location,
        experience_level: body.experience_level,
        salary_range: salaryRange,
        description: body.description,
        requirements: requirements,
        status: body.status || 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    // Trigger AI question generation if job was created as active
    if (job.status === 'active') {
      // Generate questions asynchronously (non-blocking)
      generateScreeningQuestions({ jobId: job.id, job }).catch((err) => {
        console.error('Failed to generate questions:', err);
      });
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/jobs:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
