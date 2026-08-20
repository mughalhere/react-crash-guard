# react-crash-guard

> React error boundaries that catch async errors too — global, route, and feature-level isolation, error classification, and pluggable Sentry / CloudWatch reporting. TypeScript-first, zero runtime dependencies.

[![npm version](https://img.shields.io/npm/v/react-crash-guard)](https://www.npmjs.com/package/react-crash-guard)
[![CI](https://github.com/mughalhere/react-crash-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/mughalhere/react-crash-guard/actions)
[![Coverage](https://img.shields.io/badge/coverage-%3E80%25-brightgreen)](./packages/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](./packages/core/tsconfig.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**[Live Demo](https://mughalhere.github.io/react-crash-guard/)** · **[npm Package](https://www.npmjs.com/package/react-crash-guard)** · **[Documentation](#api-reference)** · **[GitHub](https://github.com/mughalhere/react-crash-guard)**

```bash
npm install react-crash-guard
```

```tsx
import { GlobalErrorBoundary, ErrorHandlerProvider, useErrorHandler } from 'react-crash-guard';

// One broken widget no longer takes down the page — and this catches
// the async errors that a plain React error boundary silently misses.
<GlobalErrorBoundary fallback={(error, reset) => <ErrorPage error={error} onRetry={reset} />}>
  <ErrorHandlerProvider>
    <App />
  </ErrorHandlerProvider>
</GlobalErrorBoundary>
```

---

## The Problem

React's default error behavior crashes your entire application on a single render failure. In production SaaS apps, this means one broken widget takes down the whole page — a terrible user experience.

Most teams either:
- Skip error boundaries entirely (hoping for the best)
- Add a single top-level boundary with a generic "Something went wrong" message
- Have no visibility into what errors actually occurred in production

This repository demonstrates how to architect error handling the right way: **layered, isolated, observable, and recoverable**.

---

## How it compares to `react-error-boundary`

[`react-error-boundary`](https://github.com/bvaughn/react-error-boundary) is an excellent minimal
primitive, and if all you need is one boundary component you should probably use it.
`react-crash-guard` is the opinionated, batteries-included option: it assumes you are running a
real production app that needs layered isolation and an error reporting pipeline.

| | `react-error-boundary` | `react-crash-guard` |
|---|---|---|
| Boundary components | One generic `ErrorBoundary` | Four presets: global, route, feature, async |
| Async error bridging | `useErrorBoundary().showBoundary` | `useErrorHandler()` |
| Reset / retry | `resetKeys`, `onReset` | `reset` callback, `useErrorRecovery()`, built-in retry cap |
| Error reporting | `onError` callback — bring your own | `ErrorReporter` interface, **Sentry and AWS CloudWatch included** |
| Error classification | — | `classifyError()` → `network` / `chunk-load` / `permission` / `render` |
| Reporting context | You assemble it yourself | `boundaryName`, `routeName`, `featureName` attached automatically |
| Runtime dependencies | None | None |

Both libraries can coexist — nothing here conflicts with an existing `react-error-boundary` setup.

---

## Architecture

### The Boundary Hierarchy

The core pattern is a three-layer boundary system. Each layer serves a distinct purpose and catches a different class of failure.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Root                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              GlobalErrorBoundary                          │  │
│  │         (catches everything that escapes below)           │  │
│  │                                                           │  │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐   │  │
│  │  │ RouteErrorBound │    │     RouteErrorBoundary      │   │  │
│  │  │    /dashboard   │    │         /settings           │   │  │
│  │  │                 │    │                             │   │  │
│  │  │ ┌─────────────┐ │    │  ┌──────────┐ ┌─────────┐   │   │  │
│  │  │ │FeatureBound │ │    │  │FeatureBnd│ │FeatBnd  │   │   │  │
│  │  │ │  <Chart />  │ │    │  │ <Form /> │ │<Table/> │   │   │  │
│  │  │ └─────────────┘ │    │  └──────────┘ └─────────┘   │   │  │
│  │  └─────────────────┘    └─────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Layer 1 — `GlobalErrorBoundary`**: The last line of defence. Catches anything that wasn't isolated below. Shows a full-page fallback with recovery options.

**Layer 2 — `RouteErrorBoundary`**: Per-route isolation. A crash in `/dashboard` doesn't affect `/settings`. The user can navigate away without a full reload.

**Layer 3 — `FeatureErrorBoundary`**: Finest-grained isolation. A broken chart or widget fails silently or shows an inline fallback — the rest of the page continues working.

---

### Error Flow & Reporting Pipeline

```
  React Component throws
          │
          ▼
  Nearest Error Boundary
  catches in componentDidCatch
          │
          ├──► errorClassifier(error)
          │         │
          │         └──► { type, recoverable, userMessage, retryable }
          │
          ├──► ErrorReporter.report(error, context)
          │         │
          │         ├──► SentryReporter  ──► Sentry.captureException()
          │         ├──► ConsoleReporter ──► console.error (dev)
          │         └──► CustomReporter  ──► your own pipeline
          │
          └──► Render fallback UI
                    │
                    └──► useErrorRecovery()
                              │
                              └──► retry() / reset() / maxRetries check
```

---

### Async Error Bridging

React error boundaries only catch **render-time** errors. This hook bridges async errors (fetch failures, setTimeout throws, promise rejections) into the nearest boundary:

```
  async function fetchData() {
    throw new Error('Network failure')    ← NOT caught by boundary natively
  }

  const throwError = useErrorHandler()   ← bridges async → boundary

  useEffect(() => {
    fetchData().catch(throwError)         ← NOW caught by nearest boundary
  }, [])
```

```
  Component           useErrorHandler        ErrorBoundary
      │                     │                     │
      │──── throwError ─────►                     │
      │     (async err)      │                     │
      │                      │──── setState ──────►│
      │                      │     triggers        │
      │                      │     re-render       │
      │                      │     with error ────►│ componentDidCatch
      │                      │                     │ → report → fallback
```

---

## Installation

```bash
npm install react-crash-guard
# or
yarn add react-crash-guard
# or
pnpm add react-crash-guard
```

**Peer dependencies:** React 18+ is required. If you use `SentryReporter`, also install `@sentry/react >=7`:

```bash
npm install @sentry/react
```

---

## Quick Start

### 1. Wrap your app with `GlobalErrorBoundary`

```tsx
// src/main.tsx
import { GlobalErrorBoundary, SentryReporter } from 'react-crash-guard';

const reporter = new SentryReporter({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});

root.render(
  <GlobalErrorBoundary
    reporter={reporter}
    fallback={(error, reset) => (
      <CrashPage error={error} onReset={reset} />
    )}
  >
    <App />
  </GlobalErrorBoundary>
);
```

### 2. Isolate routes with `RouteErrorBoundary`

```tsx
// src/router.tsx
import { RouteErrorBoundary } from 'react-crash-guard';

function AppRouter() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <RouteErrorBoundary routeName="dashboard" reporter={reporter}>
            <DashboardPage />
          </RouteErrorBoundary>
        }
      />
      <Route
        path="/settings"
        element={
          <RouteErrorBoundary routeName="settings" reporter={reporter}>
            <SettingsPage />
          </RouteErrorBoundary>
        }
      />
    </Routes>
  );
}
```

### 3. Isolate risky features with `FeatureErrorBoundary`

```tsx
// Wrap any component that might fail independently
import { FeatureErrorBoundary } from 'react-crash-guard';

function Dashboard() {
  return (
    <div>
      <FeatureErrorBoundary featureName="revenue-chart" reporter={reporter}>
        <RevenueChart />           {/* crash here stays contained */}
      </FeatureErrorBoundary>

      <FeatureErrorBoundary featureName="activity-feed" silent>
        <ActivityFeed />           {/* silent mode — no UI fallback shown */}
      </FeatureErrorBoundary>
    </div>
  );
}
```

### 4. Handle async errors with `useErrorHandler`

```tsx
import { useErrorHandler } from 'react-crash-guard';

function CampaignList() {
  const throwError = useErrorHandler();

  useEffect(() => {
    fetchCampaigns()
      .then(setCampaigns)
      .catch(throwError); // bridges into nearest boundary
  }, []);

  return <>{/* render campaigns */}</>;
}
```

### 5. Build recovery UI with `useErrorRecovery`

```tsx
import { useErrorRecovery } from 'react-crash-guard';

function ErrorFallback({ error }: { error: Error }) {
  const { retry, retryCount, isRecovering } = useErrorRecovery({
    maxRetries: 3,
    retryDelay: 1000,
  });

  return (
    <div>
      <p>{error.message}</p>
      <p>Retry attempt: {retryCount} / 3</p>
      <button onClick={retry} disabled={isRecovering}>
        {isRecovering ? 'Retrying...' : 'Try again'}
      </button>
    </div>
  );
}
```

---

## Error Classification

The `errorClassifier` utility inspects errors and returns structured metadata for smarter fallback decisions:

```ts
import { classifyError } from 'react-crash-guard';

const result = classifyError(error);
// {
//   type: 'network' | 'chunk-load' | 'render' | 'permission' | 'unknown'
//   recoverable: true,
//   retryable: true,
//   userMessage: 'Connection issue. Please check your network and try again.'
// }
```

| Error Type    | Recoverable | Retryable | Example                                   |
|---------------|-------------|-----------|-------------------------------------------|
| `network`     | ✅          | ✅        | fetch() timeout, DNS failure              |
| `chunk-load`  | ✅          | ✅        | Lazy-loaded route fails after deploy      |
| `permission`  | ❌          | ❌        | Unauthorized access to resource           |
| `render`      | ✅          | ✅        | Component throws during render            |
| `unknown`     | ❌          | ❌        | Unclassified / unexpected error           |

---

## Error Reporters

Reporters are pluggable. Implement the `ErrorReporter` interface to integrate any observability tool:

```ts
interface ErrorReporter {
  report(error: Error, context: ErrorContext): void | Promise<void>;
}

interface ErrorContext {
  componentStack?: string;
  boundaryName?: string;
  routeName?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}
```

### Built-in: `SentryReporter`

```ts
import { SentryReporter } from 'react-crash-guard';

const reporter = new SentryReporter({
  dsn: 'https://your-dsn@sentry.io/project',
  environment: 'production',
});
```

### Built-in: `ConsoleReporter`

```ts
import { ConsoleReporter } from 'react-crash-guard';

// Useful for development and testing
const reporter = new ConsoleReporter();
```

### Custom Reporter Example

```ts
// Send errors to your own API
class DatadogReporter implements ErrorReporter {
  report(error: Error, context: ErrorContext) {
    datadogLogs.logger.error(error.message, { error, ...context });
  }
}
```

---

## API Reference

### `GlobalErrorBoundary`

| Prop          | Type                                              | Default     | Description                                      |
|---------------|---------------------------------------------------|-------------|--------------------------------------------------|
| `children`    | `ReactNode`                                       | required    | Application tree to wrap                         |
| `fallback`    | `ReactNode \| (error, reset) => ReactNode`        | built-in UI | Custom fallback UI                               |
| `reporter`    | `ErrorReporter`                                   | none        | Pluggable error reporter                         |
| `onError`     | `(error: Error, info: ErrorInfo) => void`         | none        | Additional error callback                        |
| `showDialog`  | `boolean`                                         | `false`     | Wraps the fallback UI in a `<div data-error-boundary-dialog>` container |

Two types are exported to cover both use cases:

**`ErrorFallbackProps`** — props shape for a custom fallback component:

```tsx
import type { ErrorFallbackProps } from 'react-crash-guard';

const CrashPage = ({ error, reset }: ErrorFallbackProps) => (
  <div>
    <p>{error.message}</p>
    <button onClick={reset}>Try again</button>
  </div>
);

<GlobalErrorBoundary fallback={(error, reset) => <CrashPage error={error} reset={reset} />}>
  <App />
</GlobalErrorBoundary>
```

**`ErrorFallback`** — type of the `fallback` prop itself, for wrapper components that forward it:

```tsx
import type { ErrorFallback } from 'react-crash-guard';

interface WidgetProps {
  fallback: ErrorFallback; // ReactNode | ((error, reset) => ReactNode)
}
```

When `showDialog={true}`, the fallback content is wrapped in a `<div data-error-boundary-dialog>` instead of rendered bare. This does **not** apply built-in modal styles — it gives you a stable hook to style the fallback as an overlay dialog via CSS, and a reliable selector for E2E tests:

```tsx
<GlobalErrorBoundary showDialog fallback={<CrashPage />}>
  <App />
</GlobalErrorBoundary>
```

```css
/* position the fallback as a centered modal */
[data-error-boundary-dialog] {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
```

```ts
// stable selector in Playwright / Testing Library
await page.locator('[data-error-boundary-dialog]').waitFor();
```

Omit `showDialog` if you want the fallback to replace the broken subtree inline (the default behaviour).

### `RouteErrorBoundary`

| Prop          | Type                                              | Default     | Description                                      |
|---------------|---------------------------------------------------|-------------|--------------------------------------------------|
| `routeName`   | `string`                                          | required    | Route identifier (used in error context)         |
| `isolate`     | `boolean`                                         | `false`     | Prevent error from bubbling to global boundary   |
| + all GlobalErrorBoundary props                                                                              |

### `FeatureErrorBoundary`

| Prop          | Type                                              | Default     | Description                                      |
|---------------|---------------------------------------------------|-------------|--------------------------------------------------|
| `featureName` | `string`                                          | required    | Feature identifier (used in error context)       |
| `silent`      | `boolean`                                         | `false`     | Suppress UI fallback, report only                |
| + all GlobalErrorBoundary props                                                                              |

### `useErrorHandler()`

Returns `(error: Error) => void`. Call the returned function from async code to bridge errors into the nearest boundary.

### `useErrorRecovery(options?)`

| Option        | Type     | Default | Description                     |
|---------------|----------|---------|---------------------------------|
| `maxRetries`  | `number` | `3`     | Maximum retry attempts          |
| `retryDelay`  | `number` | `1000`  | Delay between retries (ms)      |

Returns `{ retry, retryCount, isRecovering }`.

---

## Examples

Each example is a standalone Vite app.

```bash
# Clone the repo
git clone https://github.com/mughalhere/react-crash-guard.git
cd react-crash-guard
pnpm install

# Run a specific example
cd examples/01-basic-boundary && pnpm dev
cd examples/02-global-app-boundary && pnpm dev
cd examples/03-sentry-integration && pnpm dev
cd examples/04-cloudwatch-integration && pnpm dev

# Run the full interactive demo
cd demo && pnpm dev
```

| Example | What it demonstrates |
|---|---|
| [`01-basic-boundary`](./examples/01-basic-boundary) | Single component isolation, custom fallback, reset |
| [`02-global-app-boundary`](./examples/02-global-app-boundary) | Three-layer hierarchy, route isolation, error propagation |
| [`03-sentry-integration`](./examples/03-sentry-integration) | SentryReporter, async error bridging, production setup |
| [`04-cloudwatch-integration`](./examples/04-cloudwatch-integration) | CloudWatchReporter, structured JSON log events, AWS setup |

---

## FAQ

### Do React error boundaries catch async errors?

No. React error boundaries only catch errors thrown during the **render phase**, in lifecycle
methods, and in constructors. Anything thrown from a `useEffect` callback, a `setTimeout`, an event
handler, or an unhandled promise rejection escapes the boundary completely — React never sees it.

The fix is to move the error into render. `useErrorHandler()` stores the error in state and rethrows
it during the next render, so the nearest boundary catches it normally:

```tsx
const throwError = useErrorHandler();

useEffect(() => {
  fetchDashboard().catch(throwError); // now the boundary catches it
}, [throwError]);
```

`ErrorHandlerProvider` must be mounted **inside** the boundary that should receive the error.

### How do I reset a React error boundary?

Use the `reset` callback handed to a function fallback:

```tsx
<GlobalErrorBoundary fallback={(error, reset) => <button onClick={reset}>Try again</button>}>
```

Inside a fallback you can also call `useErrorRecovery()`, which adds `retryCount`, `isRecovering`,
and an optional `retryDelay`. `GlobalErrorBoundary` and `RouteErrorBoundary` cap retries so a
component that throws on every render cannot spin in an infinite reset loop.

### Can an error boundary be a hook or a function component?

Not the boundary itself. React exposes `getDerivedStateFromError` and `componentDidCatch` only on
class components, and there is still no hook equivalent. `react-crash-guard` keeps one internal
class component and wraps it in function components and hooks, so your application code never
writes a class.

### Does this work with React Router?

Yes. Wrap each route element in `RouteErrorBoundary` and pass `routeName` — the name is attached to
every error report, so you can see which route is failing in Sentry or CloudWatch.

```tsx
<Route path="/dashboard" element={
  <RouteErrorBoundary routeName="dashboard"><Dashboard /></RouteErrorBoundary>
} />
```

### Does it work with Next.js or server components?

The boundaries are client components — add `'use client'` to the file that renders them. They work
in the Next.js App Router and Pages Router for anything client-rendered. Errors thrown on the server
during RSC rendering are handled by Next's own `error.tsx` convention, not by a client boundary.

### How do I report errors somewhere other than Sentry or CloudWatch?

Implement the `ErrorReporter` interface — it is a single method:

```ts
import type { ErrorReporter, ErrorContext } from 'react-crash-guard';

class DatadogReporter implements ErrorReporter {
  report(error: Error, context: ErrorContext) {
    datadogLogs.logger.error(error.message, { ...context, error });
  }
}
```

Reporter failures are swallowed by the boundary, so a broken reporting pipeline can never take down
the app it is monitoring.

### What is the bundle size?

The package ships ESM and CJS builds, is marked `sideEffects: false`, and has **zero runtime
dependencies** — React is a peer dependency. Sentry and the AWS SDK are optional peers that are
never imported by the core; you inject them, so unused reporters tree-shake away.

---

## Contributing

Contributions are welcome. Please open an issue before submitting a PR for significant changes.

```bash
pnpm test          # run tests
pnpm typecheck     # tsc --noEmit
pnpm build         # build core package
```

---

## License

MIT © [Muhammad Zia](https://mozia.dev)