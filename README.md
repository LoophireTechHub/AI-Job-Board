# AI-Powered Job Application System

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Claude AI](https://img.shields.io/badge/Claude-3.5-orange?logo=anthropic)](https://www.anthropic.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

An intelligent job application and interview management system powered by Claude AI, built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

> 🚀 Automate your hiring process with AI-powered resume parsing, dynamic interview questions, and intelligent candidate evaluation.

## Features

🤖 **AI-Powered Interview Questions** - Claude automatically generates role-specific interview questions based on job requirements

📄 **Smart Resume Parsing** - Extract and structure candidate information from resumes using Claude

💬 **Dynamic Conversational Interviews** - Conduct natural, adaptive interviews with follow-up questions

📊 **Intelligent Response Analysis** - Automatically evaluate candidate answers with detailed scoring and insights

🎯 **Job Fit Assessment** - Match candidates to positions based on skills, experience, and requirements

📈 **Real-time Progress Tracking** - Monitor interview sessions and candidate evaluation status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (for resumes)
- **Error Tracking**: Sentry

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Supabase account ([sign up here](https://supabase.com))
- An Anthropic API key ([get one here](https://console.anthropic.com))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ai-job-application
npm install
```

### 2. Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **Settings** → **API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (⚠️ keep this secure!)
3. Go to **SQL Editor** and run the schema from `supabase-schema.sql`:

```bash
# Copy the contents of supabase-schema.sql and run it in Supabase SQL Editor
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key

# Anthropic Claude API
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ai-job-application/
├── app/
│   ├── api/
│   │   ├── generate-questions/    # Generate interview questions
│   │   ├── analyze-response/      # Analyze candidate responses
│   │   ├── parse-resume/          # Parse resume with Claude
│   │   └── interview-session/     # Manage interview sessions
│   ├── page.tsx                   # Home page
│   └── layout.tsx                 # Root layout
├── lib/
│   ├── claude/
│   │   ├── client.ts              # Claude SDK setup
│   │   ├── prompts.ts             # Prompt templates
│   │   ├── question-generator.ts  # Question generation logic
│   │   ├── response-analyzer.ts   # Response analysis logic
│   │   ├── resume-parser.ts       # Resume parsing logic
│   │   └── conversation-manager.ts # Interview conversation flow
│   ├── supabase/
│   │   ├── client.ts              # Client-side Supabase client
│   │   └── server.ts              # Server-side Supabase client
│   └── utils.ts                   # Utility functions
├── types/
│   ├── database.ts                # Database type definitions
│   └── api.ts                     # API request/response types
├── supabase-schema.sql            # Database schema
└── middleware.ts                  # Auth middleware

```

## API Endpoints

### 1. Generate Interview Questions

**POST** `/api/generate-questions?jobId={jobId}`

Generate AI-powered interview questions for a job posting.

**Request Body:**
```json
{
  "jobTitle": "Senior Software Engineer",
  "industry": "Technology",
  "experienceLevel": "senior",
  "department": "Engineering",
  "jobDescription": "...",
  "requirements": ["5+ years experience", "React expertise"]
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": "q1",
      "text": "Tell me about a time when...",
      "type": "behavioral",
      "lookingFor": ["specific example", "outcome"],
      "followUp": "Can you elaborate on...",
      "scoringKeywords": ["leadership", "teamwork"],
      "weight": 4
    }
  ],
  "questionTemplateId": "uuid"
}
```

### 2. Analyze Candidate Response

**POST** `/api/analyze-response?applicationId={applicationId}`

Analyze a candidate's answer to an interview question.

**Request Body:**
```json
{
  "questionId": "q1",
  "questionText": "Tell me about...",
  "questionType": "behavioral",
  "candidateResponse": "In my previous role...",
  "lookingFor": ["specific example", "outcome"],
  "scoringKeywords": ["leadership", "teamwork"],
  "questionWeight": 4
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "score": 4.2,
    "strengths": ["Provided specific example", "Clear outcome"],
    "concerns": ["Could elaborate more on team dynamics"],
    "keywordMatches": ["leadership", "teamwork"],
    "recommendation": "pass"
  }
}
```

### 3. Parse Resume

**POST** `/api/parse-resume?applicationId={applicationId}`

Parse a resume and extract structured information.

**Request Body:**
```json
{
  "resumeText": "John Doe\nSenior Engineer...",
  "jobContext": {
    "title": "Software Engineer",
    "requirements": ["React", "Node.js"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "personal_info": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "experience": [...],
    "skills": {...}
  },
  "matchScore": 85
}
```

### 4. Interview Session Management

**POST** `/api/interview-session` - Start interview
**PUT** `/api/interview-session` - Submit answer
**GET** `/api/interview-session?sessionId={id}` - Get session details

## Database Schema

The application uses 8 main tables:

1. **jobs** - Job postings
2. **applications** - Candidate applications
3. **candidates** - Candidate profiles
4. **question_templates** - AI-generated questions per job
5. **ai_responses** - Claude analysis of answers
6. **interview_sessions** - Conversational interview tracking
7. **resume_embeddings** - Resume content for semantic search
8. **audit_logs** - AI interaction logging

See `supabase-schema.sql` for the complete schema.

## Claude Integration

This application uses Claude AI for:

### Question Generation
- **Model**: Claude 3.5 Sonnet
- **Purpose**: Generate tailored interview questions based on role
- **Input**: Job details, requirements, experience level
- **Output**: 8 contextual questions with evaluation criteria

### Resume Parsing
- **Model**: Claude 3.5 Sonnet
- **Purpose**: Extract structured data from resumes
- **Input**: Resume text (txt, markdown, or PDF via text extraction)
- **Output**: Structured JSON with experience, skills, education

### Response Analysis
- **Model**: Claude 3.5 Sonnet
- **Purpose**: Evaluate candidate answers objectively
- **Input**: Question, candidate response, evaluation criteria
- **Output**: Score (0-5), strengths, concerns, recommendations

### Conversation Management
- **Model**: Claude 3.5 Haiku (fast responses)
- **Purpose**: Dynamic interview conversation flow
- **Input**: Conversation history, remaining questions
- **Output**: Natural follow-ups and question transitions

## Development

### Running Tests

```bash
npm run test
```

### Building for Production

```bash
npm run build
npm run start
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (server only) | Yes |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Yes |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking DSN | No |
| `SENTRY_ORG` | Sentry organization name | No |
| `SENTRY_PROJECT` | Sentry project name | No |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source maps | No |

## Error Tracking with Sentry

This application includes Sentry integration for production error tracking and monitoring.

### Setting up Sentry (Optional)

1. **Create a Sentry Account**
   - Sign up at [sentry.io](https://sentry.io)
   - Create a new Next.js project

2. **Get Your DSN**
   - Go to **Settings** → **Projects** → **Your Project**
   - Copy the DSN (Data Source Name)

3. **Add Environment Variables**

   Update your `.env.local`:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   SENTRY_ORG=your-org-name
   SENTRY_PROJECT=your-project-name
   SENTRY_AUTH_TOKEN=your-auth-token  # For source map uploads
   ```

4. **Configure in Vercel** (for production)
   - Go to your Vercel project settings
   - Add the same environment variables
   - Deploy to activate error tracking

### Features Enabled

- **Error Tracking**: Automatic capture of client and server errors
- **Session Replay**: Visual reproduction of user sessions with errors
- **Performance Monitoring**: Track application performance metrics
- **Source Maps**: Upload source maps for readable stack traces
- **Breadcrumbs**: Track user actions leading to errors

### Testing Error Tracking

You can test Sentry integration by triggering an error:

```typescript
// Trigger a test error (remove after testing)
throw new Error('Sentry test error');
```

Errors will appear in your Sentry dashboard at `https://sentry.io/organizations/your-org/issues/`

## Security Considerations

⚠️ **Important Security Notes:**

1. Never commit `.env.local` to version control
2. Keep `SUPABASE_SERVICE_KEY` secure - it bypasses RLS policies
3. Use Row Level Security (RLS) policies in Supabase for data protection
4. Validate all user inputs before processing
5. Rate limit API endpoints in production
6. Monitor Claude API usage to control costs

## Cost Optimization

To optimize Claude API costs:

1. Use **Claude 3.5 Haiku** for simple tasks (follow-ups, greetings)
2. Use **Claude 3.5 Sonnet** for complex analysis (resume parsing, evaluations)
3. Cache question templates per job (don't regenerate unnecessarily)
4. Implement response caching for common queries
5. Set appropriate `max_tokens` limits

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Node.js:
- AWS (Amplify, EC2, ECS)
- Google Cloud Platform
- Railway
- Render
- Fly.io

## Troubleshooting

### Common Issues

**Claude API Errors**
- Check your `ANTHROPIC_API_KEY` is valid
- Verify you have sufficient API credits
- Check rate limits

**Supabase Connection Issues**
- Verify your Supabase URL and keys
- Check if the database schema is properly initialized
- Ensure RLS policies allow the operations

**Build Errors**
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors with `npm run type-check`

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Claude API docs: https://docs.anthropic.com

## Roadmap

Future enhancements:
- [ ] PDF resume parsing with `pdf-parse`
- [ ] Email notifications for candidates
- [ ] Video interview recording and transcription
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Candidate self-service portal
- [ ] Integration with ATS systems
- [ ] Bulk candidate import

---

Built with ❤️ using Next.js and Claude AI
