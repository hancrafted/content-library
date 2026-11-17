// decision: docs/adr/0004-episode-content-is-staged-then-promoted.md
import { unless, type Finding } from './finding.pure';
import { frontmatterField } from './staging-file.pure';

const FEEDBACK_ROUND = /^feedback\/(\d+)\/feedback\.md$/;

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

export function checkStagingOrder(files: Readonly<Record<string, string>>): Finding[] {
  return [...checkFeedbackRounds(files)];
}
