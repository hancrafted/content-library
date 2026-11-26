export type TemplateValues = Readonly<Record<string, string | number>>;

const PLACEHOLDER_RE = /\{(\w+)\}/g;

export function fillTemplate(template: string, values: TemplateValues): string {
  return template.replace(PLACEHOLDER_RE, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : placeholder,
  );
}

export type TemplateSegment<Slot extends string> = { readonly text: string } | { readonly slot: Slot };

export function templateSegments<Slot extends string>(
  template: string,
  slots: readonly Slot[],
): readonly TemplateSegment<Slot>[] {
  const isSlot = (name: string): name is Slot => (slots as readonly string[]).includes(name);
  const segments: TemplateSegment<Slot>[] = [];
  let textStart = 0;
  for (const match of template.matchAll(PLACEHOLDER_RE)) {
    const name = match[1] ?? '';
    if (!isSlot(name)) continue;
    if (match.index > textStart) segments.push({ text: template.slice(textStart, match.index) });
    segments.push({ slot: name });
    textStart = match.index + match[0].length;
  }
  if (textStart < template.length) segments.push({ text: template.slice(textStart) });
  return segments;
}
