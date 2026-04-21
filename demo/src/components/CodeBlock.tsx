import { useState } from "react";

interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative mt-3 rounded-lg bg-zinc-950 border border-zinc-700 overflow-hidden">
      <button
        type="button"
        onClick={copy}
        className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <pre className="p-4 pr-16 overflow-x-auto text-xs leading-relaxed text-zinc-300 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}
