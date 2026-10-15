import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/*
 * The hook adapter as Claude Code runs it: a process fed a payload on stdin, in a real git repository with a
 * worktree. The root is the worktree whose marker lists the payload's session, not CLAUDE_PROJECT_DIR.
 */
const ADAPTER = path.resolve(import.meta.dirname, 'claude-adapter.ts');
const TRACE = '0123456789abcdef0123456789abcdef';
const JOB_SPAN = 'aaaaaaaaaaaaaaaa';
const RUN_SPAN = 'cccccccccccccccc';
const LOG = 'events.jsonl';

/** The environment without the GIT_* variables a git hook sets, which would point every git call at the hooked repository. */
const cleanEnv = (): NodeJS.ProcessEnv =>
  Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_'))) as NodeJS.ProcessEnv;

let dir: string;
let main: string;
let wt: string;
let other: string;

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], {
    cwd,
    encoding: 'utf8',
    env: cleanEnv(),
  });

const marker = (sessions: string[]): string =>
  JSON.stringify({
    log: LOG,
    session_id: sessions.at(-1),
    session_ids: sessions,
    trace_id: TRACE,
    job_span_id: JOB_SPAN,
  });

function seedLog(root: string, extra: object[] = []): void {
  const base = { trace_id: TRACE, t: '2026-10-09T09:00:00Z' };
  const lines = [
    { ...base, seq: 1, kind: 'start-run', span_id: RUN_SPAN, run_id: 'r', name: 'r' },
    { ...base, seq: 2, kind: 'start', span_id: JOB_SPAN, type: 'job', name: 'j', job: 'j', parent_span_id: RUN_SPAN },
    ...extra,
  ];
  writeFileSync(path.join(root, LOG), `${lines.map((l) => JSON.stringify(l)).join('\n')}\n`);
}

function withMarker(root: string, sessions: string[]): void {
  mkdirSync(path.join(root, '.scratch'), { recursive: true });
  writeFileSync(path.join(root, '.scratch/active-run'), marker(sessions));
}

/** Runs the adapter from `main`, as the harness would with the main checkout as its project dir. */
function hook(event: 'start' | 'stop', session: string, env: Record<string, string> = {}) {
  const transcript = path.join(dir, 'session.jsonl');
  const payload = { session_id: session, transcript_path: transcript, cwd: main, agent_id: 'a1' };
  return spawnSync('node', [ADAPTER, event], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    env: { ...cleanEnv(), CLAUDE_PROJECT_DIR: main, ...env },
  });
}

const linesOf = (root: string) =>
  readFileSync(path.join(root, LOG), 'utf8')
    .trim()
    .split('\n')
    .map((l) => JSON.parse(l) as Record<string, unknown>);

beforeEach(() => {
  dir = realpathSync(mkdtempSync(path.join(tmpdir(), 'adapter-')));
  main = path.join(dir, 'main');
  wt = path.join(dir, 'wt');
  other = path.join(dir, 'other');
  mkdirSync(main);
  git(main, 'init', '-b', 'main');
  git(main, 'commit', '--allow-empty', '-m', 'init');
  git(main, 'worktree', 'add', wt, '-b', 'feature');
  git(main, 'worktree', 'add', other, '-b', 'elsewhere');
  const subagents = path.join(dir, 'session', 'subagents');
  mkdirSync(subagents, { recursive: true });
  writeFileSync(
    path.join(subagents, 'agent-a1.meta.json'),
    JSON.stringify({ description: 'j#1/reviewer', model: 'sonnet' }),
  );
  seedLog(wt);
  seedLog(main);
  seedLog(other);
  withMarker(wt, ['s1', 's2']);
  withMarker(other, ['x1']);
  mkdirSync(path.join(main, '.scratch'), { recursive: true });
});

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('root scanning', () => {
  it('logs a start in the worktree whose marker names the session, not the project dir', () => {
    // ACT
    const result = hook('start', 's2');
    // ASSERT
    expect(result.status).toBe(0);
    expect(linesOf(wt).at(-1)).toMatchObject({ kind: 'start', type: 'agent', role: 'reviewer', job: 'j' });
    expect(linesOf(main)).toHaveLength(2);
    expect(linesOf(other)).toHaveLength(2);
  });

  it('writes nothing for a session no worktree names', () => {
    // ACT
    const result = hook('start', 'stranger');
    // ASSERT
    expect(result.status).toBe(0);
    expect(linesOf(wt)).toHaveLength(2);
  });

  it('accepts a stop from an earlier session of the Run, but not its start', () => {
    // ACT
    hook('start', 's1');
    const started = linesOf(wt).length;
    hook('start', 's2');
    const stop = hook('stop', 's1');
    // ASSERT
    expect(started).toBe(2);
    expect(stop.status).toBe(0);
    expect(linesOf(wt).map((l) => l.kind)).toEqual(['start-run', 'start', 'start', 'end']);
  });
});

describe('lock timeout', () => {
  it('prints a diagnosable line and exits 1, never 2', () => {
    // ARRANGE
    writeFileSync(path.join(wt, `${LOG}.lock`), 'held');
    // ACT
    const result = hook('start', 's2', { RUN_LOG_LOCK_WAIT_MS: '200' });
    // ASSERT
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/run-log lock/);
    expect(result.stderr).toContain(`${LOG}.lock`);
  });
});

/** Runs one of the adapter's point-fact modes, from the orchestrator (no agent id) or a subagent. */
function pointHook(mode: string, session: string, payload: Record<string, unknown> & { env?: Record<string, string> }) {
  const { env = {}, ...fields } = payload;
  const transcript = path.join(dir, 'session.jsonl');
  const input = { session_id: session, transcript_path: transcript, cwd: main, ...fields };
  return spawnSync('node', [ADAPTER, mode], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...cleanEnv(), CLAUDE_PROJECT_DIR: main, ...env },
  });
}
const skillHook = (session: string, payload: Record<string, unknown>, env: Record<string, string> = {}) =>
  pointHook('skill', session, { tool_name: 'Skill', ...payload, env });
const SUBAGENT = { agent_id: 'a1', agent_type: 'general-purpose' };

describe('point facts (PostToolUse on Skill and Read, InstructionsLoaded)', () => {
  it("appends a skill.invoke event on the agent span for a subagent's call and on the marker's Job for the orchestrator's", () => {
    // ARRANGE
    hook('start', 's2');
    const agentSpan = linesOf(wt).at(-1)?.span_id;
    const expected = [
      { kind: 'event', span_id: agentSpan, name: 'skill.invoke', attributes: { 'skill.name': 'tdd' } },
      { kind: 'event', span_id: JOB_SPAN, name: 'skill.invoke', attributes: { 'skill.name': 'grilling' } },
    ];
    // ACT
    const fromAgent = skillHook('s2', { ...SUBAGENT, tool_input: { skill: 'tdd' } });
    const fromOrchestrator = skillHook('s2', { tool_input: { skill: 'grilling' } });
    // ASSERT
    expect(fromAgent.status).toBe(0);
    expect(fromOrchestrator.status).toBe(0);
    expect(linesOf(wt).slice(-2)).toMatchObject(expected);
  });

  it('appends a file.read with the path relative to the checkout the agent works in, and nothing for a file outside it', () => {
    // ARRANGE
    hook('start', 's2');
    const expected = { kind: 'event', name: 'file.read', attributes: { 'file.path': 'src/a.ts' } };
    const before = linesOf(wt).length;
    // ACT
    const inside = pointHook('read', 's2', {
      ...SUBAGENT,
      cwd: wt,
      tool_name: 'Read',
      tool_input: { file_path: path.join(wt, 'src/a.ts') },
    });
    const outside = pointHook('read', 's2', {
      ...SUBAGENT,
      cwd: wt,
      tool_name: 'Read',
      tool_input: { file_path: path.join(dir, 'x.md') },
    });
    // ASSERT
    expect([inside.status, outside.status]).toEqual([0, 0]);
    expect(linesOf(wt)).toHaveLength(before + 1);
    expect(linesOf(wt).at(-1)).toMatchObject(expected);
  });

  it('appends an instructions.load naming the ADR a rule symlink resolves to', () => {
    // ARRANGE
    const adr = 'GEN-002-adr-symlink-claude-rules';
    mkdirSync(path.join(wt, '.archgate/adrs'), { recursive: true });
    mkdirSync(path.join(wt, '.claude/rules'), { recursive: true });
    writeFileSync(path.join(wt, `.archgate/adrs/${adr}.md`), '# ADR');
    symlinkSync(`../../.archgate/adrs/${adr}.md`, path.join(wt, '.claude/rules/gen-002-adr-symlink-claude-rules.md'));
    const rule = path.join(wt, '.claude/rules/gen-002-adr-symlink-claude-rules.md');
    const expected = {
      kind: 'event',
      span_id: JOB_SPAN,
      name: 'instructions.load',
      attributes: {
        'file.path': '.claude/rules/gen-002-adr-symlink-claude-rules.md',
        load_reason: 'path_glob_match',
        adr,
      },
      payload: { claude_code: { memory_type: 'Project' } },
    };
    // ACT
    const result = pointHook('instructions', 's2', {
      cwd: wt,
      hook_event_name: 'InstructionsLoaded',
      file_path: rule,
      memory_type: 'Project',
      load_reason: 'path_glob_match',
    });
    // ASSERT
    expect(result.status).toBe(0);
    expect(linesOf(wt).at(-1)).toMatchObject(expected);
  });

  it('exits 0 on a lock timeout, so the tool call it follows is never blocked', () => {
    // ARRANGE
    writeFileSync(path.join(wt, `${LOG}.lock`), 'held');
    // ACT
    const result = skillHook('s2', { tool_input: { skill: 'tdd' } }, { RUN_LOG_LOCK_WAIT_MS: '200' });
    // ASSERT
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/run-log lock/);
  });

  it('gives up on a held lock within its own short wait, not the 15 s a subagent hook waits', () => {
    // ARRANGE
    writeFileSync(path.join(wt, `${LOG}.lock`), 'held');
    const input = { session_id: 's2', transcript_path: path.join(dir, 'session.jsonl'), cwd: main, tool_name: 'Skill' };
    // ACT
    const result = spawnSync('node', [ADAPTER, 'skill'], {
      input: JSON.stringify({ ...input, tool_input: { skill: 'tdd' } }),
      encoding: 'utf8',
      env: { ...cleanEnv(), CLAUDE_PROJECT_DIR: main },
      timeout: 8_000,
    });
    // ASSERT
    expect(result.status).toBe(0);
    expect(result.stderr).toMatch(/run-log lock/);
  });

  it('exits 0 and writes nothing for a payload that is not JSON', () => {
    // ACT
    const result = spawnSync('node', [ADAPTER, 'skill'], { input: 'not json', encoding: 'utf8', env: cleanEnv() });
    // ASSERT
    expect(result.status).toBe(0);
    expect(linesOf(wt)).toHaveLength(2);
  });
});
