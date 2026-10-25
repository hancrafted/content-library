// Pinned anchors in a Section file's text (design-ADR 0016, Slide reuse rules 4 and 7): how `slides:promote` writes
// one, and how the Slide commands find the retired instance slugs every Section reserves. Reads through the view it is
// handed; writes nothing.
import { EPISODES_DIR, inside, type RepoView } from './slide-reuse.pure.ts';

const SLIDE_MASTER = '@/components/slide-master/slide';
const SECTION_LIST = /(:\s*Section\s*=\s*\[)([\s\S]*?)(\]\s*;)/;
const MASTER_IMPORT = /import (type )?\{([^}]*)\} from (['"])@\/components\/slide-master\/slide\3;/;
const PIN_CALL = /\bpinAnchor\(\s*\w+\s*,\s*(['"])([a-z0-9-]+)\1\s*\)/g;

/** `pinAnchor` added to the Section file's import from the Slide master, or a new import of it. */
function withPinImport(text: string): string {
  const found = MASTER_IMPORT.exec(text);
  if (found === null) return `import { pinAnchor } from '${SLIDE_MASTER}';\n${text}`;
  const [whole, typeOnly, names] = found;
  const listed = names
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '')
    .map((name) => (typeOnly === undefined || name.startsWith('type ') ? name : `type ${name}`));
  if (listed.includes('pinAnchor')) return text;
  return text.replace(whole, `import { ${['pinAnchor', ...listed].join(', ')} } from '${SLIDE_MASTER}';`);
}

/**
 * The Section file's text with its list entry `binding` placed under the Pinned anchor `retired`:
 * `pinAnchor(binding, 'retired')`. Undefined when the file holds no `: Section = [ … ];` list naming the binding.
 */
export function pinnedSection(text: string, binding: string, retired: string): string | undefined {
  const list = SECTION_LIST.exec(text);
  const entry = new RegExp(`\\b${binding}\\b`);
  if (list === null || !entry.test(list[2])) return undefined;
  const pinned = list[2].replace(entry, `pinAnchor(${binding}, '${retired}')`);
  return withPinImport(text.replace(list[0], `${list[1]}${pinned}${list[3]}`));
}

/** The Section files that pin `slug` as an anchor: a retired instance slug no Slide takes again. */
export function sectionsPinning(slug: string, repo: RepoView): string[] {
  return repo
    .sourceFiles()
    .filter((file) => inside(file, EPISODES_DIR) && file.includes('/sections/'))
    .filter((file) => [...repo.read(file).matchAll(PIN_CALL)].some(([, , pinned]) => pinned === slug));
}
