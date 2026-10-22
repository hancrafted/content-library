'use client';

import { MethodProgressStepper } from '@/components/landing/method-progress-stepper.client';
import { MethodSlideItem, type MethodCard } from '@/components/landing/method-slide-item';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { computeActiveStep, computeThemeColors } from '@/lib/theme-transition.pure';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applyThemeToContainer(container: HTMLElement, p: number) {
  const { bg, fg, border } = computeThemeColors(p);
  container.style.setProperty('--method-bg', bg);
  container.style.setProperty('--method-fg', fg);
  container.style.setProperty('--method-border', border);
  container.style.backgroundColor = bg;
  container.style.color = fg;
}

function getRailBounds(track: HTMLElement) {
  const slides = track.querySelectorAll<HTMLElement>('article');
  const s1 = slides[0];
  const s5 = slides[slides.length - 1];
  const startX = () => (window.innerWidth - (s1?.offsetWidth ?? window.innerWidth * 0.75)) / 2;
  const endX = () => {
    const s5Width = s5?.offsetWidth ?? window.innerWidth * 0.75;
    const s5Offset = s5?.offsetLeft ?? 0;
    return (window.innerWidth - s5Width) / 2 - s5Offset;
  };
  return { startX, endX };
}

interface ScrubOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  trackRef: React.RefObject<HTMLDivElement | null>;
  onProgress: (p: number) => void;
  progressRef: React.RefObject<number>;
}

function buildRailTimeline(container: HTMLElement, track: HTMLElement, options: ScrubOptions) {
  const { startX, endX } = getRailBounds(track);
  applyThemeToContainer(container, options.progressRef.current);

  // The stepper and the colours follow the timeline's own progress, not the scroll position: `scrub` eases the
  // track behind the scrollbar, and reading the scroll would run the stepper ahead of the slide on screen.
  const tl: gsap.core.Timeline = gsap.timeline({
    onUpdate: () => {
      const p = tl.progress();
      options.progressRef.current = p;
      applyThemeToContainer(container, p);
      options.onProgress(p);
    },
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: '+=300%',
      pin: true,
      anticipatePin: 1,
      scrub: 0.3,
      invalidateOnRefresh: true,
    },
  });
  tl.fromTo(track, { x: () => startX() }, { x: () => endX(), duration: 1, ease: 'none' }, 0);
  return tl;
}

function useRailScrub(options: ScrubOptions) {
  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);
      const container = options.containerRef.current;
      const track = options.trackRef.current;
      if (!container || !track || prefersReducedMotion()) return;

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px)', () => {
        buildRailTimeline(container, track, options);
      });
    },
    { scope: options.containerRef, dependencies: [] },
  );
}

function RailHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="absolute top-24 left-0 right-0 z-20 px-8 sm:px-16 flex items-baseline justify-between gap-6 pointer-events-none text-[var(--method-fg)]">
      <h2 className="text-subheading font-semibold">{title}</h2>
      <p className="font-mono text-caption uppercase opacity-60">{hint}</p>
    </div>
  );
}

function RailTrack({
  cards,
  trackRef,
}: {
  cards: readonly MethodCard[];
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={trackRef} className="flex h-screen items-stretch w-max will-change-transform">
      {cards.map((card) => (
        <MethodSlideItem key={card.id} card={card} />
      ))}
    </div>
  );
}

function useRailState(count: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [step, setStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  useRailScrub({
    containerRef,
    trackRef,
    onProgress: (p) => {
      setProgressPercent(p * 100);
      setStep(computeActiveStep(p, count));
    },
    progressRef,
  });

  return { containerRef, trackRef, step, progressPercent };
}

interface MethodRailProps {
  cards: readonly MethodCard[];
  title: string;
  hint: string;
}

function DesktopRail({ cards, title, hint }: MethodRailProps) {
  const { containerRef, trackRef, step, progressPercent } = useRailState(cards.length);

  return (
    <div
      ref={containerRef}
      data-method="true"
      className="hidden md:block relative h-screen w-full overflow-hidden select-none"
      style={{ transition: 'none' }}
    >
      <RailHeader title={title} hint={hint} />
      <RailTrack cards={cards} trackRef={trackRef} />
      <MethodProgressStepper cards={cards} currentStep={step} progressPercent={progressPercent} />
    </div>
  );
}

function MobileStack({ cards, title, isDark }: Omit<MethodRailProps, 'hint'> & { isDark: boolean }) {
  const fg = isDark ? 'var(--foreground)' : '#F8FAFC';
  const bg = isDark ? 'var(--background)' : '#0A0E1A';

  return (
    <div
      className={`md:hidden overflow-x-clip py-16 px-4 space-y-12 transition-colors ${!isDark ? 'bg-[#0A0E1A] text-[#F8FAFC]' : ''}`}
      style={{ '--method-fg': fg, '--method-bg': bg } as React.CSSProperties}
    >
      <h2 className="text-subheading font-semibold">{title}</h2>
      <div className="space-y-16">
        {cards.map((card) => (
          <MethodSlideItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}

export function MethodRailSection({ cards, title, hint }: MethodRailProps) {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <section className="relative" id="services">
      <DesktopRail cards={cards} title={title} hint={hint} />
      <MobileStack cards={cards} title={title} isDark={isDark} />
    </section>
  );
}
