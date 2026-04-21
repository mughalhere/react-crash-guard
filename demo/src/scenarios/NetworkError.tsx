import { useState } from "react";
import {
  FeatureErrorBoundary,
  ErrorHandlerProvider,
  useErrorHandler,
} from "react-crash-guard";
import { useDemoReporter } from "../context/DemoReporterContext";
import { CodeBlock } from "../components/CodeBlock";

const CODE = `import {
  FeatureErrorBoundary,
  ErrorHandlerProvider,
  useErrorHandler,
} from 'react-crash-guard';

// react-crash-guard classifies errors by message/type.
// Errors matching network patterns get type: 'network'
// and a user-friendly message automatically.

function SubmitButton() {
  const throwError = useErrorHandler();

  async function submit() {
    try {
      await api.post('/data', payload);
    } catch (err) {
      // classifyError(err).type === 'network'
      throwError(new Error('Network request failed.'));
    }
  }

  return <button onClick={submit}>Submit</button>;
}

<FeatureErrorBoundary
  featureName="SubmitForm"
  fallback={
    <p>Network error — check your connection and try again.</p>
  }
>
  <ErrorHandlerProvider>
    <SubmitButton />
  </ErrorHandlerProvider>
</FeatureErrorBoundary>`;

function NetworkTrigger() {
  const throwError = useErrorHandler();

  const trigger = () => {
    throwError(new Error("Network request failed."));
  };

  return (
    <div>
      <button
        type="button"
        onClick={trigger}
        className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium"
      >
        Trigger Error
      </button>
      <p className="text-zinc-400 mt-2 text-sm">
        Simulates a network error — classified automatically as <code className="text-cyan-400">type: "network"</code>.
      </p>
    </div>
  );
}

export function NetworkError() {
  const [showCode, setShowCode] = useState(false);
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-zinc-200">Network Error</h3>
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
        >
          {showCode ? "Hide code" : "View code"}
        </button>
      </div>
      <p className="text-zinc-400 text-sm mb-3">
        Network failures are classified by error message. Check the Error Log to see
        the auto-detected <code className="text-cyan-400">type</code> and <code className="text-cyan-400">userMessage</code>.
      </p>
      <FeatureErrorBoundary
        featureName="NetworkErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Network error caught. Check your connection and try again.
          </div>
        }
      >
        <ErrorHandlerProvider>
          <NetworkTrigger />
        </ErrorHandlerProvider>
      </FeatureErrorBoundary>
      {showCode && <CodeBlock code={CODE} />}
    </div>
  );
}
