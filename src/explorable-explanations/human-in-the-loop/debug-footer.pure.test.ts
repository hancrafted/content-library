import { describe, expect, it } from 'vitest';
import { debugAvailable, debugFooter, scopeOf, withDebug, type DebugBase } from './debug-footer.pure';

const base: DebugBase = {
  workflow: { id: 'project-plan', title: 'Plan a project' },
  level: 'technical',
  teaching: true,
  locale: 'en',
  source: 'ab12cd34',
};
const at = {
  stage: { id: 'epics', name: 'Epics' },
  job: { id: 'grill-epic', title: 'Grill the epic' },
};

describe('success cases', () => {
  it('writes the one-line footer with the ids Han can grep and the names beside them', () => {
    // ARRANGE
    const scope = scopeOf(base, { ...at, round: { n: 2, total: 2 } });
    // ACT
    const line = debugFooter(scope, { prompt: 'copy', step: 'do' });
    // ASSERT
    expect(line).toBe(
      '[hitl-debug] workflow=project-plan "Plan a project" · stage=epics "Epics" · job=grill-epic "Grill the epic" · round=2/2 · prompt=copy · step=do · level=cli · teaching=on · locale=en · source=ab12cd34',
    );
  });

  it('names the chat of a fan-out, the explain prompt, the simple level and teaching off', () => {
    // ARRANGE
    const scope = scopeOf({ ...base, level: 'simple', teaching: false, locale: 'de' }, at);
    // ACT
    const line = debugFooter(scope, { prompt: 'explain', step: 'review', chat: 3 });
    // ASSERT
    expect(line).toBe(
      '[hitl-debug] workflow=project-plan "Plan a project" · stage=epics "Epics" · job=grill-epic "Grill the epic" · prompt=explain · step=review · chat=3 · level=chat · teaching=off · locale=de · source=ab12cd34',
    );
  });

  it('appends the instruction, with the footer filled in, after a blank line', () => {
    // ARRANGE
    const instruction = 'End every reply with:\n{footer}';
    // ACT
    const text = withDebug('Do the thing.', instruction, 'LINE');
    // ASSERT
    expect(text).toBe('Do the thing.\n\nEnd every reply with:\nLINE');
  });

  it('shows the toggle in development and on a page whose URL carries ?debug', () => {
    // ARRANGE
    const dev = { env: 'development', search: '' };
    const flagged = { env: 'production', search: '?x=1&debug' };
    const valued = { env: 'production', search: '?debug=1' };
    // ACT
    const shown = [dev, flagged, valued].map(debugAvailable);
    // ASSERT
    expect(shown).toEqual([true, true, true]);
  });
});

describe('failure cases', () => {
  it('leaves the copied text byte-identical when debug is off', () => {
    // ARRANGE
    const text = 'Prompt {{a}}\n';
    // ACT
    const out = withDebug(text, 'End with {footer}', null);
    // ASSERT
    expect(out).toBe(text);
  });

  it('hides the toggle from a production page without ?debug', () => {
    // ARRANGE
    const lookalikes = ['', '?debugger', '?nodebug=1', '?x=debug'];
    // ACT
    const shown = lookalikes.map((search) => debugAvailable({ env: 'production', search }));
    // ASSERT
    expect(shown).toEqual([false, false, false, false]);
  });
});

describe('edge cases', () => {
  it('keeps a title with a quote or a line break on one line', () => {
    // ARRANGE
    const scope = scopeOf(
      { ...base, workflow: { id: 'w', title: 'A "b"\nc' } },
      { ...at, stage: { id: 's', name: 'Plan' } },
    );
    // ACT
    const line = debugFooter(scope, { prompt: 'copy', step: 'do' });
    // ASSERT
    expect(line).not.toContain('\n');
    expect(line).toContain('workflow=w "A \'b\' c"');
  });

  it('puts a footer holding $& into the instruction as it is', () => {
    // ARRANGE
    const footer = 'a $& b';
    // ACT
    const text = withDebug('x', '{footer}', footer);
    // ASSERT
    expect(text).toBe('x\n\na $& b');
  });
});
