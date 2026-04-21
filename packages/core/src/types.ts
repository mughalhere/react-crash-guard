import type { ReactNode } from "react";
import type { ErrorReporter } from "./reporters/types";

/**
 * Context passed to error reporters for debugging and analytics.
 * @public
 */
export interface ErrorContext {
  /** React component stack at time of error */
  componentStack?: string;
  /** Name of the boundary that caught the error (e.g. "GlobalErrorBoundary") */
  boundaryName?: string;
  /** Route path or name when error occurred (for RouteErrorBoundary) */
  routeName?: string;
  /** Optional user identifier for session context */
  userId?: string;
  /** Additional metadata */
  extra?: Record<string, unknown>;
}

/**
 * Props shape for a custom fallback component — destructure error and reset directly.
 * @public
 */
export interface ErrorFallbackProps {
  error: Error;
  reset: () => void;
}

/**
 * Fallback can be a static React node or a function that receives error and reset.
 * @public
 */
export type ErrorFallback =
  | ReactNode
  | ((error: Error, reset: () => void) => ReactNode);

/**
 * Props for GlobalErrorBoundary — wraps the entire application.
 * @public
 */
export interface GlobalErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback UI or (error, reset) => ReactNode */
  fallback?: ErrorFallback;
  /** Pluggable reporting (e.g. Sentry, custom) */
  reporter?: ErrorReporter;
  /** Called when an error is caught (in addition to reporter) */
  onError?: (error: Error, info: React.ErrorInfo) => void;
  /** When true, show a user-facing dialog/message on error */
  showDialog?: boolean;
}

/**
 * Props for RouteErrorBoundary — wraps individual React Router v6 routes.
 * @public
 */
export interface RouteErrorBoundaryProps {
  children: ReactNode;
  /** Used in error context/reporting for route identification */
  routeName: string;
  fallback?: ErrorFallback;
  reporter?: ErrorReporter;
  /** When true, error does not bubble to GlobalErrorBoundary */
  isolate?: boolean;
}

/**
 * Props for FeatureErrorBoundary — isolates individual features/widgets.
 * @public
 */
export interface FeatureErrorBoundaryProps {
  children: ReactNode;
  /** Identifier for the feature (for reporting/context) */
  featureName: string;
  fallback?: ReactNode;
  /** When true, suppress UI fallback and only report */
  silent?: boolean;
  reporter?: ErrorReporter;
}

/**
 * Result of error classification for smarter fallback UX.
 * @public
 */
export interface ClassifiedError {
  type: "render" | "network" | "chunk-load" | "permission" | "unknown";
  recoverable: boolean;
  userMessage: string;
  retryable: boolean;
}

/**
 * Ref handle for error boundaries that support imperative reset.
 * @public
 */
export interface ErrorBoundaryRef {
  reset: () => void;
}
