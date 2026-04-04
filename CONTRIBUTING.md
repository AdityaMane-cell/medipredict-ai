# Contributing to Health AI

## Pull Request Guidelines

1. **Branch naming**: `feature/xyz` or `bugfix/xyz`
2. **Commit messages**: Clear, semantic (feat:, fix:, docs:, test:)
3. **Tests**: Always include tests for new features
4. **Linting**: Run `flake8` before pushing
5. **Type hints**: Use Python type annotations

## Testing

```bash
# Run unit tests
pytest -xvs

# Check coverage
pytest --cov=api tests/

# Type-check
mypy api/ --ignore-missing-imports
```

## Code Style

- Python: PEP 8 + Black (optional)
- JavaScript/React: ESLint + Prettier
- Docstrings: Google-style for functions

## Issues & Bugs

- File with `[BUG]` prefix + reproduction steps
- For security issues, email maintainer (do not open public issue)
