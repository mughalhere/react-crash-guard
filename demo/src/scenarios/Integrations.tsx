import { useState } from "react";
import { CodeBlock } from "../components/CodeBlock";

const CLOUDWATCH_CODE = `import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { GlobalErrorBoundary, CloudWatchReporter } from "react-crash-guard";

const client = new CloudWatchLogsClient({ region: "us-east-1" });

const reporter = new CloudWatchReporter({
  logGroupName: "/myapp/errors",
  logStreamName: "production",
  putLogEvents: async (logGroupName, logStreamName, logEvents) => {
    await client.send(
      new PutLogEventsCommand({ logGroupName, logStreamName, logEvents })
    );
  },
  service: "my-frontend",    // included in every log entry
  environment: "production", // included in every log entry
});

<GlobalErrorBoundary
  reporter={reporter}
  fallback={(err, reset) => <ErrorPage onReset={reset} />}
>
  <App />
</GlobalErrorBoundary>`;

const CLOUDWATCH_LOG_SHAPE = `// Each crash produces one CloudWatch log event with this JSON shape:
{
  "level": "error",
  "timestamp": "2026-04-29T10:00:00.000Z",
  "message": "Cannot read properties of undefined",
  "errorName": "TypeError",
  "stack": "TypeError: Cannot read ...",
  "boundaryName": "GlobalErrorBoundary",
  "routeName": "/dashboard",
  "featureName": "UserProfile",     // present when FeatureErrorBoundary caught it
  "componentStack": "\\n  at UserProfile ...",
  "userId": "user_abc123",          // when context.userId is set
  "service": "my-frontend",
  "environment": "production"
  // ...any fields from context.extra are spread in here
}`;

const SENTRY_CODE = `import * as Sentry from "@sentry/react";
import { GlobalErrorBoundary, SentryReporter } from "react-crash-guard";

Sentry.init({ dsn: "https://..." });

const reporter = new SentryReporter({
  getCaptureException: () => Sentry.captureException,
  environment: "production",
});

<GlobalErrorBoundary
  reporter={reporter}
  fallback={(err, reset) => <ErrorPage onReset={reset} />}
>
  <App />
</GlobalErrorBoundary>`;

const CUSTOM_REPORTER_CODE = `import type { ErrorReporter, ErrorContext } from "react-crash-guard";

// Implement ErrorReporter to send crashes anywhere — Datadog, PagerDuty, a custom API, etc.
class DatadogReporter implements ErrorReporter {
  report(error: Error, context: ErrorContext): void {
    datadogLogs.logger.error(error.message, { ...context, error });
  }
}

// Multiple reporters — combine them
const reporter = {
  report(error: Error, context: ErrorContext) {
    sentryReporter.report(error, context);
    cloudwatchReporter.report(error, context);
  },
};`;

interface IntegrationCardProps {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  children: React.ReactNode;
}

function IntegrationCard({
  id,
  title,
  badge,
  badgeColor,
  description,
  children,
}: IntegrationCardProps) {
  return (
    <div id={id} className="rounded border border-zinc-700 p-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-semibold text-zinc-200">{title}</h3>
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${badgeColor}`}>{badge}</span>
      </div>
      <p className="text-zinc-400 text-sm mb-3">{description}</p>
      {children}
    </div>
  );
}

function ToggleCodeCard({
  label,
  code,
}: {
  label: string;
  code: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
      >
        {show ? `Hide ${label}` : `View ${label}`}
      </button>
      {show && <CodeBlock code={code} />}
    </div>
  );
}

export function Integrations() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-100 mb-1">Reporters</h2>
        <p className="text-zinc-400 text-sm">
          Every boundary accepts a <code className="text-cyan-400">reporter</code> prop. When an
          error is caught, the reporter receives the{" "}
          <code className="text-cyan-400">Error</code> and an{" "}
          <code className="text-cyan-400">ErrorContext</code> with boundary name, route, component
          stack, and any custom fields. Implement the{" "}
          <code className="text-cyan-400">ErrorReporter</code> interface to send crashes anywhere.
        </p>
      </div>

      {/* CloudWatch */}
      <IntegrationCard
        id="cloudwatch"
        title="AWS CloudWatch"
        badge="New in 1.0.6"
        badgeColor="bg-amber-900/50 text-amber-300 border border-amber-700/50"
        description={
          "CloudWatchReporter sends structured JSON log events to CloudWatch Logs on every crash. " +
          "Pass a putLogEvents callback that wraps PutLogEventsCommand — the library has no hard " +
          "dependency on the AWS SDK, so you control the client and credentials."
        }
      >
        <CodeBlock code={CLOUDWATCH_CODE} />
        <ToggleCodeCard label="log shape" code={CLOUDWATCH_LOG_SHAPE} />

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs">
          <div className="rounded bg-zinc-800/60 border border-zinc-700 p-3">
            <div className="text-zinc-300 font-medium mb-1">Options</div>
            <table className="w-full text-zinc-400">
              <tbody className="divide-y divide-zinc-700/50">
                {[
                  ["logGroupName", "string", "CloudWatch log group (e.g. /myapp/errors)"],
                  ["logStreamName", "string", "Log stream name (e.g. production, build ID)"],
                  ["putLogEvents", "function", "Wraps PutLogEventsCommand — you own the client"],
                  ["service?", "string", "Included in every log entry"],
                  ["environment?", "string", "Included in every log entry"],
                ].map(([name, type, desc]) => (
                  <tr key={name}>
                    <td className="py-1 pr-3 text-cyan-400 font-mono whitespace-nowrap">{name}</td>
                    <td className="py-1 pr-3 text-purple-300 font-mono whitespace-nowrap">{type}</td>
                    <td className="py-1 text-zinc-400">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </IntegrationCard>

      {/* Sentry */}
      <IntegrationCard
        id="sentry"
        title="Sentry"
        badge="v7+"
        badgeColor="bg-purple-900/50 text-purple-300 border border-purple-700/50"
        description={
          "SentryReporter calls captureException on every boundary-caught error, attaching " +
          "boundary name, route, feature, component stack, and extra context as Sentry extras. " +
          "Sentry is an optional peer dependency — the reporter no-ops gracefully when it is absent."
        }
      >
        <CodeBlock code={SENTRY_CODE} />
      </IntegrationCard>

      {/* Custom reporter */}
      <IntegrationCard
        id="custom-reporter"
        title="Custom reporter"
        badge="ErrorReporter interface"
        badgeColor="bg-zinc-700/80 text-zinc-300 border border-zinc-600"
        description={
          "Implement the ErrorReporter interface to send crashes to any backend — Datadog, " +
          "PagerDuty, a custom API, or a composite that fans out to multiple destinations."
        }
      >
        <CodeBlock code={CUSTOM_REPORTER_CODE} />
      </IntegrationCard>
    </div>
  );
}
