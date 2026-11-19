import { topicOfBranch } from './branch-topic.pure.ts';

export function topicOf(branch: string): string | null {
  const parsed = topicOfBranch(branch);
  return parsed === null || parsed.task !== null || !branch.includes('/') ? null : parsed.topic;
}

export function reviewPath(topic: string): string {
  return `.scratch/${topic}/review.md`;
}

export function notIntegrationBranch(branch: string): string {
  return `${branch} is not an Integration branch (<type>/<slug>); run drive pr ready on the Integration PR, not a Task branch`;
}

export function readyProblem(topic: string, reviewExists: boolean): string | null {
  return reviewExists
    ? null
    : `${reviewPath(topic)} does not exist: run the review (references/review.md) and log its verdicts before marking the PR ready`;
}
