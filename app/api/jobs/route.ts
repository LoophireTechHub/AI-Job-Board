import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    const requiredFields = ['title', 'description', 'job_type', 'experience_level', 'location_type'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Get company name from user metadata
    const companyName = user.user_metadata?.company_name || user.email?.split('@')[0];

    // Create job
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        created_by: user.id,
        company_name: companyName,
        title: body.title,
        department: body.department || null,
        location_type: body.location_type,
        location_city: body.location_city || null,
        location_state: body.location_state || null,
        location_country: body.location_country || 'US',
        job_type: body.job_type,
        experience_level: body.experience_level,
        salary_min: body.salary_min || null,
        salary_max: body.salary_max || null,
        salary_currency: body.salary_currency || 'USD',
        description: body.description,
        requirements: body.requirements || null,
        benefits: body.benefits || null,
        status: body.status || 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
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
