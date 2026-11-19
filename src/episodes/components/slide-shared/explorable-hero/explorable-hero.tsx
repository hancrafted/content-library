import { localizePath, stripLocale, type Locale } from '@/shared/lib/locale.pure';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import type { Story } from './drift.pure';
import { HeroCanvas, HeroMotionButton, type MotionLabels } from './hero-motion.client';
import { ShareLink, type ShareLinkLabels } from './share-link.client';

export interface HeroAction {
  readonly label: string;
  readonly href: string;
}

export interface HeroLayers {
  readonly Frame: ComponentType<{ className?: string; children: ReactNode }>;
}

export interface ExplorableHeroProps {
  readonly layers: HeroLayers;
  // decision: FE-003 §2
  readonly locale: Locale;
  readonly tryIt: HeroAction;
  readonly why: HeroAction;
  readonly share: { readonly title: string; readonly text: string; readonly labels: ShareLinkLabels };
  readonly motion: MotionLabels;
  readonly preview: ReactNode;
}

const ACTION =
  'inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-body font-medium outline-offset-3 transition-colors focus-visible:outline-3 focus-visible:outline-foreground';

function partsOf(link: string) {
  const [path, anchor] = link.split('#');
  return { path: stripLocale(path), anchor };
}

function Actions({ tryIt, why, locale }: Pick<ExplorableHeroProps, 'tryIt' | 'why' | 'locale'>) {
  const go = partsOf(tryIt.href);
  const learn = partsOf(why.href);
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={localizePath(go.path, locale, go.anchor)}
        className={`${ACTION} border-transparent bg-foreground text-background hover:bg-foreground/90`}
      >
        {tryIt.label}
      </Link>
      <Link
        href={localizePath(learn.path, locale, learn.anchor)}
        className={`${ACTION} border-foreground/55 text-foreground hover:bg-foreground/15`}
      >
        {why.label}
      </Link>
    </div>
  );
}

export function ExplorableHero({ layers, locale, tryIt, why, share, motion, preview }: ExplorableHeroProps) {
  return (
    <layers.Frame className="gap-7 pb-0 md:pb-0">
      <HeroMotionButton labels={motion} />
      <Actions tryIt={tryIt} why={why} locale={locale} />
      <ShareLink title={share.title} text={share.text} labels={share.labels} />
      <HeroPreview>{preview}</HeroPreview>
    </layers.Frame>
  );
}

function HeroPreview({ children }: { children: ReactNode }) {
  return (
    <div
      data-hero-preview
      className="max-h-28 w-full md:max-h-40 max-w-3xl overflow-hidden mask-[linear-gradient(#000_55%,transparent)]"
    >
      {children}
    </div>
  );
}

export function HeroDecoration({ story }: { story: Story }) {
  return (
    <>
      <div className="hero-glow absolute inset-0 text-brand-accent opacity-60" />
      <div className="hero-glow hero-glow--accent absolute inset-0 text-brand-accent opacity-60" />
      <HeroCanvas story={story} />
    </>
  );
}
