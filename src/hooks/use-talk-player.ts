import { useSyncExternalStore } from 'react';

/** The talk player's one page-wide store: whether it plays, and the Title slide's slot it sits in while undocked. */
export interface TalkPlayerState {
  readonly isOpen: boolean;
  /** The Title slide's talk slot, where the player sits while undocked; `null` until it has mounted. */
  readonly slot: HTMLElement | null;
}

let talkState: TalkPlayerState = { isOpen: false, slot: null };
const talkListeners = new Set<() => void>();

function notify() {
  for (const listener of talkListeners) {
    listener();
  }
}

export function closeTalkPlayer() {
  talkState = { ...talkState, isOpen: false };
  notify();
}

export function openTalkPlayer() {
  talkState = { ...talkState, isOpen: true };
  notify();
}

export function registerSlot(slot: HTMLElement | null) {
  if (talkState.slot === slot) return;
  talkState = { ...talkState, slot };
  notify();
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

const SERVER_SNAPSHOT: TalkPlayerState = { isOpen: false, slot: null };
function getServerSnapshot(): TalkPlayerState {
  return SERVER_SNAPSHOT;
}

export function useTalkPlayer(): TalkPlayerState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
