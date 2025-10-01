// Claude Prompt Templates for AI Job Application System

import { ExperienceLevel } from '@/types/database';

export const SYSTEM_PROMPTS = {
  QUESTION_GENERATOR: `You are an expert HR interviewer and talent acquisition specialist. Your role is to generate insightful, relevant interview questions that assess both technical competence and cultural fit. Questions should be:
- Conversational and welcoming, not intimidating
- Focused on real-world scenarios and problem-solving
- Designed to reveal the candidate's thought process
- Balanced between technical skills and soft skills
- Appropriate for the role's seniority level`,

  RESPONSE_ANALYZER: `You are an expert interview evaluator. Your role is to analyze candidate responses objectively and fairly. You should:
- Assess the depth and relevance of answers
- Identify key strengths and potential concerns
- Look for specific examples and concrete details
- Evaluate communication clarity
- Detect any red flags (vague answers, inconsistencies, lack of ownership)
- Provide actionable feedback and follow-up suggestions
- Be fair and unbiased in your evaluation`,

  RESUME_PARSER: `You are an expert resume parser and career analyst. Your role is to extract structured information from resumes accurately. You should:
- Parse all relevant information including experience, education, and skills
- Infer years of experience from dates
- Identify technical and soft skills
- Extract project details and achievements
- Maintain objectivity and accuracy
- Handle various resume formats and styles`,

  CONVERSATION_MANAGER: `You are a friendly AI interview assistant conducting a conversational interview. Your role is to:
- Ask questions naturally and warmly
- Adapt follow-up questions based on candidate responses
- Encourage elaboration on interesting points
- Keep the conversation flowing smoothly
- Be empathetic and professional
- Make the candidate feel comfortable while gathering quality information`,
};

export function generateQuestionPrompt(params: {
  jobTitle: string;
  industry: string;
  experienceLevel: ExperienceLevel;
  department: string;
  jobDescription?: string;
  requirements?: string[];
}): string {
  const { jobTitle, industry, experienceLevel, department, jobDescription, requirements } = params;

  return `Generate 8 high-quality interview questions for a ${experienceLevel}-level ${jobTitle} position in the ${industry} industry.

**Job Context:**
- Department: ${department}
- Experience Level: ${experienceLevel}
${jobDescription ? `- Job Description: ${jobDescription}` : ''}
${requirements && requirements.length > 0 ? `- Key Requirements: ${requirements.join(', ')}` : ''}

**Requirements:**
1. Create a mix of question types:
   - 2-3 behavioral questions (past experiences, how they handled situations)
   - 2-3 technical/skill-based questions (relevant to the role)
   - 2-3 scenario-based questions (how they would handle hypothetical situations)

2. For each question, provide:
   - The question text (clear, conversational)
   - Question type (behavioral, technical, or scenario)
   - What you're looking for in a strong answer (3-5 key points)
   - A follow-up prompt to use if the answer is too brief or vague
   - 5-10 scoring keywords to match against
   - Weight/importance (1-5, where 5 is most important)

3. Questions should:
   - Be appropriate for ${experienceLevel}-level candidates
   - Assess both technical capabilities and soft skills
   - Include at least one question about culture fit
   - Be open-ended to encourage detailed responses
   - Not be answerable with just yes/no

**Output Format (JSON):**
\`\`\`json
{
  "questions": [
    {
      "id": "q1",
      "text": "Question text here",
      "type": "behavioral|technical|scenario",
      "lookingFor": [
        "Specific point to look for in answer",
        "Another key indicator",
        "Evidence of skill/quality"
      ],
      "followUp": "Follow-up prompt if answer is too brief",
      "scoringKeywords": ["keyword1", "keyword2", "keyword3"],
      "weight": 1-5
    }
  ]
}
\`\`\`

Generate the questions now:`;
}

export function analyzeResponsePrompt(params: {
  questionText: string;
  questionType: string;
  lookingFor: string[];
  scoringKeywords: string[];
  candidateResponse: string;
  questionWeight: number;
}): string {
  const { questionText, questionType, lookingFor, scoringKeywords, candidateResponse, questionWeight } = params;

  return `Analyze this candidate's interview response and provide a detailed evaluation.

**Question Asked:**
"${questionText}"
- Type: ${questionType}
- Importance: ${questionWeight}/5

**What We're Looking For:**
${lookingFor.map((point, i) => `${i + 1}. ${point}`).join('\n')}

**Scoring Keywords:**
${scoringKeywords.join(', ')}

**Candidate's Response:**
"${candidateResponse}"

**Your Task:**
Evaluate this response and provide a comprehensive analysis in JSON format.

**Output Format (JSON):**
\`\`\`json
{
  "score": 0.0-5.0,
  "strengths": [
    "Specific strength demonstrated in the answer",
    "Another positive aspect"
  ],
  "concerns": [
    "Any concerns or missing elements",
    "Areas that could be improved"
  ],
  "redFlags": [
    "Any serious concerns (empty if none)"
  ],
  "suggestedFollowUp": "A specific follow-up question to ask, or null if answer is complete",
  "keywordMatches": ["matched", "keywords", "from", "list"],
  "relevanceScore": 0.0-5.0,
  "depthScore": 0.0-5.0,
  "clarityScore": 0.0-5.0,
  "recommendation": "strong_pass|pass|neutral|concern|reject"
}
\`\`\`

**Scoring Guidelines:**
- **5.0**: Exceptional answer with specific examples, demonstrates deep understanding
- **4.0**: Strong answer covering key points with good examples
- **3.0**: Adequate answer, covers basics but lacks depth or examples
- **2.0**: Weak answer, vague or missing important points
- **1.0**: Poor answer, off-topic or shows significant gaps

**Recommendation Guidelines:**
- **strong_pass**: Excellent response, candidate shows exceptional fit
- **pass**: Good response, candidate meets requirements
- **neutral**: Acceptable response, could go either way
- **concern**: Weak response, raises questions about fit
- **reject**: Poor response, candidate not suitable

Analyze the response now:`;
}

export function parseResumePrompt(params: {
  resumeText: string;
  jobContext?: {
    title: string;
    requirements: string[];
  };
}): string {
  const { resumeText, jobContext } = params;

  return `Parse this resume and extract structured information. ${jobContext ? `Also analyze fit for a ${jobContext.title} position.` : ''}

**Resume Text:**
${resumeText}

${jobContext ? `\n**Job Context:**
Position: ${jobContext.title}
Requirements: ${jobContext.requirements.join(', ')}` : ''}

**Your Task:**
Extract all relevant information from the resume and structure it as JSON.

**Output Format (JSON):**
\`\`\`json
{
  "personal_info": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number if present",
    "location": "location if present",
    "linkedin": "LinkedIn URL if present",
    "portfolio": "portfolio URL if present",
    "github": "GitHub URL if present"
  },
  "summary": "Professional summary if present",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "location": "Location",
      "start_date": "YYYY-MM",
      "end_date": "YYYY-MM or null if current",
      "is_current": true|false,
      "description": ["Bullet point 1", "Bullet point 2"],
      "technologies": ["tech1", "tech2"],
      "achievements": ["achievement 1"]
    }
  ],
  "education": [
    {
      "institution": "School Name",
      "degree": "Degree Type",
      "field_of_study": "Major/Field",
      "graduation_date": "YYYY-MM",
      "gpa": "GPA if present",
      "honors": ["Honor 1", "Honor 2"]
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "languages": ["language1", "language2"],
    "certifications": ["cert1", "cert2"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "technologies": ["tech1", "tech2"],
      "url": "project URL if present",
      "github_url": "GitHub URL if present",
      "role": "Your role in project"
    }
  ],
  "achievements": ["Achievement 1", "Achievement 2"],
  "total_experience_years": calculated_years
  ${jobContext ? `,
  "job_match_analysis": {
    "match_score": 0-100,
    "matching_skills": ["skill1", "skill2"],
    "missing_skills": ["skill1", "skill2"],
    "relevant_experience": "brief assessment"
  }` : ''}
}
\`\`\`

Parse the resume now:`;
}

export function generateConversationPrompt(params: {
  conversationHistory: Array<{ role: 'assistant' | 'user'; content: string }>;
  remainingQuestions: Array<{ id: string; text: string; type: string }>;
  candidateName: string;
}): string {
  const { conversationHistory, remainingQuestions, candidateName } = params;

  return `You are conducting a conversational interview with ${candidateName}. Continue the natural flow of conversation.

**Conversation So Far:**
${conversationHistory.map(msg => `${msg.role === 'assistant' ? 'You' : candidateName}: ${msg.content}`).join('\n\n')}

**Remaining Questions to Cover:**
${remainingQuestions.map((q, i) => `${i + 1}. [${q.type}] ${q.text}`).join('\n')}

**Your Task:**
Based on the conversation flow, decide what to do next:

1. If the last response needs follow-up or clarification, ask a natural follow-up question
2. If ready to move on, transition smoothly to the next question from the list
3. Keep the tone warm and conversational
4. Acknowledge their responses before moving forward

**Output Format (JSON):**
\`\`\`json
{
  "next_message": "Your next message to the candidate",
  "is_follow_up": true|false,
  "question_id": "ID of question you're asking, or null if follow-up"
}
\`\`\`

Generate your next message:`;
}
