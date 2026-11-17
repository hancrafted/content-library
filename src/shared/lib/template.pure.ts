export type TemplateValues = Readonly<Record<string, string | number>>;

const PLACEHOLDER_RE = /\{(\w+)\}/g;

export function fillTemplate(template: string, values: TemplateValues): string {
  return template.replace(PLACEHOLDER_RE, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : placeholder,
  );
}
