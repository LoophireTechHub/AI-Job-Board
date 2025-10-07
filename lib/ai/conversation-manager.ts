'use server';

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Types for conversation management
export interface Question {
  id: string;
  text: string;
  type: 'behavioral' | 'technical' | 'situational' | 'general';
  lookingFor?: string[];
  followUp?: string;
  weight?: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  questionId?: string;
}

export interface AIAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  keywordMatches: string[];
  needsFollowUp: boolean;
  followUpReason?: string;
  recommendation?: 'strong_yes' | 'yes' | 'maybe' | 'no';
}

/**
 * Generate initial greeting and introduce first question
 */
export async function startInterview(params: {
  candidateName: string;
  jobTitle: string;
  companyName?: string;
  questions: Question[];
}): Promise<{
  greeting: string;
  firstQuestion: Question;
}> {
  const { candidateName, jobTitle, companyName, questions } = params;

  if (questions.length === 0) {
    throw new Error('No questions provided');
  }

  const systemPrompt = `You are a professional, friendly AI interviewer conducting a job interview. Your role is to:
- Make candidates feel comfortable and welcomed
- Ask questions naturally and conversationally
- Provide smooth transitions between topics
- Be encouraging but professional
- Keep responses concise (2-3 sentences max for greetings)`;

  const userPrompt = `Generate a warm, professional greeting for ${candidateName} who is interviewing for the ${jobTitle} position${companyName ? ` at ${companyName}` : ''}. 

Then naturally introduce the first interview question: "${questions[0].text}"

Keep it conversational and make the candidate feel at ease. Return ONLY the greeting and question introduction, no additional commentary.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      greeting: responseText.trim(),
      firstQuestion: questions[0],
    };
  } catch (error) {
    console.error('Error generating interview greeting:', error);
    // Fallback to simple greeting
    return {
      greeting: `Hi ${candidateName}! Thanks for taking the time to interview with us today for the ${jobTitle} position. I'll be asking you a few questions to learn more about your experience and qualifications. Let's get started!`,
      firstQuestion: questions[0],
    };
  }
}

/**
 * Analyze candidate response and determine next step
 */
export async function processAnswer(params: {
  conversationHistory: Message[];
  currentQuestion: Question;
  candidateAnswer: string;
  remainingQuestions: Question[];
  jobTitle: string;
}): Promise<{
  analysis: AIAnalysis;
  needsFollowUp: boolean;
  followUpQuestion?: string;
  nextQuestion?: Question;
  transitionMessage: string;
}> {
  const { conversationHistory, currentQuestion, candidateAnswer, remainingQuestions, jobTitle } = params;

  const systemPrompt = `You are an expert AI interviewer and evaluator. Your role is to:
1. Analyze candidate responses objectively and fairly
2. Identify strengths and areas for improvement
3. Determine if a follow-up question would elicit more valuable information
4. Score responses on a scale of 0-5 (0=poor, 5=excellent)
5. Provide constructive, actionable feedback

Be fair, unbiased, and focused on job-relevant competencies.`;

  const analysisPrompt = `Job Position: ${jobTitle}

Question Asked: "${currentQuestion.text}"
Question Type: ${currentQuestion.type}
${currentQuestion.lookingFor ? `Looking for: ${currentQuestion.lookingFor.join(', ')}` : ''}

Candidate's Response:
"${candidateAnswer}"

Analyze this response and return a JSON object with:
{
  "score": number (0-5),
  "strengths": array of specific positive aspects,
  "concerns": array of areas that could be improved,
  "keywordMatches": array of relevant keywords or concepts mentioned,
  "needsFollowUp": boolean (true if answer is vague or incomplete),
  "followUpReason": string (if needsFollowUp is true, explain why),
  "recommendation": "strong_yes" | "yes" | "maybe" | "no"
}

Consider:
- Specificity and detail
- Relevance to the question
- Communication clarity
- Problem-solving approach (if applicable)
- Cultural fit indicators

Return ONLY valid JSON, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.3,
      system: systemPrompt,
      messages: [{ role: 'user', content: analysisPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleanedText = responseText.trim().replace(/^```json\n/, '').replace(/\n```$/, '');
    const analysis: AIAnalysis = JSON.parse(cleanedText);

    // Determine if we need a follow-up or move to next question
    if (analysis.needsFollowUp && analysis.followUpReason) {
      const followUpQuestion = await generateFollowUp({
        originalQuestion: currentQuestion,
        candidateAnswer,
        conversationHistory,
        followUpReason: analysis.followUpReason,
      });

      return {
        analysis,
        needsFollowUp: true,
        followUpQuestion,
        transitionMessage: "That's helpful. I'd like to dig a bit deeper on this:",
      };
    }

    // Move to next question
    if (remainingQuestions.length > 0) {
      const nextQuestion = remainingQuestions[0];
      const transition = await generateTransition({
        previousQuestion: currentQuestion,
        previousAnswer: candidateAnswer,
        nextQuestion,
        conversationHistory,
      });

      return {
        analysis,
        needsFollowUp: false,
        nextQuestion,
        transitionMessage: transition,
      };
    }

    // No more questions - interview complete
    return {
      analysis,
      needsFollowUp: false,
      transitionMessage: '',
    };

  } catch (error) {
    console.error('Error analyzing response:', error);

    // Fallback analysis
    const fallbackAnalysis: AIAnalysis = {
      score: 3.0,
      strengths: ['Provided a response'],
      concerns: ['Could not analyze response automatically'],
      keywordMatches: [],
      needsFollowUp: false,
      recommendation: 'maybe',
    };

    if (remainingQuestions.length > 0) {
      return {
        analysis: fallbackAnalysis,
        needsFollowUp: false,
        nextQuestion: remainingQuestions[0],
        transitionMessage: "Thank you for sharing. Let's move on to the next question:",
      };
    }

    return {
      analysis: fallbackAnalysis,
      needsFollowUp: false,
      transitionMessage: '',
    };
  }
}

/**
 * Generate a follow-up question based on candidate's answer
 */
async function generateFollowUp(params: {
  originalQuestion: Question;
  candidateAnswer: string;
  conversationHistory: Message[];
  followUpReason: string;
}): Promise<string> {
  const { originalQuestion, candidateAnswer, followUpReason } = params;

  const systemPrompt = `You are an expert interviewer skilled at asking insightful follow-up questions that help candidates elaborate and provide more detail. Your follow-ups should be:
- Specific and focused
- Non-leading (don't suggest answers)
- Encouraging but probing
- Concise (1-2 sentences)`;

  const userPrompt = `Original Question: "${originalQuestion.text}"

Candidate's Answer: "${candidateAnswer}"

Reason for follow-up: ${followUpReason}

Generate a natural, conversational follow-up question that will help the candidate provide more specific details or clarify their response. Return ONLY the follow-up question, nothing else.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Use Haiku for faster, cheaper follow-ups
      max_tokens: 150,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return responseText.trim();

  } catch (error) {
    console.error('Error generating follow-up:', error);
    return "Could you elaborate on that a bit more? I'd love to hear more details.";
  }
}

/**
 * Generate natural transition between questions
 */
async function generateTransition(params: {
  previousQuestion: Question;
  previousAnswer: string;
  nextQuestion: Question;
  conversationHistory: Message[];
}): Promise<string> {
  const { previousAnswer, nextQuestion } = params;

  const systemPrompt = `You are a skilled interviewer who creates smooth, natural transitions between interview questions. Your transitions should:
- Acknowledge the previous answer briefly
- Naturally lead into the next topic
- Be warm and conversational
- Be concise (1-2 sentences)`;

  const userPrompt = `The candidate just answered a question. 

Their answer (summary): "${previousAnswer.substring(0, 200)}${previousAnswer.length > 200 ? '...' : ''}"

Next question to ask: "${nextQuestion.text}"

Generate a brief, natural transition that thanks them and smoothly introduces the next question. Return ONLY the transition, nothing else.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022', // Use Haiku for faster transitions
      max_tokens: 100,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return responseText.trim();

  } catch (error) {
    console.error('Error generating transition:', error);
    return "That's great, thank you for sharing. Let's move on to our next topic:";
  }
}

/**
 * Generate completion message and summary
 */
export async function concludeInterview(params: {
  candidateName: string;
  totalScore: number;
  questionsAnswered: number;
  jobTitle: string;
}): Promise<{
  closingMessage: string;
  summary: {
    totalScore: number;
    questionsAnswered: number;
    averageScore: number;
  };
}> {
  const { candidateName, totalScore, questionsAnswered, jobTitle } = params;
  const averageScore = questionsAnswered > 0 ? totalScore / questionsAnswered : 0;

  const systemPrompt = `You are a professional interviewer concluding an interview. Your closing should:
- Thank the candidate warmly
- Be encouraging and positive
- Set clear next-step expectations
- Be professional but friendly
- Be concise (2-3 sentences)`;

  const userPrompt = `Generate a warm closing message for ${candidateName} who just completed an interview for the ${jobTitle} position. They answered ${questionsAnswered} questions.

Let them know we'll review their responses and get back to them soon. Make them feel appreciated for their time. Return ONLY the closing message.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 150,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    return {
      closingMessage: responseText.trim(),
      summary: {
        totalScore,
        questionsAnswered,
        averageScore: Math.round(averageScore * 10) / 10,
      },
    };

  } catch (error) {
    console.error('Error generating closing message:', error);
    return {
      closingMessage: `Thank you so much for your time today, ${candidateName}. We really appreciate you sharing your experiences with us. We'll review your responses and get back to you within the next few days. Best of luck!`,
      summary: {
        totalScore,
        questionsAnswered,
        averageScore: Math.round(averageScore * 10) / 10,
      },
    };
  }
}
