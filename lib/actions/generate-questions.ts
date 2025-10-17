'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { Job, Question, QuestionTemplate } from '@/types/database';
import { randomUUID } from 'crypto';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateQuestionsParams {
  jobId: string;
  job: Job;
}

export async function generateScreeningQuestions({
  jobId,
  job,
}: GenerateQuestionsParams): Promise<{ success: boolean; error?: string; data?: QuestionTemplate }> {
  try {
    // Create prompt for Claude
    const prompt = `You are an expert recruiter creating screening questions for a job position.

Job Details:
- Title: ${job.title}
- Industry: ${job.industry}
- Department: ${job.department || 'Not specified'}
- Experience Level: ${job.experience_level}
- Description: ${job.description}
- Requirements: ${job.requirements?.join(', ') || 'Not specified'}
- Responsibilities: ${job.responsibilities?.join(', ') || 'Not specified'}

Please generate 5-7 screening questions that will help evaluate candidates for this position. Include a mix of:
1. Technical questions (if applicable)
2. Behavioral questions
3. Scenario-based questions

For each question, provide:
- The question text
- Question type (behavioral, technical, or scenario)
- Key points to look for in the answer
- A follow-up question
- Keywords to look for in scoring
- A weight (1-5, where 5 is most important)

Also provide evaluation criteria including:
- Technical skills to assess
- Soft skills to assess
- Culture fit aspects to consider
- Minimum score threshold (0-100)

Format your response as a JSON object with this structure:
{
  "questions": [
    {
      "text": "Question text here",
      "type": "behavioral|technical|scenario",
      "lookingFor": ["point1", "point2", "point3"],
      "followUp": "Follow-up question text",
      "scoringKeywords": ["keyword1", "keyword2"],
      "weight": 1-5
    }
  ],
  "evaluationCriteria": {
    "technical_skills": ["skill1", "skill2"],
    "soft_skills": ["skill1", "skill2"],
    "culture_fit": ["aspect1", "aspect2"],
    "min_score_threshold": 60
  }
}

Return ONLY the JSON object, no additional text.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Parse response
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const responseText = content.text.trim();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from Claude response');
    }

    const aiResponse = JSON.parse(jsonMatch[0]);

    // Add IDs to questions
    const questionsWithIds: Question[] = aiResponse.questions.map((q: any) => ({
      id: randomUUID(),
      ...q,
    }));

    // Create question template object
    const questionTemplate: QuestionTemplate = {
      id: randomUUID(),
      job_id: jobId,
      questions: questionsWithIds,
      evaluation_criteria: aiResponse.evaluationCriteria,
      question_version: 1,
      is_active: true,
      generated_at: new Date().toISOString(),
    };

    // Store in database
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('question_templates')
      .insert(questionTemplate)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return { success: false, error: 'Failed to store questions in database' };
    }

    return { success: true, data: questionTemplate };
  } catch (error) {
    console.error('Error generating questions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate questions',
    };
  }
}
