import { type PipelineContext } from '@/pipeline/lib/episode-pipeline.pure';
import { type KnownVisuals } from '@/pipeline/lib/episode-staging.pure';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export const ROOT = path.join(__dirname, '../..');
export const EPISODES = path.join(ROOT, 'docs/episodes');
export const SAMPLE = path.join(ROOT, 'skills/new-episode/assets/sample-episode');
export const LLM_WIKI = path.join(ROOT, 'docs/llm-wiki');
export const RUNS_CSV = path.join(EPISODES, 'runs.csv');
// decision: docs/adr/0006-skills-follow-agentskills.md
export const SKILL_FOLDERS = [path.join(ROOT, '.agents/skills'), path.join(ROOT, 'skills')];
export const SKILL_FOLDER = 'skills/new-episode';
export const TEMPLATE = path.join(ROOT, SKILL_FOLDER, 'assets/pipeline.yml');

export const PENDING: readonly string[] = [];
/** Files a frozen per-run pipeline may still name: of retired jobs (scaffold-pipeline, #229) or replaced assets. */
export const RETIRED: readonly string[] = [
  `${SKILL_FOLDER}/references/scaffold-pipeline.md`,
  // The Spec template replaced these two assets (#562); an approved per-run pipeline keeps the reads it was approved with.
  `${SKILL_FOLDER}/assets/spec-frame.html`,
  `${SKILL_FOLDER}/assets/spec-review.html`,
];

export function readFolder(folder: string): Record<string, string> {
  const entries = readdirSync(folder, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
  return Object.fromEntries(
    entries.map((entry) => {
      const file = path.join(entry.parentPath, entry.name);
      return [path.relative(folder, file).split(path.sep).join('/'), readFileSync(file, 'utf8')];
    }),
  );
}

export function namesEndingIn(folder: string, suffix: string): string[] {
  return readdirSync(folder)
    .filter((name) => name.endsWith(suffix))
    .map((name) => name.slice(0, -suffix.length));
}

export function knownVisuals(): KnownVisuals {
  const masterSlides = ['timelines', 'grids'].flatMap((template) =>
    readdirSync(path.join(ROOT, `src/episodes/templates/${template}/slides`), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map(({ name }) => name),
  );
  return {
    masters: [...namesEndingIn(path.join(ROOT, 'src/episodes/components/slide-master'), '-slide.tsx'), ...masterSlides],
    motions: namesEndingIn(path.join(ROOT, 'src/episodes/components/slide-shared/motions'), '.module.css'),
  };
}

export function subfolders(folder: string): string[] {
  return existsSync(folder)
    ? readdirSync(folder, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map(({ name }) => path.join(folder, name))
        .sort()
    : [];
}

export function llmWikiResearch(): Record<string, string> {
  const research = path.join(LLM_WIKI, 'research');
  if (!existsSync(research)) return {};
  return Object.fromEntries(
    Object.entries(readFolder(research))
      .filter(([file]) => file.endsWith('/research.md'))
      .map(([file, text]) => [`research/${file}`, text]),
  );
}

/**
 * Every research folder on disk, as a repo path: each Run's under `docs/episodes/<slug>/research/` and each llm-wiki
 * category's. It reads folder names only, never a Run's files: the cross-Run half of the research-folder check, while
 * each Run checks its own and the folders its pipeline will write (`run-checks.ts`).
 */
export function researchFoldersOnDisk(): string[] {
  const runs = subfolders(EPISODES).flatMap((run) => subfolders(path.join(run, 'research')));
  const llmWiki = subfolders(path.join(LLM_WIKI, 'research')).flatMap(subfolders);
  return [...runs, ...llmWiki].map((folder) => path.relative(ROOT, folder));
}

export const TEMPLATE_STAGING = 'docs/episodes/<slug>';

/** `mh query` answers per path, once each: the template and every pipeline share most outputs' rules. */
export const governance = new Map<string, boolean>();

export const outputsOf = (yamls: readonly string[]): string[] =>
  yamls.flatMap((yaml) => (parse(yaml) as { jobs: { outputs?: string[] }[] }).jobs.flatMap((job) => job.outputs ?? []));

/**
 * Whether a markdown-harness rule governs a repo path, by `mh query`, which also resolves a path not written yet. A
 * lookup outside the cache batches every markdown output `yamls` name, so one pipeline's outputs cost one spawn.
 */
export function governed(file: string, yamls: readonly string[]): boolean {
  if (governance.has(file)) return governance.get(file) === true;
  const files = [
    ...new Set([file, ...outputsOf(yamls).filter((output) => output.endsWith('.md') && !governance.has(output))]),
  ];
  const answer = execFileSync(path.join(ROOT, 'node_modules/.bin/mh'), ['query', '--batch', ...files], { cwd: ROOT });
  const { results } = (JSON.parse(String(answer)) as { result: { results: { governance: string }[] } }).result;
  files.forEach((each, at) => governance.set(each, results[at].governance === 'governed'));
  return governance.get(file) === true;
}

export function pipelineContext(
  pending: readonly string[],
  staging: string,
  yamls: readonly string[],
): PipelineContext {
  const skillFiles = SKILL_FOLDERS.flatMap((folder) =>
    readdirSync(folder, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map(({ name }) => [name, path.join(folder, name, 'SKILL.md')] as const),
  );
  const skills = skillFiles.map(([name]) => name);
  const exists = (file: string): boolean => existsSync(path.join(ROOT, file));
  const disabled = skillFiles
    .filter(([, file]) =>
      /^disable-model-invocation:\s*true\s*$/m.test(readFileSync(file, 'utf8').split(/^---$/m)[1] ?? ''),
    )
    .map(([name]) => name);
  return {
    skillFolder: SKILL_FOLDER,
    skills,
    disabled,
    exists,
    staging,
    perRun: staging !== TEMPLATE_STAGING,
    // A branch in flight keeps writing its run-log.md, which no rule governs any more.
    governs: (file) => (file.endsWith('/run-log.md') && exists(file)) || governed(file, yamls),
    pending,
    retired: RETIRED,
  };
}

export function anchorOf(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/ /g, '-');
}

export function rubricsWithoutHeading(yaml: string): string[] {
  const { jobs } = parse(yaml) as { jobs: { id: string; agents: { rubric?: string }[] }[] };
  return jobs.flatMap(({ id, agents }) =>
    agents
      .flatMap(({ rubric }) => (rubric === undefined ? [] : [rubric]))
      .filter((rubric) => {
        const [file, anchor] = rubric.split('#');
        const resolved = path.join(ROOT, SKILL_FOLDER, file);
        if (!existsSync(resolved)) return true;
        const anchors = [...readFileSync(resolved, 'utf8').matchAll(/^#{1,6} (.+)$/gm)].map(([, title]) =>
          anchorOf(title),
        );
        return !anchors.includes(anchor);
      })
      .map((rubric) => `${id}: ${rubric}`),
  );
}

export function commitsWithTrailer(job: string): number {
  const hashes = execFileSync('git', ['log', '--format=%H', '-E', `--grep=^Agent: ${job}$`], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return hashes.split('\n').filter((hash) => hash !== '').length;
}

export function dossierBeforeAndAfterVoice(folder: string): { draft: string; voiced: string } | undefined {
  const file = `${folder}/dossier.md`;
  const git = (args: string[]): string => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  const at = (job: string): string | undefined => {
    const hash = git(['log', '-1', '--format=%H', '-E', `--grep=^Agent: ${job}$`, '--', file]).trim();
    if (hash !== '') return hash;
    if (commitsWithTrailer(job) === 0)
      throw new Error(`no commit in the history carries "Agent: ${job}": shallow clone?`);
    return undefined;
  };
  const [draftHash, voicedHash] = [at('write-dossier'), at('write-voice-script')];
  if (draftHash === undefined || voicedHash === undefined) return undefined;
  const voicePending = git(['rev-list', '-1', `${voicedHash}..${draftHash}`]).trim() !== '';
  if (voicePending) return undefined;
  return { draft: git(['show', `${draftHash}:${file}`]), voiced: git(['show', `${voicedHash}:${file}`]) };
}
