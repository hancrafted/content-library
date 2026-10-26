'use client';

import { useDockedPageMark, useTalkHostPlacement } from '@/episodes/hooks/use-talk-host-placement';
import { closeTalkPlayer, openTalkPlayer, registerSlot, useTalkPlayer } from '@/episodes/hooks/use-talk-player';
import { shouldDock } from '@/episodes/lib/talk-dock.pure';
import { prefersReducedMotion } from '@/hooks/prefers-reduced-motion';
import { useActiveSlide, useUrlState } from '@/hooks/use-url-state';
import type { Locale } from '@/lib/locale.pure';
import { TITLE_ANCHOR } from '@/lib/title-anchor.pure';
import { cn } from '@/lib/utils';
import { useState, useSyncExternalStore } from 'react';

export interface TalkPlayerLabels {
  readonly watch: string;
  readonly subtitle: string;
  readonly heading: string;
  readonly backToVideo: string;
  readonly close: string;
}

/** An Event recording's language, named in the page's language before play: "Recorded in German". */
export interface RecordingLanguage {
  readonly language: Locale;
  readonly label: string;
}

const WIDE_QUERY = '(min-width: 64rem)';

function subscribeWide(listener: () => void) {
  const query = window.matchMedia(WIDE_QUERY);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
}

/** True from Tailwind's `lg` up, where the player may dock; false while prerendering. */
function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => false,
  );
}

function TalkLauncherBadge() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-youtube/10 text-youtube transition-transform group-hover:scale-110">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

const LAUNCHER =
  'group mt-8 flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-background/95 px-4 py-3 text-left shadow-xs transition-all hover:border-secondary hover:bg-secondary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary cursor-pointer';

/** The language an Event recording was made in, named before play; nothing for a per-locale video. */
function RecordedIn({ recording }: { recording: RecordingLanguage | undefined }) {
  if (recording === undefined) return null;
  return (
    <span data-recording-language={recording.language} className="mt-0.5 block text-caption text-muted-foreground">
      {recording.label}
    </span>
  );
}

interface LauncherProps {
  youtubeId: string;
  labels: TalkPlayerLabels;
  recording?: RecordingLanguage;
  hidden: boolean;
}

function LauncherButton({ youtubeId, labels, recording, hidden }: LauncherProps) {
  return (
    <button
      type="button"
      id="talk-launcher"
      data-video-id={youtubeId}
      onClick={openTalkPlayer}
      hidden={hidden}
      className={LAUNCHER}
    >
      <TalkLauncherBadge />
      <span className="min-w-0 flex-1">
        <span
          id="talk-launcher-kicker"
          className="block font-mono text-body uppercase tracking-[0.25em] text-muted-foreground"
        >
          {labels.watch}
        </span>
        <span className="mt-0.5 block text-body leading-snug text-foreground/80">{labels.subtitle}</span>
        <RecordedIn recording={recording} />
      </span>
    </button>
  );
}

/**
 * The Title slide's launcher while the talk is closed; while it plays, the 16:9 talk slot takes its place.
 * Both stay in the static HTML (one hidden), so the slot is there for the player to follow once it opens.
 */
export function TalkLauncher({
  youtubeId,
  labels,
  recording,
}: {
  youtubeId: string;
  labels: TalkPlayerLabels;
  /** An Event recording's language, labelled on the launcher; none for a public Episode's per-locale video. */
  recording?: RecordingLanguage;
}) {
  const { isOpen } = useTalkPlayer();
  return (
    <>
      <LauncherButton youtubeId={youtubeId} labels={labels} recording={recording} hidden={isOpen} />
      {/* mt-16: the strip above the frame where the player's 2rem header sits, plus a gap. */}
      <div
        ref={registerSlot}
        data-slot="talk-slot"
        hidden={!isOpen}
        className="relative mt-16 aspect-video w-full max-w-3xl"
      />
    </>
  );
}

const CONTROL =
  'cursor-pointer rounded px-2 py-0.5 text-body text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-secondary';

function BackToVideo({ label }: { label: string }) {
  const url = useUrlState();
  const onClick = () => {
    url?.navigateTo(TITLE_ANCHOR);
    document.getElementById(TITLE_ANCHOR)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'instant' : 'smooth' });
  };
  return (
    <button type="button" id="talk-player-back" onClick={onClick} className={CONTROL}>
      {label}
    </button>
  );
}

function TalkPlayerControls({ isDocked, labels }: { isDocked: boolean; labels: TalkPlayerLabels }) {
  return (
    <div className="flex items-center gap-1">
      {isDocked && <BackToVideo label={labels.backToVideo} />}
      <button
        type="button"
        id="talk-player-close"
        onClick={closeTalkPlayer}
        className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-secondary"
        aria-label={labels.close}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

/** Opaque on purpose: Slide text must not show through the controls. (This theme has no card token, so bg-background.) */
function TalkPlayerHeader({ isDocked, labels }: { isDocked: boolean; labels: TalkPlayerLabels }) {
  return (
    <div className="flex h-8 items-center justify-between border-b border-border bg-background px-3 text-body">
      <div className="flex min-w-0 items-center gap-2">
        <span className="size-1.5 shrink-0 rounded-full bg-secondary" />
        <span className="truncate font-mono text-body font-semibold tracking-wider text-muted-foreground">
          {labels.heading}
        </span>
      </div>
      <TalkPlayerControls isDocked={isDocked} labels={labels} />
    </div>
  );
}

function TalkPlayerFrame({ youtubeId, title }: { youtubeId: string; title: string }) {
  return (
    <div className="aspect-video w-full bg-overlay">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}

const HOST = 'overflow-hidden rounded-xl border border-border bg-background shadow-2xl';

/**
 * The talk player (FE-009 §8, chrome). Its host is one element, `absolute` against the page while undocked and `fixed` only when docked, that is never re-parented, so
 * the video never reloads: it follows the Title slide's talk slot, and from `lg` docks bottom-left under the table
 * of contents when the active Slide leaves `top`. Below `lg` it never docks, so it follows the slot off screen with
 * the page. While the slot is unmounted (far from the Title slide) an undocked host parks out of sight, still playing.
 */
export function TalkPlayer({ youtubeId, labels }: { youtubeId?: string; labels: TalkPlayerLabels }) {
  const { isOpen, slot } = useTalkPlayer();
  const wide = useWide();
  const activeSlide = useActiveSlide();
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const docked = isOpen && shouldDock({ active: activeSlide, wide });
  useTalkHostPlacement({ host, slot, docked });
  useDockedPageMark(docked);
  if (!isOpen || !youtubeId) return null;
  return (
    <div ref={setHost} id="talk-player" className={cn(HOST, 'z-40 origin-top-left')}>
      <TalkPlayerHeader isDocked={docked} labels={labels} />
      <TalkPlayerFrame youtubeId={youtubeId} title={labels.heading} />
    </div>
  );
}
