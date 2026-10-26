/**
 * The id of the Episode portal root the Content area hosts (FE-009 §2.4, §8):
 * popovers portal into it so a Slide wrapper's stacking context can't trap them
 * under the chrome. Lives in lib so a Slide's `*.client.tsx` widget can reach it.
 */
export const EPISODE_PORTAL_ROOT_ID = 'episode-portal-root';
