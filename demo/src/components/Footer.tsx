// Page footer — the "colophon". Three stacked credit lines: the shareable-
// URL reminder, the typeface attribution (Bauhaus Modern by Nils Kähler),
// and the Pantone trademark notice. Closes with a single canonical house
// credit pointing at simiancraft.com.

export function Footer() {
  return (
    <footer className="mt-14 pt-6 bh-rule space-y-3 text-center">
      <div className="bh-eyebrow">colophon</div>
      <div className="font-mono text-xs opacity-70 max-w-xl mx-auto leading-relaxed">
        shareable url — this page's query string updates live as you scrub.
        copy and send.
      </div>
      <div className="font-mono text-[10px] tracking-wider opacity-60 max-w-xl mx-auto leading-relaxed">
        Display type:{' '}
        <a
          href="https://www.dafont.com/bauhaus-modern.font"
          rel="noopener"
          className="underline"
        >
          Bauhaus Modern
        </a>{' '}
        by Nils Kähler. Used with attribution.
      </div>
      <div className="font-mono text-[10px] tracking-wider opacity-60 max-w-xl mx-auto leading-relaxed">
        Pantone® is a registered trademark of Pantone LLC. Chromonym is not
        affiliated with Pantone; values are community approximations. See{' '}
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
        <a href="https://simiancraft.com" rel="noopener" className="underline">
          Simiancraft
        </a>
        .
      </div>
    </footer>
  );
}
