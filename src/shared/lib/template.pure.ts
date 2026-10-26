/** A value a template placeholder takes. */
export type TemplateValues = Readonly<Record<string, string | number>>;

const PLACEHOLDER_RE = /\{(\w+)\}/g;

/**
 * Fills each `{name}` in a template read from the Translation file: text a
 * client component completes at runtime (a count it only knows after the
 * visitor acts), and words a server component reads from its owner's files
 * without next-intl. A placeholder with no value stays as written, so the gap
 * shows on the page instead of an empty word.
 */
export function fillTemplate(template: string, values: TemplateValues): string {
  return template.replace(PLACEHOLDER_RE, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : placeholder,
  );
}
