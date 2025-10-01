#!/bin/bash

# Setup GitHub Project and Sprint 1 Issues
# This script automates the creation of GitHub Project, labels, milestones, and issues

set -e  # Exit on error

REPO="LoophireTechHub/AI-Job-Board"

echo "🚀 Setting up GitHub Project for AI Job Board MVP..."
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo ""
    echo "Please install it first:"
    echo "  macOS:   brew install gh"
    echo "  Windows: winget install GitHub.cli"
    echo "  Linux:   See https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "🔐 Please authenticate with GitHub first..."
    gh auth login
fi

echo "✅ GitHub CLI is ready!"
echo ""

# Step 1: Create Labels
echo "📌 Creating labels..."

gh label create "priority: high" --color d73a4a --description "High priority" --repo $REPO --force 2>/dev/null || true
gh label create "priority: medium" --color fbca04 --description "Medium priority" --repo $REPO --force 2>/dev/null || true
gh label create "priority: low" --color 0e8a16 --description "Low priority" --repo $REPO --force 2>/dev/null || true

gh label create "type: feature" --color a2eeef --description "New feature" --repo $REPO --force 2>/dev/null || true
gh label create "type: bug" --color d73a4a --description "Bug fix" --repo $REPO --force 2>/dev/null || true
gh label create "type: enhancement" --color 84b6eb --description "Enhancement" --repo $REPO --force 2>/dev/null || true

gh label create "sprint-1" --color B60205 --description "Sprint 1" --repo $REPO --force 2>/dev/null || true
gh label create "sprint-2" --color D93F0B --description "Sprint 2" --repo $REPO --force 2>/dev/null || true
gh label create "sprint-3" --color FBCA04 --description "Sprint 3" --repo $REPO --force 2>/dev/null || true
gh label create "sprint-4" --color 0E8A16 --description "Sprint 4" --repo $REPO --force 2>/dev/null || true
gh label create "sprint-5" --color 006B75 --description "Sprint 5" --repo $REPO --force 2>/dev/null || true

gh label create "backend" --color 5319e7 --description "Backend" --repo $REPO --force 2>/dev/null || true
gh label create "frontend" --color bfdadc --description "Frontend" --repo $REPO --force 2>/dev/null || true
gh label create "ai" --color e99695 --description "AI/ML" --repo $REPO --force 2>/dev/null || true
gh label create "database" --color f9d0c4 --description "Database" --repo $REPO --force 2>/dev/null || true
gh label create "devops" --color c2e0c6 --description "DevOps" --repo $REPO --force 2>/dev/null || true

echo "✅ Labels created!"
echo ""

# Step 2: Create Milestones
echo "🎯 Creating milestones..."

# Calculate dates (2 weeks from now for Sprint 1)
SPRINT1_DATE=$(date -v+14d +%Y-%m-%d 2>/dev/null || date -d '+14 days' +%Y-%m-%d)
SPRINT2_DATE=$(date -v+28d +%Y-%m-%d 2>/dev/null || date -d '+28 days' +%Y-%m-%d)
SPRINT3_DATE=$(date -v+42d +%Y-%m-%d 2>/dev/null || date -d '+42 days' +%Y-%m-%d)
SPRINT4_DATE=$(date -v+56d +%Y-%m-%d 2>/dev/null || date -d '+56 days' +%Y-%m-%d)
SPRINT5_DATE=$(date -v+70d +%Y-%m-%d 2>/dev/null || date -d '+70 days' +%Y-%m-%d)

gh api repos/$REPO/milestones -f title="Sprint 1: Foundation" -f due_on="${SPRINT1_DATE}T23:59:59Z" -f description="Basic infrastructure and authentication" 2>/dev/null || true
gh api repos/$REPO/milestones -f title="Sprint 2: Job Management" -f due_on="${SPRINT2_DATE}T23:59:59Z" -f description="Companies can create and manage jobs" 2>/dev/null || true
gh api repos/$REPO/milestones -f title="Sprint 3: Applications" -f due_on="${SPRINT3_DATE}T23:59:59Z" -f description="Candidates can apply, AI parses resumes" 2>/dev/null || true
gh api repos/$REPO/milestones -f title="Sprint 4: AI Screening" -f due_on="${SPRINT4_DATE}T23:59:59Z" -f description="AI automatically screens candidates" 2>/dev/null || true
gh api repos/$REPO/milestones -f title="Sprint 5: Launch" -f due_on="${SPRINT5_DATE}T23:59:59Z" -f description="Polish and launch MVP" 2>/dev/null || true

echo "✅ Milestones created!"
echo ""

# Step 3: Create Sprint 1 Issues
echo "📝 Creating Sprint 1 issues..."

# Issue 1: Supabase Setup
gh issue create --repo $REPO \
  --title "Set up Supabase production project" \
  --label "backend,database,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Create production Supabase project and configure settings

## Acceptance Criteria
- [ ] Create Supabase account (if not exists)
- [ ] Create new project
- [ ] Note down Project URL and API keys
- [ ] Add credentials to .env.local
- [ ] Test connection from local environment

## Estimate
2 story points (~3-4 hours)

## Documentation
- [Supabase Docs](https://supabase.com/docs)
- See \`docs/DEPLOYMENT.md\` for setup guide"

echo "  ✓ Created: Set up Supabase production project"

# Issue 2: Database Migrations
gh issue create --repo $REPO \
  --title "Run database migrations in Supabase" \
  --label "backend,database,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Apply database schema to production Supabase instance

## Acceptance Criteria
- [ ] Copy contents of \`supabase-schema.sql\`
- [ ] Open Supabase SQL Editor
- [ ] Run migration script
- [ ] Verify all 8 tables created successfully
- [ ] Verify RLS policies applied
- [ ] Test with sample data

## Dependencies
Depends on Supabase setup issue

## Estimate
3 story points (~5-6 hours)

## Files
- \`supabase-schema.sql\`"

echo "  ✓ Created: Run database migrations"

# Issue 3: Configure RLS
gh issue create --repo $REPO \
  --title "Configure Row Level Security policies" \
  --label "backend,database,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Set up and test Row Level Security policies for all tables

## Acceptance Criteria
- [ ] Review RLS policies in schema
- [ ] Test policies with different user roles
- [ ] Ensure users can only access their own data
- [ ] Document policy logic
- [ ] Add unit tests for policies

## Security Note
Critical for data protection - must be done before any user data is stored

## Estimate
5 story points (~8-10 hours)"

echo "  ✓ Created: Configure RLS policies"

# Issue 4: Authentication Pages
gh issue create --repo $REPO \
  --title "Build authentication pages (sign up, sign in)" \
  --label "frontend,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Create sign up and sign in pages with Supabase authentication

## Acceptance Criteria
- [ ] Create \`/auth/signup\` page
- [ ] Create \`/auth/signin\` page
- [ ] Implement Supabase auth integration
- [ ] Add form validation (email, password strength)
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test sign up flow end-to-end
- [ ] Test sign in flow end-to-end
- [ ] Redirect to dashboard after auth

## Design
- Use shadcn/ui form components
- Mobile responsive
- Clean, professional design

## Estimate
8 story points (~12-16 hours)"

echo "  ✓ Created: Build authentication pages"

# Issue 5: Dashboard Layout
gh issue create --repo $REPO \
  --title "Create main dashboard layout" \
  --label "frontend,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Build the main dashboard layout with navigation

## Acceptance Criteria
- [ ] Create dashboard page (\`/dashboard\`)
- [ ] Add navigation sidebar
- [ ] Add header with user menu
- [ ] Add logout functionality
- [ ] Make fully responsive (mobile, tablet, desktop)
- [ ] Add empty state messages
- [ ] Protected route (requires auth)

## Components
- Sidebar with navigation links
- Header with user avatar/menu
- Main content area
- Footer

## Estimate
5 story points (~8-10 hours)"

echo "  ✓ Created: Create dashboard layout"

# Issue 6: Navigation
gh issue create --repo $REPO \
  --title "Set up navigation structure" \
  --label "frontend,sprint-1,priority: medium" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Create navigation structure and routing

## Acceptance Criteria
- [ ] Set up Next.js app router structure
- [ ] Create navigation menu component
- [ ] Add route protection middleware
- [ ] Implement active link highlighting
- [ ] Mobile menu (hamburger)

## Routes
- \`/\` - Landing page
- \`/auth/signup\` - Sign up
- \`/auth/signin\` - Sign in
- \`/dashboard\` - Main dashboard (protected)

## Estimate
3 story points (~5-6 hours)"

echo "  ✓ Created: Set up navigation structure"

# Issue 7: Error Handling
gh issue create --repo $REPO \
  --title "Add loading states and error handling" \
  --label "frontend,sprint-1,priority: medium" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Implement consistent loading states and error handling across the app

## Acceptance Criteria
- [ ] Create LoadingSpinner component
- [ ] Create ErrorBoundary component
- [ ] Add toast notifications for errors
- [ ] Add loading states to all async operations
- [ ] User-friendly error messages
- [ ] Log errors to console (dev) or Sentry (prod)

## Components to Create
- \`LoadingSpinner.tsx\`
- \`ErrorBoundary.tsx\`
- \`Toast.tsx\`

## Estimate
3 story points (~5-6 hours)"

echo "  ✓ Created: Add loading states and error handling"

# Issue 8: Anthropic API Setup
gh issue create --repo $REPO \
  --title "Set up Anthropic API account and test" \
  --label "backend,ai,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Set up Anthropic API account and verify integration works

## Acceptance Criteria
- [ ] Create Anthropic account
- [ ] Generate API key
- [ ] Add to environment variables
- [ ] Test \`/api/generate-questions\` endpoint locally
- [ ] Verify token usage tracking
- [ ] Document API limits

## Testing
Test with sample request:
\`\`\`bash
curl -X POST http://localhost:3000/api/generate-questions \\
  -H \"Content-Type: application/json\" \\
  -d '{\"jobTitle\":\"Engineer\",\"industry\":\"Tech\",\"experienceLevel\":\"mid\",\"department\":\"Engineering\"}'
\`\`\`

## Estimate
2 story points (~3-4 hours)"

echo "  ✓ Created: Set up Anthropic API"

# Issue 9: Vercel Deployment
gh issue create --repo $REPO \
  --title "Deploy application to Vercel staging" \
  --label "devops,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Deploy the application to Vercel for staging environment

## Acceptance Criteria
- [ ] Connect GitHub repo to Vercel
- [ ] Configure environment variables in Vercel
- [ ] Deploy to staging
- [ ] Test deployment works
- [ ] Set up custom domain (optional)
- [ ] Configure preview deployments for PRs

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_KEY
- ANTHROPIC_API_KEY

## Estimate
2 story points (~3-4 hours)

## Documentation
See \`docs/DEPLOYMENT.md\`"

echo "  ✓ Created: Deploy to Vercel staging"

# Issue 10: Environment Setup
gh issue create --repo $REPO \
  --title "Configure development environment variables" \
  --label "devops,sprint-1,priority: high" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Set up local development environment variables

## Acceptance Criteria
- [ ] Copy \`.env.example\` to \`.env.local\`
- [ ] Fill in Supabase credentials
- [ ] Fill in Anthropic API key
- [ ] Test local development server starts
- [ ] Verify all API endpoints work locally
- [ ] Document setup in README

## Files
- \`.env.local\` (don't commit!)
- \`.env.example\` (template)

## Estimate
1 story point (~1-2 hours)"

echo "  ✓ Created: Configure environment variables"

# Issue 11: Landing Page
gh issue create --repo $REPO \
  --title "Create landing page" \
  --label "frontend,sprint-1,priority: medium" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Build a simple landing page for the application

## Acceptance Criteria
- [ ] Hero section with value proposition
- [ ] Call-to-action buttons (Sign Up, Sign In)
- [ ] Feature highlights
- [ ] Footer with links
- [ ] Fully responsive
- [ ] SEO optimized (meta tags)

## Content
- Headline: \"AI-Powered Hiring Made Simple\"
- Subheadline: \"Screen candidates 10x faster with Claude AI\"
- Features: Resume parsing, AI interviews, Smart scoring

## Estimate
5 story points (~8-10 hours)"

echo "  ✓ Created: Create landing page"

# Issue 12: Error Tracking Setup
gh issue create --repo $REPO \
  --title "Set up error tracking (Sentry)" \
  --label "devops,sprint-1,priority: medium" \
  --milestone "Sprint 1: Foundation" \
  --body "## Description
Set up Sentry for error tracking and monitoring

## Acceptance Criteria
- [ ] Create Sentry account
- [ ] Install Sentry SDK
- [ ] Configure Sentry in Next.js
- [ ] Test error reporting
- [ ] Set up alerts for critical errors
- [ ] Document in README

## Installation
\`\`\`bash
npx @sentry/wizard@latest -i nextjs
\`\`\`

## Estimate
2 story points (~3-4 hours)

## Optional
Can be moved to Sprint 2 if time is tight"

echo "  ✓ Created: Set up error tracking"

echo ""
echo "✅ All Sprint 1 issues created!"
echo ""

# Step 4: Instructions for creating Project Board
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Setup Complete! Here's what was created:"
echo ""
echo "  ✅ 15 labels (priority, type, sprint, component)"
echo "  ✅ 5 milestones (Sprint 1-5)"
echo "  ✅ 12 issues for Sprint 1"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEP: Create GitHub Project Board"
echo ""
echo "Unfortunately, GitHub CLI doesn't support creating Projects yet."
echo "Please create the project board manually:"
echo ""
echo "1. Go to: https://github.com/$REPO/projects"
echo "2. Click: 'New project'"
echo "3. Choose: 'Board' view"
echo "4. Name: 'AI Job Board - MVP'"
echo "5. Add columns:"
echo "   - 📋 Backlog"
echo "   - 📝 Sprint Backlog"
echo "   - 🔨 In Progress"
echo "   - 👀 In Review"
echo "   - ✅ Done"
echo "6. Add all issues to the board"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Quick Links:"
echo ""
echo "  Issues:     https://github.com/$REPO/issues"
echo "  Milestones: https://github.com/$REPO/milestones"
echo "  Projects:   https://github.com/$REPO/projects"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 Ready to start Sprint 1!"
echo ""
