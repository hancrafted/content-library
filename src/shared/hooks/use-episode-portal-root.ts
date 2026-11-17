import { EPISODE_PORTAL_ROOT_ID } from '@/shared/lib/episode-portal.pure';
import { useSyncExternalStore } from 'react';

const NO_SUBSCRIPTION = () => () => undefined;
const ON_SERVER = (): HTMLElement | null => null;

// decision: FE-009 §8
export function useEpisodePortalRoot(): HTMLElement | null {
  return useSyncExternalStore(NO_SUBSCRIPTION, () => document.getElementById(EPISODE_PORTAL_ROOT_ID), ON_SERVER);
}
