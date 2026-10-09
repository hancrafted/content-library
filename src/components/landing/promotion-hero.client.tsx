'use client';

import { usePromotionAnimation } from '@/hooks/use-promotion-animation';
import { localizePath, type Locale } from '@/lib/locale.pure';
import type { PaperDrain } from '@/lib/paper-pile.pure';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, type ReactNode } from 'react';
import styles from './promotion-hero.module.css';

interface PromotionHeroProps {
  locale: Locale;
  headline: string;
  eyebrow: string;
  caption: ReactNode;
  scene: ReactNode;
  labels: { episodes: string; contact: string; newTab: string; open: string; skip: string; motionHint: string };
}

function promiseTarget(target: EventTarget | null): PaperDrain {
  if (!(target instanceof Element)) return 'none';
  if (target.closest('[data-hero-primary]')) return 'primary';
  return target.closest('[data-hero-secondary]') ? 'secondary' : 'none';
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

function HeroActions({ locale, labels }: Pick<PromotionHeroProps, 'locale' | 'labels'>) {
  return (
    <div data-hero-actions className={styles.actions}>
      <Link
        data-testid="hero-episodes"
        data-hero-primary
        aria-describedby="hero-motion-hint"
        href={localizePath('/', locale, 'episodes')}
        className={styles.primary}
      >
        {labels.episodes}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <a
        data-testid="hero-contact"
        data-hero-secondary
        aria-describedby="hero-motion-hint"
        href="https://calendly.com/hanche2001/30min"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.secondary}
      >
        {labels.contact}
        <ArrowUpRight size={15} aria-hidden="true" />
        <span className="sr-only"> ({labels.newTab})</span>
      </a>
    </div>
  );
}

function HeroCopy({ copy }: { copy: PromotionHeroProps }) {
  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
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
  const { burst, finish } = usePromotionAnimation(root, draining);
  return (
    <section ref={root} data-promotion-hero aria-labelledby="hero-title" className={styles.hero} {...events}>
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
