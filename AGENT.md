# AGENT.md — react-crash-guard

You are an expert React/TypeScript engineer building a production-grade, open-source repository
called `react-crash-guard`. This is a portfolio and reference project by Muhammad Zia,
a Senior Full Stack Engineer. The code must reflect real-world SaaS standards — not toy examples.

---

## Project Goal

Build a production-grade npm package + examples repo that demonstrates professional error boundary
patterns used in real SaaS applications. It must be publishable to npm, deployable as a demo, and
serve as a reference implementation for other engineers.

---

## Tech Stack

- **React 18+** with TypeScript (strict mode)
- **Vite** for the demo app
- **Vitest + React Testing Library** for tests
- **tsup** for bundling the npm package
- **Sentry SDK** (`@sentry/react`) for error reporting integration examples
- **React Router v6** for per-route boundary examples
- **Tailwind CSS** for the demo app UI only (not the core package)

---

## Repository Structure

See the full file/folder structure in the project root. Key areas:

- `packages/core` — npm package `react-crash-guard`
- `examples/` — standalone Vite apps (01-basic-boundary, 02-global-app-boundary, 03-sentry-integration)
- `demo/` — interactive demo app with error scenarios
- `docs/` — architecture and reference docs

---

## Package: react-crash-guard

Exports: GlobalErrorBoundary, RouteErrorBoundary, FeatureErrorBoundary, AsyncErrorBoundary,
useErrorHandler, useErrorRecovery, ErrorReporter interface, SentryReporter, ConsoleReporter,
errorClassifier, errorSerializer, and all related types.

---

## Code Quality Standards

- No `console.log` in production code (use reporter pattern)
- All components named exports (no default exports in core)
- Single Responsibility Principle
- TypeScript strict mode, no `any`
- Conventional commits: feat, fix, docs, test, chore
