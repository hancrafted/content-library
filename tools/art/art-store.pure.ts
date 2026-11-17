// decision: FE-005 §5
import { createHash } from 'node:crypto';

export interface ArtPiece {
  readonly name: string;
  readonly body: string;
  readonly from?: string;
}

export interface ArtStore {
  readonly files: readonly { readonly file: string; readonly text: string }[];
  readonly manifest: Readonly<Record<string, string | null>>;
  readonly inline: readonly string[];
}

const ART_FRAGMENT = 'a';

function fileName(name: string, text: string) {
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 10);
  const safe = name.replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${safe}.${hash}.svg`;
}

function whereTheyDiffer(one: ArtPiece, other: ArtPiece) {
  const at = [...one.body].findIndex((char, index) => char !== other.body[index]);
  const around = (body: string) => body.slice(Math.max(0, at - 40), at + 40);
  return `${one.from ?? '?'}: …${around(one.body)}… and ${other.from ?? '?'}: …${around(other.body)}…`;
}

function bodiesByName(pieces: readonly ArtPiece[]) {
  const first = new Map<string, ArtPiece>();
  const twice = new Map<string, string>();
  for (const piece of pieces) {
    const seen = first.get(piece.name);
    if (seen === undefined) first.set(piece.name, piece);
    else if (seen.body !== piece.body && !twice.has(piece.name)) {
      twice.set(piece.name, `"${piece.name}" is drawn two ways (${whereTheyDiffer(seen, piece)})`);
    }
  }
  return { bodyOf: new Map([...first].map(([name, { body }]) => [name, body])), twice };
}

export function artStore(pieces: readonly ArtPiece[]): ArtStore {
  const { bodyOf, twice } = bodiesByName(pieces);
  const fileOf = new Map<string, string>();
  const manifest: Record<string, string | null> = {};
  for (const name of [...bodyOf.keys()].sort()) {
    if (twice.has(name)) {
      manifest[name] = null;
      continue;
    }
    const text = `<svg xmlns="http://www.w3.org/2000/svg"><g id="${ART_FRAGMENT}">${bodyOf.get(name)}</g></svg>\n`;
    const file = fileOf.get(text) ?? fileName(name, text);
    fileOf.set(text, file);
    manifest[name] = `/art/${file}#${ART_FRAGMENT}`;
  }
  return { files: [...fileOf].map(([text, file]) => ({ file, text })), manifest, inline: [...twice.values()] };
}
