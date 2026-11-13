// The real corpus the staging checks read, for the staging tests in both lanes: the staging folders under
// docs/episodes/, the new-episode skill's sample Episode and template, the llm-wiki, and the history git keeps of them.
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
/** Installed skills, then the ones authored here (design-ADR 0006). */
export const SKILL_FOLDERS = [path.join(ROOT, '.agents/skills'), path.join(ROOT, 'skills')];
export const SKILL_FOLDER = 'skills/new-episode';
export const TEMPLATE = path.join(ROOT, SKILL_FOLDER, 'assets/pipeline.yml');

/*
 * Files the template reads that later tickets create: #86 the llm-wiki index,
 * #88 the human-profile guides. The template alone tolerates them while they
 * are missing; a per-run pipeline never does. Delete an entry when its file
 * lands: a test fails until you do.
 */
export const PENDING: readonly string[] = [];
/** Files a frozen per-run pipeline may still name: of retired jobs (scaffold-pipeline, #229) or replaced assets. */
export const RETIRED: readonly string[] = [
  `${SKILL_FOLDER}/references/scaffold-pipeline.md`,
  // The Spec template replaced these two assets (#562); an approved per-run pipeline keeps the reads it was approved with.
  `${SKILL_FOLDER}/assets/spec-frame.html`,
  `${SKILL_FOLDER}/assets/spec-review.html`,
];

/** Every file under `folder`, keyed by its path relative to it with `/` separators. */
export function readFolder(folder: string): Record<string, string> {
  const entries = readdirSync(folder, { recursive: true, withFileTypes: true }).filter((entry) => entry.isFile());
  return Object.fromEntries(
    entries.map((entry) => {
      const file = path.join(entry.parentPath, entry.name);
      return [path.relative(folder, file).split(path.sep).join('/'), readFileSync(file, 'utf8')];
    }),
  );
}

/** The names in `folder` ending in `suffix`, with the suffix cut off. */
export function namesEndingIn(folder: string, suffix: string): string[] {
  return readdirSync(folder)
    .filter((name) => name.endsWith(suffix))
    .map((name) => name.slice(0, -suffix.length));
}

/**
 * What a Dossier `Visual` may name: the frame components in the Slide master
 * (`basic-page-slide.tsx` is `basic-page`), the Master slide Templates' Slide
 * folders. A library motion is a CSS module in `slide-shared/motions/`, which
 * a Slide's CSS module may `composes:` from; its name is the file name without
 * `.module.css`. The folder is empty today, so `motions` is too.
 */
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

/** The sample Episode and every staging folder, by the path a failure names. */
export function stagingFolders(): Record<string, string> {
  const staging = existsSync(EPISODES)
    ? readdirSync(EPISODES, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map(({ name }) => path.join(EPISODES, name))
    : [];
  return Object.fromEntries([SAMPLE, ...staging].map((folder) => [path.relative(ROOT, folder), folder]));
}

/** The llm-wiki research files, keyed by their path relative to the index. */
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
 * Every research folder in the repo, as a repo path: those on disk in each
 * staging folder and in each llm-wiki category folder, and those a per-run
 * pipeline will write.
 */
export function researchFolders(): string[] {
  const subfolders = (folder: string): string[] =>
    existsSync(folder)
      ? readdirSync(folder, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map(({ name }) => path.join(folder, name))
      : [];
  const staging = Object.values(stagingFolders()).flatMap((folder) => subfolders(path.join(folder, 'research')));
  const llmWiki = subfolders(path.join(LLM_WIKI, 'research')).flatMap(subfolders);
  const onDisk = [...staging, ...llmWiki].map((folder) => path.relative(ROOT, folder));
  const planned = Object.values(perRunPipelines())
    .flatMap((yaml) => (parse(yaml) as { jobs: { outputs?: string[] }[] }).jobs)
    .flatMap(({ outputs }) => outputs ?? [])
    // A draft keeps write-research's foreach glob; only a named folder is a planned one.
    .filter((output) => output.endsWith('/research.md') && !output.includes('*'))
    .map((output) => path.dirname(output));
  // A planned staging folder that Promotion already moved into the llm-wiki, under the same name, is that wiki folder.
  const promoted = new Set(llmWiki.map((folder) => path.basename(folder)));
  const unpromoted = planned.filter((folder) => !promoted.has(path.basename(folder)));
  return [...onDisk, ...unpromoted];
}

/** The template's staging folder: `<slug>` stands for the Episode a tailored copy names. */
export const TEMPLATE_STAGING = 'docs/episodes/<slug>';

/** `mh query` answers per path, once each: the template and every pipeline share most outputs' rules. */
export const governance = new Map<string, boolean>();

/** Whether a markdown-harness rule governs a repo path, by `mh query`, which also resolves a path not written yet. */
export function governed(file: string): boolean {
  const known = governance.get(file);
  if (known !== undefined) return known;
  const output = execFileSync(path.join(ROOT, 'node_modules/.bin/mh'), ['query', file], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  const answer = (JSON.parse(output) as { result: { governance: string } }).result.governance === 'governed';
  governance.set(file, answer);
  return answer;
}

/**
 * What a pipeline may name: the skills installed under `.agents/skills/` and authored under `skills/`, the files in
 * the repo, the staging folder its outputs sit in, and the outputs a rule governs.
 */
export function pipelineContext(pending: readonly string[], staging: string): PipelineContext {
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
    governs: (file) => (file.endsWith('/run-log.md') && exists(file)) || governed(file),
    pending,
    retired: RETIRED,
  };
}

/** Every per-run pipeline, by the path a failure names. */
export function perRunPipelines(): Record<string, string> {
  return Object.fromEntries(
    Object.keys(stagingFolders())
      .map((folder) => `${folder}/pipeline.yml`)
      .filter((file) => file.startsWith('docs/') && existsSync(path.join(ROOT, file)))
      .map((file) => [file, readFileSync(path.join(ROOT, file), 'utf8')]),
  );
}

/** A heading's anchor as GitHub renders it: `## Rubric` is `rubric`. */
export function anchorOf(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/ /g, '-');
}

/**
 * Every reviewer `rubric: <file>#<heading>` in a pipeline whose file has no
 * such heading, as `<job>: <rubric>`. The schema check already proves the file
 * exists; this proves the reviewer finds its pass/fail lines in it.
 */
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

/** How many commits in the checked-out history carry the `Agent: <job>` trailer; 0 when the clone is too shallow to see them. */
export function commitsWithTrailer(job: string): number {
  const hashes = execFileSync('git', ['log', '--format=%H', '-E', `--grep=^Agent: ${job}$`], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return hashes.split('\n').filter((hash) => hash !== '').length;
}

/**
 * A staging folder's Dossier as write-dossier and then write-voice-script
 * committed it, found by the `Agent: <job>` trailer of their commits. The
 * trailer exists since #107. A folder whose Run has not committed both yet has
 * nothing to compare (undefined). But when no commit in the whole history
 * carries a trailer, the history is unreadable (a shallow clone), so this
 * throws rather than let the Voice script check pass on nothing.
 */
export function dossierBeforeAndAfterVoice(folder: string): { draft: string; voiced: string } | undefined {
  const file = `${folder}/dossier.md`;
  const at = (job: string): string | undefined => {
    const hash = execFileSync('git', ['log', '-1', '--format=%H', '-E', `--grep=^Agent: ${job}$`, '--', file], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    if (hash !== '') return execFileSync('git', ['show', `${hash}:${file}`], { cwd: ROOT, encoding: 'utf8' });
    if (commitsWithTrailer(job) === 0)
      throw new Error(`no commit in the history carries "Agent: ${job}": shallow clone?`);
    return undefined;
  };
  const [draft, voiced] = [at('write-dossier'), at('write-voice-script')];
  return draft === undefined || voiced === undefined ? undefined : { draft, voiced };
}
