import { recordOutline, withTextAs, type RecordOutline } from './episode-outline-of-record';
import { EPISODES } from './episode-registry.generated';

// decision: docs/decision-records/0028-an-event-copy-is-an-instance-of-its-episode.md
const TEXT_FILES = import.meta.glob<object>(['/src/episodes/**/i18n/*.json', '/src/episodes/**/overrides/*.json'], {
  eager: true,
  import: 'default',
});

function textFiles(): ReadonlyMap<object, string> {
  return new Map(Object.entries(TEXT_FILES).map(([file, text]) => [text, file.replace(/^\//, '')]));
}

export function compositionOutlines(): Record<string, RecordOutline<string>> {
  const files = textFiles();
  const fileOf = (id: string) => (text: object) => {
    const file = files.get(text);
    if (file === undefined)
      throw new Error(
        `Text of the Episode "${id}" comes from no JSON file under src/episodes: an Episode override's text lives in overrides/<slide-slug>.<locale>.json, imported by episode.ts (Decision record 0028 §5)`,
      );
    return file;
  };
  return Object.fromEntries(
    Object.entries(EPISODES).map(([id, record]) => [id, withTextAs(recordOutline(record), fileOf(id))]),
  );
}
