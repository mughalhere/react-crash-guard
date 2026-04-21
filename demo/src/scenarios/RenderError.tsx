import { useState } from "react";
import { FeatureErrorBoundary } from "react-crash-guard";
import { useDemoReporter } from "../context/DemoReporterContext";
import { CodeBlock } from "../components/CodeBlock";

const CODE = `import { FeatureErrorBoundary } from 'react-crash-guard';

// Wraps any feature that might throw during render.
// The boundary catches the error and shows the fallback
// without crashing the rest of the page.

<FeatureErrorBoundary
  featureName="UserProfile"
  fallback={
    <div className="error-card">
      Feature unavailable — please try again.
    </div>
  }
>
  <UserProfile userId={id} />
</FeatureErrorBoundary>`;

function ThrowsWhenTriggered({ trigger }: { trigger: boolean }) {
  if (trigger) throw new Error("Render error: intentional throw in component tree.");
  return <p className="text-zinc-400">Click the button to trigger a render error.</p>;
}

export function RenderError() {
  const [trigger, setTrigger] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const reporter = useDemoReporter();

  return (
    <div className="rounded border border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-zinc-200">Render Error</h3>
        <button
          type="button"
          onClick={() => setShowCode((s) => !s)}
          className="px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
        >
          {showCode ? "Hide code" : "View code"}
        </button>
      </div>
      <p className="text-zinc-400 text-sm mb-3">
        A component throws during render. <code className="text-cyan-400">FeatureErrorBoundary</code> catches
        it and isolates the failure — the rest of the page keeps working.
      </p>
      <FeatureErrorBoundary
        featureName="RenderErrorScenario"
        reporter={reporter ?? undefined}
        fallback={
          <div className="rounded bg-amber-900/30 border border-amber-600/50 p-3 text-amber-200 text-sm">
            Render error caught by boundary.
          </div>
        }
      >
        <div>
          <button
            type="button"
            onClick={() => setTrigger(true)}
            className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-black text-sm font-medium"
          >
            Trigger Error
          </button>
          <div className="mt-2">
            <ThrowsWhenTriggered trigger={trigger} />
          </div>
        </div>
      </FeatureErrorBoundary>
      {showCode && <CodeBlock code={CODE} />}
    </div>
  );
}
