# Sprint 3: Application Submission & AI Resume Parsing

**Sprint Goal**: Candidates can apply to jobs with resume upload and AI-powered parsing

**Duration**: 2 weeks
**Story Points**: 42 SP
**Priority**: HIGH - Core candidate experience

---

## 🎯 Sprint Objectives

By the end of Sprint 3, the system should:
1. ✅ Allow candidates to submit applications to active jobs
2. ✅ Upload and store resume files securely
3. ✅ Parse resumes automatically using Claude AI
4. ✅ Structure candidate data for evaluation
5. ✅ Enable companies to view and manage applications
6. ✅ Track application status through workflow

---

## 📋 Issues Breakdown

### Foundation & Setup

#### Issue #24: Application Data Model & API Routes (5 SP)
**Priority**: HIGH
**Type**: Backend
**Dependencies**: Sprint 2 complete

**Description**:
Create the backend infrastructure for handling job applications, including database schema, API routes, and data validation.

**Tasks**:
- [ ] Design application database schema
- [ ] Create API route: POST /api/jobs/[id]/apply
- [ ] Create API route: GET /api/applications (for companies)
- [ ] Create API route: GET /api/applications/[id]
- [ ] Create API route: PATCH /api/applications/[id] (status updates)
- [ ] Add request validation with Zod
- [ ] Implement authentication checks
- [ ] Add error handling and logging

**Acceptance Criteria**:
- Applications can be created via API
- Companies can only see their own job applications
- Proper validation prevents invalid submissions
- Status updates work correctly
- API returns proper error codes

**Database Schema**:
```sql
applications (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES jobs(id),
  candidate_name VARCHAR(255) NOT NULL,
  candidate_email VARCHAR(255) NOT NULL,
  candidate_phone VARCHAR(50),
  resume_url TEXT,
  resume_parsed_data JSONB,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'submitted',
  overall_score DECIMAL(5,2),
  ai_summary JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
)
```

---

#### Issue #25: File Upload Setup (Supabase Storage) (3 SP)
**Priority**: HIGH
**Type**: Backend
**Dependencies**: #24

**Description**:
Configure Supabase Storage for resume uploads with proper security policies and file handling.

**Tasks**:
- [ ] Create 'resumes' storage bucket in Supabase
- [ ] Set up Row Level Security (RLS) policies
- [ ] Configure file size limits (5MB max)
- [ ] Set allowed file types (.pdf, .doc, .docx)
- [ ] Create helper functions for file upload
- [ ] Add file validation utilities
- [ ] Implement secure file naming (UUID-based)
- [ ] Add error handling for upload failures

**Acceptance Criteria**:
- Files upload successfully to Supabase Storage
- Only allowed file types accepted
- File size limit enforced
- Files stored with secure, unique names
- Proper error messages for failures
- RLS prevents unauthorized access

**File Upload Limits**:
- Max size: 5MB
- Formats: PDF, DOC, DOCX
- Naming: `{uuid}_{timestamp}.{ext}`

---

### Application Submission Flow

#### Issue #26: Application Form UI Component (4 SP)
**Priority**: HIGH
**Type**: Frontend
**Dependencies**: #24, #25

**Description**:
Build a comprehensive application form component with file upload, form validation, and submission handling.

**Tasks**:
- [ ] Create ApplicationForm component
- [ ] Add personal information fields (name, email, phone)
- [ ] Implement resume file upload with drag-and-drop
- [ ] Add cover letter textarea
- [ ] Create Zod validation schema
- [ ] Implement react-hook-form integration
- [ ] Add file preview functionality
- [ ] Show upload progress indicator
- [ ] Add form submission loading states
- [ ] Create success/error message displays

**Acceptance Criteria**:
- Form validates all required fields
- File upload works with drag-and-drop
- Upload progress displays correctly
- Form shows validation errors clearly
- Success message displayed after submission
- Form is responsive on mobile
- Cover letter optional but encouraged

**Form Fields**:
- Full Name (required)
- Email (required, validated)
- Phone (optional)
- Resume Upload (required, .pdf/.doc/.docx)
- Cover Letter (optional, max 5000 chars)
- LinkedIn URL (optional)
- Portfolio URL (optional)

---

#### Issue #27: Application Submission Page (3 SP)
**Priority**: HIGH
**Type**: Frontend
**Dependencies**: #26

**Description**:
Create the public application submission page at `/jobs/[id]/apply`.

**Tasks**:
- [ ] Create /jobs/[id]/apply page
- [ ] Display job information at top
- [ ] Integrate ApplicationForm component
- [ ] Add "Back to Job" navigation
- [ ] Handle form submission to API
- [ ] Implement file upload to Supabase Storage
- [ ] Show success page after submission
- [ ] Add error handling and retry logic
- [ ] Implement loading states
- [ ] Make page responsive

**Acceptance Criteria**:
- Job details display correctly
- Form submits successfully
- Resume uploads to storage
- Success page shown after submission
- Error messages display clearly
- Page is fully responsive
- Cannot apply to inactive jobs

**Success Page Elements**:
- Thank you message
- Application confirmation
- Next steps information
- Return to jobs link

---

### AI Resume Parsing

#### Issue #28: Claude Resume Parser Server Action (6 SP)
**Priority**: HIGH
**Type**: Backend AI
**Dependencies**: #24, #25

**Description**:
Implement AI-powered resume parsing using Claude to extract structured data from uploaded resumes.

**Tasks**:
- [ ] Create server action: parseResume()
- [ ] Implement file download from Supabase Storage
- [ ] Extract text from PDF files (pdf-parse)
- [ ] Extract text from DOC/DOCX files (mammoth)
- [ ] Create Claude API prompt for parsing
- [ ] Parse structured data (experience, education, skills)
- [ ] Validate parsed data structure
- [ ] Store parsed data in database
- [ ] Add error handling and logging
- [ ] Implement retry logic for failures

**Acceptance Criteria**:
- Resumes are parsed accurately
- Structured data extracted correctly
- Works with PDF, DOC, DOCX formats
- Handles parsing errors gracefully
- Parsed data stored in correct format
- Audit logs created for parsing

**Parsed Data Structure**:
```typescript
{
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
  experience: [{
    company: string;
    position: string;
    location?: string;
    start_date: string;
    end_date?: string;
    is_current: boolean;
    description: string[];
    technologies?: string[];
    achievements?: string[];
  }];
  education: [{
    institution: string;
    degree: string;
    field_of_study?: string;
    graduation_date?: string;
    gpa?: string;
    honors?: string[];
  }];
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: [{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github_url?: string;
    role?: string;
  }];
  achievements?: string[];
  total_experience_years?: number;
}
```

**Dependencies to Install**:
```bash
npm install pdf-parse mammoth
```

---

#### Issue #29: Trigger Resume Parsing on Application Submit (2 SP)
**Priority**: HIGH
**Type**: Backend Integration
**Dependencies**: #27, #28

**Description**:
Integrate resume parsing into the application submission flow.

**Tasks**:
- [ ] Trigger parseResume() after file upload
- [ ] Run parsing asynchronously (non-blocking)
- [ ] Update application with parsed data
- [ ] Add parsing status tracking
- [ ] Handle parsing failures gracefully
- [ ] Log parsing metrics (time, success rate)
- [ ] Show parsing status in admin view

**Acceptance Criteria**:
- Parsing triggers automatically after submission
- Application submission not blocked by parsing
- Parsed data updates application record
- Failures logged but don't break submission
- Parsing status visible to admins

**Status Flow**:
1. Application submitted → status: 'submitted'
2. Resume parsing starts → parsing_status: 'parsing'
3. Parsing completes → parsing_status: 'completed'
4. Parsing fails → parsing_status: 'failed'

---

### Company Application Management

#### Issue #30: Application List Page (Company View) (5 SP)
**Priority**: HIGH
**Type**: Frontend
**Dependencies**: #24

**Description**:
Create a page for companies to view all applications for their jobs.

**Tasks**:
- [ ] Create /dashboard/applications page
- [ ] Create ApplicationCard component
- [ ] Fetch applications via API
- [ ] Display application list in grid
- [ ] Show application status badges
- [ ] Add filtering by job
- [ ] Add filtering by status
- [ ] Add search by candidate name
- [ ] Add sorting (date, status, score)
- [ ] Implement pagination
- [ ] Add empty state
- [ ] Make responsive

**Acceptance Criteria**:
- All applications display correctly
- Filters work properly
- Search finds candidates
- Sorting functions correctly
- Pagination works
- Links to application details
- Responsive on all devices

**Application Card Shows**:
- Candidate name
- Applied position (job title)
- Status badge
- Application date
- Overall score (if available)
- "View Details" button

---

#### Issue #31: Application Detail Page (Company View) (6 SP)
**Priority**: HIGH
**Type**: Frontend
**Dependencies**: #28, #30

**Description**:
Create a detailed view for companies to review individual applications with parsed resume data.

**Tasks**:
- [ ] Create /dashboard/applications/[id] page
- [ ] Display candidate information
- [ ] Show parsed resume data sections
- [ ] Display cover letter
- [ ] Show resume download link
- [ ] Add status update dropdown
- [ ] Create notes section (future: add notes)
- [ ] Display AI-generated summary (Sprint 4)
- [ ] Add "Previous/Next" navigation
- [ ] Make responsive

**Acceptance Criteria**:
- All candidate data displays correctly
- Parsed resume shows structured format
- Resume can be downloaded
- Status can be updated
- Page is responsive
- Navigation between applications works

**Page Sections**:
1. Header (name, status, score)
2. Contact Information
3. Resume Summary
4. Work Experience
5. Education
6. Skills & Certifications
7. Projects (if any)
8. Cover Letter
9. Actions (update status, download resume)

---

#### Issue #32: Application Status Management (3 SP)
**Priority**: MEDIUM
**Type**: Frontend + Backend
**Dependencies**: #31

**Description**:
Implement status workflow for applications with proper tracking.

**Tasks**:
- [ ] Create status update API endpoint
- [ ] Add status dropdown in detail page
- [ ] Implement status change logic
- [ ] Add confirmation for status changes
- [ ] Track status history (audit log)
- [ ] Add status filters in list view
- [ ] Show status badges
- [ ] Add status change notifications (future)

**Acceptance Criteria**:
- Status updates work correctly
- Changes logged in audit trail
- Filters work with new statuses
- Confirmation required for major changes
- History visible to admins

**Status Workflow**:
```
submitted → reviewing → screening → interviewing → offer → rejected/withdrawn
```

---

### Polish & Testing

#### Issue #33: Application Email Notifications (3 SP)
**Priority**: MEDIUM
**Type**: Backend Integration
**Dependencies**: #27

**Description**:
Send email confirmations to candidates and notifications to companies.

**Tasks**:
- [ ] Set up email service (Resend or Supabase)
- [ ] Create email templates
- [ ] Send confirmation to candidate on apply
- [ ] Send notification to company on new application
- [ ] Add unsubscribe functionality
- [ ] Handle email failures gracefully
- [ ] Log email activity

**Acceptance Criteria**:
- Candidates receive confirmation emails
- Companies notified of new applications
- Emails are well-formatted
- Unsubscribe works
- Failures logged but don't block flow

**Email Templates**:
1. Candidate: Application confirmation
2. Company: New application notification

---

#### Issue #34: Application Analytics Dashboard (2 SP)
**Priority**: LOW
**Type**: Frontend
**Dependencies**: #30

**Description**:
Add application metrics to the company dashboard.

**Tasks**:
- [ ] Update dashboard stats API
- [ ] Add application count widgets
- [ ] Show applications by status chart
- [ ] Display recent applications list
- [ ] Add application rate metrics
- [ ] Make widgets responsive

**Acceptance Criteria**:
- Dashboard shows application counts
- Charts display correctly
- Recent applications visible
- Metrics update in real-time
- Responsive design

**Metrics to Display**:
- Total applications
- Applications this week
- Applications by status
- Average time to review
- Top jobs by applications

---

## 📊 Sprint Metrics

**Total Story Points**: 42 SP

### By Priority
- HIGH: 37 SP (88%)
- MEDIUM: 3 SP (7%)
- LOW: 2 SP (5%)

### By Type
- Backend: 13 SP (31%)
- Frontend: 18 SP (43%)
- Backend AI: 6 SP (14%)
- Integration: 5 SP (12%)

### Week 1 Target (Issues #24-29): 23 SP
- Foundation & API setup
- Application submission flow
- AI resume parsing

### Week 2 Target (Issues #30-34): 19 SP
- Company application management
- Status workflow
- Email notifications
- Analytics

---

## 🔧 Technical Requirements

### New Dependencies
```bash
npm install pdf-parse mammoth resend
```

### Environment Variables
```bash
# Existing
ANTHROPIC_API_KEY=<claude-api-key>

# New for Sprint 3
RESEND_API_KEY=<resend-api-key>
NEXT_PUBLIC_MAX_FILE_SIZE=5242880  # 5MB
```

### Supabase Setup
1. Create 'resumes' storage bucket
2. Configure RLS policies for storage
3. Update applications table schema
4. Create audit_logs table (for status tracking)

---

## 🎯 Acceptance Criteria (Sprint Level)

Sprint 3 is complete when:
- ✅ Candidates can apply to jobs with resume upload
- ✅ Resumes are parsed automatically by Claude
- ✅ Companies can view all applications
- ✅ Application details show parsed data
- ✅ Status workflow functions correctly
- ✅ Email notifications are sent
- ✅ Dashboard shows application metrics
- ✅ All features are responsive
- ✅ Smoke tests pass

---

## 🧪 Testing Strategy

### Quick Smoke Tests (30 min)
1. Apply to a job with resume upload
2. Verify resume parses correctly
3. Check application appears in company list
4. Open application detail page
5. Update application status
6. Verify email notifications
7. Check dashboard metrics
8. Test on mobile device

### Full Testing (Before Production)
- Use Sprint 3 testing guide (to be created)
- 50+ comprehensive test cases
- Cross-browser testing
- File upload edge cases
- AI parsing accuracy validation

---

## 🚀 Sprint 3 Workflow

### Day 1-3: Foundation
- Issues #24, #25 (Backend setup)
- Database schema
- API routes
- File upload configuration

### Day 4-7: Application Flow
- Issues #26, #27 (Frontend forms)
- Application submission
- File upload UI

### Day 8-10: AI Parsing
- Issues #28, #29 (AI integration)
- Resume parsing
- Data extraction
- Testing parsing accuracy

### Day 11-13: Company Management
- Issues #30, #31, #32 (Company views)
- Application list
- Detail pages
- Status management

### Day 14: Polish & Testing
- Issues #33, #34 (Notifications & analytics)
- Email setup
- Dashboard metrics
- Smoke testing

---

## 📚 Resources

### Claude AI Resources
- Resume parsing best practices
- Structured data extraction
- Error handling patterns

### Supabase Resources
- Storage setup: https://supabase.com/docs/guides/storage
- RLS policies for storage
- File upload best practices

### File Processing
- pdf-parse docs: https://www.npmjs.com/package/pdf-parse
- mammoth docs: https://www.npmjs.com/package/mammoth

---

## 🔄 Integration with Sprint 2

Sprint 3 builds on Sprint 2:
- Uses job data from Sprint 2
- Connects applications to jobs
- Extends dashboard with application metrics
- Uses AI integration patterns established

---

## 🎯 Sprint 4 Preview

Sprint 4 will build on Sprint 3 applications:
- AI screening interviews
- Candidate scoring and ranking
- Interview session management
- AI-generated candidate summaries

---

## ✅ Definition of Done

For each issue:
- [ ] Code complete and tested
- [ ] API routes documented
- [ ] Components responsive
- [ ] Error handling implemented
- [ ] Committed to git
- [ ] Smoke tested

For the sprint:
- [ ] All 11 issues complete
- [ ] Smoke test passes (30 min)
- [ ] Deployed to staging
- [ ] Documentation updated
- [ ] Ready for Sprint 4

---

**Created**: 2025-10-06
**Sprint Start**: TBD
**Sprint End**: TBD
**Velocity Target**: 42 SP in 14 days (3 SP/day)
