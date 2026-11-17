// decision: FE-003 §2.2
export function externalHref(url: string): string {
  if (!url.startsWith('https://'))
    throw new Error(`External link must start with https:// — got ${JSON.stringify(url)}`);
  return url;
}
