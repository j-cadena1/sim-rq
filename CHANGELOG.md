# Changelog

All notable changes to Sim-Flow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-06

### Added

- Role-based access control (Admin, Manager, Engineer, End-User)
- Complete request lifecycle management with enforced workflow stages
- Database CHECK constraints preventing invalid lifecycle states
- Automatic lifecycle transitions via PostgreSQL triggers
- Project hour tracking and budget allocation
- Microsoft Entra ID (Azure AD) SSO with PKCE authentication
- Session-based authentication with HTTP-only cookies
- Real-time analytics dashboard with charts and metrics
- Comprehensive E2E test suite (86 tests)
- Request status tracking and notifications
- User management with soft delete and historical data preservation
- Audit logging for sensitive operations
- Rate limiting on authentication endpoints
- Dark/light mode theme support
- Responsive design for mobile, tablet, and desktop
- Docker-first deployment strategy
- Makefile for simplified operations
- Database migrations system
- Health check endpoints
- Prometheus metrics endpoint
- Swagger API documentation at `/api-docs`
- Comprehensive security features (Helmet.js, DOMPurify, bcrypt)

### Security

- Session-based authentication (no JWT tokens)
- Rate limiting (30 login attempts per 15 minutes in production)
- Input sanitization with DOMPurify
- Bcrypt password hashing
- Database connection pooling with prepared statements
- CORS protection
- Security headers via Helmet.js
- SSO credentials encrypted at rest

### Documentation

- Comprehensive README with quick start guide
- CONTRIBUTING.md with development workflow
- SECURITY.md with vulnerability reporting process
- GitHub issue and PR templates
- Complete inline code documentation
- Environment variable configuration guide

### Testing

- 86 E2E tests covering all major features
- Authentication and authorization tests
- Lifecycle enforcement verification tests
- Role-based access control tests
- Form validation and sanitization tests
- Analytics dashboard tests
- Navigation and UI tests

[1.0.0]: https://github.com/j-cadena1/sim-flow/releases/tag/v1.0.0
