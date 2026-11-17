// decision: docs/adr/0020-post-production-writes-youtube-metadata-from-the-repo.md
import { descriptionFingerprint, normalized } from './apply.pure.ts';
import { publishedDescription, type YoutubeFile } from './youtube-file.pure.ts';

export interface RemoteCopy {
  readonly description: string;
  readonly comment: string | undefined;
}

export interface PartComparison {
  readonly edited: boolean;
  readonly repo: string;
  readonly youtube: string;
}

export type DescriptionChange = 'none' | 'youtube' | 'repo' | 'unknown';

export interface PullComparison {
  readonly description: PartComparison;
  readonly descriptionChange: DescriptionChange;
  readonly comment: PartComparison;
}

function descriptionChange(file: YoutubeFile, part: PartComparison): DescriptionChange {
  if (!part.edited) return 'none';
  if (file.appliedFingerprint === undefined) return 'unknown';
  return descriptionFingerprint(part.youtube) === file.appliedFingerprint ? 'repo' : 'youtube';
}

function compare(repo: string, youtube: string | undefined): PartComparison {
  const local = normalized(repo);
  const remote = youtube === undefined ? local : normalized(youtube);
  return { edited: local !== remote, repo: local, youtube: remote };
}

export function comparePull(file: YoutubeFile, remote: RemoteCopy): PullComparison {
  const description = compare(publishedDescription(file), remote.description);
  return {
    description,
    descriptionChange: descriptionChange(file, description),
    comment: compare(file.pinnedComment, file.commentId === '' ? undefined : remote.comment),
  };
}
