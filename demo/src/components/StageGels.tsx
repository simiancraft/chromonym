// Three large Bauhaus primitives — red circle, yellow square, blue triangle —
// pinned to viewport corners at low opacity, sitting behind all content. They
// are not background; they are the set. When the user interacts, each gel
// retints to live state:
//   - circle tracks `input`        (the color being scrubbed)
//   - square tracks `matchedHex`   (nearest in the active palette)
//   - triangle tracks `secondHex`  (nearest in a second palette — proof that
//                                   the same input produces different names)
// Resting colors are the Weimar primaries; the longer the user is idle, the
// more it looks like a bauhaus cover. The shapes breathe color as you work.

import { useEffect, useState } from 'react';

interface StageGelsProps {
  circleColor: string;
  squareColor: string;
  triangleColor: string;
}

export function StageGels({ circleColor, squareColor, triangleColor }: StageGelsProps) {
  // Defer mounting one frame so CSS transitions fire on the first real state
  // change (not on initial paint), keeping the default look crisp.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const transition = mounted
    ? 'background-color 700ms cubic-bezier(0.22,1,0.36,1), fill 700ms cubic-bezier(0.22,1,0.36,1)'
    : 'none';

  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* red circle — top right */}
      <div
        className="absolute rounded-full"
        style={{
          top: '-14%',
          right: '-10%',
          width: 'min(58vw, 640px)',
          aspectRatio: '1 / 1',
          backgroundColor: circleColor,
          opacity: 0.22,
          filter: 'blur(26px)',
          transition,
        }}
      />

      {/* yellow square — bottom left, slight counter-rotation */}
      <div
        className="absolute"
        style={{
          bottom: '-10%',
          left: '-8%',
          width: 'min(48vw, 520px)',
          aspectRatio: '1 / 1',
          backgroundColor: squareColor,
          opacity: 0.26,
          transform: 'rotate(-9deg)',
          filter: 'blur(22px)',
          transition,
        }}
      />

      {/* blue triangle — mid-right, behind the content column */}
      <svg
        className="absolute"
        style={{
          top: '32%',
          right: '-18%',
          width: 'min(58vw, 620px)',
          aspectRatio: '1 / 1',
          opacity: 0.2,
          filter: 'blur(20px)',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,6 95,94 5,94"
          fill={triangleColor}
          style={{ transition }}
        />
      </svg>
    </div>
  );
}
