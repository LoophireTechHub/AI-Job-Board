// Claude-powered Interview Question Generator

import { createClaudeMessage, parseClaudeJSON, CLAUDE_MODELS } from './client';
import { generateQuestionPrompt, SYSTEM_PROMPTS } from './prompts';
import { Question, ExperienceLevel } from '@/types/database';

interface GenerateQuestionsParams {
  jobTitle: string;
  industry: string;
  experienceLevel: ExperienceLevel;
  department: string;
  jobDescription?: string;
  requirements?: string[];
}

interface GenerateQuestionsResult {
  questions: Question[];
  tokensUsed: number;
  latencyMs: number;
}

export async function generateInterviewQuestions(
  params: GenerateQuestionsParams
): Promise<GenerateQuestionsResult> {
  const startTime = Date.now();

  try {
    const prompt = generateQuestionPrompt(params);

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: CLAUDE_MODELS.SONNET,
        system: SYSTEM_PROMPTS.QUESTION_GENERATOR,
        max_tokens: 4096,
        temperature: 0.8, // Slightly higher for creativity in questions
      }
    );

    const result = parseClaudeJSON<{ questions: Question[] }>(response);
    const latencyMs = Date.now() - startTime;

    // Validate the structure
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid response structure from Claude');
    }

    // Ensure all questions have required fields
    const validatedQuestions = result.questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      text: q.text,
      type: q.type,
      lookingFor: q.lookingFor || [],
      followUp: q.followUp || '',
      scoringKeywords: q.scoringKeywords || [],
      weight: q.weight || 3,
    }));

    return {
      questions: validatedQuestions,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latencyMs,
    };
  } catch (error) {
    console.error('Error generating interview questions:', error);
    throw new Error('Failed to generate interview questions');
  }
}

// Generate follow-up questions based on a candidate's response
export async function generateFollowUpQuestion(params: {
  originalQuestion: string;
  candidateResponse: string;
  questionType: string;
}): Promise<{ followUpQuestion: string; tokensUsed: number }> {
  const { originalQuestion, candidateResponse, questionType } = params;

  try {
    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: `Original question: "${originalQuestion}" (Type: ${questionType})

Candidate's response: "${candidateResponse}"

Generate a natural, conversational follow-up question to dig deeper into their answer or clarify vague points. The follow-up should feel like a natural continuation of the conversation.

Respond with just the follow-up question, no additional formatting.`,
        },
      ],
      {
        model: CLAUDE_MODELS.HAIKU, // Use faster model for simple tasks
        system: SYSTEM_PROMPTS.CONVERSATION_MANAGER,
        max_tokens: 256,
        temperature: 0.7,
      }
    );

    const textBlock = response.content.find(block => block.type === 'text');
    const followUpQuestion = textBlock && 'text' in textBlock ? textBlock.text.trim() : '';

    return {
      followUpQuestion,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    console.error('Error generating follow-up question:', error);
    throw new Error('Failed to generate follow-up question');
  }
}

// Regenerate questions with different style or focus
export async function regenerateQuestions(
  params: GenerateQuestionsParams,
  feedback: string
): Promise<GenerateQuestionsResult> {
  const startTime = Date.now();

  try {
    const basePrompt = generateQuestionPrompt(params);
    const modifiedPrompt = `${basePrompt}

**Additional Feedback:**
${feedback}

Please regenerate the questions taking this feedback into account.`;

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: modifiedPrompt,
        },
      ],
      {
        model: CLAUDE_MODELS.SONNET,
        system: SYSTEM_PROMPTS.QUESTION_GENERATOR,
        max_tokens: 4096,
        temperature: 0.9, // Higher temperature for more variety
      }
    );

    const result = parseClaudeJSON<{ questions: Question[] }>(response);
    const latencyMs = Date.now() - startTime;

    const validatedQuestions = result.questions.map((q, index) => ({
      id: q.id || `q${index + 1}`,
      text: q.text,
      type: q.type,
      lookingFor: q.lookingFor || [],
      followUp: q.followUp || '',
      scoringKeywords: q.scoringKeywords || [],
      weight: q.weight || 3,
    }));

    return {
      questions: validatedQuestions,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
      latencyMs,
    };
  } catch (error) {
    console.error('Error regenerating interview questions:', error);
    throw new Error('Failed to regenerate interview questions');
  }
}
