// spec: docs/features/hosting.md#temporary-the-old-githubio-urls
function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

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
  readonly file: string;
  readonly target: string;
}

export function redirectStubPlan(files: readonly string[], origin: string): StubEntry[] {
  const base = origin.replace(/\/+$/, '');
  return files
    .filter((file) => file.endsWith('.html') && !file.startsWith('_next/'))
    .map((file) => {
      const path = file === '404.html' ? '' : file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
      return { file, target: path === '' ? `${base}/` : `${base}/${path}/` };
    });
}
