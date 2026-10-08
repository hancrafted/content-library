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
  labels: { episodes: string; contact: string; newTab: string; open: string; skip: string };
  words: string[];
}

function usePromiseHover() {
  const [accelerated, setAccelerated] = useState(false);
  const events = {
    onPointerEnter: (event: React.PointerEvent) => {
      if (event.pointerType === 'mouse') setAccelerated(true);
    },
    onPointerLeave: () => setAccelerated(false),
    onFocus: () => setAccelerated(true),
    onBlur: () => setAccelerated(false),
  };
  return { accelerated, events };
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

function HeroCopy({
  copy,
  events,
}: {
  copy: PromotionHeroProps;
  events: ReturnType<typeof usePromiseHover>['events'];
}) {
  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <h1 id="hero-title" data-testid="page-title" className={styles.headline}>
        {copy.headline}
      </h1>
      <p data-hero-caption className={styles.caption} {...events}>
        {copy.caption}
      </p>
      <div {...events}>
        <HeroActions locale={copy.locale} labels={copy.labels} />
      </div>
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

export function PromotionHero(props: PromotionHeroProps) {
  const root = useRef<HTMLElement>(null);
  // Transient: a reload only replays this one-shot illustration.
  const { accelerated, events } = usePromiseHover();
  const { burst, finish } = usePromotionAnimation(root, accelerated);
  return (
    <section ref={root} data-promotion-hero aria-labelledby="hero-title" className={styles.hero}>
      <HeroCopy copy={props} events={events} />
      <div className={styles.scene}>
        {props.scene}
        <button
          data-testid="hero-open"
          type="button"
          className={styles.envelopeTrigger}
          onClick={burst}
          aria-label={props.labels.open}
        />
        <button data-testid="hero-skip" type="button" className={styles.skip} onClick={finish}>
          {props.labels.skip}
        </button>
      </div>
      <FlyingWords words={props.words} />
    </section>
  );
}
