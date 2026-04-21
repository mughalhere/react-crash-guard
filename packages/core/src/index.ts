/**
 * react-crash-guard
 * Production-grade React error boundary patterns for SaaS applications.
 */

export { GlobalErrorBoundary } from "./boundaries/GlobalErrorBoundary";
export { RouteErrorBoundary } from "./boundaries/RouteErrorBoundary";
export { FeatureErrorBoundary } from "./boundaries/FeatureErrorBoundary";
export { AsyncErrorBoundary } from "./boundaries/AsyncErrorBoundary";

export { useErrorHandler } from "./hooks/useErrorHandler";
export { useErrorRecovery } from "./hooks/useErrorRecovery";
export type { UseErrorRecoveryOptions } from "./hooks/useErrorRecovery";

export { ErrorHandlerProvider } from "./context/ErrorHandlerContext";

export { ConsoleReporter } from "./reporters/ConsoleReporter";
export { SentryReporter } from "./reporters/SentryReporter";
export type { ErrorReporter } from "./reporters/types";
export type { SentryReporterOptions } from "./reporters/SentryReporter";

export { classifyError } from "./utils/errorClassifier";
export { serializeError } from "./utils/errorSerializer";

export type {
  ErrorContext,
  ErrorFallbackProps,
  ErrorFallback,
  GlobalErrorBoundaryProps,
  RouteErrorBoundaryProps,
  FeatureErrorBoundaryProps,
  ClassifiedError,
  ErrorBoundaryRef,
} from "./types";
