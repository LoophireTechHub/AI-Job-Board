# Pull Request

## Description

Please provide a clear and concise description of your changes.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Test updates

## Related Issues

Fixes #(issue number)
Relates to #(issue number)

## Changes Made

List the specific changes made in this PR:

- Change 1
- Change 2
- Change 3

## Screenshots (if applicable)

Add screenshots to demonstrate UI changes or new features.

| Before | After |
|--------|-------|
| ![before](url) | ![after](url) |

## Testing

### Test Environment

- **OS**: [e.g., macOS 13]
- **Browser**: [e.g., Chrome 120]
- **Node Version**: [e.g., 18.17.0]

### Test Steps

1. Step 1
2. Step 2
3. Step 3

### Test Results

- [ ] All existing tests pass
- [ ] New tests added and passing
- [ ] Manual testing completed
- [ ] Tested on multiple browsers (if UI changes)
- [ ] Tested on mobile (if applicable)

## Code Quality Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Claude AI Changes (if applicable)

- [ ] Modified prompts in `lib/claude/prompts.ts`
- [ ] Updated Claude integration logic
- [ ] Tested with various inputs
- [ ] Considered token usage impact
- [ ] Updated cost estimates (if significant change)

## Database Changes (if applicable)

- [ ] Updated `supabase-schema.sql`
- [ ] Updated TypeScript types in `types/database.ts`
- [ ] Tested migrations
- [ ] Updated RLS policies
- [ ] Documented schema changes

## API Changes (if applicable)

- [ ] Updated API documentation
- [ ] Maintained backward compatibility OR documented breaking changes
- [ ] Updated request/response types in `types/api.ts`
- [ ] Added error handling
- [ ] Tested with various inputs

## Performance Impact

Describe any performance implications of your changes:

- [ ] No performance impact
- [ ] Improves performance
- [ ] May impact performance (explain below)

**Details**:

## Security Considerations

- [ ] No security implications
- [ ] Security improvements
- [ ] Requires security review

**Details**:

## Breaking Changes

List any breaking changes and migration steps:

- None

OR

- Breaking change 1: [description and migration steps]
- Breaking change 2: [description and migration steps]

## Dependencies

List any new dependencies added:

- [ ] No new dependencies
- [ ] New dependencies added (list below)

**New Dependencies**:
- `package-name@version` - reason for adding

## Deployment Notes

Any special deployment considerations:

- [ ] Requires environment variable updates
- [ ] Requires database migration
- [ ] Requires manual steps (document below)

**Manual Steps**:

## Additional Context

Add any other context about the PR here.

## Checklist for Reviewers

Reviewers should verify:

- [ ] Code follows project conventions
- [ ] Tests are adequate and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance is acceptable
- [ ] Error handling is robust

---

**Note to reviewers**: Please test the changes locally before approving.
