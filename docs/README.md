# Documentation Index

Welcome to the AI-Powered Job Application System documentation.

## 📚 Documentation

### Getting Started

- [Main README](../README.md) - Project overview, setup, and quick start
- [Contributing Guidelines](../CONTRIBUTING.md) - How to contribute to the project
- [License](../LICENSE) - MIT License

### Technical Documentation

- **[API Documentation](./API.md)** - Complete API reference with examples
  - Question Generation API
  - Response Analysis API
  - Resume Parsing API
  - Interview Session API
  - Error handling and rate limiting

- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
  - Vercel deployment (recommended)
  - Alternative platforms (AWS, Railway, Render, Docker)
  - Database setup
  - Environment variables
  - Monitoring and maintenance

### GitHub Templates

- [Bug Report Template](../.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request Template](../.github/ISSUE_TEMPLATE/feature_request.md)
- [Pull Request Template](../.github/PULL_REQUEST_TEMPLATE.md)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   UI Pages   │  │  API Routes  │  │  Middleware  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────────┬──────────────┬──────────────────┬──────────────┘
            │              │                  │
            │              │                  │
    ┌───────▼───────┐  ┌──▼───────┐  ┌──────▼──────┐
    │   Supabase    │  │  Claude  │  │   Storage   │
    │   Database    │  │   API    │  │  (Resumes)  │
    └───────────────┘  └──────────┘  └─────────────┘
```

## 🤖 Claude AI Integration

The system uses Claude AI for:

1. **Question Generation** - Generate role-specific interview questions
2. **Resume Parsing** - Extract structured data from resumes
3. **Response Analysis** - Evaluate candidate answers with scoring
4. **Conversation Management** - Dynamic interview flow with follow-ups

See [API Documentation](./API.md) for detailed usage.

## 📊 Database Schema

Main tables:

- `jobs` - Job postings
- `applications` - Candidate applications
- `question_templates` - AI-generated questions per job
- `ai_responses` - Claude analysis of candidate answers
- `interview_sessions` - Conversational interview tracking
- `audit_logs` - AI interaction logging

See `supabase-schema.sql` for complete schema.

## 🔐 Security

- All sensitive data encrypted at rest
- Row Level Security (RLS) enabled on all tables
- API keys stored securely in environment variables
- Rate limiting on all endpoints
- Input validation and sanitization

## 📈 Monitoring

Key metrics to monitor:

- **Claude API**: Token usage, costs, error rates
- **Database**: Query performance, connection pool
- **API**: Response times, error rates
- **Storage**: File uploads, bandwidth

See [Deployment Guide](./DEPLOYMENT.md#monitoring--maintenance) for details.

## 🚀 Quick Links

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check
npm run type-check

# Lint
npm run lint
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in your credentials:
   - Supabase URL and keys
   - Anthropic API key
3. Run `npm run dev`

### Common Tasks

- **Generate Questions**: `POST /api/generate-questions`
- **Parse Resume**: `POST /api/parse-resume`
- **Analyze Response**: `POST /api/analyze-response`
- **Start Interview**: `POST /api/interview-session`

## 🤝 Contributing

We welcome contributions! Please read:

1. [Contributing Guidelines](../CONTRIBUTING.md)
2. [Code of Conduct](../CONTRIBUTING.md#code-of-conduct)
3. [Development Workflow](../CONTRIBUTING.md#development-workflow)

## 📝 Changelog

Track changes in commit history or create a `CHANGELOG.md` file.

## 🐛 Troubleshooting

Common issues and solutions:

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### API Errors

- Check environment variables are set correctly
- Verify API keys are valid
- Check Supabase connection
- Review error logs

See [Deployment Guide - Troubleshooting](./DEPLOYMENT.md#troubleshooting) for more.

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ai-job-application/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-job-application/discussions)
- **Email**: support@yourproject.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Last Updated**: 2025-01-15

For more information, visit the [main README](../README.md).
