// The Design archive's page shell, shared by the Episode page and the dashboard.

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export interface Head {
  title: string;
  /** Everything else the head carries: styles, the stylesheet link, scripts. */
  head: string;
}

export function htmlPage({ title, head }: Head, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
${head}
</head>
<body>
${body}
</body>
</html>
`;
}
