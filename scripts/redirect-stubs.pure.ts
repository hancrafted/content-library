// The temporary GitHub Pages deploy (docs/features/hosting.md): the site moved to Cloudflare Pages, so the old
// github.io URLs publish only these stubs, one per exported page, each sending visitors and crawlers to the same
// path on the new origin. GitHub Pages cannot send a 301, so meta refresh plus canonical is the closest it gets.

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A page that redirects to `target` at once and names it canonical. */
export function redirectStubHtml(target: string): string {
  const url = escapeAttribute(target);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${url}">
<link rel="canonical" href="${url}">
</head>
<body><p>This page moved to <a href="${url}">${url}</a>.</p></body>
</html>
`;
}

export interface StubEntry {
  /** The file to write, relative to the stub root, mirroring the exported page. */
  readonly file: string;
  /** The absolute URL on the new origin. */
  readonly target: string;
}

/**
 * Which files of `out/` are pages, and where each stub points: the whole rule lives here. A page is an `.html` file
 * outside `_next/`; any other file is skipped. `404.html` is kept on purpose and sent to the home page, because GitHub
 * Pages serves it for every unknown old URL, and the home page is the best place to land those visitors.
 */
export function redirectStubPlan(files: readonly string[], origin: string): StubEntry[] {
  const base = origin.replace(/\/+$/, '');
  return files
    .filter((file) => file.endsWith('.html') && !file.startsWith('_next/'))
    .map((file) => {
      const path = file === '404.html' ? '' : file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
      return { file, target: path === '' ? `${base}/` : `${base}/${path}/` };
    });
}
