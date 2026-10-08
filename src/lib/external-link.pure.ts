/**
 * The one way a URL held in data becomes an `href` (FE-003 §1.4): only `https:`
 * passes, so a typo in an Episode record cannot become `javascript:` or `http:`.
 */
export function externalHref(url: string): string {
  if (!url.startsWith('https://'))
    throw new Error(`External link must start with https:// — got ${JSON.stringify(url)}`);
  return url;
}
