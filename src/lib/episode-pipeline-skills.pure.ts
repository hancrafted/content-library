/*
 * The skills an agent names: `skills`, and `ticket.skills` of an implementor whose skill spawns a subagent per
 * ticket. A name must exist and must be invocable by a model, because the Skill tool refuses a skill with
 * `disable-model-invocation: true` for every agent. Reading the disk is the caller's job.
 */
import { PLUGIN_SKILLS, TICKET_FIELDS } from './episode-pipeline-fields.pure';
import { unless } from './finding.pure';
import { checkMapping, isMapping, stringsOf, type Mapping } from './mapping-fields.pure';

/** The skills on disk, and those among them a model may not invoke. */
export interface SkillContext {
  skills: readonly string[];
  disabled: readonly string[];
}

/** Skill names that do not exist, or that no agent may invoke; a plugin skill (`x:y`) is neither checked nor refused. */
export function checkSkillNames(where: string, skills: readonly string[], context: SkillContext): string[] {
  return skills.flatMap((skill) => [
    ...unless(
      context.skills.includes(skill) || PLUGIN_SKILLS.includes(skill) || skill.includes(':'),
      `${where} names the skill "${skill}", which does not exist.`,
    ),
    ...unless(
      !context.disabled.includes(skill),
      `${where} names the skill "${skill}", which sets disable-model-invocation: true; the Skill tool refuses it for every agent.`,
    ),
  ]);
}

/** An implementor's `ticket` block: the agent and skills of each ticket subagent its skill spawns. */
export function checkTicket(where: string, agent: Mapping, context: SkillContext): string[] {
  if (!Object.hasOwn(agent, 'ticket')) return [];
  if (agent.type === 'reviewer') return [`${where} is a reviewer and has a ticket; only an implementor has one.`];
  if (!isMapping(agent.ticket)) return [];
  return [
    ...checkMapping(`${where} ticket`, agent.ticket, TICKET_FIELDS),
    ...checkSkillNames(`${where} ticket`, stringsOf(agent.ticket.skills), context),
  ];
}
