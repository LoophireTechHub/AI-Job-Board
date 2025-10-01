# MVP Development Plan - AI Job Board

## Executive Summary

**Goal**: Launch a functional MVP that allows companies to post jobs, receive applications, and use AI to screen candidates.

**Timeline**: 8-10 weeks (4-5 sprints × 2 weeks each)

**Launch Date Target**: ~10 weeks from start

---

## MVP Scope Definition

### What's IN the MVP ✅

**Core Features** (Must-Have):
1. User authentication (company accounts)
2. Job posting CRUD (Create, Read, Update, Delete)
3. Public job board (candidate view)
4. Application submission (resume upload + basic form)
5. AI resume parsing with Claude
6. AI question generation per job
7. Basic candidate dashboard for companies
8. AI-powered candidate scoring
9. Simple email notifications

**Technical Requirements**:
- Functional database with core tables
- Working Claude API integration
- Supabase auth working
- Deployed to production (Vercel)
- Basic responsive UI

### What's OUT of the MVP ❌

**Future Features** (Nice-to-Have, Post-MVP):
- Video interviews
- Advanced analytics dashboard
- Candidate portal for status tracking
- Multi-language support
- Integration with other ATS systems
- Advanced search and filtering
- Bulk operations
- Team collaboration features
- Custom branding
- Payment/subscription system

---

## Sprint Breakdown

### Sprint 0: Setup & Planning (Week 0)
**Duration**: 3-5 days
**Goal**: Project setup and team alignment

- [x] ✅ Initialize repository
- [x] ✅ Set up documentation
- [x] ✅ Define architecture
- [ ] Set up GitHub Project board
- [ ] Create all sprint issues
- [ ] Set up development environment
- [ ] Configure CI/CD pipeline

---

### Sprint 1: Foundation (Weeks 1-2)
**Goal**: Get basic infrastructure and auth working

#### Backend Tasks
- [ ] Set up Supabase project (production)
- [ ] Run database migrations
- [ ] Configure Row Level Security (RLS) policies
- [ ] Test Supabase connection
- [ ] Set up Anthropic API account

#### Frontend Tasks
- [ ] Create landing page
- [ ] Build authentication pages (sign up, sign in)
- [ ] Create dashboard layout
- [ ] Set up navigation structure
- [ ] Add loading states and error handling

#### DevOps
- [ ] Deploy to Vercel (staging)
- [ ] Set up environment variables
- [ ] Configure domain (if available)
- [ ] Set up error tracking (Sentry)

**Deliverable**: Users can sign up, log in, and see empty dashboard

---

### Sprint 2: Job Management (Weeks 3-4)
**Goal**: Companies can create and manage jobs

#### Features
- [ ] Create job form with all fields
- [ ] Job listing page (company view)
- [ ] Edit job functionality
- [ ] Delete job functionality
- [ ] Job status management (draft, active, closed)
- [ ] Public job board (candidate view)
- [ ] Job detail page (public)

#### UI Components
- [ ] Job card component
- [ ] Job form component
- [ ] Filter/search bar (basic)
- [ ] Status badges

#### API Integration
- [ ] Test `/api/generate-questions` endpoint
- [ ] Auto-generate questions when job is published
- [ ] Store questions in database

**Deliverable**: Companies can post jobs, candidates can view them

---

### Sprint 3: Applications & AI Resume Parsing (Weeks 5-6)
**Goal**: Candidates can apply, resumes are parsed with AI

#### Features
- [ ] Application submission form
- [ ] Resume upload to Supabase Storage
- [ ] File validation (PDF, DOC, DOCX)
- [ ] Resume parsing with Claude
- [ ] Store parsed data in database
- [ ] Application list view (company side)
- [ ] Application detail view
- [ ] Application status labels

#### AI Integration
- [ ] Integrate `/api/parse-resume` endpoint
- [ ] Handle parsing errors gracefully
- [ ] Display parsed resume data nicely
- [ ] Calculate job fit score

#### Database
- [ ] Test application flow end-to-end
- [ ] Verify data storage
- [ ] Add database indexes for performance

**Deliverable**: Candidates can apply, companies see parsed resumes

---

### Sprint 4: AI Screening & Scoring (Weeks 7-8)
**Goal**: AI automatically screens and scores candidates

#### Features
- [ ] Display AI-generated questions on application detail
- [ ] Candidate response viewing
- [ ] Trigger AI analysis on application submit
- [ ] Display AI scores and recommendations
- [ ] Sort candidates by score
- [ ] Filter candidates by status
- [ ] Bulk status updates (approve/reject)

#### AI Integration
- [ ] Integrate `/api/analyze-response` fully
- [ ] Generate overall candidate assessment
- [ ] Display strengths/concerns from AI
- [ ] Add "AI Insights" panel

#### UI Polish
- [ ] Score visualization (progress bars, badges)
- [ ] Candidate comparison view
- [ ] Quick actions (shortlist, reject)

**Deliverable**: Companies can see AI-scored candidates with insights

---

### Sprint 5: Polish & Launch Prep (Weeks 9-10)
**Goal**: Production-ready application

#### Critical Fixes
- [ ] Fix all high-priority bugs
- [ ] Performance optimization
- [ ] Security audit
- [ ] Mobile responsiveness check
- [ ] Cross-browser testing

#### User Experience
- [ ] Add onboarding flow for new companies
- [ ] Improve error messages
- [ ] Add help tooltips
- [ ] Create demo video
- [ ] Write user guide

#### Email Notifications
- [ ] Set up email service (Resend or SendGrid)
- [ ] Application received email (candidate)
- [ ] New application email (company)
- [ ] Status change emails

#### Production Deployment
- [ ] Deploy to production Vercel
- [ ] Set up custom domain
- [ ] Configure production environment variables
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Create backup strategy

#### Marketing Prep
- [ ] Create landing page copy
- [ ] Add testimonials section (if available)
- [ ] Set up analytics (Google Analytics)
- [ ] Prepare launch announcement

**Deliverable**: Production-ready MVP launched! 🚀

---

## Sprint Structure

### Sprint Length
- **Duration**: 2 weeks per sprint
- **Planning**: Monday of Week 1 (2 hours)
- **Daily Standups**: 15 minutes (async via Slack/Discord ok)
- **Demo**: Friday of Week 2 (1 hour)
- **Retrospective**: Friday of Week 2 (1 hour)

### Sprint Ceremonies

#### Sprint Planning (2 hours)
- Review sprint goals
- Break down user stories into tasks
- Estimate effort (story points or hours)
- Assign tasks to team members
- Define "Definition of Done"

#### Daily Standup (15 minutes)
Each team member shares:
1. What did I complete yesterday?
2. What am I working on today?
3. Any blockers?

#### Sprint Demo (1 hour)
- Showcase completed features
- Get stakeholder feedback
- Update product backlog based on feedback

#### Sprint Retrospective (1 hour)
- What went well?
- What could be improved?
- Action items for next sprint

---

## Team Structure (Recommended)

### For Solo Developer
- Focus on one sprint at a time
- Use GitHub Projects to track progress
- Deploy early and often
- Get user feedback continuously

### For Small Team (2-3 people)
**Roles**:
- Full-Stack Developer (Lead)
- Frontend Developer
- Designer/UX (Part-time or contract)

**Workload**:
- ~20-30 hours per person per sprint
- Prioritize based on skills

### For Larger Team (4+ people)
**Roles**:
- Product Manager
- 2× Full-Stack Developers
- Frontend Developer
- Backend Developer
- Designer/UX
- QA Tester

---

## GitHub Project Setup

### Board Columns
1. **📋 Backlog** - All future tasks
2. **📝 Sprint Backlog** - Current sprint tasks
3. **🔨 In Progress** - Actively being worked on
4. **👀 In Review** - PR submitted, awaiting review
5. **✅ Done** - Completed and deployed

### Labels
- `priority: high` 🔴
- `priority: medium` 🟡
- `priority: low` 🟢
- `type: feature` - New feature
- `type: bug` - Bug fix
- `type: docs` - Documentation
- `sprint-1`, `sprint-2`, etc.
- `backend`, `frontend`, `ai`, `database`

### Milestones
- `Sprint 1: Foundation`
- `Sprint 2: Job Management`
- `Sprint 3: Applications`
- `Sprint 4: AI Screening`
- `Sprint 5: Launch`
- `MVP Launch`

---

## Definition of Done

A task is "Done" when:
- ✅ Code is written and tested locally
- ✅ PR is created and reviewed
- ✅ Tests pass (if applicable)
- ✅ Code is merged to main
- ✅ Feature is deployed to staging
- ✅ Feature is tested on staging
- ✅ Documentation is updated
- ✅ Demo-able to stakeholders

---

## Success Metrics (Post-MVP)

### Week 1 After Launch
- [ ] 10+ companies signed up
- [ ] 50+ job postings created
- [ ] 100+ applications submitted
- [ ] AI parsing accuracy > 90%
- [ ] Zero critical bugs

### Month 1 After Launch
- [ ] 50+ active companies
- [ ] 200+ job postings
- [ ] 1,000+ applications
- [ ] User feedback collected
- [ ] NPS score > 7

---

## Risk Management

### Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Claude API rate limits | High | Implement caching, use Haiku for simple tasks |
| Supabase performance issues | Medium | Add database indexes, optimize queries |
| Resume parsing accuracy low | High | Fine-tune prompts, add validation |
| File upload failures | Medium | Add retry logic, better error handling |

### Business Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| No user adoption | High | Start user interviews early, iterate based on feedback |
| Claude API costs too high | Medium | Monitor usage, set budgets, optimize prompts |
| Competitors launch first | Low | Focus on unique value prop (AI conversation feature) |

---

## Next Steps

1. **Create GitHub Project** (next section has instructions)
2. **Create all issues for Sprint 1**
3. **Schedule Sprint 1 Planning meeting**
4. **Set up development environment**
5. **Start coding!** 🚀

---

## Resources

- **Design System**: Use shadcn/ui components
- **Icons**: lucide-react
- **Colors**: Use Tailwind default palette
- **Fonts**: Geist Sans (already configured)
- **Email Templates**: Use Resend + react-email

---

## Questions to Answer Before Starting

- [ ] Who is the target user? (Startups? Enterprises? Recruiting agencies?)
- [ ] What's the unique selling point vs. competitors?
- [ ] Will this be free or paid? (Pricing model)
- [ ] What's the go-to-market strategy?
- [ ] Who will handle customer support?

---

**Ready to build? Let's do this! 💪**
