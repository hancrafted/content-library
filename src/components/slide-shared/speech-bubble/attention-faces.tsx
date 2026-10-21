/*
 * The three faces of the poll: 1 fine, 2 sweating, 3 fried, as plain emoji characters so the audience can type the same
 * face into the chat. The emoji is decoration for the eye; the number and the label carry the meaning for assistive
 * technology. Server-rendered, no hooks (FE-006).
 */

export type FaceLevel = 'fine' | 'sweating' | 'fried';

export const FACE_LEVELS: readonly FaceLevel[] = ['fine', 'sweating', 'fried'];

const EMOJI: Record<FaceLevel, string> = { fine: '🙂', sweating: '😅', fried: '🤯' };

interface FacesProps {
  /** What each face is called, by level, in the Slide's language. */
  readonly labels: Readonly<Record<FaceLevel, string>>;
}

/** The numbered row: 1, 2, 3, each an emoji, its number and its word. */
export function AttentionFaces({ labels }: FacesProps) {
  return (
    <ol className="m-0 flex list-none items-start justify-between gap-2 p-0" data-faces="">
      {FACE_LEVELS.map((level, i) => (
        <li key={level} className="flex flex-1 flex-col items-center gap-1" data-face={level}>
          <span className="text-heading leading-none" data-face-emoji="" aria-hidden="true">
            {EMOJI[level]}
          </span>
          <span className="text-caption font-semibold" data-face-number="">
            {i + 1}
          </span>
          <span className="text-caption text-center text-muted-foreground">{labels[level]}</span>
        </li>
      ))}
    </ol>
  );
}
