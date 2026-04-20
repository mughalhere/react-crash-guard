import type { ReactNode } from "react";

interface LayoutProps {
  sidebar: ReactNode;
  main: ReactNode;
  errorLog: ReactNode;
}

export function Layout({ sidebar, main, errorLog }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex">
      <aside className="w-56 border-r border-zinc-700 flex-shrink-0">
        <div className="p-3 border-b border-zinc-700 font-semibold text-zinc-300">
          Scenarios
        </div>
        {sidebar}
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="border-b border-zinc-700 px-6 py-4">
          <h1 className="text-xl font-semibold">react-crash-guard</h1>
          <p className="text-sm text-zinc-500 mt-1">Trigger errors to see boundaries and recovery.</p>
        </header>
        {main}
      </main>
      <aside className="w-80 border-l border-zinc-700 flex-shrink-0 flex flex-col">
        <div className="p-3 border-b border-zinc-700 font-semibold text-zinc-300">
          Error Log
        </div>
        <div className="flex-1 overflow-hidden">{errorLog}</div>
      </aside>
    </div>
  );
}
