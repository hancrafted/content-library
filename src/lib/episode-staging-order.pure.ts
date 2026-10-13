/*
 * The staging folder's order checks (design-ADR 0004): each feedback round
 * matches its folder, research is dated no earlier than its Sources were
 * accessed, and the run log runs forward in time. They read single files but
 * compare values markdown-harness cannot: a folder name, dates, a sequence.
 */

import { unless, type Finding } from './finding.pure';
import { blocksOf, bodyLines, frontmatterField, headingsOf, orderedList } from './staging-markdown.pure';

const FEEDBACK_ROUND = /^feedback\/(\d+)\/feedback\.md$/;

/** Each feedback file's `round` equals its folder number, and no two files share a round. */
function checkFeedbackRounds(files: Readonly<Record<string, string>>): Finding[] {
  const rounds = Object.entries(files).flatMap(([file, markdown]) => {
    const folder = FEEDBACK_ROUND.exec(file);
    return folder === null ? [] : [{ file, folder: Number(folder[1]), round: frontmatterField(markdown, 'round') }];
  });
  return rounds.flatMap(({ file, folder, round }, index): Finding[] => {
    const finding = (message: string): Finding => ({ kind: 'feedback-round', file, message });
    const mismatch = `Feedback round is "${round ?? 'missing'}", but the file sits in round folder ${folder}: set "round: ${folder}" or move the file to the folder of its round.`;
    const earlier = rounds.slice(0, index).find((other) => other.folder === folder);
    const shared =
      earlier === undefined
        ? ''
        : `Feedback round ${folder} is already ${earlier.file}: give each round one file, in the next free round folder.`;
    return [
      ...unless(round !== null && /^\d+$/.test(round) && Number(round) === folder, finding(mismatch)),
      ...unless(earlier === undefined, finding(shared)),
    ];
  });
}

const RESEARCH_FILE = /^research\/[^/]+\/research\.md$/;
const DAY = /^(\d{4}-\d{2}-\d{2})/;
const ACCESSED = / — accessed (\d{4}-\d{2}-\d{2})$/;

/**
 * A research file's `generated.at` day is on or after every Source's `accessed` day. A file whose `generated.at` is
 * missing or unreadable yields no finding here: markdown-harness requires the key and already reports it.
 */
function checkResearchDate(file: string, markdown: string): Finding[] {
  const generatedAt = DAY.exec(frontmatterField(markdown, 'generated.at') ?? '')?.[1];
  if (generatedAt === undefined) return [];
  const sources = blocksOf(bodyLines(markdown)).find(
    ({ heading }) => heading.level === 2 && heading.text === 'Sources',
  );
  const accessed = orderedList(sources?.body ?? []).items.flatMap(({ text }) => ACCESSED.exec(text)?.[1] ?? []);
  return accessed
    .filter((day) => day > generatedAt)
    .map((day): Finding => ({
      kind: 'research-date',
      file,
      message: `A Source was accessed ${day}, after generated.at ${generatedAt}: set generated.at to the instant the research finished, on or after the last access.`,
    }));
}

function checkResearchDates(files: Readonly<Record<string, string>>): Finding[] {
  return Object.entries(files)
    .filter(([file]) => RESEARCH_FILE.test(file))
    .flatMap(([file, markdown]) => checkResearchDate(file, markdown));
}

const RUN_LOG_ENTRY = /^\S+ · (\S+)$/;

/** The run log's h2 entries, `<job-id> · <timestamp>`, are stamped in non-decreasing time down the file. */
function checkRunLog(runLog: string | undefined): Finding[] {
  if (runLog === undefined) return [];
  const entries = headingsOf(bodyLines(runLog)).flatMap(({ level, text }) => {
    const stamp = level === 2 ? RUN_LOG_ENTRY.exec(text)?.[1] : undefined;
    const at = stamp === undefined ? Number.NaN : Date.parse(stamp);
    return Number.isNaN(at) ? [] : [{ text, at }];
  });
  return entries.slice(1).flatMap(({ text, at }, index): Finding[] => {
    const above = entries[index];
    const message = `Run-log entry "${text}" is stamped before the entry above it, "${above.text}": append each entry below the last, in the order the jobs ran.`;
    return unless(at >= above.at, { kind: 'run-log-order', file: 'run-log.md', message });
  });
}

/**
 * Checks the order a staging folder's files record. `files` maps a path
 * relative to the folder (`run-log.md`, `feedback/01/feedback.md`,
 * `research/<slug>/research.md`) to its text.
 */
export function checkStagingOrder(files: Readonly<Record<string, string>>): Finding[] {
  return [...checkFeedbackRounds(files), ...checkResearchDates(files), ...checkRunLog(files['run-log.md'])];
}
