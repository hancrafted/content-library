/*
 * The shipped use cases of the software ecology Explorable, imported statically (FE-012-explorables §1): each one's
 * master data, its words in both locales, and the role catalog they share.
 */
import gateWordsDe from './gate.words.de.yml';
import gateWords from './gate.words.yml';
import gate from './gate.yml';
import roles from './roles.yml';
import type { Bundle, RoleDef } from './software-ecology.types';
import teamsWordsDe from './teams.words.de.yml';
import teamsWords from './teams.words.yml';
import teams from './teams.yml';
import tireWordsDe from './tire.words.de.yml';
import tireWords from './tire.words.yml';
import tire from './tire.yml';
import { bundleOf, readCatalog } from './use-case-file.ts';
import type { UseCaseTexts } from './use-case-texts.pure.ts';

export const BUILTIN = ['tire', 'gate', 'teams'] as const;
export type BuiltinId = (typeof BUILTIN)[number];

const SOURCES: Readonly<Record<BuiltinId, UseCaseTexts>> = {
  tire: { data: tire, en: tireWords, de: tireWordsDe },
  gate: { data: gate, en: gateWords, de: gateWordsDe },
  teams: { data: teams, en: teamsWords, de: teamsWordsDe },
};

export const CATALOG: Readonly<Record<string, RoleDef>> = readCatalog(roles);

/** Everything one shipped use case needs: master data, the roles it uses, and its words per locale. */
export const builtinBundle = (id: string): Bundle => {
  const src = SOURCES[id as BuiltinId];
  if (!src) throw new Error(`no built-in use case ${id}`);
  return bundleOf(src, CATALOG);
};
