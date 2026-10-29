// The video facts file of the Recording model: `video.<lang>.json`, written by `youtube:transcript` from what YouTube
// reports about the recording, and the rule that needs it: the last YouTube chapter lasts at least 10 seconds.
import type { Chapter } from './chapters.pure.ts';
import type { Violation } from './recording.pure.ts';

/** The files `video.<lang>.json`. */
export const VIDEO_FILE = /^video\.[a-z]{2}\.json$/;

/** YouTube's minimum chapter length (YouTube Help 9884579). */
const MIN_CHAPTER_SECONDS = 10;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** The content of `video.<lang>.json`: what the video is, as YouTube reports it. */
interface VideoFacts {
  readonly videoId: string;
  /** The video's length in seconds. */
  readonly durationSeconds: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isPositiveNumber(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function parseVideoFacts(text: string): { value: VideoFacts } | { problems: string[] } {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { problems: ['is not valid JSON'] };
  }
  if (!isRecord(json)) return { problems: ['must be a JSON object {videoId, durationSeconds}'] };
  const problems: string[] = [];
  if (typeof json.videoId !== 'string' || !YOUTUBE_ID.test(json.videoId)) {
    problems.push('videoId must be an 11-character YouTube id');
  }
  if (!isPositiveNumber(json.durationSeconds)) problems.push('durationSeconds must be a number of seconds above 0');
  return problems.length > 0 ? { problems } : { value: json as unknown as VideoFacts };
}

export function videoViolations(file: string, text: string): Violation[] {
  const parsed = parseVideoFacts(text);
  return 'problems' in parsed ? parsed.problems.map((message) => ({ file, message })) : [];
}

/** The problem of a last chapter shorter than YouTube's minimum for the video's length; `text` is the video file, if any. */
export function lastChapterProblems(chapters: readonly Chapter[], text: string | undefined): string[] {
  const last = chapters.at(-1);
  const parsed = text === undefined ? undefined : parseVideoFacts(text);
  if (last === undefined || parsed === undefined || 'problems' in parsed) return [];
  return parsed.value.durationSeconds - last.start < MIN_CHAPTER_SECONDS
    ? [
        `the last chapter "${last.title}" must be at least ${MIN_CHAPTER_SECONDS}s long: the video is ${parsed.value.durationSeconds}s`,
      ]
    : [];
}
