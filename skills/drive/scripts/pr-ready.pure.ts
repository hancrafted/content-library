export function topicOf(branch: string): string | null {
  const slash = branch.indexOf('/');
  return slash < 1 || slash === branch.length - 1 ? null : branch.slice(slash + 1);
}

export function reviewPath(topic: string): string {
  return `.scratch/${topic}/review.md`;
}

export function readyProblem(topic: string, reviewExists: boolean): string | null {
  return reviewExists
    ? null
    : `${reviewPath(topic)} does not exist: run the review (references/review.md) and log its verdicts before marking the PR ready`;
}
