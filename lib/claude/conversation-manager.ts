// Claude-powered Interview Conversation Manager

import { createClaudeMessage, parseClaudeJSON, CLAUDE_MODELS, extractTextContent } from './client';
import { generateConversationPrompt, SYSTEM_PROMPTS } from './prompts';
import { ConversationMessage, Question } from '@/types/database';

interface ConversationState {
  conversationHistory: ConversationMessage[];
  remainingQuestions: Question[];
  currentQuestionId: string | null;
  isFollowUp: boolean;
}

interface NextMessageResult {
  message: string;
  isFollowUp: boolean;
  questionId: string | null;
  tokensUsed: number;
}

export class InterviewConversationManager {
  private state: ConversationState;
  private candidateName: string;

  constructor(candidateName: string, questions: Question[]) {
    this.candidateName = candidateName;
    this.state = {
      conversationHistory: [],
      remainingQuestions: [...questions],
      currentQuestionId: null,
      isFollowUp: false,
    };
  }

  // Get the opening message to start the interview
  async getOpeningMessage(): Promise<{ message: string; questionId: string | null; tokensUsed: number }> {
    if (this.state.remainingQuestions.length === 0) {
      throw new Error('No questions available for interview');
    }

    const firstQuestion = this.state.remainingQuestions[0];

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: `You're starting an interview with ${this.candidateName}. Create a warm, welcoming opening message that:
1. Greets them professionally but warmly
2. Briefly explains the interview format
3. Makes them feel comfortable
4. Smoothly transitions to the first question: "${firstQuestion.text}"

Keep it concise (2-3 sentences max for intro) and conversational.`,
        },
      ],
      {
        model: CLAUDE_MODELS.HAIKU,
        system: SYSTEM_PROMPTS.CONVERSATION_MANAGER,
        max_tokens: 512,
        temperature: 0.7,
      }
    );

    const message = extractTextContent(response);

    // Add to conversation history
    this.state.conversationHistory.push({
      role: 'assistant',
      content: message,
      timestamp: new Date().toISOString(),
      metadata: {
        question_id: firstQuestion.id,
      },
    });

    this.state.currentQuestionId = firstQuestion.id;
    this.state.isFollowUp = false;

    return {
      message,
      questionId: firstQuestion.id,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  // Process candidate's response and generate next message
  async processResponse(candidateResponse: string): Promise<NextMessageResult> {
    if (!candidateResponse || candidateResponse.trim().length === 0) {
      throw new Error('Candidate response cannot be empty');
    }

    // Add candidate's response to history
    this.state.conversationHistory.push({
      role: 'user',
      content: candidateResponse,
      timestamp: new Date().toISOString(),
    });

    // If this was answering a question, move it from remaining to answered
    if (this.state.currentQuestionId && !this.state.isFollowUp) {
      this.state.remainingQuestions = this.state.remainingQuestions.filter(
        q => q.id !== this.state.currentQuestionId
      );
    }

    // If no more questions, wrap up
    if (this.state.remainingQuestions.length === 0) {
      return this.getClosingMessage();
    }

    // Generate next message using Claude
    const prompt = generateConversationPrompt({
      conversationHistory: this.state.conversationHistory,
      remainingQuestions: this.state.remainingQuestions,
      candidateName: this.candidateName,
    });

    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        model: CLAUDE_MODELS.SONNET,
        system: SYSTEM_PROMPTS.CONVERSATION_MANAGER,
        max_tokens: 512,
        temperature: 0.7,
      }
    );

    const result = parseClaudeJSON<{
      next_message: string;
      is_follow_up: boolean;
      question_id: string | null;
    }>(response);

    // Update state
    this.state.isFollowUp = result.is_follow_up;
    if (result.question_id) {
      this.state.currentQuestionId = result.question_id;
    }

    // Add to conversation history
    this.state.conversationHistory.push({
      role: 'assistant',
      content: result.next_message,
      timestamp: new Date().toISOString(),
      metadata: {
        question_id: result.question_id || undefined,
      },
    });

    return {
      message: result.next_message,
      isFollowUp: result.is_follow_up,
      questionId: result.question_id,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  // Get closing message when interview is complete
  async getClosingMessage(): Promise<NextMessageResult> {
    const response = await createClaudeMessage(
      [
        {
          role: 'user',
          content: `The interview with ${this.candidateName} is complete. Generate a warm, professional closing message that:
1. Thanks them for their time
2. Explains next steps (their responses will be reviewed)
3. Wishes them well
4. Keeps it brief (2-3 sentences)`,
        },
      ],
      {
        model: CLAUDE_MODELS.HAIKU,
        system: SYSTEM_PROMPTS.CONVERSATION_MANAGER,
        max_tokens: 256,
        temperature: 0.7,
      }
    );

    const message = extractTextContent(response);

    this.state.conversationHistory.push({
      role: 'assistant',
      content: message,
      timestamp: new Date().toISOString(),
    });

    return {
      message,
      isFollowUp: false,
      questionId: null,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  }

  // Get current conversation state
  getState(): ConversationState {
    return { ...this.state };
  }

  // Get conversation history
  getHistory(): ConversationMessage[] {
    return [...this.state.conversationHistory];
  }

  // Get remaining questions count
  getRemainingQuestionsCount(): number {
    return this.state.remainingQuestions.length;
  }

  // Check if interview is complete
  isComplete(): boolean {
    return this.state.remainingQuestions.length === 0;
  }

  // Get progress percentage
  getProgress(totalQuestions: number): number {
    const answered = totalQuestions - this.state.remainingQuestions.length;
    return Math.round((answered / totalQuestions) * 100);
  }

  // Resume from saved state (for persistent interviews)
  static fromState(
    candidateName: string,
    savedState: ConversationState
  ): InterviewConversationManager {
    const manager = new InterviewConversationManager(candidateName, savedState.remainingQuestions);
    manager.state = savedState;
    return manager;
  }
}

// Helper function to create a quick follow-up question
export async function generateQuickFollowUp(params: {
  originalQuestion: string;
  candidateResponse: string;
  reason: 'too_brief' | 'unclear' | 'interesting_point';
}): Promise<{ followUp: string; tokensUsed: number }> {
  const { originalQuestion, candidateResponse, reason } = params;

  const prompts = {
    too_brief: 'The answer was too brief. Ask them to elaborate with specific examples.',
    unclear: 'The answer was unclear or vague. Ask for clarification.',
    interesting_point: 'They mentioned something interesting. Ask them to tell you more about it.',
  };

  const response = await createClaudeMessage(
    [
      {
        role: 'user',
        content: `Question: "${originalQuestion}"
Response: "${candidateResponse}"

Context: ${prompts[reason]}

Generate a natural follow-up question (one sentence, conversational).`,
      },
    ],
    {
      model: CLAUDE_MODELS.HAIKU,
      system: SYSTEM_PROMPTS.CONVERSATION_MANAGER,
      max_tokens: 128,
      temperature: 0.7,
    }
  );

  const followUp = extractTextContent(response);

  return {
    followUp,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
