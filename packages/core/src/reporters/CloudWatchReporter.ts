import type { ErrorReporter } from "./types";
import type { ErrorContext } from "./types";

/** A single CloudWatch Logs event */
export interface CloudWatchLogEvent {
  /** Unix timestamp in milliseconds */
  timestamp: number;
  /** JSON-serialized log message */
  message: string;
}

/**
 * Function that sends log events to CloudWatch Logs.
 * Typically wraps CloudWatchLogsClient + PutLogEventsCommand from @aws-sdk/client-cloudwatch-logs.
 */
export type PutLogEventsFn = (
  logGroupName: string,
  logStreamName: string,
  events: CloudWatchLogEvent[]
) => Promise<void>;

export interface CloudWatchReporterOptions {
  /** CloudWatch Logs log group name (e.g., "/myapp/errors") */
  logGroupName: string;
  /** CloudWatch Logs log stream name (e.g., "production" or a build/deploy ID) */
  logStreamName: string;
  /**
   * Function that sends events to CloudWatch — avoids a hard dependency on @aws-sdk.
   * Wrap PutLogEventsCommand from @aws-sdk/client-cloudwatch-logs here.
   *
   * @example
   * ```ts
   * const client = new CloudWatchLogsClient({ region: "us-east-1" });
   * putLogEvents: async (logGroupName, logStreamName, logEvents) => {
   *   await client.send(new PutLogEventsCommand({ logGroupName, logStreamName, logEvents }));
   * }
   * ```
   */
  putLogEvents: PutLogEventsFn;
  /** Service name included in every log entry */
  service?: string;
  /** Environment label (e.g., "production", "staging") */
  environment?: string;
}

/**
 * Reporter that sends React error boundary crashes to AWS CloudWatch Logs.
 * Pass a `putLogEvents` wrapper around @aws-sdk/client-cloudwatch-logs — this reporter
 * has no hard dependency on the AWS SDK.
 *
 * @public
 */
export class CloudWatchReporter implements ErrorReporter {
  private readonly options: CloudWatchReporterOptions;

  constructor(options: CloudWatchReporterOptions) {
    this.options = options;
  }

  async report(error: Error, context: ErrorContext): Promise<void> {
    const { logGroupName, logStreamName, putLogEvents, service, environment } = this.options;

    const entry: Record<string, unknown> = {
      level: "error",
      timestamp: new Date().toISOString(),
      message: error.message,
      errorName: error.name,
      stack: error.stack,
    };

    if (context.boundaryName !== undefined) entry.boundaryName = context.boundaryName;
    if (context.routeName !== undefined) entry.routeName = context.routeName;
    if (context.featureName !== undefined) entry.featureName = context.featureName;
    if (context.componentStack !== undefined) entry.componentStack = context.componentStack;
    if (context.userId !== undefined) entry.userId = context.userId;
    if (service !== undefined) entry.service = service;
    if (environment !== undefined) entry.environment = environment;
    if (context.extra) Object.assign(entry, context.extra);

    try {
      await putLogEvents(logGroupName, logStreamName, [
        { timestamp: Date.now(), message: JSON.stringify(entry) },
      ]);
    } catch {
      // Avoid breaking the app if CloudWatch reporting fails
    }
  }
}
