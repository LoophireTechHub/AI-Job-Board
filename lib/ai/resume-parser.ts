'use server';

import Anthropic from '@anthropic-ai/sdk';
import pdf from 'pdf-parse/lib/pdf-parse';
import mammoth from 'mammoth';
import { createClient } from '@/lib/supabase/server';
import { downloadResume } from '@/lib/storage/resume-upload';
import type { ResumeData } from '@/types/database';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

/**
 * Extract text from a PDF file
 */
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from a DOC/DOCX file
 */
async function extractTextFromDoc(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('DOC extraction error:', error);
    throw new Error('Failed to extract text from DOC file');
  }
}

/**
 * Extract text from resume based on file type
 */
async function extractResumeText(resumePath: string): Promise<string> {
  const blob = await downloadResume(resumePath);

  if (!blob) {
    throw new Error('Failed to download resume');
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const fileExt = resumePath.split('.').pop()?.toLowerCase();

  switch (fileExt) {
    case 'pdf':
      return extractTextFromPDF(buffer);
    case 'doc':
    case 'docx':
      return extractTextFromDoc(buffer);
    default:
      throw new Error(`Unsupported file type: ${fileExt}`);
  }
}

/**
 * Parse resume using Claude AI
 */
export async function parseResume(
  applicationId: string,
  resumePath: string
): Promise<{ success: boolean; data?: ResumeData; error?: string }> {
  const startTime = Date.now();

  try {
    // Extract text from resume
    const resumeText = await extractResumeText(resumePath);

    if (!resumeText || resumeText.trim().length < 100) {
      return {
        success: false,
        error: 'Resume text is too short or empty',
      };
    }

    // Parse with Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are an expert resume parser. Extract structured information from the following resume text and return it as a JSON object.

Resume Text:
${resumeText}

Extract the following information and return ONLY valid JSON (no markdown, no explanation):

{
  "personal_info": {
    "name": "Full name",
    "email": "email@example.com",
    "phone": "phone number (optional)",
    "location": "city, state/country (optional)",
    "linkedin": "LinkedIn URL (optional)",
    "portfolio": "Portfolio URL (optional)",
    "github": "GitHub URL (optional)"
  },
  "summary": "Professional summary or objective (optional)",
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "location": "City, State (optional)",
      "start_date": "MMM YYYY or YYYY",
      "end_date": "MMM YYYY or YYYY (or null if current)",
      "is_current": true/false,
      "description": ["Bullet point 1", "Bullet point 2"],
      "technologies": ["Tech1", "Tech2"] (optional),
      "achievements": ["Achievement 1"] (optional)
    }
  ],
  "education": [
    {
      "institution": "University name",
      "degree": "Degree type and name",
      "field_of_study": "Major/Field (optional)",
      "graduation_date": "MMM YYYY or YYYY (optional)",
      "gpa": "GPA (optional)",
      "honors": ["Honor 1", "Honor 2"] (optional)
    }
  ],
  "skills": {
    "technical": ["Skill1", "Skill2"],
    "soft": ["Skill1", "Skill2"] (optional),
    "languages": ["Language1", "Language2"] (optional),
    "certifications": ["Cert1", "Cert2"] (optional)
  },
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Tech1", "Tech2"],
      "url": "Project URL (optional)",
      "github_url": "GitHub URL (optional)",
      "role": "Your role (optional)"
    }
  ] (optional),
  "achievements": ["Achievement 1", "Achievement 2"] (optional),
  "total_experience_years": 5 (calculate from work experience)
}

Important:
- Return ONLY the JSON object, no markdown formatting
- Use null for missing optional fields
- Ensure all dates are in consistent format
- Calculate total_experience_years accurately
- Extract all relevant skills mentioned`,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean up response (remove markdown if present)
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse JSON
    const parsedData: ResumeData = JSON.parse(cleanedText);

    // Save to database
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('applications')
      .update({
        resume_parsed_data: parsedData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error saving parsed data:', updateError);
    }

    // Log to audit
    const latency = Date.now() - startTime;
    await supabase.from('audit_logs').insert({
      entity_type: 'resume_parsing',
      entity_id: applicationId,
      action: 'resume_parsed',
      ai_model_used: 'claude-3-5-sonnet-20241022',
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
      latency_ms: latency,
      metadata: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        resume_length: resumeText.length,
      },
    });

    return {
      success: true,
      data: parsedData,
    };
  } catch (error) {
    console.error('Resume parsing error:', error);

    // Log error to audit
    const supabase = await createClient();
    await supabase.from('audit_logs').insert({
      entity_type: 'resume_parsing',
      entity_id: applicationId,
      action: 'parsing_failed',
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error',
        latency_ms: Date.now() - startTime,
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse resume',
    };
  }
}

/**
 * Convert full parsed resume data to simplified format for conversation manager
 */
export function simplifyResumeForConversation(resumeData: ResumeData | null): import('@/lib/ai/conversation-manager').ResumeData | undefined {
  if (!resumeData) return undefined;

  return {
    summary: resumeData.summary || undefined,
    experience: resumeData.experience?.map(exp =>
      `${exp.position} at ${exp.company}${exp.is_current ? ' (Current)' : ''}`
    ),
    skills: [
      ...(resumeData.skills?.technical || []),
      ...(resumeData.skills?.certifications || [])
    ].filter(Boolean),
    education: resumeData.education?.map(edu =>
      `${edu.degree} from ${edu.institution}${edu.field_of_study ? ` in ${edu.field_of_study}` : ''}`
    ),
    certifications: resumeData.skills?.certifications,
  };
}
