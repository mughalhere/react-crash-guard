import { useState } from "react";
import {
  FeatureErrorBoundary,
  ErrorHandlerProvider,
  useErrorHandler,
} from "react-crash-guard";
import { useDemoReporter } from "../context/DemoReporterContext";
import { CodeBlock } from "../components/CodeBlock";

const CODE = `import { GlobalErrorBoundary } from 'react-crash-guard';

// Chunk load errors happen when a lazy-loaded module fails to
// fetch (deploy, CDN issue, bad network). The right recovery is
// a full page reload — not a component reset — so the browser
// fetches the latest bundles.

<GlobalErrorBoundary
  fallback={(error, reset) => (
    <div className="error-screen">
      <h2>Failed to load a page module</h2>
      <p>A new version may have been deployed.</p>
      <button onClick={() => window.location.reload()}>
        Refresh page
      </button>
    </div>
  )}
>
  <App />
</GlobalErrorBoundary>

// Pair with lazy imports for full coverage:
const Dashboard = React.lazy(() => import('./Dashboard'));`;

function ChunkTrigger() {
  const throwError = useErrorHandler();

  const trigger = () => {
    throwError(new Error("Loading chunk 42 failed."));
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
        Simulates a chunk load failure — classified as <code className="text-cyan-400">type: "chunk-load"</code>.
      </p>
    </div>
  );
}

export function ChunkLoadError() {
  const [showCode, setShowCode] = useState(false);
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-zinc-200">Chunk Load Error</h3>
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
        >
          {showCode ? "Hide code" : "View code"}
        </button>
      </div>
      <p className="text-zinc-400 text-sm mb-3">
        Lazy-loaded chunks can fail after a new deploy. <code className="text-cyan-400">GlobalErrorBoundary</code> catches
        these at the app root and prompts a page reload to fetch fresh bundles.
      </p>
      <FeatureErrorBoundary
        featureName="ChunkLoadErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Chunk load error. Refresh the page to get the latest code.
          </div>
        }
      >
        <ErrorHandlerProvider>
          <ChunkTrigger />
        </ErrorHandlerProvider>
      </FeatureErrorBoundary>
      {showCode && <CodeBlock code={CODE} />}
    </div>
  );
}
