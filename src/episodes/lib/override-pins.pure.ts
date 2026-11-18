import { LOCALES, type Locale } from '@/shared/lib/locale.pure';
import { createHash } from 'node:crypto';
import type { InstanceTrail } from './episode-instance';
import type { InstanceBase, SlideOverride, TitleOverride } from './episode-instance.pure';

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

export const TITLE_PIN = '@title';

interface Pinned {
  readonly owner: string;
  readonly path: string;
  readonly fingerprint: string;
}

type Trail = Pick<InstanceTrail<InstanceBase>, 'base' | 'layers'>;

const textPins = (
  owner: string,
  defaults: Readonly<Record<Locale, object>>,
  override: Partial<Readonly<Record<Locale, object>>> | undefined,
): Pinned[] =>
  LOCALES.flatMap((locale) =>
    leafPaths(override?.[locale]).map((path) => ({
      owner,
      path: [locale, ...path].join('.'),
      fingerprint: fingerprintOf(valueAt(defaults[locale], path)),
    })),
  );

function titlePins(base: InstanceBase, title: TitleOverride | undefined): Pinned[] {
  if (title === undefined) return [];
  const notes =
    title.notes === undefined ? [] : [{ owner: TITLE_PIN, path: 'notes', fingerprint: fingerprintOf(base.notes) }];
  return [...notes, ...textPins(TITLE_PIN, base.messages, title.messages)];
}

function slidePins(base: InstanceBase, slug: string, override: SlideOverride): Pinned[] {
  const home = baseSlideOf(base, slug);
  if (home === undefined) return [];
  const presentation =
    override.presentation === undefined
      ? []
      : [{ owner: slug, path: 'presentation', fingerprint: fingerprintOf(home.presentation) }];
  const presets = Object.keys(override.explorables ?? {}).map((name) => ({
    owner: slug,
    path: `explorables.${name}`,
    fingerprint: fingerprintOf(home.explorables?.[name]),
  }));
  return [...textPins(slug, home.messages, override.messages), ...presentation, ...presets];
}

function pinnedOf({ base, layers }: Trail): Pinned[] {
  const seen = new Set<string>();
  return layers
    .flatMap((layer) => [
      ...titlePins(base, layer.title),
      ...Object.entries((layer.slides ?? {}) as Readonly<Record<string, SlideOverride>>).flatMap(([slug, override]) =>
        slidePins(base, slug, override),
      ),
    ])
    .filter(({ owner, path }) => {
      const key = JSON.stringify([owner, path]);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function pinsOf(trail: Trail): PinLock {
  const lock: Record<string, Record<string, string>> = {};
  for (const { owner, path, fingerprint } of pinnedOf(trail)) (lock[owner] ??= {})[path] = fingerprint;
  return lock;
}

const whereOf = (instance: string, owner: string, path: string): string =>
  `Episode instance "${instance}", ${owner === TITLE_PIN ? 'Title' : `Slide "${owner}"`}, path "${path}"`;

export function pinFindings(instance: string, trail: Trail, lock: PinLock | undefined): string[] {
  const command = `npm run overrides:pin -- ${instance}`;
  const pinned = pinnedOf(trail);
  const stale = pinned.flatMap(({ owner, path, fingerprint }) => {
    const where = whereOf(instance, owner, path);
    const held = lock?.[owner]?.[path];
    if (held === undefined) return [`${where}: the override is not pinned: run \`${command}\``];
    if (held === fingerprint) return [];
    if (fingerprint === ABSENT)
      return [
        `${where}: the Base Episode no longer has this path: delete the override, or run \`${command}\` to keep it as an addition`,
      ];
    return [
      `${where}: the Base Episode's default changed under the override: run \`${command}\` to keep the override, or delete the override to show the new default`,
    ];
  });
  const live = new Set(pinned.map(({ owner, path }) => JSON.stringify([owner, path])));
  const orphans = Object.entries(lock ?? {}).flatMap(([owner, paths]) =>
    Object.keys(paths)
      .filter((path) => !live.has(JSON.stringify([owner, path])))
      .map(
        (path) => `${whereOf(instance, owner, path)}: the lock pins a path no override replaces: run \`${command}\``,
      ),
  );
  return [...stale, ...orphans];
}
