# Sprint Quick Start Guide

Get your MVP sprints up and running in 30 minutes.

> 🎉 **Sprint 1 Complete!** Authentication, dashboard, and deployment are done. Ready for Sprint 2? See [SPRINT_2_PLAN.md](./SPRINT_2_PLAN.md)

---

## ✅ What's Been Created

You now have a complete sprint plan with:

1. **MVP Plan** (`MVP_PLAN.md`) - 5 sprints over 10 weeks
2. **GitHub Projects Setup** (`GITHUB_PROJECTS_SETUP.md`) - Project board configuration
3. **Product Roadmap** (`PRODUCT_ROADMAP.md`) - Long-term vision and strategy

---

## 🚀 Quick Start (30 minutes)

### Step 1: Set Up GitHub Project Board (10 min)

```bash
# Open your repository
open https://github.com/LoophireTechHub/AI-Job-Board
```

1. Click **"Projects"** tab
2. Click **"New project"**
3. Choose **"Board"** view
4. Name: `AI Job Board - MVP Development`
5. Add columns:
   - 📋 Backlog
   - 📝 Sprint Backlog
   - 🔨 In Progress
   - 👀 In Review
   - ✅ Done

**Detailed instructions**: See `GITHUB_PROJECTS_SETUP.md`

### Step 2: Create Labels (5 min)

Go to **Issues** → **Labels** and create:

**Quick Labels to Add:**
```
priority: high (red)
priority: medium (yellow)
priority: low (green)
sprint-1 (red)
type: feature (blue)
frontend (light blue)
backend (purple)
ai (pink)
```

### Step 3: Create Sprint 1 Milestone (2 min)

Go to **Issues** → **Milestones** → **New milestone**

- **Title**: Sprint 1: Foundation
- **Due date**: 2 weeks from today
- **Description**: Basic infrastructure and authentication

### Step 4: Create First Issues (10 min)

Create these 5 critical issues to start:

#### Issue 1: Set up Supabase Production
```
Title: Set up Supabase production project
Labels: backend, database, sprint-1, priority: high
Milestone: Sprint 1: Foundation

## Description
Create production Supabase project and configure settings

## Tasks
- [ ] Create Supabase account
- [ ] Create new project
- [ ] Note down credentials
- [ ] Add to .env.local
```

#### Issue 2: Run Database Migrations
```
Title: Run database migrations in Supabase
Labels: backend, database, sprint-1, priority: high
Milestone: Sprint 1: Foundation

## Tasks
- [ ] Copy supabase-schema.sql
- [ ] Open Supabase SQL Editor
- [ ] Run migration
- [ ] Verify tables created
```

#### Issue 3: Build Authentication Pages
```
Title: Build authentication pages (sign up, sign in)
Labels: frontend, sprint-1, priority: high
Milestone: Sprint 1: Foundation

## Tasks
- [ ] Create /auth/signup page
- [ ] Create /auth/signin page
- [ ] Implement Supabase auth
- [ ] Add form validation
- [ ] Test sign up flow
```

#### Issue 4: Create Dashboard Layout
```
Title: Create main dashboard layout
Labels: frontend, sprint-1, priority: high
Milestone: Sprint 1: Foundation

## Tasks
- [ ] Create dashboard page
- [ ] Add navigation sidebar
- [ ] Add header with user menu
- [ ] Make responsive
```

#### Issue 5: Deploy to Vercel Staging
```
Title: Deploy application to Vercel staging
Labels: devops, sprint-1, priority: high
Milestone: Sprint 1: Foundation

## Tasks
- [ ] Connect GitHub to Vercel
- [ ] Configure environment variables
- [ ] Deploy
- [ ] Test deployment
```

### Step 5: Start Sprint 1! (3 min)

1. Move all 5 issues to **"Sprint Backlog"** column
2. Assign issues to yourself
3. Move first issue to **"In Progress"**
4. Start coding! 💻

---

## 📅 Sprint Schedule

### Sprint 1 (Weeks 1-2) - **START HERE**
**Goal**: Get authentication working and deploy to staging

**Key Deliverables**:
- ✅ Users can sign up and log in
- ✅ Basic dashboard exists
- ✅ App deployed to Vercel

### Sprint 2 (Weeks 3-4)
**Goal**: Companies can create and manage jobs

**Key Deliverables**:
- ✅ Job posting form works
- ✅ Jobs listed on dashboard
- ✅ Public job board exists

### Sprint 3 (Weeks 5-6)
**Goal**: Candidates can apply with AI resume parsing

**Key Deliverables**:
- ✅ Application form works
- ✅ Resume upload works
- ✅ AI parses resumes automatically

### Sprint 4 (Weeks 7-8)
**Goal**: AI screens and scores candidates

**Key Deliverables**:
- ✅ AI analyzes applications
- ✅ Candidates scored automatically
- ✅ Dashboard shows AI insights

### Sprint 5 (Weeks 9-10)
**Goal**: Polish and launch MVP

**Key Deliverables**:
- ✅ All bugs fixed
- ✅ Email notifications work
- ✅ Production deployment
- ✅ MVP LAUNCHED! 🚀

---

## 🎯 Daily Workflow

### Morning (15 min)
1. Check GitHub Project board
2. Review your tasks
3. Plan your day

### During Work
1. Pick a task from "Sprint Backlog"
2. Move to "In Progress"
3. Work on it
4. Create PR when done
5. Move to "In Review"

### Evening (5 min)
1. Update issue comments with progress
2. Note any blockers
3. Plan tomorrow

---

## 📊 Sprint Ceremonies

### Sprint Planning (Monday, 2 hours)
**Agenda**:
1. Review sprint goal
2. Review and estimate issues
3. Commit to sprint scope
4. Assign tasks

**Outcome**: Clear sprint backlog

### Daily Standup (Daily, 15 min)
**3 Questions**:
1. What did I complete?
2. What am I working on?
3. Any blockers?

**Tip**: Can be async via Slack/Discord

### Sprint Demo (Friday, 1 hour)
**Agenda**:
1. Demo completed features
2. Get feedback
3. Celebrate wins! 🎉

### Sprint Retro (Friday, 1 hour)
**Agenda**:
1. What went well?
2. What could improve?
3. Action items

---

## 🛠️ Development Workflow

### Starting a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/job-posting-form

# 2. Make changes
# ... code code code ...

# 3. Commit with good message
git add .
git commit -m "feat: add job posting form

- Create JobForm component
- Add form validation
- Save to Supabase
- Add success message"

# 4. Push to GitHub
git push origin feature/job-posting-form

# 5. Create PR
# Link to issue: "Closes #3"

# 6. Wait for review
# 7. Merge when approved
# 8. Delete branch
```

### PR Review Checklist
- [ ] Code works locally
- [ ] No console errors
- [ ] Follows code style
- [ ] Tests pass (if any)
- [ ] Documentation updated

---

## 📈 Tracking Progress

### Story Points Guide
- **1 SP** = ~1-2 hours (simple task)
- **2 SP** = ~3-4 hours (small feature)
- **3 SP** = ~5-6 hours (medium feature)
- **5 SP** = ~8-10 hours (large feature)
- **8 SP** = ~2-3 days (complex feature)
- **13 SP** = Break it down! Too large.

### Velocity Tracking
After each sprint, calculate:
```
Velocity = Total story points completed
```

Use this to plan future sprints.

### Burndown
Track remaining work daily:
- Day 1: 40 SP remaining
- Day 5: 25 SP remaining
- Day 10: 0 SP remaining ✅

---

## 🚨 Common Mistakes to Avoid

1. **Overcommitting**: Don't take on too much
2. **Scope creep**: Stick to sprint plan
3. **Skipping standups**: Communication is key
4. **Not updating board**: Keep it current
5. **No testing**: Test before marking done

---

## 💡 Pro Tips

1. **Start small**: Better to under-commit and over-deliver
2. **Deploy early**: Deploy to staging on Day 1
3. **Get feedback**: Show work to users often
4. **Pair program**: Especially for complex features
5. **Take breaks**: Sustainable pace wins

---

## 🎓 Learning Resources

### Agile/Scrum
- [Scrum Guide](https://scrumguides.org/)
- [Atlassian Agile](https://www.atlassian.com/agile)

### Next.js
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Learn](https://nextjs.org/learn)

### Claude AI
- [Anthropic Docs](https://docs.anthropic.com/)
- [Prompt Engineering Guide](https://www.anthropic.com/index/prompting-guide)

### Supabase
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Tutorial](https://supabase.com/docs/guides/getting-started)

---

## 📞 Need Help?

### Stuck on Something?
1. Check documentation first
2. Search GitHub issues
3. Ask in team chat
4. Create a blocker issue

### Technical Blockers
- Add `blocker` label
- Comment with details
- Tag team members
- Discuss in standup

---

## 🎉 Ready to Start?

### Your Next Actions (Right Now!)

1. ✅ **Read this guide** (you're here!)
2. ⏳ **Set up GitHub Project** (10 min)
3. ⏳ **Create 5 Sprint 1 issues** (10 min)
4. ⏳ **Start first task** (now!)

### Sprint 1 Kickoff Checklist

- [ ] GitHub Project board created
- [ ] Labels added
- [ ] Sprint 1 milestone created
- [ ] First 5 issues created
- [ ] Issues moved to Sprint Backlog
- [ ] First issue in "In Progress"
- [ ] Development environment set up
- [ ] Ready to code! 🚀

---

## 📝 Sprint 1 Focus

**Week 1**:
- Set up Supabase
- Build auth pages
- Deploy to Vercel

**Week 2**:
- Create dashboard
- Polish UI
- Test everything

**Sprint 1 Demo** (Friday Week 2):
Show working authentication and deployed app!

---

## 🔥 Let's Build!

You have everything you need:
- ✅ Complete codebase
- ✅ Sprint plan
- ✅ Documentation
- ✅ This guide

**Time to turn this into reality! 💪**

---

**Questions?** Check:
- `MVP_PLAN.md` - Detailed sprint breakdown
- `GITHUB_PROJECTS_SETUP.md` - GitHub setup details
- `PRODUCT_ROADMAP.md` - Long-term vision

**Good luck! 🚀**
