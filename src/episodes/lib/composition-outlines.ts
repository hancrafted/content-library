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

export function compositionOutlines(): Record<string, RecordOutline<string | object>> {
  const files = textFiles();
  const fileOrInline = (text: object): string | object => files.get(text) ?? text;
  return Object.fromEntries(
    Object.entries(EPISODES).map(([id, record]) => [id, withTextAs(recordOutline(record), fileOrInline)]),
  );
}
