# Sprint 3 CORRECTED Plan: Conversational AI Interview Experience

**Created**: 2025-10-07
**Status**: DRAFT - Awaiting Approval
**Sprint Goal**: Candidates apply via AI-powered conversational interviews

---

## ⚠️ CRITICAL: What Went Wrong

### Incorrect Implementation (What Was Built)
❌ Traditional application form with:
- Manual form fields (name, email, phone, LinkedIn)
- Resume file upload
- Cover letter textarea
- Submit button
- Static form validation

### Correct Implementation (What Should Be Built)
✅ **Conversational AI Interview** with:
- Chat interface (like ChatGPT)
- Claude AI conducts natural conversation
- Dynamic questions based on job requirements
- Follow-up questions based on responses
- Resume upload as conversation starter (optional)
- Real-time AI analysis and scoring
- Session state management

---

## 🎯 Product Vision Alignment

From `PRODUCT_ROADMAP.md`:
> **#2 Unique Value Proposition**: Conversational Interviews - Natural, human-like AI interactions

From `README.md`:
> 💬 **Dynamic Conversational Interviews** - Conduct natural, adaptive interviews with follow-up questions

**This is a CORE differentiator**, not a Phase 2 feature!

---

## 📋 Corrected Sprint 3 Scope

### Sprint Duration: 2 weeks
### Story Points: 42 SP (original scope, excluding LinkedIn OAuth which was added)

---

## Issues Breakdown

### Issue #37: Interview Session Data Model (3 SP)
**Type**: Backend
**Priority**: HIGH

**Description**:
Set up the `interview_sessions` table and related database infrastructure.

**Tasks**:
- ✅ Already exists in `supabase-schema.sql` (line 108-118)
- [ ] Add RLS policies for interview sessions
- [ ] Create database functions for session management
- [ ] Add indexes for performance

**Table Structure** (already defined):
```sql
CREATE TABLE interview_sessions (
  id UUID PRIMARY KEY,
  application_id UUID REFERENCES applications(id),
  session_type TEXT CHECK (session_type IN ('screening', 'technical', 'behavioral', 'final')),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  conversation_history JSONB, -- Full Claude conversation thread
  current_question_index INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_score DECIMAL(3,2)
);
```

**Acceptance Criteria**:
- [x] Table exists in database
- [ ] RLS policies allow candidates to access their own sessions
- [ ] RLS policies allow companies to view sessions for their job applications
- [ ] Can create, read, update interview sessions via Supabase client

---

### Issue #38: Interview Session API Routes (5 SP)
**Type**: Backend
**Priority**: HIGH

**Description**:
Create API endpoints for managing conversational interview sessions.

**Endpoints** (from `API.md`):

1. **POST /api/interview-session** - Start Interview
   - Input: `{ applicationId, sessionType }`
   - Output: First AI greeting + question
   - Creates session record
   - Generates initial question from question_templates

2. **PUT /api/interview-session** - Submit Answer
   - Input: `{ sessionId, questionId, answer }`
   - Process: Send to Claude for analysis
   - Output: Next question or completion message
   - Updates conversation_history (JSONB)
   - Triggers AI analysis
   - Determines if follow-up needed or move to next question

3. **GET /api/interview-session?sessionId={id}** - Get Session
   - Output: Full session details, conversation history
   - For candidate to resume interrupted session
   - For company to review completed interview

**Tasks**:
- [ ] Create `/app/api/interview-session/route.ts` (POST, GET)
- [ ] Create `/app/api/interview-session/[id]/route.ts` (PUT)
- [ ] Implement Zod validation schemas
- [ ] Add error handling and logging
- [ ] Test with Postman/Thunder Client

**Acceptance Criteria**:
- [ ] Can start new interview session
- [ ] Can submit answers and get next questions
- [ ] Can retrieve session details
- [ ] Conversation history stored correctly in JSONB
- [ ] Progress tracking works (questions answered / total)

---

### Issue #39: Claude Conversation Manager (8 SP)
**Type**: AI Integration
**Priority**: HIGH

**Description**:
Build the core AI logic for managing conversational interview flow.

**File**: `/lib/ai/conversation-manager.ts`

**Key Functions**:

```typescript
/**
 * Generate initial greeting and first question
 */
async function startInterview(params: {
  candidateName: string;
  jobTitle: string;
  questions: Question[]; // From question_templates
}): Promise<{
  greeting: string;
  firstQuestion: Question;
}>

/**
 * Analyze candidate response and determine next step
 */
async function processAnswer(params: {
  conversationHistory: Message[];
  currentQuestion: Question;
  candidateAnswer: string;
  remainingQuestions: Question[];
}): Promise<{
  analysis: AIAnalysis; // Score, strengths, concerns
  needsFollowUp: boolean;
  followUpQuestion?: string;
  nextQuestion?: Question;
  transitionMessage: string; // Natural transition from Claude
}>

/**
 * Generate follow-up question based on candidate's answer
 */
async function generateFollowUp(params: {
  originalQuestion: Question;
  candidateAnswer: string;
  conversationHistory: Message[];
}): Promise<{
  followUpQuestion: string;
  rationale: string; // Why this follow-up is needed
}>

/**
 * Generate completion message
 */
async function concludeInterview(params: {
  candidateName: string;
  totalScore: number;
  questionsAnswered: number;
}): Promise<{
  closingMessage: string;
  summary: SessionSummary;
}>
```

**Claude Prompts**:
- Use system prompt to set "professional interviewer" persona
- Include job context and evaluation criteria
- Maintain conversation flow across messages
- Natural transitions between questions
- Empathetic, encouraging tone

**Tasks**:
- [ ] Create conversation-manager.ts
- [ ] Implement startInterview()
- [ ] Implement processAnswer()
- [ ] Implement generateFollowUp()
- [ ] Implement concludeInterview()
- [ ] Write prompt templates
- [ ] Add conversation history management
- [ ] Test with various scenarios

**Acceptance Criteria**:
- [ ] AI greeting feels natural and personalized
- [ ] Transitions between questions are smooth
- [ ] Follow-up questions are relevant and insightful
- [ ] Closing message is professional and encouraging
- [ ] Conversation history properly formatted

---

### Issue #40: Chat UI Component (6 SP)
**Type**: Frontend
**Priority**: HIGH

**Description**:
Build the chat interface for conversational interviews.

**File**: `/components/interview/chat-interface.tsx`

**Features**:
- Message bubbles (candidate vs AI)
- Typing indicators when AI is "thinking"
- Scroll to bottom on new messages
- Input field with send button
- Progress bar (X of Y questions answered)
- Session timer
- "Resume Later" button
- Responsive design (mobile-first)

**Component Structure**:
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  questionId?: string; // If this message is a question
}

interface ChatInterfaceProps {
  sessionId: string;
  conversationHistory: Message[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  progress: {
    current: number;
    total: number;
  };
}
```

**UI Libraries**:
- Use shadcn/ui components (Button, Input, ScrollArea)
- lucide-react icons (Send, Loader2)
- Tailwind CSS for styling

**Tasks**:
- [ ] Create ChatInterface component
- [ ] Create MessageBubble component
- [ ] Add typing indicator animation
- [ ] Implement auto-scroll behavior
- [ ] Add progress bar
- [ ] Add session timer
- [ ] Make responsive for mobile
- [ ] Add keyboard shortcuts (Enter to send)

**Acceptance Criteria**:
- [ ] Messages display correctly (user right, AI left)
- [ ] Smooth scrolling behavior
- [ ] Loading states clear and professional
- [ ] Works on mobile (360px width)
- [ ] Timestamps formatted correctly
- [ ] Progress updates in real-time

---

### Issue #41: Interview Application Page (5 SP)
**Type**: Frontend
**Priority**: HIGH

**Description**:
Create the main application page with conversational interview.

**Route**: `/app/jobs/[id]/apply/page.tsx`

**Flow**:
1. **Step 1: Resume Upload (Optional)**
   - "Upload your resume or start interview without it"
   - Parse resume if uploaded
   - Extract name, email for pre-fill

2. **Step 2: Start Interview**
   - Show job title and company
   - "Start Interview" button
   - Creates application record
   - Starts interview session
   - Redirects to chat interface

3. **Step 3: Chat Interview**
   - Full-screen chat interface
   - AI conducts interview
   - 8 questions total (as per question_templates)
   - Can pause and resume later

4. **Step 4: Completion**
   - Thank you message from AI
   - "Your responses have been submitted"
   - Option to view dashboard (if logged in)

**Tasks**:
- [ ] Create apply/page.tsx
- [ ] Add resume upload step (use existing upload logic)
- [ ] Create interview start page
- [ ] Integrate ChatInterface component
- [ ] Handle session state management
- [ ] Add completion screen
- [ ] Add error handling (network issues)
- [ ] Add "Resume Later" functionality

**Acceptance Criteria**:
- [ ] Can start interview with or without resume
- [ ] Chat interface loads correctly
- [ ] Messages sent and received successfully
- [ ] Interview completes after all questions
- [ ] Can resume interrupted sessions
- [ ] Error messages clear and actionable

---

### Issue #42: Resume Integration with AI (4 SP)
**Type**: AI Integration
**Priority**: MEDIUM

**Description**:
Use uploaded resume to enhance conversational interview.

**Features**:
- If resume uploaded, parse it first (use existing parser)
- Claude uses resume context in conversation
- More targeted follow-up questions based on resume
- Skip basic questions if resume has the info

**Example**:
```
Without resume:
AI: "Tell me about your work experience"

With resume:
AI: "I see you worked at Google for 3 years as a Staff Engineer.
     Tell me about your biggest technical accomplishment there."
```

**Tasks**:
- [ ] Integrate resume parsing with interview session
- [ ] Pass parsed resume data to conversation manager
- [ ] Update Claude prompts to use resume context
- [ ] Test with various resume formats
- [ ] Handle cases where resume parsing fails

**Acceptance Criteria**:
- [ ] Resume data included in Claude context
- [ ] Questions more personalized with resume
- [ ] Graceful handling if resume not uploaded
- [ ] No duplicate questions (don't ask what's in resume)

---

### Issue #43: Company Interview Review Dashboard (5 SP)
**Type**: Frontend
**Priority**: HIGH

**Description**:
Allow companies to review completed conversational interviews.

**Route**: `/app/dashboard/applications/[id]/interview/page.tsx`

**Features**:
- Full conversation transcript
- AI analysis for each answer
- Individual question scores
- Overall interview score
- Strengths and concerns summary
- Recommendation (hire/reject/maybe)
- Side-by-side: resume + interview

**UI Components**:
- Conversation timeline
- Score visualizations (progress circles)
- Highlight keywords matched
- Exportable transcript (PDF)

**Tasks**:
- [ ] Create interview review page
- [ ] Display conversation history
- [ ] Show AI analysis per question
- [ ] Add score visualization
- [ ] Create summary card
- [ ] Add export functionality
- [ ] Link from application detail page

**Acceptance Criteria**:
- [ ] Can view full conversation
- [ ] AI analysis clearly displayed
- [ ] Scores easy to understand
- [ ] Can export transcript
- [ ] Links back to application detail

---

### Issue #44: Session State Management (3 SP)
**Type**: Frontend
**Priority**: MEDIUM

**Description**:
Manage interview session state on frontend.

**Features**:
- Store session ID in localStorage
- Detect interrupted sessions
- Prompt to resume on page load
- Handle session timeout (30 min inactivity)
- Clear session on completion

**Libraries**:
- React Context or Zustand for state
- localStorage for persistence

**Tasks**:
- [ ] Create InterviewSessionContext
- [ ] Add localStorage hooks
- [ ] Implement session detection
- [ ] Add resume prompt
- [ ] Handle timeouts
- [ ] Clear on completion

**Acceptance Criteria**:
- [ ] Can resume interrupted session
- [ ] Session persists across page refreshes
- [ ] Timeout handled gracefully
- [ ] Completed sessions cleared

---

### Issue #45: Application Status Workflow (3 SP)
**Type**: Backend
**Priority**: MEDIUM

**Description**:
Update application status based on interview completion.

**Flow**:
1. Application created → status: `submitted`
2. Interview started → status: `interviewing`
3. Interview completed → status: `screening` (awaiting company review)
4. Company reviews → status: `offer` or `rejected`

**Tasks**:
- [ ] Update status on interview start
- [ ] Update status on interview completion
- [ ] Add status change audit logs
- [ ] Update application list filters

**Acceptance Criteria**:
- [ ] Status updates automatically
- [ ] Audit logs created
- [ ] Filters work correctly

---

## 📊 Sprint Metrics

**Total Story Points**: 42 SP
**Sprint Duration**: 2 weeks (10 business days)
**Velocity Target**: ~21 SP/week

**Week 1** (23 SP):
- Issues #37-40 (Backend + AI + Chat UI)

**Week 2** (19 SP):
- Issues #41-45 (Frontend integration + Polish)

---

## 🧪 Testing Plan

### Manual Testing Scenarios

1. **Happy Path**:
   - Upload resume
   - Start interview
   - Answer all 8 questions
   - Receive completion message
   - Company reviews transcript

2. **Resume Optional**:
   - Start interview without resume
   - Answer questions
   - Complete successfully

3. **Interrupted Session**:
   - Start interview
   - Answer 3 questions
   - Close browser
   - Return to page
   - Resume from question 4

4. **Follow-up Questions**:
   - Give vague answer
   - AI asks follow-up
   - Give detailed answer
   - AI moves to next question

5. **Network Error**:
   - Disconnect internet mid-interview
   - Reconnect
   - Resume successfully

---

## 🔧 Technical Architecture

### Data Flow

```
1. Candidate visits /jobs/[id]/apply
2. (Optional) Upload resume → Parse with Claude
3. Click "Start Interview"
   ↓
4. POST /api/interview-session
   - Creates application record (status: submitted)
   - Creates interview_session record
   - Fetches questions from question_templates
   - Claude generates greeting + first question
   ↓
5. Candidate types answer → Click Send
   ↓
6. PUT /api/interview-session
   - Stores answer in conversation_history
   - Claude analyzes response
   - Determines: follow-up or next question
   - Returns AI message
   ↓
7. Repeat step 5-6 until all questions answered
   ↓
8. Interview completes
   - Update interview_session.status = 'completed'
   - Update application.status = 'screening'
   - Calculate total_score
   - Claude generates closing message
   ↓
9. Company reviews in dashboard
   - View conversation transcript
   - View AI analysis
   - Make hiring decision
```

### Database Tables Involved

**Already Exist**:
- `jobs` - Job postings
- `applications` - Applications submitted
- `question_templates` - AI-generated questions per job
- `interview_sessions` - Conversation state
- `ai_responses` - Analysis per answer

**New**:
- None (all tables already defined in schema)

---

## ⚠️ What NOT to Build

These are Phase 2 features, NOT Sprint 3:
- ❌ LinkedIn profile import (basic OAuth done, full import is Sprint 5)
- ❌ Email notifications
- ❌ Video interviews
- ❌ Candidate portal/dashboard
- ❌ Application tracking for candidates
- ❌ Bulk operations
- ❌ Advanced analytics

---

## 📝 Definition of Done

A task is complete when:
- ✅ Code written and tested locally
- ✅ PR created and reviewed
- ✅ Merged to production branch
- ✅ Deployed to Vercel
- ✅ Tested on staging with real scenarios
- ✅ Documentation updated (if applicable)
- ✅ No critical bugs

---

## 🚨 Critical Success Factors

1. **Conversation feels natural** - Not robotic or form-like
2. **AI transitions smoothly** - Between questions
3. **Follow-ups are relevant** - Based on candidate's answer
4. **Mobile experience works** - Most candidates apply on mobile
5. **Session resume works** - Don't lose progress
6. **Company can review easily** - Clear transcript and analysis

---

## 📚 Key Files to Create

```
lib/ai/
├── conversation-manager.ts        # NEW - Core AI conversation logic
└── resume-parser.ts               # EXISTS - Reuse for resume integration

app/api/
├── interview-session/
│   ├── route.ts                   # NEW - POST (start), GET (retrieve)
│   └── [id]/route.ts              # NEW - PUT (submit answer)

components/interview/
├── chat-interface.tsx             # NEW - Main chat UI
├── message-bubble.tsx             # NEW - Individual message
└── typing-indicator.tsx           # NEW - AI "thinking" animation

app/jobs/[id]/apply/
├── page.tsx                       # REPLACE - Conversational flow
└── success/page.tsx               # EXISTS - Keep as-is

app/dashboard/applications/[id]/
└── interview/page.tsx             # NEW - Company review page
```

---

## 🎯 Sprint Goal Statement

> "By the end of Sprint 3, candidates can apply to jobs through a natural, AI-powered conversational interview that feels like chatting with a recruiter, while companies can review detailed interview transcripts with AI-generated insights."

---

## Next Steps

1. ✅ Get user approval on this corrected plan
2. ⏸️ Create GitHub issues for each task
3. ⏸️ Begin implementation starting with Issue #37
4. ⏸️ Daily progress updates
5. ⏸️ Demo at end of Sprint 3

---

**Status**: AWAITING APPROVAL ⏳

Please review and approve before I proceed with implementation.
