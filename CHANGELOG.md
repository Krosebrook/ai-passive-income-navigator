# Changelog

All notable changes to the AI Passive Income Navigator project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project documentation structure
- Comprehensive README with setup instructions
- Product audit and roadmap documentation
- Technical recommendations guide
- Security recommendations documentation
- Implementation guide for quick start
- CI/CD pipeline with GitHub Actions

### Changed
- N/A

### Deprecated
- N/A

### Removed
- N/A

### Fixed
- N/A

### Security
- Authentication currently disabled (requiresAuth: false) - MUST be enabled before production
- 11 npm security vulnerabilities identified - requires `npm audit fix`

## [0.0.0] - 2026-01-14

### Added
- Initial prototype release
- Idea Discovery feature - Browse 30+ curated passive income opportunities
- Portfolio Management - Track and manage income ideas
- Bookmarks System - Save favorite ideas
- Dashboard - Analytics and performance tracking
- Market Trends - AI-powered trend analysis
- AI Guide Chat - Interactive AI assistant
- Community Features - Social sharing and discussions
- Onboarding Flow - Multi-step preference collection
- Profile Settings - User configuration
- Responsive Design - Mobile-first UI with Tailwind CSS
- Modern tech stack: React 18, Vite, Tailwind CSS, Base44 Platform
- UI Components: Radix UI, Shadcn/ui
- State Management: React Query (TanStack Query)
- Animations: Framer Motion
- Charts: Recharts
- Forms: React Hook Form + Zod validation

### Known Issues
- Zero test coverage
- No input validation in forms
- Missing legal pages (Privacy Policy, Terms of Service)
- No monitoring or error tracking
- Authentication disabled by default
- Multiple security vulnerabilities in dependencies

---

## Version History

- **0.0.0** (2026-01-14): Initial prototype release

---

## Upgrade Guide

### From 0.0.0 to Next Version

When upgrading, please note:
1. Enable authentication in `src/api/base44Client.js`
2. Run `npm audit fix` to resolve security vulnerabilities
3. Review and update environment variables from `.env.example`
4. Run database migrations if applicable
5. Clear browser cache and local storage

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## Release Process

1. Update version in `package.json`
2. Update this CHANGELOG.md with changes
3. Create a git tag: `git tag -a v0.1.0 -m "Release v0.1.0"`
4. Push tags: `git push --tags`
5. Create GitHub release with release notes
6. Deploy to production following [DEPLOYMENT.md](./docs/DEPLOYMENT.md)
