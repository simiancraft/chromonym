// Layout primitives shared across the three demo acts.
//
//   <SubChapterHeader> — black bar with eyebrow + title + kicker, mono
//                         throughout. Used by every box in the demo.
//   <DemoPanel>         — composed: SubChapterHeader above a bordered card
//
// Typography rule: Bauhaus Modern is reserved for the masthead wordmark at
// the top of the page. Every box-header in the demo uses this single flat
// mono style — act, sub-chapter, all the same. Hierarchy comes from reading
// order, not from type weight.
//
// Content components own their own padding and background fill; DemoPanel
// only provides the chrome (header + bottom/side borders).

import type { ReactNode } from 'react';

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
