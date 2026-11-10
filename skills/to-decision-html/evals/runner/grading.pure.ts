// Builds a run's grading.json in skill-creator's shape (references/schemas.md in the skill-creator skill): one
// expectation per grader result, then the summary and execution metrics skill-creator's aggregation reads. Each
// grader contributes expectations; the run's grading.json concatenates them, mechanical first.
import type { Report } from '../../scripts/grader/report.pure.ts';
import type { ToolCall } from './transcript.pure.ts';

export interface Expectation {
  readonly text: string;
  readonly passed: boolean;
  readonly evidence: string;
}

export interface Grading {
  readonly expectations: readonly Expectation[];
  readonly summary: { passed: number; failed: number; total: number; pass_rate: number };
  readonly execution_metrics: {
    tool_calls: Record<string, number>;
    total_tool_calls: number;
    errors_encountered: number;
    output_chars: number;
  };
  readonly user_notes_summary: { uncertainties: string[]; needs_review: string[]; workarounds: string[] };
}

/** A report for a run with no gradable page: every check fails with the reason. */
export function ungradedReport(checks: readonly { id: string; summary: string }[], reason: string): Report {
  return {
    page: '',
    mode: null,
    pass: false,
    checks: checks.map(({ id, summary }) => ({ id, summary, status: 'fail', problems: [reason] })),
  };
}

/**
 * A skipped check passes only when the page declared the case's mode, so a page that omits or misstates its mode
 * cannot pass the other mode's checks by skipping them.
 */
export function mechanicalExpectations(report: Report, caseMode: string): Expectation[] {
  return report.checks.map(({ id, summary, status, problems }) => {
    const text = `mechanical ${id}: ${summary}`;
    if (status === 'pass') return { text, passed: true, evidence: 'passes at every graded width' };
    if (status === 'fail') return { text, passed: false, evidence: problems.join('; ') };
    if (report.mode === caseMode) return { text, passed: true, evidence: `does not apply to mode ${caseMode}` };
    const declared = report.mode ?? 'none';
    return {
      text,
      passed: false,
      evidence: `skipped: the page declares mode ${declared}, the case expects ${caseMode}`,
    };
  });
}

export function isolationExpectation(problems: readonly string[]): Expectation {
  const text = 'isolation: no tool path outside the run workspace';
  return problems.length === 0
    ? { text, passed: true, evidence: 'every tool path stays in the run workspace' }
    : { text, passed: false, evidence: problems.join('; ') };
}

interface RunOutcome {
  readonly expectations: readonly Expectation[];
  readonly tools: readonly ToolCall[];
  /** Characters in the run's saved outputs. */
  readonly outputChars: number;
  /** Why the agent's run did not finish cleanly; null when it did. */
  readonly error: string | null;
  /** Things a reviewer should know about the run, such as which page was graded. */
  readonly notes: readonly string[];
}

function countByName(tools: readonly ToolCall[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const { name } of tools) counts[name] = (counts[name] ?? 0) + 1;
  return counts;
}

/** Timing goes to timing.json, where the aggregation also finds the token count. */
export function gradingOf({ expectations, tools, outputChars, error, notes }: RunOutcome): Grading {
  const passed = expectations.filter((expectation) => expectation.passed).length;
  const total = expectations.length;
  return {
    expectations,
    summary: {
      passed,
      failed: total - passed,
      total,
      pass_rate: total === 0 ? 0 : Math.round((passed / total) * 10000) / 10000,
    },
    execution_metrics: {
      tool_calls: countByName(tools),
      total_tool_calls: tools.length,
      errors_encountered: error === null ? 0 : 1,
      output_chars: outputChars,
    },
    user_notes_summary: { uncertainties: [], needs_review: [...notes], workarounds: [] },
  };
}
