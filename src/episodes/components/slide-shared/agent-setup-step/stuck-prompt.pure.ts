import { fillTemplate } from '@/shared/lib/template.pure';

/** What the troubleshooting box's prompt wraps: the picks, the step, and what the viewer pasted. */
export interface StuckInput {
  readonly os: string;
  readonly agent: string;
  readonly step: string;
  /** The pasted error, as typed; blank reads as `noError`. */
  readonly error: string;
  /** What the prompt says in place of an error the viewer did not paste. */
  readonly noError: string;
}

/**
 * The prompt the troubleshooting box copies: its Slide's template (`{os}`, `{agent}`, `{step}`, `{error}`) filled once,
 * so braces in a pasted error stay as written. The error loses only its blank edges.
 */
export function stuckPrompt(template: string, input: StuckInput): string {
  const error = input.error.trim();
  return fillTemplate(template, {
    os: input.os,
    agent: input.agent,
    step: input.step,
    error: error === '' ? input.noError : error,
  });
}
