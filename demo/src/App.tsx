// Composition root. All state lives in useDemoState; every panel below is a
// presentational component that receives just what it needs. The page reads
// top-down as the user will: masthead → live RGB channel strip → act 01
// (identify, with color-picker + eyedropper both feeding the same input)
// → act 02 (resolve) → act 03 (convert) → footer.
//
// Every content box uses the same header treatment — the SubChapterHeader
// black bar. There is no separate large "act" header; the act identifier
// lives in the eyebrow slot of each box's header.

import { ConvergenceStrip } from './components/ConvergenceStrip.js';
import { ConversionsScope } from './components/ConversionsScope.js';
import { CrossPaletteTranslator } from './components/CrossPaletteTranslator.js';
import { DemoPanel } from './components/DemoPanel.js';
import { Footer } from './components/Footer.js';
import { HeroIdentifier } from './components/HeroIdentifier.js';
import { KandinskyBYO } from './components/KandinskyBYO.js';
import { Masthead } from './components/Masthead.js';
import { StageGels } from './components/StageGels.js';
import { WARHAMMER_INVOCATIONS, warhammer } from './data/warhammer.js';
import { useDemoState } from './hooks/useDemoState.js';

export function App() {
  const demo = useDemoState();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StageGels {...demo.gels} />
      <div className="grain" aria-hidden />

      <main
        className="relative mx-auto max-w-4xl px-6 md:px-10 py-10 md:py-14"
        style={{ zIndex: 10 }}
      >
        <Masthead metric={demo.metric} />

        {/* Live RGB channel strip — the divider between masthead and
            the above-the-fold identify demo. Driven by the current input
            color, so it reads as part of the demo, not inert chrome. */}
        <div className="mt-6">
          <ConvergenceStrip hex={demo.input} />
        </div>

        {/* ===== act 01 · identify (above the fold) ===== */}
        <DemoPanel
          className="mt-10"
          eyebrow="act 01"
          title="identify"
          kicker="color → name"
        >
          <HeroIdentifier
            input={demo.input}
            setInput={demo.setInput}
            paletteKey={demo.paletteKey}
            setPaletteKey={demo.setPaletteKey}
            metric={demo.metric}
            setMetric={demo.setMetric}
            applyPreset={demo.applyPreset}
            matchedName={demo.matchedName}
            matchedHex={demo.matchedHex}
            elapsedMs={demo.identifyElapsedMs}
            conversions={demo.conversions}
          />
        </DemoPanel>

        <DemoPanel
          className="mt-8"
          eyebrow="identify · cont."
          title="translate"
          kicker="palette ↔ palette"
        >
          <CrossPaletteTranslator />
        </DemoPanel>

        {/* ===== act 02 · resolve ===== */}
        <DemoPanel
          className="mt-8"
          eyebrow="act 02"
          title="resolve"
          kicker="bring your own"
        >
          <KandinskyBYO
            input={demo.input}
            setInput={demo.setInput}
            matchedName={demo.warhammerMatch}
            matchedHex={demo.warhammerHex}
            colors={warhammer.colors}
            invocations={WARHAMMER_INVOCATIONS}
          />
        </DemoPanel>

        {/* ===== act 03 · convert ===== */}
        <DemoPanel
          className="mt-8"
          eyebrow="act 03"
          title="convert"
          kicker="format ↔ format"
        >
          <ConversionsScope
            conversions={demo.conversions}
            tintHex={demo.input}
            input={demo.input}
          />
        </DemoPanel>

        <Footer />
      </main>
    </div>
  );
}
