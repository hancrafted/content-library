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
  return template
    .split(/(\{\w+\})/)
    .filter((part) => part !== '')
    .map((part) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      return name !== undefined && isSlot(name) ? { slot: name } : { text: part };
    });
}
