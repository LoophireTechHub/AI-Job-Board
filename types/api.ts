// API Request/Response Types

import { Question, ResumeData, ResponseAnalysis } from './database';

// Question Generation API
export interface GenerateQuestionsRequest {
  jobTitle: string;
  industry: string;
  experienceLevel: string;
  department: string;
  jobDescription?: string;
  requirements?: string[];
}

export interface GenerateQuestionsResponse {
  success: boolean;
  questions: Question[];
  questionTemplateId?: string;
  error?: string;
}

// Resume Parsing API
export interface ParseResumeRequest {
  resumeText?: string;
  resumeUrl?: string;
  jobContext?: {
    title: string;
    requirements: string[];
  };
}

export interface ParseResumeResponse {
  success: boolean;
  data?: ResumeData;
  matchScore?: number; // How well resume matches job
  error?: string;
}

// Response Analysis API
export interface AnalyzeResponseRequest {
  questionId: string;
  questionText: string;
  questionType: string;
  candidateResponse: string;
  lookingFor: string[];
  scoringKeywords: string[];
  questionWeight: number;
}

export interface AnalyzeResponseResponse {
  success: boolean;
  analysis?: ResponseAnalysis;
  error?: string;
}

// Interview Session API
export interface StartInterviewSessionRequest {
  applicationId: string;
  sessionType: string;
}

export interface StartInterviewSessionResponse {
  success: boolean;
  sessionId?: string;
  firstQuestion?: {
    id: string;
    text: string;
    type: string;
  };
  error?: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  questionId: string;
  answer: string;
}

export interface SubmitAnswerResponse {
  success: boolean;
  analysis?: ResponseAnalysis;
  nextQuestion?: {
    id: string;
    text: string;
    type: string;
  };
  isComplete?: boolean;
  sessionSummary?: {
    totalScore: number;
    questionsAnswered: number;
    recommendation: string;
  };
  error?: string;
}

// Application Scoring API
export interface ScoreApplicationRequest {
  applicationId: string;
  includeDetailedAnalysis?: boolean;
}

export interface ScoreApplicationResponse {
  success: boolean;
  overallScore?: number;
  aiSummary?: {
    overall_fit_score: number;
    key_strengths: string[];
    potential_concerns: string[];
    recommendation: string;
    interview_focus_areas: string[];
  };
  questionScores?: Array<{
    questionId: string;
    score: number;
    analysis: ResponseAnalysis;
  }>;
  error?: string;
}

// Batch Operations
export interface BatchAnalyzeApplicationsRequest {
  jobId: string;
  limit?: number;
}

export interface BatchAnalyzeApplicationsResponse {
  success: boolean;
  processed: number;
  results: Array<{
    applicationId: string;
    score: number;
    status: string;
  }>;
  error?: string;
}
