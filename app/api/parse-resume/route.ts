// API Route: Parse Resume with Claude

import { NextRequest, NextResponse } from 'next/server';
import { parseResume, analyzeResumeJobFit } from '@/lib/claude/resume-parser';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { ParseResumeRequest } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body: ParseResumeRequest = await req.json();

    // Validate input
    if (!body.resumeText && !body.resumeUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either resumeText or resumeUrl must be provided',
        },
        { status: 400 }
      );
    }

    let resumeText = body.resumeText;

    // If resumeUrl is provided, fetch from Supabase storage
    if (body.resumeUrl && !resumeText) {
      const supabase = createServiceRoleClient();

      // Extract file path from URL
      const urlPath = body.resumeUrl.split('/').slice(-1)[0];

      const { data, error } = await supabase.storage
        .from('resumes')
        .download(urlPath);

      if (error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to download resume from storage',
          },
          { status: 500 }
        );
      }

      // Convert blob to text (assumes text-based resume like .txt, .md)
      resumeText = await data.text();
    }

    if (!resumeText) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to extract resume text',
        },
        { status: 400 }
      );
    }

    // Parse resume using Claude
    const result = await parseResume({
      resumeText,
      jobContext: body.jobContext,
    });

    // Optional: Update application with parsed data
    const applicationId = req.nextUrl.searchParams.get('applicationId');
    if (applicationId) {
      const supabase = createServiceRoleClient();

      const { error } = await supabase
        .from('applications')
        .update({
          resume_parsed_data: result.data,
        })
        .eq('id', applicationId);

      if (error) {
        console.error('Error updating application with parsed data:', error);
      }

      // Log the AI interaction
      await supabase.from('audit_logs').insert({
        entity_type: 'application',
        entity_id: applicationId,
        action: 'parse_resume',
        ai_model_used: 'claude-3-5-sonnet-20241022',
        tokens_used: result.tokensUsed,
        latency_ms: result.latencyMs,
        metadata: {
          candidate_name: result.data.personal_info.name,
          experience_years: result.data.total_experience_years,
          match_score: result.matchScore,
        },
      });

      // If job context provided, also run job fit analysis
      if (body.jobContext) {
        const { data: application } = await supabase
          .from('applications')
          .select('*, jobs(*)')
          .eq('id', applicationId)
          .single();

        if (application && application.jobs) {
          const fitAnalysis = await analyzeResumeJobFit({
            resumeData: result.data,
            jobTitle: application.jobs.title,
            jobRequirements: application.jobs.requirements || [],
            jobDescription: application.jobs.description || '',
          });

          // Update application with fit score
          await supabase
            .from('applications')
            .update({
              overall_score: fitAnalysis.fitScore / 20, // Convert 0-100 to 0-5
              ai_summary: {
                overall_fit_score: fitAnalysis.fitScore,
                key_strengths: fitAnalysis.strengths,
                potential_concerns: fitAnalysis.gaps,
                recommendation: fitAnalysis.recommendation,
                interview_focus_areas: [],
              },
            })
            .eq('id', applicationId);

          return NextResponse.json({
            success: true,
            data: result.data,
            matchScore: result.matchScore,
            matchingSkills: result.matchingSkills,
            missingSkills: result.missingSkills,
            jobFitAnalysis: fitAnalysis,
            metadata: {
              tokensUsed: result.tokensUsed + fitAnalysis.tokensUsed,
              latencyMs: result.latencyMs,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      matchScore: result.matchScore,
      matchingSkills: result.matchingSkills,
      missingSkills: result.missingSkills,
      metadata: {
        tokensUsed: result.tokensUsed,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    console.error('Error in parse-resume API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse resume',
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve parsed resume data
export async function GET(req: NextRequest) {
  try {
    const applicationId = req.nextUrl.searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json(
        {
          success: false,
          error: 'applicationId query parameter is required',
        },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('applications')
      .select('resume_parsed_data, resume_url, overall_score, ai_summary')
      .eq('id', applicationId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data.resume_parsed_data,
      resumeUrl: data.resume_url,
      overallScore: data.overall_score,
      aiSummary: data.ai_summary,
    });
  } catch (error) {
    console.error('Error retrieving parsed resume:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve parsed resume',
      },
      { status: 500 }
    );
  }
}
