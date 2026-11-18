import { LOCALES } from '@/shared/lib/locale.pure';
import { createHash } from 'node:crypto';
import type { InstanceTrail } from './episode-instance';
import type { InstanceBase, SlideOverride } from './episode-instance.pure';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
export const PIN_LOCK_FILE = 'overrides.lock.json';

export type PinLock = Readonly<Record<string, Readonly<Record<string, string>>>>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const ABSENT = 'absent';

export function fingerprintOf(value: unknown): string {
  if (value === undefined) return ABSENT;
  return createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 12);
}

function leafPaths(override: unknown, at: readonly string[] = []): string[][] {
  if (!isRecord(override)) return override === undefined ? [] : [[...at]];
  return Object.entries(override).flatMap(([key, value]) => leafPaths(value, [...at, key]));
}

const valueAt = (text: unknown, path: readonly string[]): unknown =>
  path.reduce<unknown>((value, key) => (isRecord(value) ? value[key] : undefined), text);

function baseSlideOf(base: InstanceBase, slug: string) {
  return [base.title, ...base.sections.flat()].find((slide) => slide?.slug === slug);
}

interface Pinned {
  readonly slide: string;
  readonly path: string;
  readonly fingerprint: string;
}

function pinnedOf({ base, layers }: Pick<InstanceTrail<InstanceBase>, 'base' | 'layers'>): Pinned[] {
  const seen = new Set<string>();
  return layers.flatMap((layer) =>
    Object.entries((layer.slides ?? {}) as Readonly<Record<string, SlideOverride>>).flatMap(([slide, override]) => {
      const home = baseSlideOf(base, slide);
      if (home === undefined) return [];
      return LOCALES.flatMap((locale) =>
        leafPaths(override.messages?.[locale]).flatMap((path) => {
          const key = [slide, locale, ...path].join('.');
          if (seen.has(key)) return [];
          seen.add(key);
          return [
            {
              slide,
              path: [locale, ...path].join('.'),
              fingerprint: fingerprintOf(valueAt(home.messages[locale], path)),
            },
          ];
        }),
      );
    }),
  );
}

export function pinsOf(trail: Pick<InstanceTrail<InstanceBase>, 'base' | 'layers'>): PinLock {
  const lock: Record<string, Record<string, string>> = {};
  for (const { slide, path, fingerprint } of pinnedOf(trail)) (lock[slide] ??= {})[path] = fingerprint;
  return lock;
}

export function pinFindings(
  instance: string,
  trail: Pick<InstanceTrail<InstanceBase>, 'base' | 'layers'>,
  lock: PinLock | undefined,
): string[] {
  const command = `npm run overrides:pin -- ${instance}`;
  return pinnedOf(trail).flatMap(({ slide, path, fingerprint }) => {
    const where = `Episode instance "${instance}", Slide "${slide}", path "${path}"`;
    const pinned = lock?.[slide]?.[path];
    if (pinned === undefined) return [`${where}: the override is not pinned: run \`${command}\``];
    if (pinned === fingerprint) return [];
    return [
      `${where}: the Base Episode's default changed under the override: run \`${command}\` to keep the override, or delete the override to show the new default`,
    ];
  });
}
