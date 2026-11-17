const EPISODE = 'docs/episodes/';
/** The frozen Run template: a Run's template must not shift under it, so a change becomes a LEARNINGS.md lesson. */
const FROZEN = 'skills/new-episode/assets/pipeline.yml';
const ALLOWED = ['skills/new-episode/', 'src/pipeline/', 'docs/', 'GLOSSARY.md'];

export interface Scope {
  ok: boolean;
  episode: string[];
  outside: string[];
  frozen: string[];
}

export function checkScope(paths: string[]): Scope {
  const episode = paths.filter((file) => file.startsWith(EPISODE));
  const frozen = paths.filter((file) => file === FROZEN);
  const outside = paths.filter(
    (file) => !file.startsWith(EPISODE) && !ALLOWED.some((place) => file === place || file.startsWith(place)),
  );
  return {
    ok: paths.length > 0 && episode.length === 0 && outside.length === 0 && frozen.length === 0,
    episode,
    outside,
    frozen,
  };
}
