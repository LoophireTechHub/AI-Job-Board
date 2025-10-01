# Deployment Guide

Complete guide for deploying the AI-Powered Job Application System to production.

## Table of Contents

- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Vercel Deployment](#vercel-deployment-recommended)
- [Alternative Platforms](#alternative-platforms)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-deployment Tasks](#post-deployment-tasks)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Pre-deployment Checklist

Before deploying, ensure you have:

- [ ] Supabase project created and configured
- [ ] Database schema applied (`supabase-schema.sql`)
- [ ] Anthropic API key obtained
- [ ] All environment variables documented
- [ ] Code tested locally
- [ ] Build passing (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Dependencies up to date
- [ ] `.env.local` never committed to git

---

## Vercel Deployment (Recommended)

Vercel provides seamless Next.js deployment with automatic builds and previews.

### Step 1: Prepare Your Repository

1. Ensure your code is in a Git repository
2. Push to GitHub, GitLab, or Bitbucket:

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (unless you changed it)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

5. Add environment variables (see [Environment Variables](#environment-variables))

6. Click **"Deploy"**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=sk-ant-your-key
```

**Important**:
- Mark `SUPABASE_SERVICE_KEY` and `ANTHROPIC_API_KEY` as **secret**
- Apply to **Production**, **Preview**, and **Development** environments

### Step 4: Deploy

After adding environment variables, trigger a new deployment:

```bash
vercel --prod
```

Or use the dashboard to redeploy.

### Step 5: Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records:
   - **Type**: A Record
   - **Name**: @ (or subdomain)
   - **Value**: `76.76.19.19` (Vercel IP)

   OR

   - **Type**: CNAME
   - **Name**: @ (or subdomain)
   - **Value**: `cname.vercel-dns.com`

4. Wait for DNS propagation (up to 48 hours)

---

## Alternative Platforms

### AWS (Amplify)

1. **Prerequisites**:
   - AWS Account
   - GitHub connected to AWS Amplify

2. **Deploy**:
   ```bash
   # Install Amplify CLI
   npm install -g @aws-amplify/cli

   # Configure
   amplify init

   # Add hosting
   amplify add hosting

   # Deploy
   amplify publish
   ```

3. **Environment Variables**:
   - Go to Amplify Console → Environment Variables
   - Add all required variables
   - Redeploy

### Railway

1. Go to [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub**
3. Select repository
4. Add environment variables
5. Deploy

### Render

1. Go to [render.com](https://render.com)
2. **New** → **Web Service**
3. Connect repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add environment variables
6. Deploy

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

```bash
# Build
docker build -t ai-job-app .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  -e SUPABASE_SERVICE_KEY=... \
  -e ANTHROPIC_API_KEY=... \
  ai-job-app
```

---

## Database Setup

### Supabase Production Setup

1. **Create Project**:
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Choose region close to your users

2. **Apply Schema**:
   - Go to **SQL Editor**
   - Copy contents of `supabase-schema.sql`
   - Run the SQL

3. **Configure Storage**:
   - Go to **Storage**
   - Create `resumes` bucket (if not created by schema)
   - Set permissions:
     - **Public**: No
     - **File size limit**: 10MB
     - **Allowed MIME types**:
       - `application/pdf`
       - `text/plain`
       - `application/msword`

4. **Enable RLS**:
   - Verify Row Level Security is enabled on all tables
   - Test policies with different user roles

5. **Backup Configuration**:
   - Go to **Settings** → **Database**
   - Enable **Daily Backups**
   - Configure retention period

### Database Migrations

For future schema changes:

1. Create migration file:
   ```sql
   -- migrations/002_add_new_field.sql
   ALTER TABLE jobs ADD COLUMN new_field TEXT;
   ```

2. Apply via Supabase Dashboard or CLI
3. Update TypeScript types in `types/database.ts`

---

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | Service role key (⚠️ secret) | Supabase → Settings → API |
| `ANTHROPIC_API_KEY` | Claude API key (⚠️ secret) | console.anthropic.com |

### Optional Variables

```bash
# Node environment
NODE_ENV=production

# Custom API base URL (if different)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature flags
NEXT_PUBLIC_ENABLE_PDF_PARSING=true
```

### Security Best Practices

1. **Never commit secrets** to git
2. **Rotate keys** regularly (every 90 days)
3. **Use different keys** for dev/staging/prod
4. **Monitor API usage** for anomalies
5. **Set up alerts** for failed authentication

---

## Post-deployment Tasks

### 1. Verify Deployment

```bash
# Health check
curl https://your-domain.com/api/health

# Test API endpoint
curl -X POST https://your-domain.com/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"jobTitle":"Engineer","industry":"Tech","experienceLevel":"mid","department":"Engineering"}'
```

### 2. Set Up Monitoring

#### Vercel Analytics

1. Go to Vercel Dashboard → Analytics
2. Enable **Web Analytics**
3. Enable **Speed Insights**

#### Supabase Monitoring

1. Go to Supabase → Reports
2. Monitor:
   - API requests
   - Database connections
   - Storage usage

#### Claude API Monitoring

1. Go to Anthropic Console
2. Check:
   - Token usage
   - API calls
   - Error rates

### 3. Configure DNS

If using custom domain:

```
Type  Name             Value                    TTL
A     @                76.76.19.19              3600
A     www              76.76.19.19              3600
TXT   _vercel          vercel-verification=...  3600
```

### 4. Enable HTTPS

- Vercel automatically provisions SSL certificates
- For custom domains, certificates are auto-generated
- Verify HTTPS by visiting `https://your-domain.com`

### 5. Set Up Error Tracking

Consider integrating:

- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging
- **Datadog**: Application monitoring

```bash
npm install @sentry/nextjs

# Follow Sentry setup wizard
npx @sentry/wizard@latest -i nextjs
```

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Check error rates in Vercel/Sentry
- [ ] Monitor Claude API usage and costs
- [ ] Review Supabase database performance

### Weekly Tasks

- [ ] Review application logs
- [ ] Check database backup status
- [ ] Monitor API response times
- [ ] Review security alerts

### Monthly Tasks

- [ ] Update dependencies (`npm update`)
- [ ] Review and rotate API keys
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Review and archive old data

### Performance Optimization

1. **Database Indexes**:
   - Monitor slow queries in Supabase
   - Add indexes for frequently queried columns

2. **Caching**:
   - Cache question templates
   - Cache parsed resumes
   - Use Redis for session data (if needed)

3. **CDN**:
   - Vercel automatically uses CDN
   - Optimize images with Next.js Image

4. **API Rate Limiting**:
   ```typescript
   // lib/rate-limit.ts
   import rateLimit from 'express-rate-limit';

   export const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

---

## Troubleshooting

### Build Failures

**Error**: `Type error: Cannot find module...`

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

**Error**: `Environment variable not found`

- Verify all environment variables are set in deployment platform
- Check for typos in variable names
- Redeploy after adding variables

### Runtime Errors

**Error**: `Supabase client error`

- Verify `NEXT_PUBLIC_SUPABASE_URL` and keys are correct
- Check Supabase project is active
- Verify RLS policies allow the operation

**Error**: `Claude API error: 401 Unauthorized`

- Verify `ANTHROPIC_API_KEY` is correct
- Check API key has not expired
- Verify sufficient credits

**Error**: `Claude API error: 429 Rate Limit`

- Implement exponential backoff
- Reduce concurrent requests
- Upgrade Anthropic plan if needed

### Database Issues

**Slow Queries**:

```sql
-- Check slow queries in Supabase
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**Connection Pool Exhausted**:

- Increase connection pool size in Supabase
- Close connections properly in code
- Use connection pooling (PgBouncer)

### Deployment Issues

**Vercel Build Timeout**:

- Split large builds into smaller chunks
- Optimize build process
- Contact Vercel support for limit increase

**Out of Memory**:

- Increase Node.js memory limit:
  ```json
  {
    "scripts": {
      "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
    }
  }
  ```

---

## Rollback Procedure

If deployment fails:

### Vercel

1. Go to **Deployments**
2. Find last working deployment
3. Click **⋯** → **Promote to Production**

### Manual Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback multiple commits
git reset --hard <commit-hash>
git push --force origin main
```

---

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] RLS policies tested
- [ ] API rate limiting configured
- [ ] Input validation implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CORS configured properly
- [ ] Security headers set
- [ ] Audit logs enabled

---

## Cost Optimization

### Claude API

- Use caching for repeated queries
- Use Haiku for simple tasks
- Set appropriate `max_tokens` limits
- Monitor token usage daily

### Supabase

- Use indexes to optimize queries
- Archive old data
- Optimize storage (compress files)
- Monitor bandwidth usage

### Vercel

- Optimize images and assets
- Use static generation where possible
- Enable edge caching
- Monitor function execution time

---

## Support

For deployment help:

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **Anthropic**: [support.anthropic.com](https://support.anthropic.com)

For project-specific issues, open an issue on GitHub.

---

**Congratulations! Your application is now deployed! 🚀**
