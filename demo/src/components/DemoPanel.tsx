// Layout primitives shared across the three demo acts.
//
//   <ActHeader>         — large "act 01 · identify" heading with 3px rule
//   <SubChapterHeader>  — black bar with eyebrow + title + kicker, 10px mono
//   <DemoPanel>         — composed: SubChapterHeader above a bordered card
//
// Content components own their own padding and background fill; DemoPanel
// only provides the chrome (header + bottom/side borders). This way the
// hero's paper fill, the translator's paper fill, and KandinskyBYO's own
// chrome all compose cleanly without DemoPanel having to know about them.

import type { ReactNode } from 'react';

interface ActHeaderProps {
  act: string;
  title: string;
  kicker: string;
}

export function ActHeader({ act, title, kicker }: ActHeaderProps) {
  return (
    <div
      className="flex items-end justify-between gap-4 pb-3"
      style={{ borderBottom: '3px solid var(--bh-ink)' }}
    >
      <div className="flex items-baseline gap-3 md:gap-5 flex-wrap">
        <span className="bh-eyebrow">{act}</span>
        <h2
          className="lowercase bh-caps leading-none"
          style={{
            fontFamily: "'Bauhaus Modern', 'Unbounded', sans-serif",
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
          }}
        >
          {title}
        </h2>
      </div>
      <span className="bh-eyebrow text-right shrink-0">{kicker}</span>
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
      className="flex items-center justify-between px-5 py-3"
      style={{ backgroundColor: 'var(--bh-ink)', color: 'var(--bh-cream)' }}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
          {eyebrow}
        </span>
        <h3
          className="text-lg lowercase bh-caps"
          style={{ fontFamily: "'Bauhaus Modern', 'Unbounded', sans-serif" }}
        >
          {title}
        </h3>
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
