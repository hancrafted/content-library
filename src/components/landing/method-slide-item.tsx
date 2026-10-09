import type { FrameworkSlideData } from '@/lib/framework-slides.pure';
import type { Locale } from '@/lib/locale.pure';
import { Cpu, Gauge, Sparkles, Target, Users, type LucideIcon } from 'lucide-react';

const ICONS: Record<FrameworkSlideData['iconName'], LucideIcon> = {
  cpu: Cpu,
  users: Users,
  target: Target,
  gauge: Gauge,
  sparkles: Sparkles,
};

function SlideBullets({ bullets, deliverable }: { bullets: readonly string[]; deliverable: string }) {
  return (
    <ul className="mt-8 flex max-w-xl flex-col gap-3 font-mono text-xs sm:text-sm font-light">
      {bullets.map((bullet, idx) => (
        <li key={idx} className="flex items-start gap-3 opacity-80" style={{ color: 'var(--method-fg)' }}>
          <span
            className="mt-[0.65em] inline-block h-[1px] w-3 shrink-0 opacity-40"
            style={{ backgroundColor: 'var(--method-fg)' }}
          />
          <span>{bullet}</span>
        </li>
      ))}
      <li className="flex items-start gap-3 mt-1 font-semibold text-brand-accent">
        <span className="mt-[0.65em] inline-block h-[1px] w-3 shrink-0 bg-brand-accent" />
        <span>{deliverable}</span>
      </li>
    </ul>
  );
}

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

function SlideHeader({ slide, locale }: { slide: FrameworkSlideData; locale: Locale }) {
  const Icon = ICONS[slide.iconName];

  return (
    <div>
      <div className="inline-flex items-center gap-2 mb-3 font-mono text-xs uppercase tracking-widest text-primary font-bold">
        <Icon className="h-3.5 w-3.5" />
        <span>
          STEP {slide.step} // {slide.tag[locale]}
        </span>
      </div>

      <h2 className="font-extrabold leading-[0.95] tracking-tight whitespace-normal sm:whitespace-nowrap text-3xl sm:text-6xl md:text-7xl lg:text-8xl text-[var(--method-fg)]">
        <span>{slide.shortTitle[locale]}</span>
        <span className="text-primary">.</span>
      </h2>
    </div>
  );
}

export function MethodSlideItem({ slide, locale }: { slide: FrameworkSlideData; locale: Locale }) {
  return (
    <article
      data-method-slide={slide.step}
      className="relative flex min-h-[60vh] md:h-screen w-full md:w-[80vw] lg:w-[70vw] max-w-4xl shrink-0 flex-col justify-center px-6 md:px-12 pt-20 sm:pt-24 will-change-transform select-none"
    >
      <SlideWatermark step={slide.step} />
      <div className="relative z-10 max-w-2xl mx-auto w-full">
        <SlideHeader slide={slide} locale={locale} />
        <div
          aria-hidden="true"
          className="mt-6 h-[1px] w-20 opacity-25"
          style={{ backgroundColor: 'var(--method-fg)' }}
        />
        <p className="mt-6 font-mono text-base sm:text-xl font-light opacity-80 max-w-xl text-[var(--method-fg)]">
          {slide.subtitle[locale]}
        </p>
        <SlideBullets bullets={slide.bullets[locale]} deliverable={slide.deliverable[locale]} />
      </div>
    </article>
  );
}
