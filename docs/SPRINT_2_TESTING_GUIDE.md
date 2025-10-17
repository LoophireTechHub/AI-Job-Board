# Sprint 2: Job Management - Comprehensive Manual Testing Guide

**Sprint Goal**: Companies can create, manage, and publish jobs with AI-generated questions

**Testing Date**: ___________
**Tester Name**: ___________
**Environment**: Development (localhost:3000)

---

## Prerequisites

- [ ] Application is running on localhost:3000
- [ ] You have a registered company account and are logged in
- [ ] Database is accessible and has the latest schema
- [ ] ANTHROPIC_API_KEY is set in environment variables

---

## Test Suite 1: Job Creation (Issue #16)

### Test 1.1: Access Job Creation Form
**Steps**:
1. Log in to the application
2. Navigate to `/dashboard`
3. Click "New Job" button

**Expected Results**:
- ✅ Redirected to `/dashboard/jobs/new`
- ✅ Form displays with 4 sections: Basic Information, Location, Compensation, Job Description
- ✅ Required fields are marked with red asterisk (*)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 1.2: Form Validation - Empty Required Fields
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Leave all fields empty
3. Click "Publish Job" button

**Expected Results**:
- ✅ Form does not submit
- ✅ Error messages appear under each required field:
  - "Title must be at least 3 characters"
  - "Please select a job type"
  - "Please select an experience level"
  - "Please select a location type"
  - "Description must be at least 50 characters"

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 1.3: Form Validation - Field Length Limits
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Enter "Ab" in Job Title (less than 3 characters)
3. Enter a 25-character description (less than 50 characters)
4. Tab out of fields

**Expected Results**:
- ✅ Error: "Title must be at least 3 characters"
- ✅ Error: "Description must be at least 50 characters"

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 1.4: Form Validation - Salary Range
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Fill in all required fields
3. Enter Minimum Salary: 100000
4. Enter Maximum Salary: 80000 (less than minimum)
5. Click "Publish Job"

**Expected Results**:
- ✅ Error: "Maximum salary must be greater than minimum salary"
- ✅ Form does not submit

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 1.5: Conditional Fields - Location Type
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Select "Remote" as location type

**Expected Results**:
- ✅ City and State fields are hidden

**Steps (continued)**:
3. Select "Hybrid" as location type

**Expected Results**:
- ✅ City and State fields appear

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 1.6: Create Job as Draft
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Fill in required fields:
   - Title: "Senior Software Engineer"
   - Job Type: "Full-time"
   - Experience Level: "Senior"
   - Location Type: "Remote"
   - Description: (At least 50 characters)
3. Click "Save as Draft"

**Expected Results**:
- ✅ Success message appears
- ✅ Redirected to `/dashboard/jobs?success=draft`
- ✅ Success banner: "Job saved as draft!"
- ✅ New job appears in job list with "Draft" badge

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 1.7: Create Job as Active (Published)
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Fill in all required fields (same as Test 1.6)
3. Click "Publish Job"

**Expected Results**:
- ✅ Success message appears
- ✅ Redirected to `/dashboard/jobs?success=published`
- ✅ Success banner: "Job published successfully!"
- ✅ New job appears in job list with "Active" badge
- ✅ (Backend) AI questions are being generated asynchronously

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 1.8: Create Job with All Optional Fields
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Fill in all fields including:
   - Department: "Engineering"
   - Location (for Hybrid/Onsite): City, State
   - Salary: Min and Max values
   - Requirements: Multiple lines of text
3. Click "Publish Job"

**Expected Results**:
- ✅ Job created successfully
- ✅ All fields saved correctly
- ✅ Job displays with complete information

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 2: Job Listing Page (Issue #17)

### Test 2.1: View Empty Job List
**Steps**:
1. Log in with a new account (no jobs created)
2. Navigate to `/dashboard/jobs`

**Expected Results**:
- ✅ Page displays empty state
- ✅ Message: "No jobs yet"
- ✅ "Create your first job posting" text visible
- ✅ "New Job" button is present

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 2.2: View Job List with Jobs
**Steps**:
1. Create 2-3 jobs (mix of draft and active)
2. Navigate to `/dashboard/jobs`

**Expected Results**:
- ✅ All jobs are displayed in a responsive grid
- ✅ Each job card shows:
  - Status badge (Draft/Active)
  - Job title (clickable)
  - Department (if provided)
  - Location info
  - Job type and experience level
  - Application count (0 for new jobs)
  - Posted date ("X time ago")
  - Salary range (if provided)
  - Actions dropdown (3 dots icon)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 2.3: Success Messages from URL Params
**Steps**:
1. Create a new job and publish it (redirects with success param)
2. Observe the success banner

**Expected Results**:
- ✅ Success banner appears at top
- ✅ Correct message based on action:
  - "Job published successfully!" for published jobs
  - "Job saved as draft!" for draft jobs

**Steps (continued)**:
3. Dismiss the banner by clicking X

**Expected Results**:
- ✅ Banner disappears
- ✅ URL params are cleared

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 2.4: Job Card Actions Dropdown
**Steps**:
1. Navigate to `/dashboard/jobs`
2. Click the 3-dot menu on any job card

**Expected Results**:
- ✅ Dropdown menu appears with options:
  - "Edit"
  - "Delete" (in red)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 3: Edit Job Functionality (Issue #18)

### Test 3.1: Access Edit Page
**Steps**:
1. Navigate to `/dashboard/jobs`
2. Click 3-dot menu on a job
3. Click "Edit"

**Expected Results**:
- ✅ Redirected to `/dashboard/jobs/[id]/edit`
- ✅ Form pre-populated with existing job data
- ✅ All fields show correct values:
  - Title, department, job type, experience level
  - Location type and city/state (if applicable)
  - Salary min/max (if applicable)
  - Description
  - Requirements (each on separate line)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 3.2: Edit Job and Save as Draft
**Steps**:
1. Open edit page for an active job
2. Change the title to "Updated Job Title"
3. Click "Save as Draft"

**Expected Results**:
- ✅ Job updated successfully
- ✅ Redirected to `/dashboard/jobs?success=updated-draft`
- ✅ Success message: "Job updated and saved as draft!"
- ✅ Job status changed to "Draft" in job list
- ✅ Job title shows new value

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 3.3: Edit Job and Publish
**Steps**:
1. Open edit page for a draft job
2. Update the description
3. Click "Update & Publish"

**Expected Results**:
- ✅ Job updated successfully
- ✅ Redirected to `/dashboard/jobs?success=updated-published`
- ✅ Success message: "Job updated and published successfully!"
- ✅ Job status changed to "Active"
- ✅ Description shows updated content

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 3.4: Edit - Cancel Button
**Steps**:
1. Open edit page for any job
2. Make some changes
3. Click "Cancel" button

**Expected Results**:
- ✅ Redirected to `/dashboard/jobs`
- ✅ Changes are not saved
- ✅ Job shows original values

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 3.5: Edit - Back to Jobs Link
**Steps**:
1. Open edit page for any job
2. Click "Back to Jobs" button at top

**Expected Results**:
- ✅ Redirected to `/dashboard/jobs`
- ✅ Changes are not saved

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 4: Delete Job Functionality (Issue #19)

### Test 4.1: Delete Job with Confirmation
**Steps**:
1. Navigate to `/dashboard/jobs`
2. Click 3-dot menu on a job
3. Click "Delete"
4. Confirm deletion in the dialog

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Job is soft-deleted (status set to 'deleted')
- ✅ Job disappears from the job list
- ✅ Success message appears (if implemented)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 4.2: Delete Job - Cancel
**Steps**:
1. Navigate to `/dashboard/jobs`
2. Click 3-dot menu on a job
3. Click "Delete"
4. Cancel the deletion dialog

**Expected Results**:
- ✅ Dialog closes
- ✅ Job is NOT deleted
- ✅ Job still appears in list

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 5: Job Status Management (Issue #20)

### Test 5.1: Change Job Status from Job List
**Steps**:
1. Navigate to `/dashboard/jobs`
2. Note current status of a job
3. Click 3-dot menu
4. Look for status change option (implementation may vary)

**Expected Results**:
- ✅ Status can be changed directly from job list
- ✅ Job card updates in real-time
- ✅ Status badge reflects new status

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 5.2: Activate Draft Job
**Steps**:
1. Create or find a draft job
2. Edit the job
3. Click "Update & Publish"

**Expected Results**:
- ✅ Status changes from "draft" to "active"
- ✅ Job appears on public job board (test in Suite 6)
- ✅ AI question generation is triggered (check backend logs)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 6: Public Job Board (Issue #21)

### Test 6.1: Access Public Job Board
**Steps**:
1. Log out (or open incognito window)
2. Navigate to `/jobs`

**Expected Results**:
- ✅ Page loads without authentication
- ✅ Header displays: "Find Your Next Opportunity"
- ✅ Shows count of active jobs
- ✅ Search bar is visible
- ✅ Filters button is visible

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.2: Public Job Board - Empty State
**Steps**:
1. Ensure no active jobs exist in database
2. Navigate to `/jobs`

**Expected Results**:
- ✅ Empty state message: "No jobs found"
- ✅ Message: "No active job postings at the moment. Check back soon!"

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.3: View Active Jobs Only
**Steps**:
1. Create jobs with different statuses (draft, active, closed)
2. Log out
3. Navigate to `/jobs`

**Expected Results**:
- ✅ Only jobs with "active" status are displayed
- ✅ Draft and closed jobs are NOT visible
- ✅ Status badge is NOT visible on job cards (public view)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.4: Job Search Functionality
**Steps**:
1. Navigate to `/jobs`
2. Create jobs with distinct titles (e.g., "Software Engineer", "Product Manager")
3. Type "Software" in search bar

**Expected Results**:
- ✅ Search is debounced (300ms delay)
- ✅ Results filter to show only matching jobs
- ✅ Search works on: title, description, industry, department, location
- ✅ Count updates: "Showing X of Y jobs"

**Steps (continued)**:
4. Clear search by clicking X icon

**Expected Results**:
- ✅ All jobs reappear

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.5: Job Filters - Location Type
**Steps**:
1. Navigate to `/jobs`
2. Click "Filters" button
3. Select "Remote" location type
4. Observe results

**Expected Results**:
- ✅ Filter panel opens
- ✅ Only remote jobs are displayed
- ✅ Filter count badge shows "1"

**Steps (continued)**:
5. Add "Hybrid" to selection

**Expected Results**:
- ✅ Both remote and hybrid jobs appear
- ✅ Filter count badge shows "2"

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.6: Job Filters - Experience Level
**Steps**:
1. Navigate to `/jobs`
2. Click "Filters" button
3. Select "Senior" experience level

**Expected Results**:
- ✅ Only senior-level jobs are displayed
- ✅ Filter count updates

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.7: Job Filters - Multiple Filters Combined
**Steps**:
1. Navigate to `/jobs`
2. Click "Filters" button
3. Select "Remote" location type
4. Select "Senior" experience level
5. Type "Engineer" in search

**Expected Results**:
- ✅ All filters apply simultaneously (AND logic)
- ✅ Only jobs matching ALL criteria are shown
- ✅ Count shows filtered results

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.8: Job Filters - Clear All
**Steps**:
1. Apply multiple filters
2. Click "Clear all" button

**Expected Results**:
- ✅ All filters are removed
- ✅ All jobs reappear
- ✅ Filter count badge disappears

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.9: Public Job Card - View Details Button
**Steps**:
1. Navigate to `/jobs`
2. Locate a job card
3. Click "View Details & Apply" button

**Expected Results**:
- ✅ Redirected to `/jobs/[id]` (job detail page)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 6.10: Public Job Board - Responsive Design
**Steps**:
1. Navigate to `/jobs`
2. Resize browser to mobile width (< 768px)

**Expected Results**:
- ✅ Layout switches to single column
- ✅ Search bar remains accessible
- ✅ Filters button remains accessible
- ✅ Job cards stack vertically
- ✅ All content is readable

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 7: Job Detail Page (Public) (Issue #22)

### Test 7.1: View Job Detail Page
**Steps**:
1. Navigate to `/jobs`
2. Click on any job card or "View Details & Apply" button

**Expected Results**:
- ✅ Redirected to `/jobs/[id]`
- ✅ Page displays complete job information:
  - Job title (large, bold)
  - Department (if applicable)
  - Location details
  - Industry and experience level
  - Posted date
  - Full description
  - Requirements list (with checkmarks)
  - Responsibilities list (with checkmarks, if applicable)
- ✅ Sidebar displays:
  - "Ready to Apply?" card with "Apply Now" button
  - Job Details card with salary, experience level, industry, location

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 7.2: Job Detail - Share Functionality (Mobile)
**Steps**:
1. Open `/jobs/[id]` on a mobile device with share API support
2. Click "Share" button

**Expected Results**:
- ✅ Native share dialog appears
- ✅ Share data includes:
  - Title: Job title
  - Text: "Check out this job: [Job Title]"
  - URL: Current page URL

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 7.3: Job Detail - Share Functionality (Desktop)
**Steps**:
1. Open `/jobs/[id]` on desktop (no native share API)
2. Click "Share" button

**Expected Results**:
- ✅ Alert appears: "Link copied to clipboard!"
- ✅ URL is copied to clipboard
- ✅ Can paste URL successfully

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 7.4: Job Detail - Back to Jobs Link
**Steps**:
1. Navigate to `/jobs/[id]`
2. Click "Back to Jobs" button

**Expected Results**:
- ✅ Redirected to `/jobs` (public job board)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 7.5: Job Detail - Apply Now Button
**Steps**:
1. Navigate to `/jobs/[id]`
2. Click "Apply Now" button in sidebar

**Expected Results**:
- ✅ Redirected to `/jobs/[id]/apply` (application page)
- ✅ (Note: Application page is not yet implemented - Sprint 3)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 7.6: Job Detail - Direct Access to Inactive Job
**Steps**:
1. Note the URL of an active job
2. Change the job status to "draft" via dashboard
3. Log out
4. Navigate to the noted URL

**Expected Results**:
- ✅ Error page displayed
- ✅ Message: "Job not found or no longer available"

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 7.7: Job Detail - Responsive Design
**Steps**:
1. Navigate to `/jobs/[id]`
2. Resize browser to mobile width

**Expected Results**:
- ✅ Sidebar moves below main content
- ✅ Layout remains readable
- ✅ Apply button remains accessible

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 8: AI Question Generation (Issue #23)

### Test 8.1: Question Generation - New Active Job
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Fill in all required fields
3. Click "Publish Job" (status = active)
4. Check backend logs and database

**Expected Results**:
- ✅ Job created successfully
- ✅ Backend log shows: "Generating screening questions..."
- ✅ Claude API is called (check logs)
- ✅ Questions stored in `question_templates` table
- ✅ Question template has:
  - `job_id` matching the created job
  - 5-7 questions
  - Each question has id, text, type, lookingFor, followUp, scoringKeywords, weight
  - `is_active` = true
  - `question_version` = 1

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 8.2: Question Generation - Draft Job (Should NOT Generate)
**Steps**:
1. Navigate to `/dashboard/jobs/new`
2. Fill in all required fields
3. Click "Save as Draft" (status = draft)
4. Check backend logs and database

**Expected Results**:
- ✅ Job created successfully
- ✅ NO question generation triggered
- ✅ No entry in `question_templates` table for this job

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 8.3: Question Generation - Activating Draft Job
**Steps**:
1. Create a draft job (or use existing draft)
2. Edit the job
3. Click "Update & Publish" (status changes draft → active)
4. Check backend logs and database

**Expected Results**:
- ✅ Job updated successfully
- ✅ Status changed to "active"
- ✅ Question generation triggered
- ✅ Questions stored in database

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 8.4: Question Generation - Already Has Questions (Should NOT Duplicate)
**Steps**:
1. Find an active job that already has questions generated
2. Edit and save the job (keep status as active)
3. Check backend logs and database

**Expected Results**:
- ✅ Job updated successfully
- ✅ No NEW questions generated
- ✅ Existing questions remain unchanged
- ✅ Only one active question_template entry per job

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 8.5: Question Quality - Technical Job
**Steps**:
1. Create an active job with technical requirements:
   - Title: "Senior Python Developer"
   - Description: Include Python, Django, REST APIs, etc.
   - Requirements: Include technical skills
2. Wait for question generation
3. Query database to view generated questions

**Expected Results**:
- ✅ Questions are relevant to the job
- ✅ Mix of question types (behavioral, technical, scenario)
- ✅ Technical questions mention relevant technologies
- ✅ Each question has meaningful lookingFor points
- ✅ Weights are distributed (not all the same)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 8.6: Question Generation Error Handling
**Steps**:
1. Temporarily set invalid ANTHROPIC_API_KEY in .env
2. Create and publish a new job
3. Check backend logs

**Expected Results**:
- ✅ Job still created successfully
- ✅ Error logged: "Failed to generate questions: [error message]"
- ✅ Application continues to function
- ✅ No crash or 500 errors

**Steps (continued)**:
4. Restore valid API key
5. Try again

**Expected Results**:
- ✅ Questions generate successfully

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 9: Dashboard Statistics (Bonus Fix)

### Test 9.1: Dashboard Stats - Active Jobs Count
**Steps**:
1. Create 3 active jobs
2. Create 2 draft jobs
3. Navigate to `/dashboard`

**Expected Results**:
- ✅ "Active jobs" card shows: 3
- ✅ Count is accurate and real-time

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 9.2: Dashboard Stats - Total Applications
**Steps**:
1. Ensure you have jobs created
2. Navigate to `/dashboard`

**Expected Results**:
- ✅ "Total applications" card shows correct count
- ✅ Currently should be 0 (no applications yet - Sprint 3)

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 9.3: Dashboard Stats - Candidates Screened
**Steps**:
1. Navigate to `/dashboard`

**Expected Results**:
- ✅ "Candidates screened" card shows: 0
- ✅ Note: This will be implemented in Sprint 3

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 10: Integration & E2E Tests

### Test 10.1: Complete Job Lifecycle
**Steps**:
1. Log in to dashboard
2. Create a draft job
3. Edit and publish the job
4. Verify it appears on public job board
5. Open job detail page (public)
6. Go back to dashboard
7. Change job status to closed
8. Verify it disappears from public board
9. Delete the job
10. Verify it's removed from dashboard

**Expected Results**:
- ✅ All transitions work smoothly
- ✅ Data consistency maintained throughout
- ✅ No errors or broken links

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 10.2: Multi-User Scenario
**Steps**:
1. Create jobs with User A
2. Log out
3. Log in with User B
4. Navigate to `/dashboard/jobs`

**Expected Results**:
- ✅ User B only sees their own jobs
- ✅ User A's jobs are not visible

**Steps (continued)**:
4. Try to access User A's job edit page directly (URL manipulation)

**Expected Results**:
- ✅ Access denied (403 Forbidden)
- ✅ Error message displayed

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 10.3: Performance - Large Job List
**Steps**:
1. Create 20+ jobs
2. Navigate to `/dashboard/jobs`
3. Navigate to `/jobs` (public)

**Expected Results**:
- ✅ Both pages load within 2 seconds
- ✅ No performance degradation
- ✅ Smooth scrolling
- ✅ Responsive interactions

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 11: Database & Data Integrity

### Test 11.1: Verify Database Schema
**Steps**:
1. Check Supabase dashboard
2. Verify tables exist:
   - `jobs`
   - `question_templates`
   - `applications` (for future)

**Expected Results**:
- ✅ All tables exist with correct columns
- ✅ Relationships are properly set up
- ✅ RLS policies are configured

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 11.2: Soft Delete Verification
**Steps**:
1. Delete a job from dashboard
2. Query database directly
3. Check the job record

**Expected Results**:
- ✅ Job record still exists in database
- ✅ `status` field is set to 'deleted'
- ✅ Job does not appear in any listings

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 11.3: Data Transformation (Form ↔ Database)
**Steps**:
1. Create a job with all fields filled
2. Check database record
3. Edit the job
4. Verify form is correctly populated

**Expected Results**:
- ✅ Form data correctly transformed to database format:
  - `location_type` → `remote_policy`
  - `location_city, location_state, location_country` → `location` (comma-separated string)
  - `salary_min, salary_max, salary_currency` → `salary_range` (formatted string)
  - `requirements` (string) → `requirements` (array)
- ✅ Reverse transformation works for editing:
  - Database format correctly converted back to form fields

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Test Suite 12: Error Handling & Edge Cases

### Test 12.1: Network Error During Job Creation
**Steps**:
1. Open DevTools → Network tab
2. Set network to "Offline"
3. Try to create a job

**Expected Results**:
- ✅ Error message displayed to user
- ✅ Form data is not lost
- ✅ User can retry after going online

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 12.2: Unauthenticated Access to Protected Routes
**Steps**:
1. Log out
2. Try to access:
   - `/dashboard`
   - `/dashboard/jobs`
   - `/dashboard/jobs/new`
   - `/dashboard/jobs/[id]/edit`

**Expected Results**:
- ✅ Redirected to `/auth/signin` for all protected routes
- ✅ No data is exposed

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 12.3: Invalid Job ID
**Steps**:
1. Navigate to `/jobs/invalid-job-id-12345`

**Expected Results**:
- ✅ Error page displayed
- ✅ Message: "Job not found or no longer available"
- ✅ Retry button present

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

### Test 12.4: Browser Compatibility
**Test on multiple browsers:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Verify:**
- ✅ All features work consistently
- ✅ UI renders correctly
- ✅ No console errors

**Status**: [ ] Pass [ ] Fail

**Notes**: ___________

---

## Critical Bugs Found

**Bug #**: _____
**Severity**: [ ] Critical [ ] High [ ] Medium [ ] Low
**Description**: _____________________________________________________
**Steps to Reproduce**: _____________________________________________
**Expected Result**: ________________________________________________
**Actual Result**: __________________________________________________
**Screenshots/Evidence**: ___________________________________________

---

## Summary

**Total Tests**: 60+
**Tests Passed**: _____
**Tests Failed**: _____
**Pass Rate**: _____%

**Sprint 2 Status**: [ ] Ready for Production [ ] Needs Fixes

---

## Sign-off

**Tester Signature**: ___________
**Date**: ___________
**Approved by**: ___________
**Date**: ___________

---

## Notes for Sprint 3

Based on testing, the following should be prioritized in Sprint 3:
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________
