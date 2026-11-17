import { useSyncExternalStore } from 'react';

const NO_UNSUBSCRIBE = () => undefined;
const never = () => NO_UNSUBSCRIBE;

export function useSearch(): string {
  return useSyncExternalStore(
    never,
    () => window.location.search,
    () => '',
  );
}
