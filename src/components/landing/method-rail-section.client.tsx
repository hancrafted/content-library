'use client';

import { MethodProgressStepper } from '@/components/landing/method-progress-stepper.client';
import { MethodSlideItem } from '@/components/landing/method-slide-item';
import { useResolvedTheme } from '@/hooks/use-resolved-theme';
import { FRAMEWORK_SLIDES } from '@/lib/framework-slides.pure';
import type { Locale } from '@/lib/locale.pure';
import { computeActiveStep, computeThemeColors } from '@/lib/theme-transition.pure';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applyThemeToContainer(container: HTMLElement, p: number, isDarkSiteTheme: boolean) {
  const { bg, fg, border } = computeThemeColors(p, isDarkSiteTheme);
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
  isDarkRef: React.RefObject<boolean>;
  progressRef: React.RefObject<number>;
}

function buildRailTimeline(container: HTMLElement, track: HTMLElement, options: ScrubOptions) {
  const { startX, endX } = getRailBounds(track);
  applyThemeToContainer(container, options.progressRef.current, options.isDarkRef.current);

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: '+=300%',
      pin: true,
      anticipatePin: 1,
      scrub: 0.3,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        options.progressRef.current = self.progress;
        applyThemeToContainer(container, self.progress, options.isDarkRef.current);
        options.onProgress(self.progress);
      },
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

function RailHeader({ locale }: { locale: Locale }) {
  const title = locale === 'de' ? 'DIE METHODE' : 'THE METHOD';
  const hint = locale === 'de' ? 'HORIZONTAL SCROLLEN →' : 'SCROLL TO PROGRESS →';

  return (
    <div className="absolute top-20 sm:top-24 left-0 right-0 z-20 px-8 sm:px-16 flex items-center justify-between pointer-events-none text-[var(--method-fg)]">
      <div className="font-mono text-xs font-bold tracking-widest uppercase text-primary">{title}</div>
      <div className="font-mono text-xs opacity-60">{hint}</div>
    </div>
  );
}

function RailTrack({ locale, trackRef }: { locale: Locale; trackRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={trackRef} className="flex h-screen items-stretch w-max will-change-transform">
      {FRAMEWORK_SLIDES.map((slide) => (
        <MethodSlideItem key={slide.id} slide={slide} locale={locale} />
      ))}
    </div>
  );
}

function useDarkSync(
  containerRef: React.RefObject<HTMLDivElement | null>,
  progressRef: React.RefObject<number>,
  isDark: boolean,
) {
  useEffect(() => {
    if (containerRef.current) {
      applyThemeToContainer(containerRef.current, progressRef.current, isDark);
    }
  }, [containerRef, progressRef, isDark]);
}

function useRailState(isDark: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;
  const progressRef = useRef(0);
  const [step, setStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(0);

  useRailScrub({
    containerRef,
    trackRef,
    onProgress: (p) => {
      setProgressPercent(p * 100);
      setStep(computeActiveStep(p));
    },
    isDarkRef,
    progressRef,
  });

  useDarkSync(containerRef, progressRef, isDark);

  return { containerRef, trackRef, step, progressPercent };
}

function DesktopRail({ locale, isDark }: { locale: Locale; isDark: boolean }) {
  const { containerRef, trackRef, step, progressPercent } = useRailState(isDark);

  return (
    <div
      ref={containerRef}
      data-method="true"
      className="hidden md:block relative h-screen w-full overflow-hidden select-none"
      style={{ transition: 'none' }}
    >
      <RailHeader locale={locale} />
      <RailTrack locale={locale} trackRef={trackRef} />
      <MethodProgressStepper currentStep={step} progressPercent={progressPercent} locale={locale} />
    </div>
  );
}

function MobileStack({ locale, isDark }: { locale: Locale; isDark: boolean }) {
  const fg = isDark ? 'var(--foreground)' : '#F8FAFC';
  const bg = isDark ? 'var(--background)' : '#0A0E1A';

  return (
    <div
      className={`md:hidden py-16 px-4 space-y-12 transition-colors ${!isDark ? 'bg-[#0A0E1A] text-[#F8FAFC]' : ''}`}
      style={{ '--method-fg': fg, '--method-bg': bg } as React.CSSProperties}
    >
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {locale === 'de' ? 'Die Methode' : 'The Method'}
      </h2>
      <div className="space-y-16">
        {FRAMEWORK_SLIDES.map((slide) => (
          <MethodSlideItem key={slide.id} slide={slide} locale={locale} />
        ))}
      </div>
    </div>
  );
}

export function MethodRailSection({ locale }: { locale: Locale }) {
  const resolvedTheme = useResolvedTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <section className="relative" id="services">
      <DesktopRail locale={locale} isDark={isDark} />
      <MobileStack locale={locale} isDark={isDark} />
    </section>
  );
}
