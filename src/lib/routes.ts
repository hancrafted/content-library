/** Locale-neutral logical paths. Turn one into a URL with `localizePath`. */
export const ROUTES = {
  home: '/',
  /** Section prefix for nav highlighting; there is no page at this path. */
  episodes: '/episode',
  episodeTemplate: '/episode/page-template',
} as const;
