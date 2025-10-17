# Fix Dashboard Routing Issue - Complete Step-by-Step Guide

## Problem
Candidates logging in are being routed to the company dashboard instead of a candidate-specific dashboard.

## Solution Overview
We need to:
1. Create a separate candidate dashboard component
2. 2. Add role detection logic to the main dashboard page
   3. 3. Route users based on their role (candidate vs recruiter)
      4. 4. Update the signup flow to assign roles
        
         5. ---
        
         6. ## STEP 1: Create Candidate Dashboard Component ✅ DONE
        
         7. **File:** `app/dashboard/candidate-dashboard.tsx`
        
         8. The candidate dashboard has been created with:
         9. - Job listing display (using data from jobs table)
            - - Application tracking (displaying user's applications)
              - - View & Apply functionality for each job
                - - Responsive layout with Tailwind CSS
                  - - Sign out functionality
                   
                    - ---

                    ## STEP 2: Update Main Dashboard Page (IMMEDIATE ACTION NEEDED)

                    **File:** `app/dashboard/page.tsx`

                    Replace the entire content with this updated version that includes role detection:

                    ```typescript
                    'use client';

                    import { useEffect, useState } from 'react';
                    import { useRouter } from 'next/navigation';
                    import { createClient } from '@/lib/supabase/client';
                    import CandidateDashboard from './candidate-dashboard';

                    // Keep the existing RecruiterDashboard component as is
                    export default function DashboardPage() {
                      const router = useRouter();
                      const supabase = createClient();
                      const [user, setUser] = useState<{ email: string; user_metadata?: { full_name?: string } } | null>(null);
                      const [userRole, setUserRole] = useState<'candidate' | 'recruiter' | null>(null);
                      const [loading, setLoading] = useState(true);

                      useEffect(() => {
                        const checkUserAndRole = async () => {
                          try {
                            // Get authenticated user
                            const { data: { user }, error: userError } = await supabase.auth.getUser();

                            if (userError || !user) {
                              router.push('/auth/signin');
                              return;
                            }

                            setUser(user);

                            // Check user role from auth metadata
                            const role = user.user_metadata?.role || 'candidate';
                            setUserRole(role as 'candidate' | 'recruiter');
                            setLoading(false);
                          } catch (error) {
                            console.error('Error checking user role:', error);
                            router.push('/auth/signin');
                          }
                        };

                        checkUserAndRole();
                      }, [router, supabase]);

                      if (loading) {
                        return <div className="flex items-center justify-center min-h-screen">
                          <div className="text-center">
                            <p className="text-xl text-gray-600">Loading your dashboard...</p>
                          </div>
                        </div>;
                      }

                      // Route based on user role
                      if (userRole === 'candidate') {
                        return <CandidateDashboard />;
                      }

                      // Recruiter dashboard (existing component)
                      // Import and render the existing RecruiterDashboard or keep existing code
                      return <RecruiterDashboard />;
                    }

                    // This is the existing recruiter dashboard component
                    // Keep your existing DashboardPage JSX here renamed as RecruiterDashboard
                    function RecruiterDashboard() {
                      // ... [COPY ALL THE EXISTING DASHBOARD CODE HERE] ...
                    }
                    ```

                    **ACTION ITEMS FOR STEP 2:**
                    1. Open `app/dashboard/page.tsx`
                    2. 2. Replace the file with the code above
                       3. 3. Move your existing dashboard JSX into the `RecruiterDashboard` function
                          4. 4. Commit with message: "fix: add role-based dashboard routing"
                            
                             5. ---
                            
                             6. ## STEP 3: Update Signup Flow to Set User Role
                            
                             7. **File:** `app/auth/signup/route.ts` (or `app/auth/signup/page.tsx` depending on your structure)
                            
                             8. When creating users, set their role in metadata:
                            
                             9. ```typescript
                                // After user signup, set role
                                const { data: { user }, error } = await supabase.auth.signUp({
                                  email,
                                  password,
                                  options: {
                                    data: {
                                      full_name: fullName,
                                      role: 'candidate' // Default role for signup
                                      // For recruiters, this would be 'recruiter'
                                    },
                                  },
                                });
                                ```

                                **ACTION ITEMS FOR STEP 3:**
                                1. Find your signup authentication logic
                                2. 2. Add `role: 'candidate'` to the `options.data` object
                                   3. 3. For recruiters, set `role: 'recruiter'`
                                      4. 4. Commit with message: "feat: assign roles during signup"
                                        
                                         5. ---
                                        
                                         6. ## STEP 4: (Optional) Add Role Column to Profiles Table
                                        
                                         7. If you're using a profiles table, run this SQL in Supabase:
                                        
                                         8. ```sql
                                            ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'candidate';

                                            -- Update existing users
                                            UPDATE profiles SET role = 'candidate' WHERE role IS NULL;

                                            -- Add constraint
                                            ALTER TABLE profiles ADD CONSTRAINT valid_role CHECK (role IN ('candidate', 'recruiter'));
                                            ```

                                            ---

                                            ## STEP 5: Testing Checklist

                                            ### Test Candidate Login:
                                            1. Sign out from recruiter account
                                            2. 2. Login with: `candidate@testai-jobs.com` / `CandidatePass123`
                                               3. 3. Verify you see:
                                                  4.    - ✅ "Available Jobs" card showing job count
                                                        -    - ✅ "Your Applications" card
                                                             -    - ✅ Job listing with "View & Apply" buttons
                                                                  -    - ✅ Your applications list
                                                                   
                                                                       - ### Test Recruiter Login:
                                                                       - 1. Sign out from candidate account
                                                                         2. 2. Login with: `recruiter@testai-jobs.com` / `RecruiterPass123`
                                                                            3. 3. Verify you see:
                                                                               4.    - ✅ "Job Postings" card
                                                                                     -    - ✅ "Applications" card
                                                                                          -    - ✅ "AI Screening" card
                                                                                               -    - ✅ Dashboard onboarding steps
                                                                                                
                                                                                                    - ---
                                                                                                    
                                                                                                    ## STEP 6: Commit and Deploy
                                                                                                    
                                                                                                    **Commit all changes:**
                                                                                                    ```bash
                                                                                                    git add .
                                                                                                    git commit -m "fix: implement role-based dashboard routing for candidates and recruiters"
                                                                                                    git push origin main
                                                                                                    ```
                                                                                                    
                                                                                                    **Vercel will auto-deploy.** Wait for deployment to complete, then test both accounts in production.
                                                                                                    
                                                                                                    ---
                                                                                                    
                                                                                                    ## STEP 7: Verify in Production
                                                                                                    
                                                                                                    1. Visit: https://ai-job-board-cpcbmtnck-loophire-ai-job-boards-projects.vercel.app/auth/signin
                                                                                                    2. 2. Test both accounts
                                                                                                       3. 3. Verify routing works correctly
                                                                                                          4. 4. Check Vercel logs for any errors
                                                                                                            
                                                                                                             5. ---
                                                                                                            
                                                                                                             6. ## Rollback Plan (if needed)
                                                                                                            
                                                                                                             7. If issues occur:
                                                                                                             8. ```bash
                                                                                                                git revert HEAD
                                                                                                                git push origin main
                                                                                                                ```
                                                                                                                
                                                                                                                ---
                                                                                                                
                                                                                                                ## Summary of Changes
                                                                                                                
                                                                                                                | File | Change | Status |
                                                                                                                |------|--------|--------|
                                                                                                                | `app/dashboard/candidate-dashboard.tsx` | NEW - Candidate interface | ✅ Created |
                                                                                                                | `app/dashboard/page.tsx` | UPDATED - Role-based routing | 📝 Needs update |
                                                                                                                | Signup flow | UPDATED - Add role assignment | 📝 Needs update |
                                                                                                                | Profiles table | (Optional) Add role column | 📝 Optional |
                                                                                                                
                                                                                                                ---
                                                                                                                
                                                                                                                ## Issues Encountered & Solutions
                                                                                                                
                                                                                                                ### Issue: "Cannot find candidate-dashboard"
                                                                                                                **Solution:** Make sure file is saved in `app/dashboard/candidate-dashboard.tsx`
                                                                                                                
                                                                                                                ### Issue: Role is undefined
                                                                                                                **Solution:** Check that `user.user_metadata.role` is being set during signup
                                                                                                                
                                                                                                                ### Issue: Still seeing recruiter dashboard
                                                                                                                **Solution:** Clear browser cache and re-login
                                                                                                                
                                                                                                                ---
                                                                                                                
                                                                                                                ## Support
                                                                                                                
                                                                                                                If you encounter issues:
                                                                                                                1. Check browser console for errors
                                                                                                                2. 2. Verify both components exist in the dashboard folder
                                                                                                                   3. 3. Ensure role is being set in auth metadata
                                                                                                                      4. 4. Check Vercel build logs for compilation errors
