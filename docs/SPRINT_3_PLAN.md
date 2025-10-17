# Sprint 3: Application Submission & AI Resume Parsing

**Sprint Goal**: Candidates can apply with LinkedIn auth, resume upload, and AI-powered parsing

**Duration**: 2 weeks
**Story Points**: 45 SP (42 base + 3 LinkedIn OAuth)
**Priority**: HIGH - Core candidate experience

---

## 🎯 Sprint Objectives

By the end of Sprint 3:
1. ✅ **NEW**: LinkedIn OAuth for quick candidate signup
2. ✅ **NEW**: Candidate profile system
3. ✅ Candidates submit applications to active jobs
4. ✅ Upload and store resume files securely
5. ✅ Parse resumes automatically using Claude AI
6. ✅ Structure candidate data for evaluation
7. ✅ Companies view and manage applications
8. ✅ Application status workflow

**Note**: Full LinkedIn profile import (work history, education) comes in Sprint 5

---

## 📋 Sprint 3 Issues (12 total)

### Authentication & Profiles

**Issue #24: LinkedIn OAuth & Candidate Profiles (3 SP)** 🆕
- LinkedIn OAuth setup with Supabase
- Candidate profiles table
- Basic profile import (name, email, photo)
- "Sign in with LinkedIn" button

### Application Backend

**Issue #25: Application Data Model & API (5 SP)**
**Issue #26: File Upload - Supabase Storage (3 SP)**

### Application Frontend

**Issue #27: Application Form Component (4 SP)**
**Issue #28: Application Submission Page (3 SP)**

### AI Resume Parsing

**Issue #29: Claude Resume Parser (6 SP)**
**Issue #30: Trigger Parsing on Submit (2 SP)**

### Company Management

**Issue #31: Application List Page (5 SP)**
**Issue #32: Application Detail Page (6 SP)**
**Issue #33: Status Management (3 SP)**

### Polish

**Issue #34: Email Notifications (3 SP)**
**Issue #35: Application Analytics (2 SP)**

---

## 📊 Sprint Metrics

**Total**: 45 SP over 14 days (3.2 SP/day)

**Week 1** (26 SP): Issues #24-30 (Auth + Applications + AI)
**Week 2** (19 SP): Issues #31-35 (Company views + Polish)

---

## 🔗 Full Sprint 5 Preview

**Sprint 5: Full LinkedIn Profile Import (8-10 SP)**
- Import work experience from LinkedIn
- Import education from LinkedIn
- Import skills from LinkedIn
- Make resume upload optional
- Profile sync & updates

This gives users LinkedIn signup in Sprint 3, full profile import in Sprint 5!

---

See [LinkedIn Auth Spec](./LINKEDIN_AUTH_SPEC.md) for full technical details.

**Created**: 2025-10-06
**Updated**: 2025-10-07 (Added LinkedIn OAuth - Option B)
