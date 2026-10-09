'use client';

import { useActiveSlide } from '@/hooks/use-url-state';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

export interface TalkPlayerLabels {
  readonly watch: string;
  readonly playing: string;
  readonly subtitle: string;
  readonly heading: string;
  readonly shrink: string;
  readonly expand: string;
  readonly close: string;
}

interface TalkPlayerState {
  readonly isOpen: boolean;
  readonly isDocked: boolean;
}

let talkState: TalkPlayerState = { isOpen: false, isDocked: false };
const talkListeners = new Set<() => void>();

function notify() {
  for (const listener of talkListeners) {
    listener();
  }
}

function closeTalkPlayer() {
  talkState = { isOpen: false, isDocked: false };
  notify();
}

function toggleTalkPlayer() {
  talkState = { isOpen: !talkState.isOpen, isDocked: false };
  notify();
}

function toggleDockTalkPlayer() {
  talkState = { ...talkState, isDocked: !talkState.isDocked };
  notify();
}

function dockTalkPlayer() {
  if (!talkState.isDocked) {
    talkState = { ...talkState, isDocked: true };
    notify();
  }
}

function subscribe(listener: () => void) {
  talkListeners.add(listener);
  return () => {
    talkListeners.delete(listener);
  };
}

function getSnapshot(): TalkPlayerState {
  return talkState;
}

const SERVER_SNAPSHOT: TalkPlayerState = { isOpen: false, isDocked: false };
function getServerSnapshot(): TalkPlayerState {
  return SERVER_SNAPSHOT;
}

function useTalkPlayer(): TalkPlayerState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function TalkLauncherBadge() {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FF0000]/10 text-[#FF0000] transition-transform group-hover:scale-110">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </span>
  );
}

export function TalkLauncher({ youtubeId, labels }: { youtubeId: string; labels: TalkPlayerLabels }) {
  const { isOpen } = useTalkPlayer();
  const onClick = useCallback(() => {
    toggleTalkPlayer();
  }, []);

  return (
    <button
      type="button"
      id="talk-launcher"
      data-video-id={youtubeId}
      onClick={onClick}
      className="group mt-8 flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 text-left shadow-xs transition-all hover:border-secondary hover:bg-secondary/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary cursor-pointer"
    >
      <TalkLauncherBadge />
      <span className="min-w-0 flex-1">
        <span
          id="talk-launcher-kicker"
          className="block font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground"
        >
          {isOpen ? labels.playing : labels.watch}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-foreground/80">{labels.subtitle}</span>
      </span>
    </button>
  );
}

function TalkPlayerControls({ isDocked, labels }: { isDocked: boolean; labels: TalkPlayerLabels }) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        id="talk-player-resize"
        onClick={toggleDockTalkPlayer}
        className="cursor-pointer rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {isDocked ? labels.expand : labels.shrink}
      </button>
      <button
        type="button"
        id="talk-player-close"
        onClick={closeTalkPlayer}
        className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
        aria-label={labels.close}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

function TalkPlayerHeader({ isDocked, labels }: { isDocked: boolean; labels: TalkPlayerLabels }) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/60 px-3 py-1.5 text-xs">
      <div className="flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-secondary" />
        <span className="font-mono text-[0.65rem] font-semibold tracking-wider text-muted-foreground">
          {labels.heading}
        </span>
      </div>
      <TalkPlayerControls isDocked={isDocked} labels={labels} />
    </div>
  );
}

function TalkPlayerFrame({ youtubeId, title }: { youtubeId: string; title: string }) {
  return (
    <div className="aspect-video w-full bg-black">
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

export function TalkPlayer({ youtubeId, labels }: { youtubeId?: string; labels: TalkPlayerLabels }) {
  const { isOpen, isDocked } = useTalkPlayer();
  const activeSlide = useActiveSlide();

  useEffect(() => {
    if (activeSlide && activeSlide !== 'top') {
      dockTalkPlayer();
    }
  }, [activeSlide]);

  if (!isOpen || !youtubeId) return null;

  return (
    <div
      id="talk-player"
      className={cn(
        'fixed bottom-4 right-4 z-40 overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-[width] duration-500 ease-out motion-reduce:transition-none',
        isDocked ? 'w-[min(22rem,calc(100vw-2rem))]' : 'w-[min(46rem,calc(100vw-2rem))]',
      )}
    >
      <TalkPlayerHeader isDocked={isDocked} labels={labels} />
      <TalkPlayerFrame youtubeId={youtubeId} title={labels.heading} />
    </div>
  );
}
