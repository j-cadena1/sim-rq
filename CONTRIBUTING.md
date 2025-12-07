# Contributing to Sim-Flow

Thanks for your interest in contributing to Sim-Flow! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR-USERNAME/sim-flow.git
   cd sim-flow
   ```

3. **Set up the development environment**:

   ```bash
   make dev
   ```

## Development Workflow

1. **Create a feature branch** from `dev`:

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Write clean, readable TypeScript code
   - Follow existing code style and patterns
   - Add comments where logic isn't self-evident
   - Keep functions focused and single-purpose

3. **Test your changes**:

   ```bash
   make test         # Run unit tests
   make test-e2e     # Run E2E tests
   ```

4. **Commit your changes** with clear commit messages:

   ```bash
   git add .
   git commit -m "feat: Add user profile picture support"
   ```

   Commit message format:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `refactor:` Code refactoring
   - `test:` Adding or updating tests
   - `chore:` Maintenance tasks

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** against the `dev` branch (NOT `master`)

## Pull Request Guidelines

- Fill out the PR template completely
- Ensure all tests pass (`make test && make test-e2e`)
- Keep PRs focused - one feature/fix per PR
- Update documentation if needed
- Add tests for new functionality
- Ensure your code follows existing patterns

## Code Standards

- **TypeScript**: Use strict typing, avoid `any` where possible
- **Error Handling**: Handle errors gracefully, don't let the app crash
- **Security**: Never commit secrets, sanitize user input, follow OWASP guidelines
- **Performance**: Consider performance implications of your changes
- **Accessibility**: Ensure UI changes are accessible

## Testing Requirements

- All new features must include tests
- Bug fixes should include regression tests
- E2E tests for user-facing features
- Maintain or improve code coverage

## Docker-First Development

- All changes must work in Docker containers
- Test with `make dev` and `make prod`
- Don't break the Docker build
- Update Dockerfiles if dependencies change

## Documentation

- Update README.md for user-facing changes
- Add inline comments for complex logic
- Keep documentation concise and accurate

## Need Help?

- Open an issue for discussion before starting major changes
- Ask questions in your PR if you're unsure
- Check existing issues and PRs for similar work

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
