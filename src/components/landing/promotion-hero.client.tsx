'use client';

import { usePromotionAnimation } from '@/hooks/use-promotion-animation';
import { INK_DROPLETS } from '@/lib/ink-magnet.pure';
import { localizePath, type Locale } from '@/lib/locale.pure';
import type { PaperDrain } from '@/lib/paper-pile.pure';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import styles from './promotion-hero.module.css';

interface PromotionHeroProps {
  locale: Locale;
  headline: ReactNode;
  eyebrow: string;
  offers: string[];
  caption: ReactNode;
  scene: ReactNode;
  labels: { episodes: string; open: string; skip: string; motionHint: string };
}

function promiseTarget(target: EventTarget | null): PaperDrain {
  return target instanceof Element && target.closest('[data-hero-primary]') ? 'primary' : 'none';
}

function usePointerFollow(follow: (point: { x: number; y: number } | null) => void) {
  return {
    onPointerMove: (event: React.PointerEvent<HTMLElement>) => {
      if (event.pointerType === 'mouse') follow({ x: event.clientX, y: event.clientY });
    },
    onPointerLeave: () => follow(null),
  };
}

function usePromiseInteraction() {
  const [hovered, setHovered] = useState<PaperDrain>('none');
  const [focused, setFocused] = useState<PaperDrain>('none');
  const events = {
    onPointerOver: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(promiseTarget(event.target));
    },
    onPointerOut: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(promiseTarget(event.relatedTarget));
    },
    onFocus: (event: React.FocusEvent) =>
      setFocused(event.target.matches(':focus-visible') ? promiseTarget(event.target) : 'none'),
    onBlur: () => setFocused('none'),
  };
  return { draining: hovered === 'none' ? focused : hovered, events };
}

// The ink field reaches 128px past the button on every side (see .inkField); the filters cover it all.
const INK_REGION = {
  filterUnits: 'userSpaceOnUse',
  x: -128,
  y: -128,
  width: '100%',
  height: '100%',
  colorInterpolationFilters: 'sRGB',
} as const;

function InkFilters() {
  return (
    <defs>
      <filter id="hero-ink-goo" {...INK_REGION}>
        <feGaussianBlur stdDeviation="4" />
        <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 18 -7" />
      </filter>
      <filter id="hero-ink-rough" {...INK_REGION}>
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <clipPath id="hero-ink-edge">
        <rect data-ink-edge />
      </clipPath>
    </defs>
  );
}

/**
 * The ink the pointer pulls out of Explore why; promotion-ink.ts sizes and moves it. Roughened like the
 * section's liquid ink transition, then gooey, so the beads merge into one irregular body.
 */
function InkField() {
  return (
    <svg className={styles.inkField} aria-hidden="true">
      <InkFilters />
      <g transform="translate(128 128)" filter="url(#hero-ink-goo)" fill="var(--primary)">
        {/* Clipped after roughening, so the front is ragged but the flooded button keeps its edge. */}
        <g clipPath="url(#hero-ink-edge)">
          <circle data-ink-fill filter="url(#hero-ink-rough)" r="0" />
        </g>
        <g filter="url(#hero-ink-rough)">
          {Array.from({ length: INK_DROPLETS }, (_, drop) => (
            <circle key={drop} data-ink-drop r="0" />
          ))}
        </g>
      </g>
    </svg>
  );
}

function PrimaryAction({ locale, label }: { locale: Locale; label: string }) {
  return (
    <Link
      data-testid="hero-episodes"
      data-hero-primary
      aria-describedby="hero-motion-hint"
      href={localizePath('/', locale, 'episodes')}
      className={styles.primary}
    >
      <InkField />
      <span className={styles.primaryLabel}>
        {label}
        <ArrowDown size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

function HeroActions({ locale, labels }: Pick<PromotionHeroProps, 'locale' | 'labels'>) {
  return (
    <div data-hero-actions className={styles.actions}>
      <PrimaryAction locale={locale} label={labels.episodes} />
    </div>
  );
}

function HeroCopy({ copy }: { copy: PromotionHeroProps }) {
  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <ul className={styles.offers}>
        {copy.offers.map((offer) => (
          <li key={offer}>{offer}</li>
        ))}
      </ul>
      <h1 id="hero-title" data-testid="page-title" className={styles.headline}>
        {copy.headline}
      </h1>
      <p data-hero-caption className={styles.caption}>
        {copy.caption}
      </p>
      <HeroActions locale={copy.locale} labels={copy.labels} />
    </div>
  );
}

function SceneControls({ labels, burst }: { labels: PromotionHeroProps['labels']; burst: () => void }) {
  return (
    <button
      data-testid="hero-open"
      type="button"
      className={styles.envelopeTrigger}
      onClick={burst}
      aria-label={labels.open}
    />
  );
}

export function PromotionHero(props: PromotionHeroProps) {
  const root = useRef<HTMLElement>(null);
  // Transient: the illustrated workload is not the reader's application state.
  const { draining, events } = usePromiseInteraction();
  const { burst, finish, follow } = usePromotionAnimation(root, draining);
  const pointer = usePointerFollow(follow);
  return (
    <section
      ref={root}
      data-promotion-hero
      aria-labelledby="hero-title"
      className={styles.hero}
      {...events}
      {...pointer}
    >
      <HeroCopy copy={props} />
      <div className={styles.scene}>
        {props.scene}
        <SceneControls labels={props.labels} burst={burst} />
      </div>
      <button data-testid="hero-skip" type="button" className={styles.skip} onClick={finish}>
        {props.labels.skip}
      </button>
      <p id="hero-motion-hint" className="sr-only">
        {props.labels.motionHint}
      </p>
    </section>
  );
}
