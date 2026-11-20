export const SOCIAL_LINKS = [
  { id: 'youtube', href: 'https://www.youtube.com/@hancraftedhq' },
  { id: 'github', href: 'https://github.com/hancrafted' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/han-che/' },
] as const;

export type SocialId = (typeof SOCIAL_LINKS)[number]['id'];
