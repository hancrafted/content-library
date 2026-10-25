// `npm run slides:reuse -- <slide-slug> --into <episode> --section <section-slug>`: reuses a Slide in another Episode
// by reference (design-ADR 0016, Slide reuse rules 1 and 2). On first reuse the Slide's folder moves into the Slide
// pool with `git mv` and every import of it is re-pointed; the reusing Section then lists it. Run from the repository
// root. The rules live in slide-reuse.pure.ts; this adapter reads the tree, moves, writes and formats.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { format, resolveConfig } from 'prettier';
import { planReuse, SLIDE_POOL_DIR, type RepoView } from './slide-reuse.pure.ts';

const USAGE = 'usage: npm run slides:reuse -- <slide-slug> --into <episode> --section <section-slug>';

function argsOf(argv: readonly string[]): { slug: string; into: string; section: string } | undefined {
  const [slug, ...rest] = argv;
  const flag = (name: string) => {
    const at = rest.indexOf(name);
    return at === -1 ? undefined : rest[at + 1];
  };
  const into = flag('--into');
  const section = flag('--section');
  return slug === undefined || slug.startsWith('-') || into === undefined || section === undefined
    ? undefined
    : { slug, into, section };
}

const root = process.cwd();

function sourceFilesUnder(dir: string): string[] {
  if (!existsSync(join(root, dir))) return [];
  return readdirSync(join(root, dir), { recursive: true, encoding: 'utf8' })
    .map((file) => `${dir}/${file.split('\\').join('/')}`)
    .filter((file) => /\.tsx?$/.test(file) && !file.includes('/node_modules/'));
}

const repo: RepoView = {
  exists: (path) => existsSync(join(root, path)),
  read: (path) => readFileSync(join(root, path), 'utf8'),
  folders: (path) => {
    try {
      return readdirSync(join(root, path), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort();
    } catch {
      return [];
    }
  },
  sourceFiles: () => [...sourceFilesUnder('src'), ...sourceFilesUnder('tests')],
};

const request = argsOf(process.argv.slice(2));
if (request === undefined) {
  console.error(USAGE);
  process.exit(1);
}

const result = planReuse(request, repo);
if (!result.ok) {
  console.error(`slides:reuse refused, nothing changed:\n${result.reasons.map((reason) => `  ${reason}`).join('\n')}`);
  process.exit(1);
}

const { move, edits } = result.plan;
if (move !== undefined) {
  mkdirSync(join(root, SLIDE_POOL_DIR), { recursive: true });
  execFileSync('git', ['mv', move.from, move.to], { cwd: root, stdio: 'inherit' });
  console.log(`moved ${move.from} -> ${move.to}`);
}
for (const { path, text } of edits) {
  const file = join(root, path);
  const options = (await resolveConfig(file)) ?? {};
  writeFileSync(file, await format(text, { ...options, filepath: file }));
  console.log(`edited ${path}`);
}
console.log(`"${request.slug}" is reused in ${request.into}; run npm run verify.`);
