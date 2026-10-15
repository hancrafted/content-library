/*
 * The skills an agent names in `skills`. A name must exist and must be invocable by a model, because the Skill tool
 * refuses a skill with `disable-model-invocation: true` for every agent. Reading the disk is the caller's job.
 */
import { unless } from './finding.pure';

/** The skills on disk, and those among them a model may not invoke. */
export interface SkillContext {
  skills: readonly string[];
  disabled: readonly string[];
}

/** Skill names that do not exist, or that no agent may invoke; a plugin skill (`x:y`) is neither checked nor refused. */
export function checkSkillNames(where: string, skills: readonly string[], context: SkillContext): string[] {
  return skills.flatMap((skill) => [
    ...unless(
      context.skills.includes(skill) || skill.includes(':'),
      `${where} names the skill "${skill}", which does not exist.`,
    ),
    ...unless(
      !context.disabled.includes(skill),
      `${where} names the skill "${skill}", which sets disable-model-invocation: true; the Skill tool refuses it for every agent.`,
    ),
  ]);
}
