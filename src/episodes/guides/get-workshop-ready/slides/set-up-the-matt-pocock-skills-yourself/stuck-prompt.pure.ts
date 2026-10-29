import { fillTemplate } from '@/shared/lib/template.pure';

/** What the "Stuck?" prompt wraps: the page's picks and the step, as words, and the viewer's paste. */
export interface StuckParts {
  readonly os: string;
  readonly agent: string;
  readonly step: string;
  /** The paste area's text, as the viewer left it. */
  readonly error: string;
  /** What the prompt says in place of an error when the paste area is blank. */
  readonly noError: string;
}

/**
 * The prompt the "Stuck?" box copies: its Translation file's template with `{os}`, `{agent}`, `{step}` and `{error}`
 * filled. The paste is trimmed; a blank one becomes `noError`, so the prompt never ends on an empty line.
 */
export function stuckPrompt(template: string, parts: StuckParts): string {
  const error = parts.error.trim();
  return fillTemplate(template, {
    os: parts.os,
    agent: parts.agent,
    step: parts.step,
    error: error === '' ? parts.noError : error,
  });
}
