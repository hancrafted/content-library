// The pure half of `npm run youtube:pull`: how a video's live description and comment differ from the repo copy.
// Read-only input for the Learn branch of /episode-author-youtube-metadata; the repo stays the source (design-ADR 0020).
import { descriptionFingerprint, normalized } from './apply.pure.ts';
import { publishedDescription, type YoutubeFile } from './youtube-file.pure.ts';

/** What YouTube shows: the description, and the posted comment's text when one was posted and found. */
export interface RemoteCopy {
  readonly description: string;
  readonly comment: string | undefined;
}

/** One part compared: edited when YouTube shows other text than the repo would send. */
export interface PartComparison {
  readonly edited: boolean;
  readonly repo: string;
  readonly youtube: string;
}

/**
 * Who moved the description, read from the fingerprint apply stored: `youtube` when YouTube no longer shows what apply
 * sent (a Studio edit, input for Learn), `repo` when it still does (a repo change not yet applied), `unknown` without a
 * fingerprint, `none` when they agree.
 */
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

/** The repo copy against the live one; a comment not yet posted counts as unedited. */
export function comparePull(file: YoutubeFile, remote: RemoteCopy): PullComparison {
  const description = compare(publishedDescription(file), remote.description);
  return {
    description,
    descriptionChange: descriptionChange(file, description),
    comment: compare(file.pinnedComment, file.commentId === '' ? undefined : remote.comment),
  };
}
