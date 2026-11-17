// spec: docs/features/hosting.md#how-it-deploys
export function upcomingListed(env: { readonly NODE_ENV?: string; readonly LIST_UPCOMING_EPISODES?: string }): boolean {
  return env.NODE_ENV === 'development' || env.LIST_UPCOMING_EPISODES === 'true';
}
