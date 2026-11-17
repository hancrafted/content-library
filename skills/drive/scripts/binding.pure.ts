// The Binding (design-ADR 0027): the DRIVE phases bound to a project's skills, n:m, each phase with the model its
// Subagents run on, and the one agent type every agent uses. Pure: text in, text or a validated Binding out.
import { type Document, isMap, isSeq, parseDocument, type YAMLMap, type YAMLSeq } from 'yaml';
import catalogData from '../catalog/catalog.json' with { type: 'json' };
import { isRecord, isText, openMapping } from './yaml.pure.ts';

export const PHASES = ['define', 'reason', 'implement', 'verify', 'evolve'] as const;
export type Phase = (typeof PHASES)[number];

/** A Model tier: `mid` the everyday model, `top` the strongest; `project.yml` maps each to a provider's model. */
export const TIERS = ['mid', 'top'] as const;
export type Tier = (typeof TIERS)[number];
export const isTier = (value: unknown): value is Tier => (TIERS as readonly unknown[]).includes(value);

/** The tier each phase's Subagents run on when nothing else says so: reasoning and verifying take the top one. */
export const PHASE_TIERS: Readonly<Record<Phase, Tier>> = {
  define: 'mid',
  reason: 'top',
  implement: 'mid',
  verify: 'top',
  evolve: 'mid',
};
export const DEFAULT_AGENT_TYPE = 'general-purpose';

/** Where the lockfile or a skill folder found a skill. `source` is the lockfile's source, null when it names none. */
export interface DetectedSkill {
  name: string;
  origin: 'installed' | 'authored';
  source: string | null;
}

/** The vendor catalog, as data: which phases each skill of the vendor's source serves, and where decision docs live. */
export const CATALOG = {
  source: catalogData.source,
  skills: catalogData.skills as Readonly<Record<string, readonly Phase[]>>,
  decisionFolders: catalogData.decisionFolders as readonly string[],
};

/** The phases a detected skill serves by the catalog; none for an authored skill or an unknown one. A skill found only
 * by folder names no source, so it is matched by name. */
export function phasesOf(skill: DetectedSkill): readonly Phase[] {
  if (skill.origin !== 'installed' || (skill.source !== null && skill.source !== CATALOG.source)) return [];
  return Object.hasOwn(CATALOG.skills, skill.name) ? (CATALOG.skills[skill.name] ?? []) : [];
}

/** One list of detected skills from the groups, the first sighting of a name winning, minus `exclude`, sorted by name. */
export function mergeDetected(groups: readonly (readonly DetectedSkill[])[], exclude: string): DetectedSkill[] {
  const found = new Map<string, DetectedSkill>();
  for (const skill of groups.flat()) if (skill.name !== exclude && !found.has(skill.name)) found.set(skill.name, skill);
  return [...found.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export interface PhaseBinding {
  /** The Model tier; `project.yml` resolves it to a model per provider. */
  model: Tier;
  skills: string[];
  /** No skill bound: the Orchestrator does the phase itself. */
  inline: boolean;
}

export interface Binding {
  agentType: string;
  phases: Record<Phase, PhaseBinding>;
}

export interface SeedOptions {
  agentType?: string;
  /** Seeds every phase with this tier instead of its preset. */
  tier?: Tier;
}

const HEADER = [
  " The Binding (design-ADR 0027): which skills serve each DRIVE phase (n:m), the model tier each phase's Subagents run on,",
  ' and the agent type every agent uses. `drive setup` seeds it and adds newly installed skills; you own every edit.',
  ' `skills` and `model` (a tier, mid or top, mapped to models in project.yml) per phase are yours to change;',
  ' `seen` lists the skills setup has already offered, so one you',
  ' remove here is not added back.',
].join('\n');

/** Written beside an empty `skills` list; removed again once a skill is bound. */
export const INLINE_NOTE = ' none bound: the Orchestrator does this phase inline';

function mapAt(parent: YAMLMap, key: string, doc: Document): YAMLMap {
  const found = parent.get(key, true);
  if (isMap(found)) return found;
  const created = doc.createNode({}) as YAMLMap;
  parent.set(key, created);
  return created;
}

function seqAt(parent: YAMLMap, key: string, doc: Document): YAMLSeq {
  const found = parent.get(key, true);
  if (isSeq(found)) return found;
  const created = doc.createNode([]) as YAMLSeq;
  parent.set(key, created);
  return created;
}

const names = (seq: YAMLSeq): string[] => seq.items.map((item) => String((item as { value?: unknown }).value ?? item));

/** Fills what the file lacks: the agent type, and a model and a skills list for every phase. */
function seedMissing(doc: Document, root: YAMLMap, seed: SeedOptions): void {
  if (!root.has('agentType')) root.set('agentType', seed.agentType ?? DEFAULT_AGENT_TYPE);
  const phases = mapAt(root, 'phases', doc);
  for (const phase of PHASES) {
    const node = mapAt(phases, phase, doc);
    if (!node.has('model')) node.set('model', seed.tier ?? PHASE_TIERS[phase]);
    seqAt(node, 'skills', doc);
  }
}

/** Binds each skill not offered before to the phases the catalog gives it, then records it as offered. */
function offerNewSkills(doc: Document, root: YAMLMap, detected: readonly DetectedSkill[]): void {
  const phases = mapAt(root, 'phases', doc);
  const seen = seqAt(root, 'seen', doc);
  const offered = new Set(names(seen));
  for (const skill of detected.filter((candidate) => !offered.has(candidate.name))) {
    for (const phase of phasesOf(skill)) {
      const skills = seqAt(mapAt(phases, phase, doc), 'skills', doc);
      if (!names(skills).includes(skill.name)) skills.add(doc.createNode(skill.name));
    }
    seen.add(doc.createNode(skill.name));
  }
}

/** An empty `skills` list gets the inline note and a flow style; a bound one loses a note setup wrote. */
function settleInlineNote(skills: YAMLSeq): void {
  const empty = skills.items.length === 0;
  skills.flow = empty;
  if (empty && skills.comment === undefined) skills.comment = INLINE_NOTE;
  if (!empty && skills.comment === INLINE_NOTE) skills.comment = undefined;
}

/**
 * The binding file after a setup run. With no `existing` text it seeds one; with it, every value the human wrote is
 * kept and only skills not offered before are added to the phases the catalog gives them. Throws a message naming
 * what is wrong when the existing text is not a binding.
 */
export function updateBinding(
  existing: string | null,
  detected: readonly DetectedSkill[],
  seed: SeedOptions = {},
): string {
  const { doc, root } = openMapping(existing, 'binding');
  if (existing === null) doc.commentBefore = HEADER;
  seedMissing(doc, root, seed);
  offerNewSkills(doc, root, detected);
  const phases = mapAt(root, 'phases', doc);
  for (const phase of PHASES) settleInlineNote(seqAt(mapAt(phases, phase, doc), 'skills', doc));
  return doc.toString();
}

/** One phase's binding from its parsed value, or what is wrong with it. */
function readPhase(phase: Phase, value: unknown): PhaseBinding | { error: string } {
  if (!isRecord(value)) return { error: `phases.${phase} must be a mapping` };
  const skills = value.skills ?? [];
  if (!isTier(value.model)) return { error: `phases.${phase}.model must be a tier: ${TIERS.join(' or ')}` };
  if (!Array.isArray(skills) || !skills.every((item) => typeof item === 'string'))
    return { error: `phases.${phase}.skills must be a list of skill names` };
  return { model: value.model, skills: skills as string[], inline: skills.length === 0 };
}

/** The five phases of a parsed binding, or what is wrong with the first bad one. */
function readPhases(root: Record<string, unknown>): Record<Phase, PhaseBinding> | { error: string } {
  const section = isRecord(root.phases) ? root.phases : {};
  const phases = {} as Record<Phase, PhaseBinding>;
  for (const phase of PHASES) {
    const read = readPhase(phase, section[phase]);
    if ('error' in read) return read;
    phases[phase] = read;
  }
  return phases;
}

/** The Binding a file holds, or the first thing wrong with it. */
export function readBinding(text: string): Binding | { error: string } {
  const doc = parseDocument(text);
  if (doc.errors.length > 0) return { error: `binding is not valid YAML: ${doc.errors[0]?.message}` };
  const root: unknown = doc.toJS();
  return isRecord(root) ? readRoot(root) : { error: 'binding must be a mapping' };
}

function readRoot(root: Record<string, unknown>): Binding | { error: string } {
  const { agentType } = root;
  if (!isText(agentType)) return { error: 'agentType must be a non-empty string' };
  const phases = readPhases(root);
  return 'error' in phases ? phases : { agentType, phases };
}
