/** The one list of the site's social profiles, in display order; header and About both render it. */
export const SOCIAL_LINKS = [
  { id: 'youtube', href: 'https://www.youtube.com/@codeadjacent' },
  { id: 'github', href: 'https://github.com/hancrafted' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/han-che/' },
] as const;

export type SocialId = (typeof SOCIAL_LINKS)[number]['id'];
