import { resolveSiteUrl } from './page-metadata.pure';

/** The absolute URL this build is served from (FE-008 §3). Read once, at build time. */
export const SITE_URL = resolveSiteUrl(process.env);
