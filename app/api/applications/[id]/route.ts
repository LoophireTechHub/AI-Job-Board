import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// GET /api/applications/[id] - Get a specific application
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: application, error } = await supabase
      .from('applications')
      .select(
        `
        *,
        jobs!inner(id, title, created_by)
      `
      )
      .eq('id', id)
      .eq('jobs.created_by', user.id)
      .single();

    if (error || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for updating an application
const updateApplicationSchema = z.object({
  status: z
    .enum([
      'submitted',
      'screening',
      'interviewing',
      'offer',
      'rejected',
      'withdrawn',
    ])
    .optional(),
  overall_score: z.number().min(0).max(5).optional(),
  ai_summary: z.any().optional(),
});

// PATCH /api/applications/[id] - Update an application (status, score, etc.)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validatedData = updateApplicationSchema.parse(body);

    // Verify the application belongs to a job owned by the user
    const { data: application } = await supabase
      .from('applications')
      .select(
        `
        id,
        jobs!inner(created_by)
      `
      )
      .eq('id', id)
      .eq('jobs.created_by', user.id)
      .single();

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update the application
    const { data: updatedApplication, error } = await supabase
      .from('applications')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    // Log status change to audit log
    if (validatedData.status) {
      await supabase.from('audit_logs').insert({
        entity_type: 'application',
        entity_id: id,
        action: `status_changed_to_${validatedData.status}`,
        metadata: {
          previous_status: application,
          new_status: validatedData.status,
          changed_by: user.id,
        },
      });
    }

    return NextResponse.json(updatedApplication);
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

// DELETE /api/applications/[id] - Delete an application
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify the application belongs to a job owned by the user
    const { data: application } = await supabase
      .from('applications')
      .select(
        `
        id,
        jobs!inner(created_by)
      `
      )
      .eq('id', id)
      .eq('jobs.created_by', user.id)
      .single();

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase.from('applications').delete().eq('id', id);

    if (error) {
      console.error('Error deleting application:', error);
      return NextResponse.json(
        { error: 'Failed to delete application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
