import { resolveSiteUrl } from './site-url.pure';

// decision: FE-008 §3
export const SITE_URL = resolveSiteUrl(process.env);
