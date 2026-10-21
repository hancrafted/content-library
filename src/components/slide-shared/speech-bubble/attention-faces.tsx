import { cn } from '@/lib/utils';

/*
 * The three faces of the poll: 1 fine, 2 sweating, 3 fried, drawn from tokens only. The audience types the number into
 * the chat; the faces are a visual aid, not an input. Server-rendered, no hooks (FE-006).
 */

export type FaceLevel = 'fine' | 'sweating' | 'fried';

export const FACE_LEVELS: readonly FaceLevel[] = ['fine', 'sweating', 'fried'];

const TONE: Record<FaceLevel, string> = {
  fine: 'text-(--success)',
  sweating: 'text-(--warning)',
  fried: 'text-(--destructive)',
};

/** One face: a round head tinted from calm to hot, strokes in the foreground colour. */
export function Face({ level, className }: { level: FaceLevel; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 shrink-0', className)} aria-hidden="true" data-face-art={level}>
      <circle cx="16" cy="16" r="13" className={cn('fill-current/25 stroke-current', TONE[level])} strokeWidth="1.8" />
      <g className="fill-none stroke-foreground" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {level === 'fine' && (
          <>
            <circle cx="11.5" cy="13" r="1.1" className="fill-foreground" />
            <circle cx="20.5" cy="13" r="1.1" className="fill-foreground" />
            <path d="M10.5 19.5q5.5 5 11 0" />
          </>
        )}
        {level === 'sweating' && (
          <>
            <circle cx="11.5" cy="14" r="1.1" className="fill-foreground" />
            <circle cx="20.5" cy="14" r="1.1" className="fill-foreground" />
            <path d="M10.5 22q2.75-2.5 5.5 0t5.5 0" />
            <path d="M26 6q3 3.6 0 5.6-3-2 0-5.6z" className="fill-(--info) stroke-(--info)" />
          </>
        )}
        {level === 'fried' && (
          <>
            <path d="M9 11.5l5 5M14 11.5l-5 5M18 11.5l5 5M23 11.5l-5 5" />
            <path d="M10 23q1.5-3 3 0t3 0 3 0 3 0" />
          </>
        )}
      </g>
    </svg>
  );
}

interface FacesProps {
  /** What each face is called, by level, in the Slide's language. */
  readonly labels: Readonly<Record<FaceLevel, string>>;
}

/** The numbered row: 1, 2, 3, each a face and its word. */
export function AttentionFaces({ labels }: FacesProps) {
  return (
    <ol className="m-0 flex list-none items-start justify-between gap-2 p-0" data-faces="">
      {FACE_LEVELS.map((level, i) => (
        <li key={level} className="flex flex-1 flex-col items-center gap-1" data-face={level}>
          <Face level={level} />
          <span className="text-caption font-semibold" data-face-number="">
            {i + 1}
          </span>
          <span className="text-caption text-center text-muted-foreground">{labels[level]}</span>
        </li>
      ))}
    </ol>
  );
}
