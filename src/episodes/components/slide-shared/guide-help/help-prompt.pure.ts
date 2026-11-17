import { fillTemplate } from '@/shared/lib/template.pure';

export interface HelpPromptInput {
  readonly os: string;
  readonly agent: string;
  readonly step: string;
  readonly error: string;
  readonly noError: string;
}

export function helpPrompt(template: string, input: HelpPromptInput): string {
  const error = input.error.trim();
  return fillTemplate(template, {
    os: input.os,
    agent: input.agent,
    step: input.step,
    error: error === '' ? input.noError : error,
  });
}
