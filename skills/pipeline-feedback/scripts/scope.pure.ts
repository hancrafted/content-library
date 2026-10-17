// Where a pipeline-feedback commit may reach: the new-episode skill folder, docs/ and the glossary.
// An Episode's staging folder sits under docs/ and is refused by name, so its files never reach `main`.

const EPISODE = 'docs/episodes/';
const ALLOWED = ['skills/new-episode/', 'docs/', 'GLOSSARY.md'];

export interface Scope {
  ok: boolean;
  episode: string[];
  outside: string[];
}

export function checkScope(paths: string[]): Scope {
  const episode = paths.filter((file) => file.startsWith(EPISODE));
  const outside = paths.filter(
    (file) => !file.startsWith(EPISODE) && !ALLOWED.some((place) => file === place || file.startsWith(place)),
  );
  return { ok: paths.length > 0 && episode.length === 0 && outside.length === 0, episode, outside };
}
