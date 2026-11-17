import { describe, expect, it } from 'vitest';
import { dropGitEnvironment } from './git-environment.fixture.ts';

describe('success cases', () => {
  it('removes every GIT_ variable, which a commit hook exports and which would point a temporary repository at the real one', () => {
    // ARRANGE
    const env: Record<string, string | undefined> = { GIT_DIR: '/real/.git', GIT_INDEX_FILE: 'index', PATH: '/bin' };
    // ACT
    dropGitEnvironment(env);
    // ASSERT
    expect(env).toEqual({ PATH: '/bin' });
  });
});

describe('edge cases', () => {
  it('also removes the names it is told to, such as the CI variable CI sets', () => {
    // ARRANGE
    const env: Record<string, string | undefined> = { GIT_DIR: '/real/.git', CI: 'true', PATH: '/bin' };
    // ACT
    dropGitEnvironment(env, ['CI']);
    // ASSERT
    expect(env).toEqual({ PATH: '/bin' });
  });
});
