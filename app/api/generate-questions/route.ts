// API Route: Generate Interview Questions

import { NextRequest, NextResponse } from 'next/server';
import { generateInterviewQuestions } from '@/lib/claude/question-generator';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { GenerateQuestionsRequest } from '@/types/api';
import { ExperienceLevel } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body: GenerateQuestionsRequest = await req.json();

    // Validate required fields
    if (!body.jobTitle || !body.industry || !body.experienceLevel || !body.department) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: jobTitle, industry, experienceLevel, department',
        },
        { status: 400 }
      );
    }

    // Generate questions using Claude
    const result = await generateInterviewQuestions({
      jobTitle: body.jobTitle,
      industry: body.industry,
      experienceLevel: body.experienceLevel as ExperienceLevel,
      department: body.department,
      jobDescription: body.jobDescription,
      requirements: body.requirements,
    });

    // Optional: Save to database if jobId is provided
    const jobId = req.nextUrl.searchParams.get('jobId');
    if (jobId) {
      const supabase = createServiceRoleClient();

      const { data, error } = await supabase
        .from('question_templates')
        .insert({
          job_id: jobId,
          questions: result.questions,
          evaluation_criteria: {
            min_score_threshold: 3.0,
          },
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error saving questions to database:', error);
      }

      // Log the AI interaction
      await supabase.from('audit_logs').insert({
        entity_type: 'question_generation',
        entity_id: jobId,
        action: 'generate_questions',
        ai_model_used: 'claude-3-5-sonnet-20241022',
        tokens_used: result.tokensUsed,
        latency_ms: result.latencyMs,
        metadata: {
          questions_count: result.questions.length,
          job_title: body.jobTitle,
          experience_level: body.experienceLevel,
        },
      });

      return NextResponse.json({
        success: true,
        questions: result.questions,
        questionTemplateId: data?.id,
        metadata: {
          tokensUsed: result.tokensUsed,
          latencyMs: result.latencyMs,
        },
      });
    }

    // Return questions without saving
    return NextResponse.json({
      success: true,
      questions: result.questions,
      metadata: {
        tokensUsed: result.tokensUsed,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    console.error('Error in generate-questions API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate questions',
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve existing question templates for a job
export async function GET(req: NextRequest) {
  try {
    const jobId = req.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: 'jobId query parameter is required',
        },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('question_templates')
      .select('*')
      .eq('job_id', jobId)
      .eq('is_active', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json({
          success: true,
          questions: null,
          message: 'No question templates found for this job',
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      questions: data.questions,
      questionTemplateId: data.id,
      version: data.question_version,
    });
  } catch (error) {
    console.error('Error retrieving question templates:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve question templates',
      },
      { status: 500 }
    );
  }
}
