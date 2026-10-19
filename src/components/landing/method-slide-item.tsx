import type { FrameworkSlideData } from '@/lib/framework-slides.pure';
import { Car, HandHelping, RefreshCw, Undo2, Users, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** A PROOF card with its copy resolved for the page's locale. */
export type MethodCard = Pick<FrameworkSlideData, 'id' | 'step' | 'letter' | 'iconName'> & {
  title: string;
  claim: string;
  note?: ReactNode;
};

const ICONS: Record<FrameworkSlideData['iconName'], LucideIcon> = {
  users: Users,
  'undo-2': Undo2,
  car: Car,
  'hand-helping': HandHelping,
  'refresh-cw': RefreshCw,
};

function SlideWatermark({ step }: { step: string }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[clamp(140px,40vh,480px)] font-black leading-none tracking-tighter opacity-[0.05] select-none text-[var(--method-fg)]"
    >
      {step}
    </span>
  );
}

function SlideHeader({ card }: { card: MethodCard }) {
  const Icon = ICONS[card.iconName];

  return (
    <div>
      <div className="inline-flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-widest text-primary font-bold">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>
          STEP {card.step} // {card.title}
        </span>
      </div>

      <h2 className="font-extrabold leading-[0.95] tracking-tight text-balance text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--method-fg)]">
        <span>{card.title}</span>
        <span className="text-brand-accent">.</span>
      </h2>
    </div>
  );
}

export function MethodSlideItem({ card }: { card: MethodCard }) {
  return (
    <article
      data-method-slide={card.step}
      className="relative flex min-h-[60vh] md:h-screen w-full md:w-[80vw] lg:w-[70vw] max-w-4xl shrink-0 flex-col justify-center px-6 md:px-12 pt-20 sm:pt-24 will-change-transform select-none"
    >
      <SlideWatermark step={card.step} />
      <div className="relative z-10 max-w-2xl mx-auto w-full">
        <SlideHeader card={card} />
        <div
          aria-hidden="true"
          className="mt-6 h-[1px] w-20 opacity-25"
          style={{ backgroundColor: 'var(--method-fg)' }}
        />
        <p className="mt-6 font-mono text-base sm:text-xl font-light opacity-80 max-w-xl text-[var(--method-fg)]">
          {card.claim}
        </p>
        {card.note ? (
          <p data-method-note className="mt-6 max-w-xl text-caption text-[var(--method-fg)] opacity-60">
            {card.note}
          </p>
        ) : null}
      </div>
    </article>
  );
}
