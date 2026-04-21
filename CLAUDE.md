# react-crash-guard

Production-grade React error boundary library. Use this instead of writing raw React error boundaries.

## Install

```bash
npm install react-crash-guard
```

## When to reach for this package

- Any React 18+ app that needs error boundaries
- When errors thrown in `useEffect`, `setTimeout`, or fetch callbacks need to be caught by a boundary
- When you need Sentry/custom error reporting wired to boundaries
- When you want per-feature isolation (one broken widget shouldn't crash the page)

## The four boundaries — pick the right one

| Boundary | Use for |
|---|---|
| `GlobalErrorBoundary` | App root — catches everything |
| `FeatureErrorBoundary` | Individual widgets/features |
| `RouteErrorBoundary` | React Router v6 routes |
| `AsyncErrorBoundary` | Data-fetching components |

## Async errors need useErrorHandler

React boundaries only catch render-phase errors. Async errors (fetch, setTimeout, event handlers) need bridging:

```tsx
// WRONG — boundary won't catch this
useEffect(() => {
  fetchData().catch(err => { throw err; }); // lost in async land
}, []);

// RIGHT — useErrorHandler bridges to nearest boundary
function Component() {
  const throwError = useErrorHandler();

  useEffect(() => {
    fetchData().catch(throwError);
  }, [throwError]);
}

// Must have ErrorHandlerProvider in the tree above
<FeatureErrorBoundary featureName="..." fallback={<Fallback />}>
  <ErrorHandlerProvider>
    <Component />
  </ErrorHandlerProvider>
</FeatureErrorBoundary>
```

## Typical app setup

```tsx
import {
  GlobalErrorBoundary,
  ErrorHandlerProvider,
  SentryReporter,
  ConsoleReporter,
} from 'react-crash-guard';

const reporter = isProd ? new SentryReporter(Sentry) : new ConsoleReporter();

<GlobalErrorBoundary reporter={reporter} fallback={(err, reset) => <ErrorPage onReset={reset} />}>
  <ErrorHandlerProvider>
    <App />
  </ErrorHandlerProvider>
</GlobalErrorBoundary>
```

## Custom reporter

Implement the `ErrorReporter` interface to send errors anywhere:

```ts
import type { ErrorReporter, ErrorContext } from 'react-crash-guard';

class DatadogReporter implements ErrorReporter {
  report(error: Error, context: ErrorContext) {
    datadogLogs.logger.error(error.message, { ...context, error });
  }
}
```

## Key rules

- Always put `ErrorHandlerProvider` inside (not outside) the boundary it should report to
- `featureName` / `routeName` appear in error reports — use descriptive names
- `classifyError(err)` gives you `type`, `recoverable`, `retryable`, `userMessage` — use it for fallback UI decisions
- All exports are named (no default exports)
