'use client';

import { HeroTitle } from '@/episodes/components/slide-master/slide-master';
import { useMagneticInk } from '@/shared/hooks/use-magnetic-ink';
import { usePromotionAnimation } from '@/shared/hooks/use-promotion-animation';
import { localizePath, type Locale } from '@/shared/lib/locale.pure';
import type { PaperDrain } from '@/shared/lib/paper-pile.pure';
import { ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState, type MouseEvent, type ReactNode } from 'react';
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

const EPISODES_SECTION = 'episodes';

/**
 * Glides to the Episodes section on this page instead of jumping; a modified click keeps the link's own behaviour.
 * The URL is left alone (FE-001 §2): the section is a place on the page, not state to share.
 */
const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);

function glideToEpisodes(event: MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById(EPISODES_SECTION);
  if (!target || !isPlainClick(event)) return;
  event.preventDefault();
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}

interface HeroInk {
  enabled: () => boolean;
  proximity: (strength: number) => void;
}

function PrimaryAction({ locale, label, ink }: { locale: Locale; label: string; ink: HeroInk }) {
  const host = useRef<HTMLAnchorElement>(null);
  useMagneticInk(host, { kind: 'button', reach: 240, enabled: ink.enabled, onProximity: ink.proximity });
  return (
    <Link
      ref={host}
      onClick={glideToEpisodes}
      data-testid="hero-episodes"
      data-hero-primary
      aria-describedby="hero-motion-hint"
      href={localizePath('/', locale, EPISODES_SECTION)}
      className={styles.primary}
    >
      <span data-ink-label className={styles.primaryLabel}>
        {label}
        <ArrowDown size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

function HeroActions({ locale, labels, ink }: Pick<PromotionHeroProps, 'locale' | 'labels'> & { ink: HeroInk }) {
  return (
    <div data-hero-actions className={styles.actions}>
      <PrimaryAction locale={locale} label={labels.episodes} ink={ink} />
    </div>
  );
}

function HeroCopy({ copy, ink }: { copy: PromotionHeroProps; ink: HeroInk }) {
  return (
    <div className={styles.copy}>
      <p className={styles.eyebrow}>{copy.eyebrow}</p>
      <ul className={styles.offers}>
        {copy.offers.map((offer) => (
          <li key={offer}>{offer}</li>
        ))}
      </ul>
      <HeroTitle id="hero-title" data-testid="page-title" className={styles.headline}>
        {copy.headline}
      </HeroTitle>
      <p data-hero-caption className={styles.caption}>
        {copy.caption}
      </p>
      <HeroActions locale={copy.locale} labels={copy.labels} ink={ink} />
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
  const { burst, finish, setProximity } = usePromotionAnimation(root, draining);
  const ink = {
    enabled: () =>
      root.current?.dataset.animated === 'interactive' || root.current?.hasAttribute('data-hero-settled') === true,
    proximity: setProximity,
  };
  return (
    <section ref={root} data-promotion-hero aria-labelledby="hero-title" className={styles.hero} {...events}>
      <HeroCopy copy={props} ink={ink} />
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
