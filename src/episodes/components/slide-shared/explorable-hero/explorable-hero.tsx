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
  /** The wrapper supplies the surface, decoration and shared motion context. */
  readonly presentation?: boolean;
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
        className={`${ACTION} border-transparent bg-foreground text-(--tone-paper) hover:bg-foreground/90`}
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
 * The Title hero's actions, team-share block and tool preview under the container's headline and lede.
 * Every string belongs to the composing Slide. Wrapper presentation supplies decoration and motion context;
 * a self-contained hero supplies its own Backdrop and context. The pause button shares the canvas's state.
 */
export function ExplorableHero({
  layers,
  story,
  locale,
  tryIt,
  why,
  share,
  motion,
  preview,
  presentation,
}: ExplorableHeroProps) {
  const content = (
    <>
      {!presentation && (
        <layers.Backdrop mobile>
          <div className="absolute inset-0 bg-(--tone-paper)" />
          <HeroDecoration story={story} />
        </layers.Backdrop>
      )}
      <layers.Frame className="gap-7 pb-0 md:pb-0">
        <HeroMotionButton labels={motion} />
        <Actions tryIt={tryIt} why={why} locale={locale} />
        <ShareLink title={share.title} text={share.text} labels={share.labels} />
        <HeroPreview>{preview}</HeroPreview>
        {!presentation && <div aria-hidden="true" className="h-[45svh]" />}
      </layers.Frame>
    </>
  );
  return presentation ? content : <HeroMotion labels={motion}>{content}</HeroMotion>;
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

/** Decorative story art; its motion context and Slide identity belong to the wrapper. */
export function HeroDecoration({ story }: { story: Story }) {
  return (
    <>
      <div className="hero-glow absolute inset-0 text-brand-accent opacity-60" />
      <div className="hero-glow hero-glow--accent absolute inset-0 text-brand-accent opacity-60" />
      <HeroCanvas story={story} />
    </>
  );
}
