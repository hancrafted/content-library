/*
 * The staging folder's order checks (design-ADR 0004): each feedback round
 * matches its folder. It reads single files but compares a value markdown-harness cannot: a folder name.
 */

import { unless, type Finding } from './finding.pure';
import { frontmatterField } from './staging-file.pure';

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

/**
 * Checks the order a staging folder's files record. `files` maps a path
 * relative to the folder (`feedback/01/feedback.md`,
 * `research/<slug>/research.md`) to its text.
 */
export function checkStagingOrder(files: Readonly<Record<string, string>>): Finding[] {
  return [...checkFeedbackRounds(files)];
}
