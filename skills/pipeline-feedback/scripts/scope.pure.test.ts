import { describe, expect, it } from 'vitest';
import { checkScope } from './scope.pure.ts';

/*
 * pipeline-feedback commits machinery feedback on a run branch, then cherry-picks it to `main`.
 * Only the skill, the pipeline area, the docs and the glossary may ride along; an Episode's files never do.
 */
describe('checkScope', () => {
  it('accepts the skill folder, docs and the glossary', () => {
    const paths = [
      'skills/new-episode/SKILL.md',
      'skills/new-episode/references/write-spec.md',
      'docs/adr/0008-x.md',
      'GLOSSARY.md',
    ];
    expect(checkScope(paths)).toEqual({ ok: true, episode: [], outside: [], frozen: [] });
  });

  it('accepts the pipeline area, where the run log, the checks and the dashboard live', () => {
    const paths = [
      'src/pipeline/lib/episode-reference-jobs.pure.ts',
      'src/pipeline/lib/episode-reference-jobs.pure.test.ts',
    ];
    expect(checkScope(paths)).toEqual({ ok: true, episode: [], outside: [], frozen: [] });
  });

  it('names every Episode file, which is refused even though it sits under docs/', () => {
    const result = checkScope([
      'docs/episodes/my-slug/brief.md',
      'docs/episodes/my-slug/events.jsonl',
      'docs/agents/x.md',
    ]);
    expect(result).toEqual({
      ok: false,
      episode: ['docs/episodes/my-slug/brief.md', 'docs/episodes/my-slug/events.jsonl'],
      outside: [],
      frozen: [],
    });
  });

  it('names a file outside the four places', () => {
    const result = checkScope(['src/episodes/my-slug/page.tsx', 'skills/brief-grill/SKILL.md', 'GLOSSARY.md']);
    expect(result).toEqual({
      ok: false,
      episode: [],
      outside: ['src/episodes/my-slug/page.tsx', 'skills/brief-grill/SKILL.md'],
      frozen: [],
    });
  });

  it('names the frozen pipeline template, which is in the skill folder but never ships', () => {
    const result = checkScope(['skills/new-episode/SKILL.md', 'skills/new-episode/assets/pipeline.yml']);
    expect(result).toEqual({
      ok: false,
      episode: [],
      outside: [],
      frozen: ['skills/new-episode/assets/pipeline.yml'],
    });
  });

  it('refuses an empty change', () => {
    expect(checkScope([]).ok).toBe(false);
  });
});
