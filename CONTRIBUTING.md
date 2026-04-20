# Contributing to react-crash-guard

Thank you for your interest in contributing! This document explains how to get started.

## Code of Conduct

By participating, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).

## Ways to Contribute

- **Bug reports** — open a [bug report issue](https://github.com/mughalhere/react-crash-guard/issues/new?template=bug_report.yml)
- **Feature requests** — open a [feature request issue](https://github.com/mughalhere/react-crash-guard/issues/new?template=feature_request.yml)
- **Pull requests** — fix bugs, improve docs, or implement approved features

## Development Setup

**Requirements:** Node.js >=20, pnpm 9.x

```bash
git clone https://github.com/mughalhere/react-crash-guard.git
cd react-crash-guard
pnpm install
```

**Key commands:**

| Command | Description |
|---------|-------------|
| `pnpm test` | Run all tests with coverage |
| `pnpm typecheck` | TypeScript type-check |
| `pnpm build` | Build the core package |
| `pnpm dev:demo` | Start the interactive demo |

## Pull Request Guidelines

1. **Open an issue first** for non-trivial changes — avoid wasted effort.
2. **One PR per concern** — keep changes focused and reviewable.
3. **Tests required** — all new code needs test coverage. PRs that drop coverage won't be merged.
4. **TypeScript strict** — no `any`, no `// @ts-ignore`. Strict mode is enforced.
5. **Conventional commits** — use `feat:`, `fix:`, `docs:`, `test:`, `chore:` prefixes.
6. **No default exports** in `packages/core` — named exports only.

## Project Structure

```
packages/core/       # npm package: react-crash-guard
  src/
    boundaries/      # Error boundary components
    context/         # React context providers
    hooks/           # Custom hooks
    reporters/       # Error reporter implementations
    utils/           # Utility functions
demo/                # Interactive demo app (Vite + Tailwind)
examples/            # Standalone usage examples
docs/                # Architecture documentation
```

## Commit Message Format

```
feat(boundaries): add retry limit to AsyncErrorBoundary
fix(hooks): handle null ref in useErrorRecovery
docs: update SentryReporter usage example
test(utils): add edge cases for errorClassifier
```

## Release Process

Releases are handled by the maintainer. When a `v*.*.*` tag is pushed, GitHub Actions automatically publishes to npm and creates a GitHub Release.
