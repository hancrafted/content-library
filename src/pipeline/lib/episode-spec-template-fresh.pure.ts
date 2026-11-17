import { createHash } from 'node:crypto';

// decision: docs/adr/0011-episode-design-is-reviewed-as-a-static-html-spec.md
export interface TemplateSources {
  skill: Readonly<Record<string, string>>;
  calibration: string;
}

export const HASH_META = 'spec-template-source-hash';

const REGENERATING = /^## Regenerating the template\s*$/m;
const HEADING = /^## /m;

const lf = (text: string): string => text.replaceAll('\r\n', '\n');

function calibrationWithoutRegenerating(calibration: string): string {
  const text = lf(calibration);
  const start = REGENERATING.exec(text);
  if (!start) return text;
  const after = text.slice(start.index + start[0].length);
  const next = HEADING.exec(after);
  return text.slice(0, start.index) + (next ? after.slice(next.index) : '');
}

export function templateHash({ skill, calibration }: TemplateSources): string {
  const hash = createHash('sha256');
  const entries = [
    ...Object.keys(skill)
      .sort()
      .map((file) => [`skill:${file}`, lf(skill[file] ?? '')] as const),
    ['calibration', calibrationWithoutRegenerating(calibration)] as const,
  ];
  for (const [name, text] of entries) hash.update(`${name}\0${text.length}\0${text}\0`);
  return hash.digest('hex');
}

export function recordedTemplateHash(template: string): string | undefined {
  const tag = new RegExp(`<meta\\s[^>]*name="${HASH_META}"[^>]*>`).exec(template);
  return tag ? /content="([^"]*)"/.exec(tag[0])?.[1] : undefined;
}

const HOW =
  'Regenerate it as the "Regenerating the template" section of skills/new-episode/references/spec-calibration.md says; ' +
  'the hash of the current sources is printed by `npm run episode:spec-template-hash`.';

export function templateStaleFindings(template: string, sources: TemplateSources): string[] {
  const recorded = recordedTemplateHash(template);
  if (recorded === undefined) return [`The Spec template records no hash (<meta name="${HASH_META}">). ${HOW}`];
  const current = templateHash(sources);
  if (recorded === current) return [];
  return [
    `The Spec template is stale: to-review or the Spec calibration changed since it was generated ` +
      `(recorded ${recorded}, current ${current}). ${HOW}`,
  ];
}
