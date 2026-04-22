// Page footer — the "colophon". A functional hint (shareable URL), a single
// succinct attribution line covering trademarks and typeface with a link to
// NOTICE.md, and the canonical Simiancraft credit.

export function Footer() {
  return (
    <footer className="mt-14 pt-6 bh-rule space-y-3 text-center">
      <div className="bh-eyebrow">colophon</div>
      <div className="font-mono text-xs opacity-70 max-w-xl mx-auto leading-relaxed">
        shareable url: this page's query string updates live as you scrub.
        copy and send.
      </div>
      <div className="font-mono text-[10px] tracking-wider opacity-60 max-w-xl mx-auto leading-relaxed">
        Pantone® and Crayola® are trademarks of their respective owners;
        Chromonym is not affiliated. Palette values are community
        approximations. Demo typeface{' '}
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
        <a href="https://simiancraft.com" rel="noopener" className="underline">
          Simiancraft
        </a>
        .
      </div>
    </footer>
  );
}
