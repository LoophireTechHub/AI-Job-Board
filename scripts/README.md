# Setup Scripts

Automation scripts for project setup.

## setup-github-project.sh

Automatically sets up your GitHub repository with:
- Labels (priority, type, sprint, component)
- Milestones (Sprint 1-5)
- Sprint 1 issues (12 tasks ready to work on)

### Prerequisites

Install GitHub CLI:
```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
sudo apt install gh  # Debian/Ubuntu
```

### Usage

```bash
# Run the setup script
./scripts/setup-github-project.sh
```

This will:
1. Create all labels
2. Create 5 sprint milestones
3. Create 12 Sprint 1 issues
4. Give you instructions to create the Project board

### What Gets Created

**Labels:**
- Priority: high, medium, low
- Type: feature, bug, enhancement
- Sprint: sprint-1 through sprint-5
- Component: backend, frontend, ai, database, devops

**Milestones:**
- Sprint 1: Foundation (2 weeks)
- Sprint 2: Job Management (4 weeks)
- Sprint 3: Applications (6 weeks)
- Sprint 4: AI Screening (8 weeks)
- Sprint 5: Launch (10 weeks)

**Sprint 1 Issues:**
1. Set up Supabase production project
2. Run database migrations
3. Configure RLS policies
4. Build authentication pages
5. Create dashboard layout
6. Set up navigation structure
7. Add loading states and error handling
8. Set up Anthropic API
9. Deploy to Vercel staging
10. Configure environment variables
11. Create landing page
12. Set up error tracking

### After Running the Script

You still need to manually create the GitHub Project board:

1. Go to: https://github.com/LoophireTechHub/AI-Job-Board/projects
2. Click "New project"
3. Choose "Board" view
4. Name it: "AI Job Board - MVP"
5. Add 5 columns: Backlog, Sprint Backlog, In Progress, In Review, Done
6. Add all issues to the board

### Troubleshooting

**Error: "gh: command not found"**
→ Install GitHub CLI (see Prerequisites above)

**Error: "authentication required"**
→ Run: `gh auth login`

**Issues already exist**
→ Script will skip existing labels/milestones

### Manual Alternative

If you prefer to set up manually, follow:
- `docs/GITHUB_PROJECTS_SETUP.md` - Detailed setup guide
- `docs/SPRINT_QUICKSTART.md` - Quick start guide
