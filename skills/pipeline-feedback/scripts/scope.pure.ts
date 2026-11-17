const EPISODE = 'docs/episodes/';
const FROZEN_RUN_TEMPLATE = 'skills/new-episode/assets/pipeline.yml';
const ALLOWED = ['skills/new-episode/', 'src/pipeline/', 'docs/', 'GLOSSARY.md'];

export interface Scope {
  ok: boolean;
  episode: string[];
  outside: string[];
  frozen: string[];
}

export function checkScope(paths: string[]): Scope {
  const episode = paths.filter((file) => file.startsWith(EPISODE));
  const frozen = paths.filter((file) => file === FROZEN_RUN_TEMPLATE);
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
