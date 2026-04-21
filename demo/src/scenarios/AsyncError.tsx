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

// useErrorHandler bridges async errors to the nearest boundary.
// Without it, errors thrown inside setTimeout/Promise would be
// unhandled — the boundary would never catch them.

function DataLoader() {
  const throwError = useErrorHandler();

  async function load() {
    try {
      const data = await fetchUserData();
      setData(data);
    } catch (err) {
      throwError(err as Error); // re-throws inside React's render cycle
    }
  }

  return <button onClick={load}>Load Data</button>;
}

<FeatureErrorBoundary featureName="DataLoader" fallback={<Fallback />}>
  <ErrorHandlerProvider>
    <DataLoader />
  </ErrorHandlerProvider>
</FeatureErrorBoundary>`;

function AsyncTrigger() {
  const throwError = useErrorHandler();

  const trigger = () => {
    setTimeout(() => {
      throwError(new Error("Async error: simulated failure after delay."));
    }, 100);
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
      <p className="text-zinc-400 mt-2 text-sm">Throws via useErrorHandler after a short delay.</p>
    </div>
  );
}

export function AsyncError() {
  const [showCode, setShowCode] = useState(false);
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-zinc-200">Async Error</h3>
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
        >
          {showCode ? "Hide code" : "View code"}
        </button>
      </div>
      <p className="text-zinc-400 text-sm mb-3">
        An error thrown inside a <code className="text-cyan-400">setTimeout</code> or <code className="text-cyan-400">Promise</code> escapes
        React's render cycle. <code className="text-cyan-400">useErrorHandler</code> bridges it back to the nearest boundary.
      </p>
      <FeatureErrorBoundary
        featureName="AsyncErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Async error caught (bridged to boundary via useErrorHandler).
          </div>
        }
      >
        <ErrorHandlerProvider>
          <AsyncTrigger />
        </ErrorHandlerProvider>
      </FeatureErrorBoundary>
      {showCode && <CodeBlock code={CODE} />}
    </div>
  );
}
