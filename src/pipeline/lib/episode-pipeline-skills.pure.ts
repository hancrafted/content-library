import { unless } from './finding.pure';

export interface SkillContext {
  skills: readonly string[];
  disabled: readonly string[];
}

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
