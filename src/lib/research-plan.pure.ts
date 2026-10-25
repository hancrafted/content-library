import { unless, type Finding } from './finding.pure';

/*
 * The research plan retrieval writes, `docs/episodes/<slug>/research-plan.md`, read item by item and checked against
 * the Research questions of the wiki and every Staging (design-ADR 0016, Pipeline and evidence rules 1 to 7). Its
 * `## Research jobs` lists one job per question needing research, and nothing when every question is reused; its
 * `## Reuse` lists each question an existing Research question already answers:
 *
 *   - new: <folder>, question <n>, informs <concept-id>, …
 *   - refresh: <folder>, question <n>, refreshes <id>
 *   - migrate: <folder>, <slide-slug>, informs <concept-id>, …
 *   - Question <n>: reuse <id>, confidence <value>, fresh until <date>
 *   - Slide <n>: reuse <id>, confidence <value>, fresh until <date>
 *
 * A `Slide <n>` reuse is a question a Slide the Slide plan reuses or adapts already cites (rule 13): it needs no job
 * and no Dossier citation, since the Slide keeps citing it.
 *
 * markdown-harness governs the headings; this checks what it cannot: the references the items make.
 */

/** One item of the plan, as retrieval decided it. */
export type ResearchPlanItem =
  | { readonly kind: 'new'; readonly folder: string; readonly question: number; readonly informs: readonly string[] }
  | { readonly kind: 'refresh'; readonly folder: string; readonly question: number; readonly stale: string }
  | { readonly kind: 'migrate'; readonly folder: string; readonly slide: string; readonly informs: readonly string[] }
  | {
      readonly kind: 'reuse';
      readonly id: string;
      /** The Brief's research question it answers, or undefined for one a reused or adapted Slide cites. */
      readonly question: number | undefined;
      /** The Brief's Slide whose kept Slide cites it, for a `Slide <n>` reuse. */
      readonly slide: number | undefined;
      readonly confidence: string | undefined;
      readonly freshUntil: string | undefined;
    };

/** What the plan is checked against: its own Staging folder, every Research question and every Concept. */
export interface ResearchPlanContext {
  /** The plan's Staging folder, `docs/episodes/<slug>`. */
  readonly staging: string;
  /** Every Research question in the wiki and in every Staging, by id and file path. */
  readonly research: readonly { readonly id: string; readonly path: string }[];
  readonly concepts: readonly string[];
}

const JOBS = /^## Research jobs$/;
const REUSE = /^## Reuse$/;
const FOLDER = /^([A-Z]+-\d{4})__[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ID = /^[A-Z]+-\d{4}$/;

/** The list items under the h2 the pattern matches, each without its bullet. */
function itemsUnder(lines: readonly string[], heading: RegExp): string[] {
  const start = lines.findIndex((line) => heading.test(line.trim()));
  if (start === -1) return [];
  const end = lines.findIndex((line, at) => at > start && /^#{1,2} /.test(line));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .filter((line) => /^[-*] /.test(line))
    .map((line) => line.replace(/^[-*] /, '').trim());
}

/** The comma-separated parts of an item, its closing full stop dropped. */
function partsOf(text: string): string[] {
  return text
    .replace(/\.$/, '')
    .split(',')
    .map((part) => part.trim());
}

function questionOf(part: string | undefined): number | undefined {
  const match = /^question (\d+)$/.exec(part ?? '');
  return match ? Number(match[1]) : undefined;
}

/** The Concept ids after `informs`: the first part opens with the word, every later part is one more id. */
function informsOf(parts: readonly string[]): string[] {
  const at = parts.findIndex((part) => part.startsWith('informs '));
  if (at === -1) return [];
  return [parts[at].slice('informs '.length).trim(), ...parts.slice(at + 1)].filter((id) => id !== '');
}

/** A job's parts after its folder, read by its kind; nothing when they do not fit that kind's form. */
const JOB_READERS = {
  new: (folder: string, [second, ...others]: string[]): ResearchPlanItem | undefined => {
    const question = questionOf(second);
    return question === undefined ? undefined : { kind: 'new', folder, question, informs: informsOf(others) };
  },
  refresh: (folder: string, [second, third]: string[]): ResearchPlanItem | undefined => {
    const question = questionOf(second);
    const stale = /^refreshes ([A-Z]+-\d{4})$/.exec(third ?? '')?.[1];
    return question === undefined || stale === undefined ? undefined : { kind: 'refresh', folder, question, stale };
  },
  migrate: (folder: string, [slide, ...others]: string[]): ResearchPlanItem | undefined =>
    slide ? { kind: 'migrate', folder, slide, informs: informsOf(others) } : undefined,
};

function readJob(text: string): ResearchPlanItem | undefined {
  const match = /^(new|refresh|migrate): (.*)$/.exec(text);
  if (!match) return undefined;
  const [folder, ...rest] = partsOf(match[2]);
  return FOLDER.test(folder ?? '') ? JOB_READERS[match[1] as keyof typeof JOB_READERS](folder, rest) : undefined;
}

function readReuse(text: string): ResearchPlanItem | undefined {
  const match = /^(Question|Slide) (\d+): reuse (.*)$/.exec(text);
  if (!match) return undefined;
  const [id, ...others] = partsOf(match[3]);
  if (!ID.test(id ?? '')) return undefined;
  const after = (word: string) =>
    others
      .find((part) => part.startsWith(`${word} `))
      ?.slice(word.length + 1)
      .trim() || undefined;
  return {
    kind: 'reuse',
    id,
    question: match[1] === 'Question' ? Number(match[2]) : undefined,
    slide: match[1] === 'Slide' ? Number(match[2]) : undefined,
    confidence: after('confidence'),
    freshUntil: after('fresh until'),
  };
}

const UNREAD =
  'none of `new: <folder>, question <n>, informs <concept-id>, …`, `refresh: <folder>, question <n>, refreshes <id>`, `migrate: <folder>, <slide-slug>, informs <concept-id>, …` under Research jobs, or `Question <n>: reuse <id>, confidence <value>, fresh until <date>` or `Slide <n>: reuse …` under Reuse';

/** Each list item of the plan, as written, with what it reads as: nothing for a line of no known form. */
function readItems(markdown: string): { text: string; item: ResearchPlanItem | undefined }[] {
  const lines = markdown.split('\n');
  return [
    ...itemsUnder(lines, JOBS).map((text) => ({ text, item: readJob(text) })),
    ...itemsUnder(lines, REUSE).map((text) => ({ text, item: readReuse(text) })),
  ];
}

/** The plan's items that read as one of the four forms; a line of no known form is the check's finding. */
export function readResearchPlan(markdown: string): ResearchPlanItem[] {
  return readItems(markdown).flatMap(({ item }) => (item ? [item] : []));
}

function idOf(folder: string): string {
  return FOLDER.exec(folder)?.[1] ?? folder;
}

type Exists = (id: string) => boolean;

function reuseProblems(item: Extract<ResearchPlanItem, { kind: 'reuse' }>, text: string, exists: Exists): string[] {
  return [
    ...unless(
      exists(item.id),
      `"${text}" reuses ${item.id}, which no Research question in the wiki or any Staging has.`,
    ),
    ...unless(
      item.confidence !== undefined && item.freshUntil !== undefined,
      `"${text}" names no confidence or no fresh-until date; write \`, confidence <value>, fresh until <date>\` from the question's frontmatter.`,
    ),
  ];
}

function refreshProblems(item: Extract<ResearchPlanItem, { kind: 'refresh' }>, text: string, exists: Exists): string[] {
  const written = idOf(item.folder);
  return [
    ...unless(exists(item.stale), `"${text}" refreshes ${item.stale}, which no Research question has.`),
    ...unless(
      written === item.stale,
      `"${text}" writes ${written}, not the stale id ${item.stale}: a refresh keeps the id, so every note citing it still resolves.`,
    ),
  ];
}

/** A new or migrate job: it informs Concepts that exist, and writes an id no other file holds. */
function jobProblems(
  item: Extract<ResearchPlanItem, { kind: 'new' | 'migrate' }>,
  text: string,
  context: ResearchPlanContext,
): string[] {
  const own = `${context.staging}/research/${item.folder}/research.md`;
  const taken = context.research.find((each) => each.id === idOf(item.folder) && each.path !== own);
  return [
    ...unless(
      item.informs.length > 0,
      `The research job "${text}" names no Concept it informs; end it with \`informs <concept-id>, …\`, the main Concept first.`,
    ),
    ...item.informs
      .filter((concept) => !context.concepts.includes(concept))
      .map((concept) => `The research job "${text}" informs ${concept}, which is no Concept.`),
    ...(taken === undefined
      ? []
      : [
          `The research job "${text}" writes ${idOf(item.folder)}, which ${taken.path} already holds: reuse that question, or take the next free number.`,
        ]),
  ];
}

function problemsOf(item: ResearchPlanItem, text: string, context: ResearchPlanContext): string[] {
  const exists = (id: string) => context.research.some((each) => each.id === id);
  if (item.kind === 'reuse') return reuseProblems(item, text, exists);
  if (item.kind === 'refresh') return refreshProblems(item, text, exists);
  return jobProblems(item, text, context);
}

/**
 * One finding per item that is of no known form, names no Concept or one that does not exist, reuses or refreshes an
 * id no Research question has, refreshes under another id, or writes an id another file already holds.
 */
export function checkResearchPlan(file: string, markdown: string, context: ResearchPlanContext): Finding[] {
  const messages = readItems(markdown).flatMap(({ text, item }) =>
    item === undefined ? [`"${text}" is ${UNREAD}.`] : problemsOf(item, text, context),
  );
  return messages.map((message): Finding => ({ kind: 'research-plan', file, message }));
}

/**
 * The staged Research questions that shadow a wiki id with leave (design-ADR 0016, Pipeline and evidence rule 4): each
 * one whose own Staging's plan lists it as `refresh` of that id, while the wiki holds the id once and no other Staging
 * holds it. The duplicate-id check passes over exactly these.
 */
export function refreshShadows<R extends { readonly id: string; readonly path: string; readonly staged: boolean }>(
  research: readonly R[],
  plans: readonly { readonly path: string; readonly markdown: string }[],
): Set<R> {
  const refreshes = plans.flatMap(({ path, markdown }) => {
    const staging = path.replace(/\/research-plan\.md$/, '');
    return readResearchPlan(markdown).flatMap((item) =>
      item.kind === 'refresh' ? [`${staging}/research/${item.folder}/research.md#${item.stale}`] : [],
    );
  });
  return new Set(
    research.filter((record) => {
      const sharing = research.filter(({ id }) => id === record.id);
      const pair = sharing.length === 2 && sharing.filter(({ staged }) => !staged).length === 1;
      return record.staged && pair && refreshes.includes(`${record.path}#${record.id}`);
    }),
  );
}
