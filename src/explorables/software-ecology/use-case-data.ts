/*
 * The shipped use cases of the software ecology Explorable, imported statically (FE-012-explorables §1): each one's
 * master data, its words in both locales, and the role catalog they share.
 */
import gateWordsDe from './gate.words.de.yml';
import gateWords from './gate.words.yml';
import gate from './gate.yml';
import roles from './roles.yml';
import type { Bundle, RoleDef, UseCaseData } from './software-ecology.types';
import teamsWordsDe from './teams.words.de.yml';
import teamsWords from './teams.words.yml';
import teams from './teams.yml';
import tireWordsDe from './tire.words.de.yml';
import tireWords from './tire.words.yml';
import tire from './tire.yml';
import { readCatalog, readUseCase, readWords } from './use-case-file.ts';

export const BUILTIN = ['tire', 'gate', 'teams'] as const;
export type BuiltinId = (typeof BUILTIN)[number];

const SOURCES: Readonly<Record<BuiltinId, { data: string; en: string; de: string }>> = {
  tire: { data: tire, en: tireWords, de: tireWordsDe },
  gate: { data: gate, en: gateWords, de: gateWordsDe },
  teams: { data: teams, en: teamsWords, de: teamsWordsDe },
};

export const CATALOG: Readonly<Record<string, RoleDef>> = readCatalog(roles);

/** The catalog with a use case's role overrides on top. */
export const rolesOf = (data: UseCaseData): Readonly<Record<string, RoleDef>> => {
  const out: Record<string, RoleDef> = { ...CATALOG };
  for (const [k, v] of Object.entries(data.roles ?? {})) out[k] = { ...CATALOG[k], ...v } as RoleDef;
  return out;
};

/** Everything one shipped use case needs: master data, the roles it uses, and its words per locale. */
export const builtinBundle = (id: string): Bundle => {
  const src = SOURCES[id as BuiltinId];
  if (!src) throw new Error(`no built-in use case ${id}`);
  const data = readUseCase(src.data, Object.keys(CATALOG));
  return { data, roles: rolesOf(data), words: { en: readWords(src.en), de: readWords(src.de) }, source: 'built in' };
};
