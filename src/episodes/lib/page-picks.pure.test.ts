import { describe, expect, it } from 'vitest';
import { createPagePicks } from './page-picks.pure';

/*
 * The page picks (FE-001 §1, transient): one store per Episode page holding what the viewer picked in a page-wide
 * toolbar, such as a Guide's operating system and AI agent, so every Slide reading a pick shows the same one. It lives
 * in memory only: a reload starts from each Slide's default.
 */

describe('success cases', () => {
  it('gives every reader of a pick the value one Slide set', () => {
    // ARRANGE
    const picks = createPagePicks();
    // ACT
    picks.set('os', 'windows');
    // ASSERT
    expect([picks.get('os', 'mac'), picks.get('os', 'linux')]).toEqual(['windows', 'windows']);
  });

  it('tells its subscribers when a pick changes', () => {
    // ARRANGE
    const picks = createPagePicks();
    const heard: string[] = [];
    picks.subscribe(() => heard.push(picks.get('agent', 'claude-code')));
    // ACT
    picks.set('agent', 'codex');
    // ASSERT
    expect(heard).toEqual(['codex']);
  });
});

describe('failure cases', () => {
  it('never calls a subscriber again once it stopped listening', () => {
    // ARRANGE
    const picks = createPagePicks();
    const heard: string[] = [];
    const stop = picks.subscribe(() => heard.push(picks.get('agent', 'claude-code')));
    stop();
    // ACT
    picks.set('agent', 'antigravity');
    // ASSERT
    expect(heard).toEqual([]);
  });
});

describe('edge cases', () => {
  it("reads the Slide's default until the viewer picks, and keeps two picks apart", () => {
    // ARRANGE
    const picks = createPagePicks();
    // ACT
    picks.set('os', 'linux');
    // ASSERT
    expect([picks.get('agent', 'claude-code'), picks.get('os', 'mac')]).toEqual(['claude-code', 'linux']);
  });

  it('stays quiet when a pick is set to the value it already has', () => {
    // ARRANGE
    const picks = createPagePicks();
    picks.set('os', 'mac');
    let calls = 0;
    picks.subscribe(() => (calls += 1));
    // ACT
    picks.set('os', 'mac');
    // ASSERT
    expect(calls).toBe(0);
  });

  it('starts empty on every page: a fresh store holds no earlier page’s pick', () => {
    // ARRANGE
    createPagePicks().set('os', 'windows');
    // ACT
    const fresh = createPagePicks();
    // ASSERT
    expect(fresh.get('os', 'mac')).toBe('mac');
  });
});
