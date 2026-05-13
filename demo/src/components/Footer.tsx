// Page footer — the "colophon". A functional hint (shareable URL), a
// version badge, project + author social links, the trademark + typeface
// attribution line with a pointer to NOTICE.md, and the canonical
// Simiancraft credit.

import { VERSION } from 'chromonym';
import { Coffee } from 'lucide-react';
import type { ReactNode } from 'react';
import SimianMark from './SimianMark.js';

export function Footer() {
  return (
    <footer className="mt-14 pt-6 bh-rule space-y-3 text-center">
      <div className="bh-eyebrow">colophon</div>
      <div className="font-mono text-xs opacity-70 max-w-xl mx-auto leading-relaxed">
        shareable url: this page's query string updates live as you scrub.
        copy and send.
      </div>

      <div
        className="font-mono text-[10px] tracking-wider opacity-70 pt-1"
        aria-label={`chromonym version ${VERSION}`}
      >
        v{VERSION}
      </div>

      <nav
        aria-label="project and author links"
        className="flex items-center justify-center gap-5 pt-1"
      >
        <FooterLink
          href="https://github.com/simiancraft/chromonym"
          label="chromonym on GitHub"
        >
          <GithubGlyph />
        </FooterLink>
        <FooterLink href="https://x.com/5imian" label="Jesse Harlin on X">
          <XGlyph />
        </FooterLink>
        <FooterLink href="https://ko-fi.com/the_simian0604" label="Tip on Ko-fi">
          <Coffee size={18} strokeWidth={1.6} aria-hidden />
        </FooterLink>
      </nav>

      <div className="font-mono text-[10px] tracking-wider opacity-60 max-w-xl mx-auto leading-relaxed pt-1">
        Pantone®, Crayola®, RAL® and Pokémon™ are trademarks of their
        respective owners; chromonym is not affiliated. Palette values are
        community approximations. Demo typeface{' '}
        <a
          href="https://www.dafont.com/bauhaus-modern.font"
          rel="noopener"
          className="underline"
        >
          Bauhaus Modern
        </a>{' '}
        © Nils Kähler. Full attributions:{' '}
        <a
          href="https://github.com/simiancraft/chromonym/blob/main/NOTICE.md"
          rel="noopener"
          className="underline"
        >
          NOTICE.md
        </a>
        .
      </div>

      <div className="font-mono text-[10px] tracking-wider opacity-80 pt-2">
        Crafted with care by{' '}
        <a
          href="https://simiancraft.com"
          rel="noopener"
          className="inline-flex items-center gap-1.5 align-middle underline"
        >
          <SimianMark width={14} height={14} aria-hidden />
          Simiancraft
        </a>
        .
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      target="_blank"
      rel="noopener noreferrer"
      className="opacity-70 transition-opacity hover:opacity-100"
      style={{ color: 'var(--bh-ink)' }}
    >
      {children}
    </a>
  );
}

// Brand glyphs rendered inline; lucide v1 dropped branded icons over
// trademark concerns, so GitHub and X both need their official paths.
function GithubGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <title>GitHub</title>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.13c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.44-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.17.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.48 3.16-1.17 3.16-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.35.78 1.05.78 2.12v3.14c0 .3.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <title>X</title>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
