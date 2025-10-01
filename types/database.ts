// Database Types for AI Job Application System

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type RemotePolicy = 'onsite' | 'hybrid' | 'remote';
export type JobStatus = 'draft' | 'active' | 'paused' | 'closed';
export type ApplicationStatus = 'submitted' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
export type SessionType = 'screening' | 'technical' | 'behavioral' | 'final';
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ChunkType = 'experience' | 'education' | 'skills' | 'summary' | 'projects';
export type QuestionType = 'behavioral' | 'technical' | 'scenario';

export interface Job {
  id: string;
  title: string;
  industry: string;
  department: string;
  experience_level: ExperienceLevel;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  salary_range?: string;
  location?: string;
  remote_policy?: RemotePolicy;
  status: JobStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  resume_url?: string;
  resume_parsed_data?: ResumeData;
  cover_letter?: string;
  status: ApplicationStatus;
  overall_score?: number;
  ai_summary?: AISummary;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  email: string;
  name: string;
  phone?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  skills?: string[];
  experience_years?: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionTemplate {
  id: string;
  job_id: string;
  questions: Question[];
  evaluation_criteria?: EvaluationCriteria;
  question_version: number;
  is_active: boolean;
  generated_at: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  lookingFor: string[];
  followUp: string;
  scoringKeywords: string[];
  weight: number; // 1-5
}

export interface EvaluationCriteria {
  technical_skills?: string[];
  soft_skills?: string[];
  culture_fit?: string[];
  min_score_threshold?: number;
}

export interface AIResponse {
  id: string;
  application_id: string;
  question_id: string;
  question_text: string;
  candidate_response: string;
  ai_analysis: ResponseAnalysis;
  response_score?: number;
  keywords_matched?: string[];
  created_at: string;
}

export interface ResponseAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  redFlags?: string[];
  suggestedFollowUp?: string;
  keywordMatches: string[];
  relevanceScore: number;
  depthScore: number;
  clarityScore: number;
  recommendation: 'strong_pass' | 'pass' | 'neutral' | 'concern' | 'reject';
}

export interface InterviewSession {
  id: string;
  application_id: string;
  session_type: SessionType;
  status: SessionStatus;
  conversation_history?: ConversationMessage[];
  current_question_index: number;
  started_at: string;
  completed_at?: string;
  total_score?: number;
}

export interface ConversationMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  metadata?: {
    question_id?: string;
    score?: number;
    analysis?: ResponseAnalysis;
  };
}

export interface ResumeEmbedding {
  id: string;
  application_id: string;
  content_chunk: string;
  chunk_type: ChunkType;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  ai_model_used?: string;
  tokens_used?: number;
  latency_ms?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

// Claude-parsed resume data structure
export interface ResumeData {
  personal_info: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
    github?: string;
  };
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: Project[];
  achievements?: string[];
  total_experience_years?: number;
}

export interface WorkExperience {
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description: string[];
  technologies?: string[];
  achievements?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study?: string;
  graduation_date?: string;
  gpa?: string;
  honors?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github_url?: string;
  role?: string;
}

export interface AISummary {
  overall_fit_score: number;
  key_strengths: string[];
  potential_concerns: string[];
  technical_assessment: string;
  culture_fit_assessment: string;
  recommendation: 'highly_recommended' | 'recommended' | 'consider' | 'not_recommended';
  interview_focus_areas: string[];
}
