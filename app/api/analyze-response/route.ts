// API Route: Analyze Interview Response

import { NextRequest, NextResponse } from 'next/server';
import { analyzeInterviewResponse, generateOverallAssessment } from '@/lib/claude/response-analyzer';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { AnalyzeResponseRequest } from '@/types/api';

export async function POST(req: NextRequest) {
  try {
    const body: AnalyzeResponseRequest = await req.json();

    // Validate required fields
    if (
      !body.questionId ||
      !body.questionText ||
      !body.candidateResponse ||
      !body.lookingFor ||
      !body.scoringKeywords
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Analyze the response using Claude
    const result = await analyzeInterviewResponse({
      questionText: body.questionText,
      questionType: body.questionType,
      lookingFor: body.lookingFor,
      scoringKeywords: body.scoringKeywords,
      candidateResponse: body.candidateResponse,
      questionWeight: body.questionWeight,
    });

    // Optional: Save to database if applicationId is provided
    const applicationId = req.nextUrl.searchParams.get('applicationId');
    if (applicationId) {
      const supabase = createServiceRoleClient();

      const { error } = await supabase.from('ai_responses').insert({
        application_id: applicationId,
        question_id: body.questionId,
        question_text: body.questionText,
        candidate_response: body.candidateResponse,
        ai_analysis: result.analysis,
        response_score: result.analysis.score,
        keywords_matched: result.analysis.keywordMatches,
      });

      if (error) {
        console.error('Error saving analysis to database:', error);
      }

      // Log the AI interaction
      await supabase.from('audit_logs').insert({
        entity_type: 'response_analysis',
        entity_id: applicationId,
        action: 'analyze_response',
        ai_model_used: 'claude-3-5-sonnet-20241022',
        tokens_used: result.tokensUsed,
        latency_ms: result.latencyMs,
        metadata: {
          question_id: body.questionId,
          score: result.analysis.score,
          recommendation: result.analysis.recommendation,
        },
      });
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      metadata: {
        tokensUsed: result.tokensUsed,
        latencyMs: result.latencyMs,
      },
    });
  } catch (error) {
    console.error('Error in analyze-response API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze response',
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve analysis for an application
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

    // Get all responses for this application
    const { data: responses, error } = await supabase
      .from('ai_responses')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*, jobs(title)')
      .eq('id', applicationId)
      .single();

    if (appError) {
      throw appError;
    }

    // Calculate overall score if we have responses
    let overallScore = null;
    let overallAssessment = null;

    if (responses && responses.length > 0) {
      const scores = responses.map(r => r.response_score || 0);
      overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

      // Generate overall assessment using Claude
      const assessmentResult = await generateOverallAssessment({
        candidateName: application.candidate_name,
        jobTitle: application.jobs?.title || 'the position',
        responses: responses.map(r => ({
          question: r.question_text,
          answer: r.candidate_response,
          score: r.response_score || 0,
          analysis: r.ai_analysis,
        })),
      });

      overallAssessment = assessmentResult;
    }

    return NextResponse.json({
      success: true,
      responses,
      overallScore,
      overallAssessment,
      application: {
        id: application.id,
        candidateName: application.candidate_name,
        jobTitle: application.jobs?.title,
        status: application.status,
      },
    });
  } catch (error) {
    console.error('Error retrieving analysis:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve analysis',
      },
      { status: 500 }
    );
  }
}
