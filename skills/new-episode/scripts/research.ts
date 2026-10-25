// `npm run episode:research -- list [<concept-id>]`: every Research question of the wiki and of every Staging that
// informs the Concept (all of them without one), each with its confidence and whether it is still fresh today; what
// `retrieval` reads to decide reuse, refresh or new.
// `npm run episode:research -- next <PREFIX>`: the next free id of a prefix across the wiki and every Staging, retired
// ids included; what `categorize-research` numbers a new folder with. Run from the repo root.
import { readResearchFiles } from '../../../src/lib/evidence-files.ts';
import { readFrontmatter } from '../../../src/lib/frontmatter.pure.ts';
import { nextFreeId, researchCatalogue, type CatalogueEntry } from '../../../src/lib/research-catalogue.pure.ts';

const USAGE = 'usage: npm run episode:research -- list [<concept-id>] | next <PREFIX>';
const ID = /^([A-Z]+-\d{4})__/;

const files = readResearchFiles(process.cwd());
const [command, argument] = process.argv.slice(2);

/** A research file as a listing entry; the content store checks the fields, so a file it would refuse is skipped. */
function entryOf(path: string, markdown: string): CatalogueEntry[] {
  const id = ID.exec(path.split('/').at(-2) ?? '')?.[1];
  const front = readFrontmatter(markdown);
  if (id === undefined || 'reason' in front) return [];
  const data = front.data as Record<string, unknown>;
  const text = (key: string) => String(data[key] ?? '');
  const informs = Array.isArray(data.informs) ? data.informs.map(String) : [];
  const staleAfter = data.stale_after instanceof Date ? data.stale_after.toISOString() : text('stale_after');
  return [
    {
      id,
      path,
      title: text('title'),
      description: text('description'),
      confidence: text('confidence'),
      informs,
      stale_after: staleAfter,
      staged: !path.startsWith('docs/llm-wiki/'),
    },
  ];
}

if (command === 'list') {
  const today = new Date().toISOString().slice(0, 10);
  const entries = files.flatMap(({ path, markdown }) => entryOf(path, markdown));
  const listing = researchCatalogue(entries, { concept: argument, today });
  console.log(listing.length > 0 ? listing.join('\n\n') : `No Research question informs ${argument}.`);
} else if (command === 'next' && argument !== undefined) {
  try {
    const held = files.flatMap(({ path }) => ID.exec(path.split('/').at(-2) ?? '')?.[1] ?? []);
    // A merge retires an id into its kept question's `supersedes` line; that id is never handed out again.
    const retired = files.flatMap(({ markdown }) => {
      const front = readFrontmatter(markdown);
      const supersedes = 'reason' in front ? undefined : (front.data as { supersedes?: unknown }).supersedes;
      return Array.isArray(supersedes) ? supersedes.map(String) : [];
    });
    const ids = [...held, ...retired];
    console.log(nextFreeId(argument, ids));
  } catch (error) {
    console.error((error as Error).message);
    process.exit(1);
  }
} else {
  console.error(USAGE);
  process.exit(1);
}
