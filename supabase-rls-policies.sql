-- Row Level Security Policies for AI Job Application System
-- These policies ensure users can only access their own data

-- ============================================
-- 1. JOBS TABLE POLICIES
-- ============================================

-- Users can view their own jobs
CREATE POLICY "Users can view own jobs"
ON jobs FOR SELECT
TO authenticated
USING (created_by = auth.uid());

-- Users can insert their own jobs
CREATE POLICY "Users can create jobs"
ON jobs FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs"
ON jobs FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Users can delete their own jobs
CREATE POLICY "Users can delete own jobs"
ON jobs FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- ============================================
-- 2. APPLICATIONS TABLE POLICIES
-- ============================================

-- Users can view applications for their jobs
CREATE POLICY "Users can view applications for own jobs"
ON applications FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs WHERE created_by = auth.uid()
  )
);

-- Service role can insert applications (for public application forms)
-- Note: This will be used by the API to accept applications from candidates
CREATE POLICY "Service role can insert applications"
ON applications FOR INSERT
TO service_role
WITH CHECK (true);

-- Users can update applications for their jobs
CREATE POLICY "Users can update applications for own jobs"
ON applications FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs WHERE created_by = auth.uid()
  )
);

-- ============================================
-- 3. CANDIDATES TABLE POLICIES
-- ============================================

-- Users can view candidates who applied to their jobs
CREATE POLICY "Users can view candidates for own jobs"
ON candidates FOR SELECT
TO authenticated
USING (
  email IN (
    SELECT candidate_email FROM applications
    WHERE job_id IN (SELECT id FROM jobs WHERE created_by = auth.uid())
  )
);

-- Service role can manage candidates
CREATE POLICY "Service role can manage candidates"
ON candidates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 4. QUESTION TEMPLATES TABLE POLICIES
-- ============================================

-- Users can view templates for their jobs
CREATE POLICY "Users can view question templates for own jobs"
ON question_templates FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs WHERE created_by = auth.uid()
  )
);

-- Users can create templates for their jobs
CREATE POLICY "Users can create question templates for own jobs"
ON question_templates FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM jobs WHERE created_by = auth.uid()
  )
);

-- Users can update templates for their jobs
CREATE POLICY "Users can update question templates for own jobs"
ON question_templates FOR UPDATE
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs WHERE created_by = auth.uid()
  )
);

-- Service role full access for AI generation
CREATE POLICY "Service role can manage question templates"
ON question_templates FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 5. AI RESPONSES TABLE POLICIES
-- ============================================

-- Users can view AI responses for their job applications
CREATE POLICY "Users can view AI responses for own jobs"
ON ai_responses FOR SELECT
TO authenticated
USING (
  application_id IN (
    SELECT id FROM applications
    WHERE job_id IN (SELECT id FROM jobs WHERE created_by = auth.uid())
  )
);

-- Service role can manage AI responses
CREATE POLICY "Service role can manage AI responses"
ON ai_responses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 6. INTERVIEW SESSIONS TABLE POLICIES
-- ============================================

-- Users can view interview sessions for their job applications
CREATE POLICY "Users can view sessions for own jobs"
ON interview_sessions FOR SELECT
TO authenticated
USING (
  application_id IN (
    SELECT id FROM applications
    WHERE job_id IN (SELECT id FROM jobs WHERE created_by = auth.uid())
  )
);

-- Service role can manage sessions
CREATE POLICY "Service role can manage sessions"
ON interview_sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 7. RESUME EMBEDDINGS TABLE POLICIES
-- ============================================

-- Users can view resume embeddings for their job applications
CREATE POLICY "Users can view embeddings for own jobs"
ON resume_embeddings FOR SELECT
TO authenticated
USING (
  application_id IN (
    SELECT id FROM applications
    WHERE job_id IN (SELECT id FROM jobs WHERE created_by = auth.uid())
  )
);

-- Service role can manage embeddings
CREATE POLICY "Service role can manage embeddings"
ON resume_embeddings FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- 8. AUDIT LOGS TABLE POLICIES
-- ============================================

-- Users can view audit logs for their entities
CREATE POLICY "Users can view audit logs for own entities"
ON audit_logs FOR SELECT
TO authenticated
USING (
  (entity_type = 'job' AND entity_id IN (SELECT id FROM jobs WHERE created_by = auth.uid()))
  OR
  (entity_type = 'application' AND entity_id IN (
    SELECT id FROM applications
    WHERE job_id IN (SELECT id FROM jobs WHERE created_by = auth.uid())
  ))
  OR
  (entity_type = 'interview_session' AND entity_id IN (
    SELECT id FROM interview_sessions
    WHERE application_id IN (
      SELECT id FROM applications
      WHERE job_id IN (SELECT id FROM jobs WHERE created_by = auth.uid())
    )
  ))
);

-- Service role can manage audit logs
CREATE POLICY "Service role can manage audit logs"
ON audit_logs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
