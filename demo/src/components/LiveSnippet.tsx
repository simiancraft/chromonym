// Reusable "live code snippet" block — dark <pre> with a reveal-on-hover
// copy button. Takes a display string (what the user sees, may include
// `// → [...]` result comments) and a copy string (what lands in the
// clipboard, typically just the runnable lines).

import { useState } from 'react';

interface LiveSnippetProps {
  displayText: string;
  copyText: string;
  ariaLabel?: string;
}

export function LiveSnippet({ displayText, copyText, ariaLabel }: LiveSnippetProps) {
  return (
    <div className="relative group">
      <pre
        aria-label={ariaLabel ?? 'live chromonym call'}
        className="bg-neutral-900 text-neutral-100 rounded-lg p-4 pr-16 overflow-x-auto text-xs md:text-sm font-mono leading-relaxed"
      >
        <code>{displayText}</code>
      </pre>
      <CopyButton text={copyText} />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
      className="absolute top-2 right-2 text-[10px] uppercase tracking-wide px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 transition"
    >
      {copied ? 'copied!' : 'copy'}
    </button>
  );
}
