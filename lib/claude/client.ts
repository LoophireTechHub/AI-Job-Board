// Anthropic Claude SDK Client Setup

import Anthropic from '@anthropic-ai/sdk';

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Default models for different tasks
export const CLAUDE_MODELS = {
  // For complex analysis, resume parsing, and question generation
  SONNET: 'claude-3-5-sonnet-20241022',

  // For faster, simpler tasks
  HAIKU: 'claude-3-5-haiku-20241022',
} as const;

// Default configuration
export const DEFAULT_CONFIG = {
  max_tokens: 4096,
  temperature: 0.7,
} as const;

// Helper function to create a message with error handling
export async function createClaudeMessage(
  messages: Anthropic.MessageParam[],
  options?: {
    model?: string;
    max_tokens?: number;
    temperature?: number;
    system?: string;
  }
) {
  try {
    const response = await claude.messages.create({
      model: options?.model || CLAUDE_MODELS.SONNET,
      max_tokens: options?.max_tokens || DEFAULT_CONFIG.max_tokens,
      temperature: options?.temperature ?? DEFAULT_CONFIG.temperature,
      system: options?.system,
      messages,
    });

    return response;
  } catch (error) {
    console.error('Claude API Error:', error);
    throw error;
  }
}

// Helper to extract text content from Claude response
export function extractTextContent(response: Anthropic.Message): string {
  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === 'text'
  );
  return textBlock?.text || '';
}

// Helper to parse JSON from Claude response with error handling
export function parseClaudeJSON<T>(response: Anthropic.Message): T {
  const text = extractTextContent(response);

  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(jsonText) as T;
  } catch {
    console.error('Failed to parse Claude JSON response:', text);
    throw new Error('Invalid JSON response from Claude');
  }
}
