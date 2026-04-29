import { useState } from "react";
import {
  GlobalErrorBoundary,
  CloudWatchReporter,
  ErrorHandlerProvider,
  useErrorHandler,
} from "react-crash-guard";
import {
  CloudWatchLogsClient,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";

const logGroupName = import.meta.env.VITE_CW_LOG_GROUP as string | undefined;
const logStreamName = import.meta.env.VITE_CW_LOG_STREAM as string | undefined;
const region = (import.meta.env.VITE_AWS_REGION as string | undefined) ?? "us-east-1";

const reporter =
  logGroupName && logStreamName
    ? new CloudWatchReporter({
        logGroupName,
        logStreamName,
        putLogEvents: async (lgName, lsName, logEvents) => {
          const client = new CloudWatchLogsClient({ region });
          await client.send(
            new PutLogEventsCommand({
              logGroupName: lgName,
              logStreamName: lsName,
              logEvents,
            })
          );
        },
        service: "example-app",
        environment: "demo",
      })
    : undefined;

function TriggerPanel() {
  const throwError = useErrorHandler();
  const [renderError, setRenderError] = useState(false);

  if (renderError) throw new Error("Intentional render error for CloudWatch demo.");

  const triggerAsync = () => {
    setTimeout(() => {
      throwError(new Error("Async error (useErrorHandler) for CloudWatch demo."));
    }, 100);
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button type="button" onClick={() => setRenderError(true)}>
        Trigger render error
      </button>
      <button type="button" onClick={triggerAsync}>
        Trigger async error
      </button>
    </div>
  );
}

function App() {
  return (
    <GlobalErrorBoundary
      reporter={reporter}
      fallback={(error, reset) => (
        <div style={{ padding: "2rem", border: "1px solid #c00" }}>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <p>
            {reporter
              ? "Error was reported to CloudWatch Logs."
              : "No CloudWatch config — set VITE_CW_LOG_GROUP, VITE_CW_LOG_STREAM, and VITE_AWS_REGION."}
          </p>
          <button type="button" onClick={reset}>
            Retry
          </button>
        </div>
      )}
    >
      <ErrorHandlerProvider>
        <h1>Example 04 — CloudWatch Integration</h1>
        <p>
          {reporter
            ? `Reporting to: ${logGroupName} / ${logStreamName}`
            : "Running without reporter — errors shown in UI only."}
        </p>
        <TriggerPanel />
      </ErrorHandlerProvider>
    </GlobalErrorBoundary>
  );
}

export { App };
