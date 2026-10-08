'use client';

import { usePromotionAnimation } from '@/hooks/use-promotion-animation';
import { localizePath, type Locale } from '@/lib/locale.pure';
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
  words: string[];
}

function promiseTarget(target: EventTarget | null) {
  return target instanceof Element
    ? target.closest('[data-caption-word], [data-testid="hero-episodes"], [data-testid="hero-contact"]')
    : null;
}

function usePromiseInteraction() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const events = {
    onPointerOver: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(!!promiseTarget(event.target));
    },
    onPointerOut: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setHovered(!!promiseTarget(event.relatedTarget));
    },
    onFocus: (event: React.FocusEvent) => setFocused(!!promiseTarget(event.target)?.matches(':focus-visible')),
    onBlur: () => setFocused(false),
  };
  return { draining: hovered || focused, events };
}

function HeroActions({ locale, labels }: Pick<PromotionHeroProps, 'locale' | 'labels'>) {
  return (
    <div className={styles.actions}>
      <Link
        data-testid="hero-episodes"
        data-hero-primary
        href={localizePath('/', locale, 'episodes')}
        className={styles.primary}
      >
        {labels.episodes}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
      <a
        data-testid="hero-contact"
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

function FlyingWords({ words }: Pick<PromotionHeroProps, 'words'>) {
  return words.map((word, index) => (
    <span key={index} data-flying-word className={styles.flyingWord} aria-hidden="true">
      {word}
    </span>
  ));
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
      <FlyingWords words={props.words} />
    </section>
  );
}
