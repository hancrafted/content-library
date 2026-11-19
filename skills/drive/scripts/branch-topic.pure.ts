export interface BranchTopic {
  topic: string;
  task: string | null;
}

export function topicOfBranch(branch: string): BranchTopic | null {
  const found = /^(?:[^/]+\/)?([^/-][^/]*?)(?:--([^/]*))?$/.exec(branch);
  if (found === null || found[1] === '' || found[2] === '') return null;
  return { topic: found[1], task: found[2] ?? null };
}
