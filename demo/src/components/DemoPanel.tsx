// Layout primitives shared across the three demo acts.
//
//   <ActHeader>         — flat mono header strip: "act 01 · identify · color → name"
//   <SubChapterHeader>  — black bar with eyebrow + title + kicker, mono throughout
//   <DemoPanel>         — composed: SubChapterHeader above a bordered card
//
// Typography rule: Bauhaus Modern is reserved for the masthead wordmark at
// the top of the page. Every other header in the demo uses the same mono
// eyebrow-style typography (JetBrains Mono, tracked, uppercase). Keeps
// the type hierarchy flat so the content, not the chrome, carries weight.
//
// Content components own their own padding and background fill; DemoPanel
// only provides the chrome (header + bottom/side borders).

import type { ReactNode } from 'react';

interface ActHeaderProps {
  act: string;
  title: string;
  kicker: string;
}

export function ActHeader({ act, title, kicker }: ActHeaderProps) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 pb-2 flex-wrap"
      style={{ borderBottom: '3px solid var(--bh-ink)' }}
    >
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="bh-eyebrow">{act}</span>
        <span className="bh-eyebrow" style={{ opacity: 0.4 }}>
          ·
        </span>
        <span className="font-mono text-sm font-semibold uppercase tracking-[0.2em]">
          {title}
        </span>
      </div>
      <span className="bh-eyebrow">{kicker}</span>
    </div>
  );
}

interface SubChapterHeaderProps {
  eyebrow: string;
  title: string;
  kicker: string;
}

export function SubChapterHeader({ eyebrow, title, kicker }: SubChapterHeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 py-2 gap-3"
      style={{ backgroundColor: 'var(--bh-ink)', color: 'var(--bh-cream)' }}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
          {eyebrow}
        </span>
        <span className="font-mono text-xs tracking-[0.24em] uppercase font-semibold">
          {title}
        </span>
      </div>
      <span className="font-mono text-[10px] tracking-[0.24em] uppercase opacity-70">
        {kicker}
      </span>
    </header>
  );
}

interface DemoPanelProps {
  eyebrow: string;
  title: string;
  kicker: string;
  className?: string;
  children: ReactNode;
}

export function DemoPanel({ eyebrow, title, kicker, className = '', children }: DemoPanelProps) {
  return (
    <div className={className}>
      <SubChapterHeader eyebrow={eyebrow} title={title} kicker={kicker} />
      <div style={{ border: '1px solid var(--bh-ink)', borderTop: 0 }}>{children}</div>
    </div>
  );
}
