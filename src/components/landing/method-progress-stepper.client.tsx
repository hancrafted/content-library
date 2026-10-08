'use client';

import { FRAMEWORK_SLIDES, type FrameworkSlideData } from '@/lib/framework-slides.pure';
import type { Locale } from '@/lib/locale.pure';

const STEP_THRESHOLDS = [0, 26, 51, 76, 97];

interface NodeSymbolProps {
  isPassed: boolean;
  isCurrent: boolean;
  letter: string;
}

function NodeSymbol({ isPassed, isCurrent, letter }: NodeSymbolProps) {
  const dotClasses = `rounded-full transition-all duration-300 ease-out transform ${
    isPassed ? 'scale-0 opacity-0' : 'scale-100'
  } h-2 w-2 sm:h-2.5 sm:w-2.5 bg-current opacity-70`;

  const letterClasses = `absolute font-mono text-base sm:text-lg tracking-tight px-1.5 py-0.5 rounded transition-all duration-300 ease-out transform ${
    isPassed ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
  } ${isCurrent ? 'font-black scale-110 text-primary' : 'font-bold text-current opacity-75'}`;

  return (
    <div className="relative flex items-center justify-center min-w-[28px] sm:min-w-[32px] h-7 sm:h-8">
      <span className={dotClasses} />
      <span className={letterClasses} style={{ backgroundColor: 'var(--method-bg)' }}>
        {letter}
      </span>
    </div>
  );
}

function NodeWord({ isCurrent, word }: { isCurrent: boolean; word: string }) {
  const wordClasses = `font-mono text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.14em] uppercase transition-all duration-300 ease-out transform ${
    isCurrent ? 'translate-y-0 opacity-100 font-bold text-primary' : 'translate-y-2 opacity-0'
  }`;

  return (
    <div className="absolute top-7 sm:top-8 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none pt-0.5">
      <div className={wordClasses}>{word}</div>
    </div>
  );
}

interface TrackNodeProps {
  slide: FrameworkSlideData;
  idx: number;
  currentStep: number;
  progressPercent: number;
  locale: Locale;
}

function TrackNode({ slide, idx, currentStep, progressPercent, locale }: TrackNodeProps) {
  const isPassed = progressPercent >= (STEP_THRESHOLDS[idx] ?? 0);
  const isCurrent = currentStep === idx + 1;
  const leftPercent = (idx / (FRAMEWORK_SLIDES.length - 1)) * 100;

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center z-10"
      style={{ left: `${leftPercent}%` }}
    >
      <NodeSymbol isPassed={isPassed} isCurrent={isCurrent} letter={slide.letter[locale]} />
      <NodeWord isCurrent={isCurrent} word={slide.phase[locale]} />
    </div>
  );
}

function TrackBackground({ progressPercent }: { progressPercent: number }) {
  const clampedProgress = Math.min(100, Math.max(0, progressPercent));

  return (
    <>
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-current opacity-20 -translate-y-1/2 pointer-events-none" />
      <div
        className="absolute top-1/2 left-0 h-[1.5px] bg-primary -translate-y-1/2 pointer-events-none"
        style={{ width: `${clampedProgress}%` }}
      />
    </>
  );
}

interface MethodProgressStepperProps {
  currentStep: number;
  progressPercent: number;
  locale: Locale;
}

export function MethodProgressStepper({ currentStep, progressPercent, locale }: MethodProgressStepperProps) {
  const formattedPercent = String(Math.round(progressPercent)).padStart(3, '0');

  return (
    <div
      className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-20 pointer-events-none flex items-center justify-center transition-colors"
      style={{ color: 'var(--method-fg)' }}
    >
      <div className="relative w-[240px] sm:w-[340px] md:w-[420px] max-w-[85vw] h-14 sm:h-16 flex items-center pointer-events-auto">
        <TrackBackground progressPercent={progressPercent} />
        {FRAMEWORK_SLIDES.map((slide, idx) => (
          <TrackNode
            key={slide.id}
            slide={slide}
            idx={idx}
            currentStep={currentStep}
            progressPercent={progressPercent}
            locale={locale}
          />
        ))}
      </div>
      <div className="hidden sm:block absolute right-8 sm:right-16 text-[10px] font-mono tracking-wider tabular-nums opacity-60">
        {formattedPercent}%
      </div>
    </div>
  );
}
