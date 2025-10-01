# API Documentation

Complete API reference for the AI-Powered Job Application System.

## Table of Contents

- [Authentication](#authentication)
- [Question Generation API](#question-generation-api)
- [Response Analysis API](#response-analysis-api)
- [Resume Parsing API](#resume-parsing-api)
- [Interview Session API](#interview-session-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints use Supabase authentication. Include the user's JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

For service-level operations, use the service role key (server-side only).

---

## Question Generation API

### Generate Interview Questions

Generate AI-powered interview questions for a job posting.

**Endpoint**: `POST /api/generate-questions`

**Query Parameters**:
- `jobId` (optional): UUID of the job to associate questions with

**Request Body**:

```json
{
  "jobTitle": "Senior Software Engineer",
  "industry": "Technology",
  "experienceLevel": "senior",
  "department": "Engineering",
  "jobDescription": "We are looking for an experienced software engineer...",
  "requirements": [
    "5+ years of experience",
    "React and TypeScript expertise",
    "Team leadership experience"
  ]
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "questions": [
    {
      "id": "q1",
      "text": "Tell me about a time when you had to lead a team through a challenging technical project.",
      "type": "behavioral",
      "lookingFor": [
        "Specific example with context",
        "Leadership approach",
        "Outcome and lessons learned"
      ],
      "followUp": "Can you elaborate on how you handled team conflicts during this project?",
      "scoringKeywords": [
        "leadership",
        "communication",
        "problem-solving",
        "team management",
        "technical expertise"
      ],
      "weight": 4
    }
  ],
  "questionTemplateId": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "tokensUsed": 1250,
    "latencyMs": 2340
  }
}
```

**Error Responses**:

```json
{
  "success": false,
  "error": "Missing required fields: jobTitle, industry, experienceLevel, department"
}
```

### Get Existing Questions

Retrieve existing question templates for a job.

**Endpoint**: `GET /api/generate-questions?jobId={jobId}`

**Response** (200 OK):

```json
{
  "success": true,
  "questions": [...],
  "questionTemplateId": "uuid",
  "version": 1
}
```

---

## Response Analysis API

### Analyze Candidate Response

Analyze a candidate's answer to an interview question using Claude AI.

**Endpoint**: `POST /api/analyze-response`

**Query Parameters**:
- `applicationId` (optional): UUID of the application to save analysis to

**Request Body**:

```json
{
  "questionId": "q1",
  "questionText": "Tell me about a time when...",
  "questionType": "behavioral",
  "candidateResponse": "In my previous role at TechCorp, I led a team of 5 engineers to migrate our monolithic application to microservices...",
  "lookingFor": [
    "Specific example",
    "Leadership approach",
    "Outcome"
  ],
  "scoringKeywords": [
    "leadership",
    "communication",
    "problem-solving"
  ],
  "questionWeight": 4
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "analysis": {
    "score": 4.2,
    "strengths": [
      "Provided specific example with clear context",
      "Demonstrated strong leadership skills",
      "Clearly articulated the outcome and impact"
    ],
    "concerns": [
      "Could have elaborated more on team dynamics",
      "Limited detail on technical challenges faced"
    ],
    "redFlags": [],
    "suggestedFollowUp": "How did you handle resistance from team members during the migration?",
    "keywordMatches": [
      "leadership",
      "communication",
      "problem-solving"
    ],
    "relevanceScore": 4.5,
    "depthScore": 4.0,
    "clarityScore": 4.3,
    "recommendation": "pass"
  },
  "metadata": {
    "tokensUsed": 890,
    "latencyMs": 1850
  }
}
```

**Recommendation Values**:
- `strong_pass`: Exceptional candidate, highly recommended
- `pass`: Good candidate, meets requirements
- `neutral`: Adequate, could go either way
- `concern`: Weak response, raises questions
- `reject`: Poor fit for the position

### Get Application Analysis

Retrieve all response analyses for an application.

**Endpoint**: `GET /api/analyze-response?applicationId={applicationId}`

**Response** (200 OK):

```json
{
  "success": true,
  "responses": [
    {
      "id": "uuid",
      "question_id": "q1",
      "question_text": "...",
      "candidate_response": "...",
      "ai_analysis": {...},
      "response_score": 4.2,
      "created_at": "2025-01-15T10:30:00Z"
    }
  ],
  "overallScore": 4.1,
  "overallAssessment": {
    "overallScore": 4.1,
    "summary": "Strong candidate with excellent technical skills...",
    "keyStrengths": [
      "Technical expertise",
      "Leadership experience",
      "Communication skills"
    ],
    "potentialConcerns": [
      "Limited experience with specific tools"
    ],
    "recommendation": "recommended"
  },
  "application": {
    "id": "uuid",
    "candidateName": "John Doe",
    "jobTitle": "Senior Software Engineer",
    "status": "interviewing"
  }
}
```

---

## Resume Parsing API

### Parse Resume

Extract structured information from a resume using Claude AI.

**Endpoint**: `POST /api/parse-resume`

**Query Parameters**:
- `applicationId` (optional): UUID of the application to save parsed data to

**Request Body**:

```json
{
  "resumeText": "JOHN DOE\njohn.doe@email.com\n...",
  "jobContext": {
    "title": "Software Engineer",
    "requirements": ["React", "Node.js", "5+ years experience"]
  }
}
```

Or use a stored resume:

```json
{
  "resumeUrl": "https://supabase.co/storage/v1/object/public/resumes/file.txt",
  "jobContext": {
    "title": "Software Engineer",
    "requirements": ["React", "Node.js"]
  }
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "personal_info": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1-555-0123",
      "location": "San Francisco, CA",
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe"
    },
    "summary": "Experienced software engineer with 7+ years...",
    "experience": [
      {
        "company": "TechCorp",
        "position": "Senior Software Engineer",
        "location": "San Francisco, CA",
        "start_date": "2020-01",
        "end_date": null,
        "is_current": true,
        "description": [
          "Led team of 5 engineers",
          "Built microservices architecture"
        ],
        "technologies": ["React", "Node.js", "AWS"],
        "achievements": [
          "Reduced API latency by 40%"
        ]
      }
    ],
    "education": [
      {
        "institution": "Stanford University",
        "degree": "Bachelor of Science",
        "field_of_study": "Computer Science",
        "graduation_date": "2015-06",
        "gpa": "3.8",
        "honors": ["Cum Laude"]
      }
    ],
    "skills": {
      "technical": ["React", "TypeScript", "Node.js", "AWS"],
      "soft": ["Leadership", "Communication", "Problem-solving"],
      "languages": ["English", "Spanish"],
      "certifications": ["AWS Certified Solutions Architect"]
    },
    "projects": [
      {
        "name": "E-commerce Platform",
        "description": "Built full-stack e-commerce solution",
        "technologies": ["React", "Node.js", "PostgreSQL"],
        "url": "https://example.com",
        "github_url": "https://github.com/johndoe/project"
      }
    ],
    "total_experience_years": 7
  },
  "matchScore": 85,
  "matchingSkills": ["React", "Node.js"],
  "missingSkills": ["GraphQL"],
  "jobFitAnalysis": {
    "fitScore": 85,
    "strengths": [
      "Strong React experience",
      "Relevant leadership experience",
      "Exceeds experience requirement"
    ],
    "gaps": [
      "Limited GraphQL experience"
    ],
    "recommendation": "strong_fit"
  },
  "metadata": {
    "tokensUsed": 2100,
    "latencyMs": 3200
  }
}
```

### Get Parsed Resume

Retrieve previously parsed resume data.

**Endpoint**: `GET /api/parse-resume?applicationId={applicationId}`

**Response** (200 OK):

```json
{
  "success": true,
  "data": {...},
  "resumeUrl": "https://...",
  "overallScore": 4.2,
  "aiSummary": {...}
}
```

---

## Interview Session API

### Start Interview Session

Start a new conversational interview session.

**Endpoint**: `POST /api/interview-session`

**Request Body**:

```json
{
  "applicationId": "550e8400-e29b-41d4-a716-446655440000",
  "sessionType": "screening"
}
```

**Session Types**:
- `screening`: Initial screening interview
- `technical`: Technical interview
- `behavioral`: Behavioral interview
- `final`: Final round interview

**Response** (200 OK):

```json
{
  "success": true,
  "sessionId": "uuid",
  "message": "Hi Sarah! Thanks for taking the time to interview with us today. I'll be asking you a few questions to learn more about your experience and qualifications. Let's start with: Tell me about a time when you had to lead a team through a challenging technical project.",
  "firstQuestion": {
    "id": "q1",
    "text": "Tell me about a time when...",
    "type": "behavioral"
  },
  "totalQuestions": 8,
  "progress": 0
}
```

### Submit Answer

Submit a candidate's answer and get the next question.

**Endpoint**: `PUT /api/interview-session`

**Request Body**:

```json
{
  "sessionId": "uuid",
  "questionId": "q1",
  "answer": "In my previous role at TechCorp..."
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "That's a great example. I'd love to hear more about how you handled the team dynamics. Moving on to our next question: How do you approach debugging complex technical issues?",
  "isFollowUp": false,
  "nextQuestion": {
    "id": "q2",
    "text": "How do you approach debugging...",
    "type": "technical"
  },
  "isComplete": false,
  "progress": 25,
  "questionsRemaining": 6
}
```

**When Interview Completes**:

```json
{
  "success": true,
  "message": "Thank you so much for your time today, Sarah. We'll review your responses and get back to you within a few days. Best of luck!",
  "isComplete": true,
  "progress": 100,
  "questionsRemaining": 0,
  "sessionSummary": {
    "totalScore": 4.3,
    "questionsAnswered": 8,
    "averageScore": 4.3
  }
}
```

### Get Session Details

Retrieve interview session information.

**Endpoint**: `GET /api/interview-session?sessionId={sessionId}`

**Response** (200 OK):

```json
{
  "success": true,
  "session": {
    "id": "uuid",
    "status": "completed",
    "sessionType": "screening",
    "conversationHistory": [
      {
        "role": "assistant",
        "content": "Hi Sarah! Thanks for...",
        "timestamp": "2025-01-15T10:00:00Z"
      },
      {
        "role": "user",
        "content": "In my previous role...",
        "timestamp": "2025-01-15T10:02:30Z"
      }
    ],
    "startedAt": "2025-01-15T10:00:00Z",
    "completedAt": "2025-01-15T10:45:00Z",
    "totalScore": 4.3,
    "candidate": {
      "name": "Sarah Johnson",
      "email": "sarah@example.com"
    },
    "job": {
      "title": "Senior Software Engineer"
    }
  }
}
```

---

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Detailed error message"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Common Error Messages

```json
{
  "success": false,
  "error": "Missing required fields: jobTitle, industry"
}
```

```json
{
  "success": false,
  "error": "Failed to generate questions"
}
```

```json
{
  "success": false,
  "error": "Application not found"
}
```

---

## Rate Limiting

To prevent abuse and manage Claude API costs:

- **Anonymous requests**: 10 requests per minute
- **Authenticated requests**: 60 requests per minute
- **Service role**: No limit (use with caution)

Rate limit headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642252800
```

When rate limit is exceeded:

```json
{
  "success": false,
  "error": "Rate limit exceeded. Try again in 30 seconds."
}
```

---

## Best Practices

### Caching

- Cache question templates per job (don't regenerate on every request)
- Cache parsed resumes for repeated access
- Cache analysis results

### Error Handling

- Always check `success` field in responses
- Implement retry logic with exponential backoff for 5xx errors
- Log errors with context for debugging

### Token Usage

- Monitor Claude API token usage via `metadata.tokensUsed`
- Use Haiku model for simple tasks (not implemented yet, but recommended)
- Set appropriate `max_tokens` limits

### Security

- Never expose service role key to clients
- Validate all user inputs
- Use RLS policies in Supabase
- Sanitize data before storage

---

## SDK / Client Libraries

TypeScript types are available in `types/api.ts`:

```typescript
import { GenerateQuestionsRequest, GenerateQuestionsResponse } from '@/types/api';

const response = await fetch('/api/generate-questions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(request)
});

const data: GenerateQuestionsResponse = await response.json();
```

---

## Support

For API issues:
- Check API status
- Review error messages
- Consult this documentation
- Open an issue on GitHub
