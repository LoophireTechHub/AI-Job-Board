// Claude-powered Resume Parser

import { createClaudeMessage, parseClaudeJSON, CLAUDE_MODELS } from './client';
import { parseResumePrompt, SYSTEM_PROMPTS } from './prompts';
import { ResumeData } from '@/types/database';

interface ParseResumeParams {
  resumeText: string;
  jobContext?: {
    title: string;
    requirements: string[];
  };
}

interface ParseResumeResult {
  data: ResumeData;
  matchScore?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
  tokensUsed: number;
  latencyMs: number;
}

export async function parseResume(params: ParseResumeParams): Promise<ParseResumeResult> {
  const startTime = Date.now();

  try {
    // Validate input
    if (!params.resumeText || params.resumeText.trim().length === 0) {
      throw new Error('Resume text cannot be empty');
    }

    const prompt = parseResumePrompt(params);

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: CLAUDE_MODELS.SONNET,
        system: SYSTEM_PROMPTS.RESUME_PARSER,
        max_tokens: 4096,
        temperature: 0.2, // Low temperature for accurate parsing
      }
    );

    const result = parseClaudeJSON<ResumeData & { job_match_analysis?: any }>(response);
    const latencyMs = Date.now() - startTime;

    // Extract job match analysis if present
    const matchScore = result.job_match_analysis?.match_score;
    const matchingSkills = result.job_match_analysis?.matching_skills;
    const missingSkills = result.job_match_analysis?.missing_skills;

    // Remove job_match_analysis from the main data object
    const { job_match_analysis, ...resumeData } = result as any;

    // Validate required fields
    if (!resumeData.personal_info || !resumeData.personal_info.name || !resumeData.personal_info.email) {
      throw new Error('Resume must contain at least name and email');
    }

    return {
      data: resumeData as ResumeData,
      matchScore,
      matchingSkills,
      missingSkills,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latencyMs,
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume');
  }
}

// Extract text from PDF resume (you'll need a PDF parsing library)
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // This is a placeholder - implement with a library like pdf-parse
  // npm install pdf-parse @types/pdf-parse
  // const pdfParse = require('pdf-parse');
  // const data = await pdfParse(pdfBuffer);
  // return data.text;

  throw new Error('PDF parsing not yet implemented. Please use a PDF parsing library.');
}

// Analyze resume for specific job match
export async function analyzeResumeJobFit(params: {
  resumeData: ResumeData;
  jobTitle: string;
  jobRequirements: string[];
  jobDescription: string;
}): Promise<{
  fitScore: number;
  strengths: string[];
  gaps: string[];
  recommendation: string;
  tokensUsed: number;
}> {
  const { resumeData, jobTitle, jobRequirements, jobDescription } = params;

  try {
    const resumeSummary = `
Name: ${resumeData.personal_info.name}
Experience: ${resumeData.total_experience_years} years
Skills: ${[...resumeData.skills.technical, ...resumeData.skills.soft].join(', ')}
Recent Position: ${resumeData.experience[0]?.position} at ${resumeData.experience[0]?.company}
Education: ${resumeData.education[0]?.degree} in ${resumeData.education[0]?.field_of_study}`;

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: `Analyze how well this candidate fits the job requirements.

**Job Details:**
Title: ${jobTitle}
Description: ${jobDescription}
Requirements: ${jobRequirements.join(', ')}

**Candidate Profile:**
${resumeSummary}

**Your Task:**
Provide a detailed job fit analysis in JSON format.

**Output Format (JSON):**
\`\`\`json
{
  "fitScore": 0-100,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "gaps": ["gap 1", "gap 2"],
  "recommendation": "strong_fit|good_fit|moderate_fit|poor_fit",
  "reasoning": "Brief explanation of the assessment"
}
\`\`\`

Analyze the fit:`,
        },
      ],
      {
        model: CLAUDE_MODELS.SONNET,
        system: SYSTEM_PROMPTS.RESUME_PARSER,
        max_tokens: 1024,
        temperature: 0.3,
      }
    );

    const result = parseClaudeJSON<{
      fitScore: number;
      strengths: string[];
      gaps: string[];
      recommendation: string;
      reasoning: string;
    }>(response);

    return {
      fitScore: Math.max(0, Math.min(100, result.fitScore)),
      strengths: result.strengths,
      gaps: result.gaps,
      recommendation: result.recommendation,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    console.error('Error analyzing resume job fit:', error);
    throw new Error('Failed to analyze resume job fit');
  }
}

// Extract key skills from resume for quick filtering
export function extractKeySkills(resumeData: ResumeData): string[] {
  const allSkills = [
    ...resumeData.skills.technical,
    ...resumeData.skills.soft,
    ...(resumeData.skills.languages || []),
  ];

  // Deduplicate and normalize
  return [...new Set(allSkills.map(skill => skill.toLowerCase()))];
}

// Calculate years of experience from work history
export function calculateTotalExperience(resumeData: ResumeData): number {
  if (resumeData.total_experience_years) {
    return resumeData.total_experience_years;
  }

  // Calculate from experience array
  let totalMonths = 0;

  for (const exp of resumeData.experience) {
    const startDate = new Date(exp.start_date);
    const endDate = exp.end_date ? new Date(exp.end_date) : new Date();

    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth());

    totalMonths += months;
  }

  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal
}
