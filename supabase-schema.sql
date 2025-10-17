-- AI-Powered Job Application System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  industry TEXT NOT NULL,
  department TEXT NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  description TEXT,
  requirements TEXT[],
  responsibilities TEXT[],
  salary_range TEXT,
  location TEXT,
  remote_policy TEXT CHECK (remote_policy IN ('onsite', 'hybrid', 'remote')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'closed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_profile_id UUID REFERENCES candidate_profiles(id),
  candidate_name TEXT NOT NULL,
  candidate_email TEXT NOT NULL,
  candidate_phone TEXT,
  resume_url TEXT,
  resume_parsed_data JSONB, -- Claude-parsed resume data
  cover_letter TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'screening', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  overall_score DECIMAL(3,2), -- 0.00 to 5.00
  ai_summary JSONB, -- Claude's overall assessment
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Candidate Profiles table (LinkedIn OAuth profiles)
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,

  -- Basic Info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),

  -- LinkedIn Data
  linkedin_id VARCHAR(255) UNIQUE,
  linkedin_url TEXT,
  profile_picture_url TEXT,
  headline VARCHAR(500),
  location VARCHAR(255),

  -- Profile Status
  profile_completed BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Candidates table (for tracking across multiple applications)
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  skills TEXT[],
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Question Templates table (Claude-generated questions per job)
CREATE TABLE question_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- Array of question objects with evaluation criteria
  evaluation_criteria JSONB, -- What to look for in answers
  question_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. AI Responses table (Claude analysis of candidate answers)
CREATE TABLE ai_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL, -- Reference to question in question_templates.questions
  question_text TEXT NOT NULL,
  candidate_response TEXT NOT NULL,
  ai_analysis JSONB NOT NULL, -- Claude's evaluation including score, strengths, concerns, follow-up suggestions
  response_score DECIMAL(3,2), -- Individual question score
  keywords_matched TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Interview Sessions table (for dynamic conversation flow)
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  session_type TEXT CHECK (session_type IN ('screening', 'technical', 'behavioral', 'final')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  conversation_history JSONB, -- Full Claude conversation thread
  current_question_index INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_score DECIMAL(3,2)
);

-- 8. Resume Embeddings table (for semantic search using Claude)
CREATE TABLE resume_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  content_chunk TEXT NOT NULL,
  chunk_type TEXT CHECK (chunk_type IN ('experience', 'education', 'skills', 'summary', 'projects')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Audit Log table (track AI interactions)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL, -- 'application', 'question_generation', 'response_analysis'
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  ai_model_used TEXT, -- e.g., 'claude-3-sonnet-20241022'
  tokens_used INTEGER,
  latency_ms INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_email ON applications(candidate_email);
CREATE INDEX idx_applications_candidate_profile_id ON applications(candidate_profile_id);
CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_linkedin_id ON candidate_profiles(linkedin_id);
CREATE INDEX idx_candidate_profiles_email ON candidate_profiles(email);
CREATE INDEX idx_question_templates_job_id ON question_templates(job_id);
CREATE INDEX idx_ai_responses_application_id ON ai_responses(application_id);
CREATE INDEX idx_interview_sessions_application_id ON interview_sessions(application_id);
CREATE INDEX idx_resume_embeddings_application_id ON resume_embeddings(application_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- Row Level Security (RLS) Policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resume_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Candidate Profiles RLS Policies
CREATE POLICY "Users can view own profile"
  ON candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Interview Sessions RLS Policies
CREATE POLICY "Candidates can view own interview sessions"
  ON interview_sessions FOR SELECT
  USING (
    application_id IN (
      SELECT id FROM applications
      WHERE candidate_profile_id IN (
        SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Candidates can create interview sessions"
  ON interview_sessions FOR INSERT
  WITH CHECK (
    application_id IN (
      SELECT id FROM applications
      WHERE candidate_profile_id IN (
        SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Candidates can update own interview sessions"
  ON interview_sessions FOR UPDATE
  USING (
    application_id IN (
      SELECT id FROM applications
      WHERE candidate_profile_id IN (
        SELECT id FROM candidate_profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Companies can view interview sessions for their jobs"
  ON interview_sessions FOR SELECT
  USING (
    application_id IN (
      SELECT a.id FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE j.created_by = auth.uid()
    )
  );

-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false);

-- Storage policy for resumes
CREATE POLICY "Authenticated users can upload resumes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'resumes');

CREATE POLICY "Users can read their own resumes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'resumes');

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
