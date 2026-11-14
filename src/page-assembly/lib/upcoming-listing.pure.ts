/**
 * Whether the Episode overview lists and links Upcoming Episodes: always under `next dev`, and in a build whose
 * deploy sets `LIST_UPCOMING_EPISODES=true`, which only the Cloudflare preview of a pull request does
 * (docs/features/hosting.md). A production build leaves them out.
 */
export function upcomingListed(env: { readonly NODE_ENV?: string; readonly LIST_UPCOMING_EPISODES?: string }): boolean {
  return env.NODE_ENV === 'development' || env.LIST_UPCOMING_EPISODES === 'true';
}
