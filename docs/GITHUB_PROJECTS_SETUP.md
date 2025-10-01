# GitHub Projects Setup Guide

Complete guide to setting up GitHub Projects for sprint management.

---

## Quick Setup (5 minutes)

### Step 1: Create a New Project

1. Go to your repository: https://github.com/LoophireTechHub/AI-Job-Board
2. Click on **"Projects"** tab at the top
3. Click **"New project"**
4. Choose **"Board"** view
5. Name it: `AI Job Board - MVP Development`
6. Click **"Create project"**

### Step 2: Configure Board Columns

Delete the default columns and create these:

1. **📋 Backlog**
   - Description: "All future tasks not yet scheduled"

2. **📝 Sprint Backlog**
   - Description: "Tasks for current sprint"

3. **🔨 In Progress**
   - Description: "Actively being worked on"

4. **👀 In Review**
   - Description: "PR submitted, awaiting review"

5. **✅ Done**
   - Description: "Completed and deployed"

### Step 3: Add Labels

Go to **Issues** → **Labels** and create:

**Priority Labels:**
- `priority: high` - #d73a4a (red)
- `priority: medium` - #fbca04 (yellow)
- `priority: low` - #0e8a16 (green)

**Type Labels:**
- `type: feature` - #a2eeef (light blue)
- `type: bug` - #d73a4a (red)
- `type: docs` - #0075ca (blue)
- `type: enhancement` - #84b6eb (blue)
- `type: refactor` - #d4c5f9 (purple)

**Sprint Labels:**
- `sprint-1` - #B60205
- `sprint-2` - #D93F0B
- `sprint-3` - #FBCA04
- `sprint-4` - #0E8A16
- `sprint-5` - #006B75

**Component Labels:**
- `backend` - #5319e7
- `frontend` - #bfdadc
- `ai` - #e99695
- `database` - #f9d0c4
- `devops` - #c2e0c6

### Step 4: Create Milestones

Go to **Issues** → **Milestones** → **New milestone**

Create these milestones:

1. **Sprint 1: Foundation**
   - Due date: 2 weeks from start
   - Description: "Basic infrastructure and authentication"

2. **Sprint 2: Job Management**
   - Due date: 4 weeks from start
   - Description: "Companies can create and manage jobs"

3. **Sprint 3: Applications & AI Resume Parsing**
   - Due date: 6 weeks from start
   - Description: "Candidates can apply, AI parses resumes"

4. **Sprint 4: AI Screening & Scoring**
   - Due date: 8 weeks from start
   - Description: "AI automatically screens and scores candidates"

5. **Sprint 5: Polish & Launch Prep**
   - Due date: 10 weeks from start
   - Description: "Production-ready MVP"

6. **MVP Launch**
   - Due date: 10 weeks from start
   - Description: "Go live with MVP! 🚀"

---

## Creating Issues

### Issue Template

Use this format for creating sprint tasks:

```markdown
## Description
[Clear description of what needs to be built]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details
[Any specific technical implementation notes]

## Dependencies
- Depends on #[issue-number]

## Estimate
[Story points or hours]

## Design/Mockup
[Link to design if applicable]
```

### Example Issue

**Title**: `Create job posting form`

**Description**:
```markdown
## Description
Build a form that allows companies to create new job postings with all required fields.

## Acceptance Criteria
- [ ] Form includes: title, industry, department, experience level, description
- [ ] Form validation works (all required fields)
- [ ] Job is saved to Supabase database
- [ ] Success message shown after creation
- [ ] Redirects to job detail page after creation

## Technical Details
- Use React Hook Form for form handling
- Use Zod for validation
- Use shadcn/ui form components
- Save to `jobs` table in Supabase

## Dependencies
- None (can start immediately)

## Estimate
5 story points (~8-10 hours)

## Design/Mockup
[Link to Figma or screenshot]
```

**Labels**: `type: feature`, `frontend`, `sprint-1`, `priority: high`
**Milestone**: Sprint 1: Foundation
**Assignee**: [Your name]

---

## Sprint 1 Issues to Create

Copy and create these issues:

### Backend Tasks

1. **Set up Supabase production project**
   - Labels: `backend`, `database`, `sprint-1`, `priority: high`
   - Estimate: 2 SP

2. **Run database migrations**
   - Labels: `backend`, `database`, `sprint-1`, `priority: high`
   - Estimate: 3 SP

3. **Configure RLS policies**
   - Labels: `backend`, `database`, `sprint-1`, `priority: high`
   - Estimate: 5 SP

4. **Test Supabase connection**
   - Labels: `backend`, `sprint-1`, `priority: medium`
   - Estimate: 2 SP

5. **Set up Anthropic API account and test**
   - Labels: `backend`, `ai`, `sprint-1`, `priority: high`
   - Estimate: 2 SP

### Frontend Tasks

6. **Create landing page**
   - Labels: `frontend`, `sprint-1`, `priority: high`
   - Estimate: 5 SP

7. **Build authentication pages (sign up, sign in)**
   - Labels: `frontend`, `sprint-1`, `priority: high`
   - Estimate: 8 SP

8. **Create dashboard layout**
   - Labels: `frontend`, `sprint-1`, `priority: high`
   - Estimate: 5 SP

9. **Set up navigation structure**
   - Labels: `frontend`, `sprint-1`, `priority: medium`
   - Estimate: 3 SP

10. **Add loading states and error handling**
    - Labels: `frontend`, `sprint-1`, `priority: medium`
    - Estimate: 3 SP

### DevOps Tasks

11. **Deploy to Vercel staging**
    - Labels: `devops`, `sprint-1`, `priority: high`
    - Estimate: 2 SP

12. **Configure environment variables**
    - Labels: `devops`, `sprint-1`, `priority: high`
    - Estimate: 1 SP

13. **Set up error tracking (Sentry)**
    - Labels: `devops`, `sprint-1`, `priority: medium`
    - Estimate: 2 SP

---

## Using GitHub Projects

### Daily Workflow

1. **Morning**: Check your assigned issues
2. **Start Work**: Move issue to "In Progress"
3. **Create PR**: Link to issue in PR description
4. **PR Review**: Move issue to "In Review"
5. **Merge**: Move issue to "Done"

### Moving Cards

- Drag and drop issues between columns
- Or use automation (see below)

### Filtering

Use filters to focus:
- `sprint:sprint-1` - Current sprint only
- `is:open assignee:@me` - Your tasks
- `label:"priority: high"` - High priority
- `milestone:"Sprint 1: Foundation"` - Sprint 1 tasks

### Automation

GitHub Projects has built-in automation:

1. **Auto-move to In Progress**
   - When PR is opened → Move to "In Review"

2. **Auto-move to Done**
   - When PR is merged → Move to "Done"

3. **Auto-close issues**
   - When PR is merged → Close linked issue

To set up:
- Go to Project → **⋯** menu → **Workflows**
- Enable built-in workflows

---

## Sprint Planning Process

### Before Sprint Planning

1. Groom backlog (add/update issues)
2. Estimate all issues (story points)
3. Prioritize issues (labels)
4. Ensure acceptance criteria are clear

### During Sprint Planning (2 hours)

1. **Review sprint goal** (15 min)
2. **Select issues** from backlog (45 min)
   - Move to "Sprint Backlog" column
   - Assign to team members
3. **Break down large issues** (30 min)
4. **Final commitment** (15 min)
   - Confirm team can complete selected work
5. **Update milestone dates** (15 min)

### During Sprint

- Move cards as you work
- Update issue comments with progress
- Add blockers as comments
- Close completed issues

### Sprint Demo

- Show completed features
- Move "Done" items to archive
- Get feedback

### Sprint Retrospective

Create an issue template for retro:

**Title**: `Sprint [X] Retrospective`

```markdown
## What went well? ✅

## What could be improved? 🔧

## Action items for next sprint 📋
- [ ] Action 1
- [ ] Action 2

## Shoutouts 🎉
```

---

## Advanced: GitHub CLI

Create issues faster with GitHub CLI:

```bash
# Install GitHub CLI
brew install gh  # macOS
# or download from https://cli.github.com

# Login
gh auth login

# Create an issue
gh issue create \
  --title "Create job posting form" \
  --body "Build form for creating jobs..." \
  --label "type: feature,frontend,sprint-1" \
  --milestone "Sprint 1: Foundation" \
  --assignee "@me"

# List issues
gh issue list --milestone "Sprint 1: Foundation"

# View issue
gh issue view 123

# Close issue
gh issue close 123
```

---

## Alternative: Use Issue Templates

Create issue templates for common tasks:

**File**: `.github/ISSUE_TEMPLATE/sprint_task.md`

```markdown
---
name: Sprint Task
about: Create a task for a sprint
title: '[TASK] '
labels: 'sprint-1'
assignees: ''
---

## Description
[Clear description]

## Acceptance Criteria
- [ ] Criterion 1

## Estimate
[Story points]
```

---

## Tracking Velocity

After each sprint, calculate velocity:

```
Velocity = Total story points completed
```

**Example**:
- Sprint 1: Planned 40 SP, Completed 35 SP → Velocity: 35
- Sprint 2: Planned 35 SP, Completed 38 SP → Velocity: 38
- Average: (35 + 38) / 2 = 36.5 SP per sprint

Use this to plan future sprints more accurately.

---

## Burndown Chart

Track remaining work daily:

| Day | Remaining SP |
|-----|--------------|
| Day 1 | 40 |
| Day 2 | 38 |
| Day 3 | 35 |
| ... | ... |
| Day 10 | 0 |

Ideal: Straight line from Day 1 to Day 10.

---

## Sprint Report Template

After each sprint, create a report:

```markdown
# Sprint [X] Report

## Goals
- [Goal 1]
- [Goal 2]

## Completed
- ✅ Issue #1
- ✅ Issue #2

## Not Completed
- ❌ Issue #3 (reason)

## Metrics
- Velocity: 35 SP
- Issues completed: 10/12
- Bugs found: 2

## Learnings
- What we learned

## Next Sprint
- What we're focusing on
```

---

## Tips for Success

1. **Keep issues small** - Max 13 story points
2. **Update daily** - Move cards, add comments
3. **Review weekly** - Ensure board reflects reality
4. **Celebrate wins** - Mark "Done" items visibly
5. **Be flexible** - Adjust mid-sprint if needed

---

## Questions?

Check out:
- [GitHub Projects Docs](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Agile Best Practices](https://www.atlassian.com/agile)

---

**Ready to start tracking? Let's build! 🚀**
