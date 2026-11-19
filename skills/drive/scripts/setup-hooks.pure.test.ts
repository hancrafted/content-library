import { describe, expect, it } from 'vitest';
import { addAdapterHooks } from './setup-hooks.pure.ts';

describe('addAdapterHooks', () => {
  const ENTRY = 'skills/drive/scripts/drive.ts';
  const existing = JSON.stringify(
    { hooks: { SubagentStart: [{ hooks: [{ type: 'command', command: 'other start' }] }] }, env: { A: '1' } },
    null,
    2,
  );

  it('adds an async hook beside the existing ones and keeps them', () => {
    // ACT
    const result = addAdapterHooks(existing, ENTRY);
    // ASSERT
    if (!('text' in result)) throw new Error(result.note);
    const hooks = JSON.parse(result.text).hooks;
    expect(hooks.SubagentStart).toHaveLength(2);
    expect(hooks.SubagentStart[0].hooks[0].command).toBe('other start');
    expect(hooks.SubagentStart[1].hooks[0]).toEqual({
      type: 'command',
      command: 'node "${CLAUDE_PROJECT_DIR}/skills/drive/scripts/claude-adapter.ts" start',
      async: true,
    });
    expect(hooks.SubagentStop[0].hooks[0].command).toContain('claude-adapter.ts" stop');
    expect(JSON.parse(result.text).env).toEqual({ A: '1' });
  });

  it('is idempotent and notes instead of overwriting an unreadable file', () => {
    // ARRANGE
    const once = addAdapterHooks(null, ENTRY);
    if (!('text' in once)) throw new Error(once.note);
    // ACT
    const twice = addAdapterHooks(once.text, ENTRY);
    // ASSERT
    expect(twice).toEqual(once);
    expect(addAdapterHooks('{not json', ENTRY)).toHaveProperty('note');
  });
});
