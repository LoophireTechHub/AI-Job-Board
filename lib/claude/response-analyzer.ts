// Claude-powered Interview Response Analyzer

import { createClaudeMessage, parseClaudeJSON, CLAUDE_MODELS } from './client';
import { analyzeResponsePrompt, SYSTEM_PROMPTS } from './prompts';
import { ResponseAnalysis } from '@/types/database';

interface AnalyzeResponseParams {
  questionText: string;
  questionType: string;
  lookingFor: string[];
  scoringKeywords: string[];
  candidateResponse: string;
  questionWeight: number;
}

interface AnalyzeResponseResult {
  analysis: ResponseAnalysis;
  tokensUsed: number;
  latencyMs: number;
}

export async function analyzeInterviewResponse(
  params: AnalyzeResponseParams
): Promise<AnalyzeResponseResult> {
  const startTime = Date.now();

  try {
    // Validate input
    if (!params.candidateResponse || params.candidateResponse.trim().length === 0) {
      throw new Error('Candidate response cannot be empty');
    }

    const prompt = analyzeResponsePrompt(params);

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: CLAUDE_MODELS.SONNET,
        system: SYSTEM_PROMPTS.RESPONSE_ANALYZER,
        max_tokens: 2048,
        temperature: 0.3, // Lower temperature for more consistent analysis
      }
    );

    const analysis = parseClaudeJSON<ResponseAnalysis>(response);
    const latencyMs = Date.now() - startTime;

    // Validate the analysis structure
    if (
      typeof analysis.score !== 'number' ||
      !Array.isArray(analysis.strengths) ||
      !Array.isArray(analysis.concerns)
    ) {
      throw new Error('Invalid analysis structure from Claude');
    }

    // Ensure scores are within valid range
    const validatedAnalysis: ResponseAnalysis = {
      score: Math.max(0, Math.min(5, analysis.score)),
      strengths: analysis.strengths,
      concerns: analysis.concerns,
      redFlags: analysis.redFlags || [],
      suggestedFollowUp: analysis.suggestedFollowUp || undefined,
      keywordMatches: analysis.keywordMatches || [],
      relevanceScore: Math.max(0, Math.min(5, analysis.relevanceScore || 0)),
      depthScore: Math.max(0, Math.min(5, analysis.depthScore || 0)),
      clarityScore: Math.max(0, Math.min(5, analysis.clarityScore || 0)),
      recommendation: analysis.recommendation || 'neutral',
    };

    return {
      analysis: validatedAnalysis,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latencyMs,
    };
  } catch (error) {
    console.error('Error analyzing interview response:', error);
    throw new Error('Failed to analyze interview response');
  }
}

// Batch analyze multiple responses for efficiency
export async function batchAnalyzeResponses(
  responses: AnalyzeResponseParams[]
): Promise<AnalyzeResponseResult[]> {
  // For now, process sequentially. Could be optimized with Promise.all
  // but need to be mindful of rate limits
  const results: AnalyzeResponseResult[] = [];

  for (const response of responses) {
    try {
      const result = await analyzeInterviewResponse(response);
      results.push(result);
    } catch (error) {
      console.error('Error in batch analysis:', error);
      // Continue with other responses even if one fails
      results.push({
        analysis: {
          score: 0,
          strengths: [],
          concerns: ['Analysis failed'],
          redFlags: ['Unable to analyze response'],
          suggestedFollowUp: undefined,
          keywordMatches: [],
          relevanceScore: 0,
          depthScore: 0,
          clarityScore: 0,
          recommendation: 'neutral',
        },
        tokensUsed: 0,
        latencyMs: 0,
      });
    }
  }

  return results;
}

// Generate overall assessment from multiple question responses
export async function generateOverallAssessment(params: {
  candidateName: string;
  jobTitle: string;
  responses: Array<{
    question: string;
    answer: string;
    score: number;
    analysis: ResponseAnalysis;
  }>;
}): Promise<{
  overallScore: number;
  summary: string;
  keyStrengths: string[];
  potentialConcerns: string[];
  recommendation: string;
  tokensUsed: number;
}> {
  const { candidateName, jobTitle, responses } = params;

  try {
    const responseSummary = responses
      .map(
        (r, i) =>
          `Q${i + 1}: ${r.question}
Answer Score: ${r.score}/5
Strengths: ${r.analysis.strengths.join(', ')}
Concerns: ${r.analysis.concerns.join(', ')}`
      )
      .join('\n\n');

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: `Provide an overall assessment of ${candidateName}'s interview performance for the ${jobTitle} position.

**Individual Question Assessments:**
${responseSummary}

**Your Task:**
Generate a comprehensive overall assessment in JSON format.

**Output Format (JSON):**
\`\`\`json
{
  "overallScore": 0.0-5.0,
  "summary": "2-3 sentence overall summary",
  "keyStrengths": ["strength 1", "strength 2", "strength 3"],
  "potentialConcerns": ["concern 1", "concern 2"],
  "recommendation": "highly_recommended|recommended|consider|not_recommended",
  "interviewFocusAreas": ["area to explore more in next interview"]
}
\`\`\`

Generate the assessment:`,
        },
      ],
      {
        model: CLAUDE_MODELS.SONNET,
        system: SYSTEM_PROMPTS.RESPONSE_ANALYZER,
        max_tokens: 1024,
        temperature: 0.3,
      }
    );

    const result = parseClaudeJSON<{
      overallScore: number;
      summary: string;
      keyStrengths: string[];
      potentialConcerns: string[];
      recommendation: string;
      interviewFocusAreas: string[];
    }>(response);

    return {
      overallScore: Math.max(0, Math.min(5, result.overallScore)),
      summary: result.summary,
      keyStrengths: result.keyStrengths,
      potentialConcerns: result.potentialConcerns,
      recommendation: result.recommendation,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    console.error('Error generating overall assessment:', error);
    throw new Error('Failed to generate overall assessment');
  }
}
