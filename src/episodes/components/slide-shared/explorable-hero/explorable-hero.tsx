import { localizePath, stripLocale, type Locale } from '@/shared/lib/locale.pure';
import Link from 'next/link';
import type { ComponentType, ReactNode } from 'react';
import type { Story } from './drift.pure';
import { HeroCanvas, HeroMotion, HeroMotionButton, type MotionLabels } from './hero-motion.client';
import { ShareLink, type ShareLinkLabels } from './share-link.client';

/** A call to action: its words and where it goes. */
export interface HeroAction {
  readonly label: string;
  readonly href: string;
}

/** The Slide master's two layers, which a `slide-shared` part may not import: the Slide hands them in. */
export interface HeroLayers {
  readonly Backdrop: ComponentType<{ mobile?: boolean; children?: ReactNode }>;
  readonly Frame: ComponentType<{ className?: string; children: ReactNode }>;
}

export interface ExplorableHeroProps {
  /** `SlideBackdrop` and `SlideFrame`, from the Slide master. */
  readonly layers: HeroLayers;
  /** Which Explorable's story the background's subject beat tells. */
  readonly story: Story;
  /** The page's locale: the action links are localized again here, so every `href` goes through `localizePath` (FE-003). */
  readonly locale: Locale;
  /** "Try it": the page's fully enabled Explorable. */
  readonly tryIt: HeroAction;
  /** "Why it matters": the explanatory Slide. */
  readonly why: HeroAction;
  readonly share: { readonly title: string; readonly text: string; readonly labels: ShareLinkLabels };
  readonly motion: MotionLabels;
  /** The lightweight, decorative tool preview that peeks up from the bottom edge. */
  readonly preview: ReactNode;
}

const ACTION =
  'inline-flex min-h-12 items-center justify-center rounded-full border px-6 text-body font-medium outline-offset-3 transition-colors focus-visible:outline-3 focus-visible:outline-foreground';

/** A Slide link (`slideHref`) taken apart: the logical path and the anchor, for `localizePath`. */
function partsOf(link: string) {
  const [path, anchor] = link.split('#');
  return { path: stripLocale(path), anchor };
}

/** "Try it" and "Why it matters": the Slide links of the page, localized again so every `href` goes through `localizePath`. */
function Actions({ tryIt, why, locale }: Pick<ExplorableHeroProps, 'tryIt' | 'why' | 'locale'>) {
  const go = partsOf(tryIt.href);
  const learn = partsOf(why.href);
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href={localizePath(go.path, locale, go.anchor)}
        className={`${ACTION} border-transparent bg-brand-accent text-(--tone-paper) hover:bg-brand-accent/90 dark:text-(--tone-ink)`}
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

/**
 * The Title slide hero Scene of an Explorable page (a record's `title`): an inverted, full-bleed Backdrop of faint
 * bubbles whose one accent beat tells the Explorable's story, then the actions, the team-share block and the tool
 * preview under the container's headline and lede. It owns no words: every string arrives as a prop, from the Slide
 * that renders it. The pause button sits outside the decorative Backdrop and shares its state with the canvas.
 */
export function ExplorableHero({ layers, story, locale, tryIt, why, share, motion, preview }: ExplorableHeroProps) {
  return (
    <HeroMotion labels={motion}>
      <layers.Backdrop mobile>
        <div className="absolute inset-0 bg-(--tone-paper)" />
        <div className="hero-glow absolute inset-0 text-brand-accent opacity-60" />
        <div className="hero-glow hero-glow--accent absolute inset-0 text-brand-accent opacity-60" />
        <HeroCanvas story={story} />
      </layers.Backdrop>
      <layers.Frame className="gap-7 pb-0 md:pb-0">
        <HeroMotionButton />
        <Actions tryIt={tryIt} why={why} locale={locale} />
        <ShareLink title={share.title} text={share.text} labels={share.labels} />
        <div
          data-hero-preview
          className="max-h-28 w-full md:max-h-40 max-w-3xl overflow-hidden mask-[linear-gradient(#000_55%,transparent)]"
        >
          {preview}
        </div>
        {/* Height for the Title slide's ink transition to bleed through, so the preview no longer sits on the Slide's edge. */}
        <div aria-hidden="true" className="h-[45svh]" />
      </layers.Frame>
    </HeroMotion>
  );
}
