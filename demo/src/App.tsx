// Composition root. All state lives in useDemoState; every panel below is a
// presentational component that receives just what it needs. The page reads
// top-down as the user will: masthead → act 01 (identify) → RGB channel
// divider → act 02 (resolve) → act 03 (convert) → footer.

import { ConvergenceStrip } from './components/ConvergenceStrip.js';
import { ConversionsScope } from './components/ConversionsScope.js';
import { CrossPaletteTranslator } from './components/CrossPaletteTranslator.js';
import { ActHeader, DemoPanel } from './components/DemoPanel.js';
import { Eyedropper } from './components/Eyedropper.js';
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

        {/* ===== act 01 · identify ===== */}
        <div className="mt-12">
          <ActHeader act="act 01" title="identify" kicker="color → name" />
        </div>

        <DemoPanel className="mt-4" eyebrow="identify" title="scrub" kicker="color picker">
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
          />
        </DemoPanel>

        <DemoPanel
          className="mt-10"
          eyebrow="identify · cont."
          title="translate"
          kicker="palette ↔ palette"
        >
          <CrossPaletteTranslator />
        </DemoPanel>

        <DemoPanel
          className="mt-10"
          eyebrow="identify · cont."
          title="eyedropper"
          kicker="pixel → name"
        >
          <Eyedropper onPick={demo.setInput} />
        </DemoPanel>

        {/* RGB channel strip — visible divider driven by current input */}
        <div className="mt-12">
          <ConvergenceStrip hex={demo.input} />
        </div>

        {/* ===== act 02 · resolve ===== */}
        <div className="mt-12">
          <ActHeader act="act 02" title="resolve" kicker="name → color" />
          <div className="mt-4">
            <KandinskyBYO
              input={demo.input}
              setInput={demo.setInput}
              matchedName={demo.warhammerMatch}
              matchedHex={demo.warhammerHex}
              colors={warhammer.colors}
              invocations={WARHAMMER_INVOCATIONS}
            />
          </div>
        </div>

        {/* ===== act 03 · convert ===== */}
        <div className="mt-12">
          <ActHeader act="act 03" title="convert" kicker="format ↔ format" />
          <div className="mt-4">
            <ConversionsScope
              conversions={demo.conversions}
              tintHex={demo.input}
              input={demo.input}
            />
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
