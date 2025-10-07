# LinkedIn Authentication & Profile Import - Specification

## Overview
Allow candidates to sign up and auto-populate application data using their LinkedIn profile via OAuth 2.0.

---

## 🎯 Goals

1. **One-Click Signup**: Candidates create accounts via LinkedIn
2. **Auto-Fill Applications**: Import profile data to pre-populate forms
3. **Seamless Experience**: Reduce application friction
4. **Data Accuracy**: Get verified professional information

---

## 🔧 Technical Implementation

### Authentication Flow

#### Option 1: Supabase Auth with LinkedIn Provider (Recommended)
**Pros:**
- Built-in Supabase support
- Handles OAuth flow automatically
- Stores user in auth.users table
- Secure token management

**Setup:**
1. Enable LinkedIn provider in Supabase Dashboard
2. Configure LinkedIn App credentials
3. Add sign-in button to UI

```typescript
// Sign in with LinkedIn
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'linkedin_oidc',
  options: {
    scopes: 'openid profile email',
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

#### Option 2: Custom LinkedIn OAuth with API Integration
**Pros:**
- Access to LinkedIn API for profile data
- Can import work history, education, skills
- More control over data flow

**Cons:**
- More complex implementation
- Need to manage tokens
- Additional API calls

---

## 📊 LinkedIn Profile Data Available

### Basic Profile (OpenID Connect)
- First Name
- Last Name
- Email
- Profile Picture
- LinkedIn Profile URL

### Extended Profile (LinkedIn API with additional scopes)
Requires `r_liteprofile` and `r_emailaddress` scopes:
- Headline (current position)
- Location
- Industry
- Summary

### Full Profile Data (Requires LinkedIn API Partnership)
- Work Experience (positions, companies, dates)
- Education (schools, degrees, dates)
- Skills & Endorsements
- Certifications
- Languages

**Note**: Full work history access requires LinkedIn Partner status or Marketing Developer Platform access.

---

## 🏗️ Architecture

### Database Schema Updates

#### New Table: `candidate_profiles`
```sql
CREATE TABLE candidate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,

  -- Basic Info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),

  -- LinkedIn Data
  linkedin_id VARCHAR(255) UNIQUE,
  linkedin_url TEXT,
  profile_picture_url TEXT,
  headline VARCHAR(500),
  location VARCHAR(255),
  industry VARCHAR(255),
  summary TEXT,

  -- Imported Profile Data (JSON)
  experience JSONB,  -- Work history
  education JSONB,   -- Education history
  skills TEXT[],     -- Skills array
  certifications JSONB,
  languages TEXT[],

  -- Metadata
  profile_completed BOOLEAN DEFAULT false,
  last_synced_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_candidate_profiles_user_id ON candidate_profiles(user_id);
CREATE INDEX idx_candidate_profiles_linkedin_id ON candidate_profiles(linkedin_id);
CREATE INDEX idx_candidate_profiles_email ON candidate_profiles(email);
```

#### Update `applications` table
```sql
ALTER TABLE applications
ADD COLUMN candidate_profile_id UUID REFERENCES candidate_profiles(id);
```

---

## 🎨 User Experience Flow

### For Candidates (First Time)

1. **Landing on Job Detail Page** (`/jobs/[id]`)
   - See "Apply with LinkedIn" button (prominent)
   - See "Apply with Email" button (alternative)

2. **Click "Apply with LinkedIn"**
   - Redirect to LinkedIn OAuth consent screen
   - User authorizes access
   - Redirect back to application

3. **Profile Creation**
   - Create `candidate_profiles` record
   - Import available LinkedIn data
   - Show profile preview/edit screen

4. **Application Pre-Fill**
   - Application form auto-filled with LinkedIn data
   - Candidate can edit/add info
   - Upload resume (optional if LinkedIn data sufficient)
   - Submit application

### For Returning Candidates

1. **Already Authenticated**
   - Click "Apply Now" on any job
   - Profile data auto-fills form
   - Quick submission process

2. **Update Profile**
   - Option to re-sync LinkedIn data
   - Edit profile in settings

---

## 🔐 Security & Privacy

### Data Handling
- Store only necessary data
- Request minimal LinkedIn scopes
- Comply with LinkedIn API Terms of Service
- Allow users to disconnect LinkedIn
- Clear data on account deletion

### RLS Policies
```sql
-- Candidates can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON candidate_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 📋 Implementation Tasks

### Sprint 3 Integration

#### Issue #24.5: LinkedIn Authentication Setup (3 SP)
**Priority**: HIGH
**Type**: Backend + Auth

**Tasks**:
- [ ] Create LinkedIn App in LinkedIn Developer Portal
- [ ] Configure OAuth redirect URLs
- [ ] Enable LinkedIn provider in Supabase
- [ ] Add LinkedIn app credentials to env
- [ ] Test OAuth flow
- [ ] Create candidate_profiles table
- [ ] Add RLS policies

**Acceptance Criteria**:
- LinkedIn OAuth works end-to-end
- Profile data stored in database
- Secure token handling

---

#### Issue #26.5: LinkedIn Sign-In UI (2 SP)
**Priority**: HIGH
**Type**: Frontend

**Tasks**:
- [ ] Add "Sign in with LinkedIn" button
- [ ] Create LinkedIn brand compliance UI
- [ ] Add to job detail page
- [ ] Add to application page
- [ ] Show loading states
- [ ] Handle OAuth callback
- [ ] Display error messages

**Acceptance Criteria**:
- Button follows LinkedIn branding guidelines
- OAuth flow is smooth
- Errors handled gracefully
- Responsive design

---

#### Issue #27.5: Profile Import & Auto-Fill (4 SP)
**Priority**: HIGH
**Type**: Backend + Frontend

**Tasks**:
- [ ] Fetch LinkedIn profile data after auth
- [ ] Parse and structure profile data
- [ ] Create/update candidate_profiles record
- [ ] Pre-fill application form with profile data
- [ ] Allow manual edits
- [ ] Show "Edit Profile" page
- [ ] Add profile sync functionality
- [ ] Handle missing data gracefully

**Acceptance Criteria**:
- Profile data imports correctly
- Application form pre-fills
- Users can edit imported data
- Profile page displays well

---

## 📦 Dependencies

### NPM Packages
```bash
# Already included with Supabase
# No additional packages needed for basic OAuth
```

### Environment Variables
```bash
# LinkedIn OAuth (from LinkedIn Developer Portal)
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret

# Supabase handles the rest
```

### LinkedIn Developer Setup
1. Create app at: https://www.linkedin.com/developers/apps
2. Add redirect URLs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (dev)
3. Request OAuth 2.0 scopes:
   - `openid`
   - `profile`
   - `email`

---

## 🎯 Sprint 3 Revised Story Points

### Original Sprint 3: 42 SP
### LinkedIn Auth Addition: +9 SP
### **New Total: 51 SP**

**Breakdown**:
- Issue #24.5: LinkedIn Auth Setup (3 SP)
- Issue #26.5: LinkedIn Sign-In UI (2 SP)
- Issue #27.5: Profile Import & Auto-Fill (4 SP)

---

## 🚀 Benefits

### For Candidates
- ✅ Faster application process
- ✅ No manual data entry
- ✅ Professional profile presentation
- ✅ One account for all applications

### For Companies
- ✅ Verified candidate information
- ✅ LinkedIn profile links
- ✅ More complete applications
- ✅ Higher quality data

### For Platform
- ✅ Reduced friction
- ✅ Higher conversion rates
- ✅ Better user experience
- ✅ Competitive advantage

---

## 📚 Resources

### LinkedIn OAuth Documentation
- Developer Portal: https://www.linkedin.com/developers/
- OAuth 2.0 Guide: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authentication
- API Reference: https://learn.microsoft.com/en-us/linkedin/shared/references/v2/profile

### Supabase Documentation
- Social Login: https://supabase.com/docs/guides/auth/social-login
- LinkedIn Provider: https://supabase.com/docs/guides/auth/social-login/auth-linkedin

### LinkedIn Branding Guidelines
- Button Design: https://brand.linkedin.com/downloads
- Must use official LinkedIn blue: #0077B5
- Must include LinkedIn logo

---

## ⚠️ Important Notes

### LinkedIn API Limitations
1. **Basic Profile Only**: Without LinkedIn Partner status, we can only get basic profile (name, email, photo)
2. **No Work History**: Full work experience requires partner access
3. **Rate Limits**: LinkedIn has API rate limits
4. **Compliance**: Must follow LinkedIn branding and usage guidelines

### Recommendations
1. **Start Simple**: Implement basic profile (name, email, photo) first
2. **Resume Still Required**: Since we can't get full work history, still require resume upload
3. **Best Use Case**: LinkedIn auth for quick sign-up, resume parsing for detailed data
4. **Future Enhancement**: Apply for LinkedIn Partner status to get full profile access

---

## 🎯 Alternative Approach (Recommended)

Given LinkedIn API limitations, here's the optimal approach:

### Phase 1 (Sprint 3): LinkedIn OAuth for Sign-Up Only
- Use LinkedIn for authentication
- Import basic profile (name, email, photo)
- Still require resume upload for detailed info
- Parse resume with Claude for work history

### Phase 2 (Future): Enhanced Integration
- Apply for LinkedIn Partner status
- Import full work experience
- Auto-sync profile updates
- Deep integration with LinkedIn profiles

**This approach gives us**:
- ✅ Easy candidate signup
- ✅ Verified identity
- ✅ Professional profile photos
- ✅ Full work history from resume parsing
- ✅ No API partnership required immediately

---

## 📊 Revised Sprint 3 Scope Decision

### Option A: Full LinkedIn Integration (51 SP)
Add 9 SP for comprehensive LinkedIn features

### Option B: Basic LinkedIn Auth Only (45 SP)
Add 3 SP for sign-up/sign-in only

### Option C: Defer to Sprint 4
Keep Sprint 3 at 42 SP, add LinkedIn in Sprint 4

**Recommendation**: **Option B - Basic LinkedIn Auth (45 SP)**
- Quick value: Easy signup
- Manageable scope: +3 SP only
- Best UX: Verified profiles
- Practical: Works without partner status

---

**Created**: 2025-10-06
**Status**: Proposed for Sprint 3
**Impact**: +3 to +9 Story Points
