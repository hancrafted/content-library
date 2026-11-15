// The store `npm run art` writes (FE-005 §5): one content-hashed file per distinct drawing under `/art/`, and the
// manifest `<Art>` reads to point each `<use>` at its file.
import { createHash } from 'node:crypto';

/** One drawing of one `<Art>`, as a page drew it: its name and its baked markup. */
export interface ArtPiece {
  readonly name: string;
  readonly body: string;
  /** The Slide that drew it, for a report to name. */
  readonly from?: string;
}

/**
 * Each file under `/art/`; the manifest from art name to URL, or `null` for a name that stays inline; and why each
 * inline name stays so.
 */
export interface ArtStore {
  readonly files: readonly { readonly file: string; readonly text: string }[];
  readonly manifest: Readonly<Record<string, string | null>>;
  readonly inline: readonly string[];
}

/** The fragment every `<use>` points at: the one drawing an asset file holds. */
const ART_FRAGMENT = 'a';

/** The file a drawing is written to, under its URL-safe name and the hash of its content. */
function fileName(name: string, text: string) {
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 10);
  const safe = name.replace(/[^a-zA-Z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
  return `${safe}.${hash}.svg`;
}

/** Where two drawings of one name part: the Slides that drew them, and the markup around their first difference. */
function whereTheyDiffer(one: ArtPiece, other: ArtPiece) {
  const at = [...one.body].findIndex((char, index) => char !== other.body[index]);
  const around = (body: string) => body.slice(Math.max(0, at - 40), at + 40);
  return `${one.from ?? '?'}: …${around(one.body)}… and ${other.from ?? '?'}: …${around(other.body)}…`;
}

/** Every name's one drawing, and the names drawn two ways: a page around them repaints them, so they stay inline. */
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

/**
 * One file per distinct drawing, however many names, Episodes, Event copies and Slides draw it, and a manifest from
 * every name to its file's URL. The file names the first name that draws it, and the hash of its content, so a
 * redraw is a new URL and an unchanged drawing keeps its cached one. A name drawn two ways, because a Slide's CSS
 * reaches into a shared figure, maps to `null`: `<Art>` draws it inline, where that CSS still reaches it.
 */
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
