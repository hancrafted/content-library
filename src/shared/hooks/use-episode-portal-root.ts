import { EPISODE_PORTAL_ROOT_ID } from '@/shared/lib/episode-portal.pure';
import { useSyncExternalStore } from 'react';

/** The root never moves while a page lives, so there is nothing to subscribe to. */
const NO_SUBSCRIPTION = () => () => undefined;
const ON_SERVER = (): HTMLElement | null => null;

/**
 * The Episode portal root (FE-009 §8), or `null` on the server and outside an
 * Episode page. Pass it to `createPortal`; the root is `pointer-events-none`,
 * so a popover sets `pointer-events-auto` on itself.
 */
export function useEpisodePortalRoot(): HTMLElement | null {
  return useSyncExternalStore(NO_SUBSCRIPTION, () => document.getElementById(EPISODE_PORTAL_ROOT_ID), ON_SERVER);
}
