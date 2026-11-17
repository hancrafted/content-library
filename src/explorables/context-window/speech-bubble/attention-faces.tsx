// decision: FE-006 §1
import styles from './speech-bubble.module.css';

export type FaceLevel = 'fine' | 'sweating' | 'fried';

export const FACE_LEVELS: readonly FaceLevel[] = ['fine', 'sweating', 'fried'];

const EMOJI: Record<FaceLevel, string> = { fine: '🙂', sweating: '😅', fried: '🤯' };

interface FacesProps {
  readonly labels: Readonly<Record<FaceLevel, string>>;
}

export function AttentionFaces({ labels }: FacesProps) {
  return (
    <ol className="m-0 flex list-none items-start justify-between gap-2 p-0" data-faces="">
      {FACE_LEVELS.map((level, i) => (
        <li key={level} className="flex flex-1 flex-col items-center gap-1" data-face={level}>
          <span className={`${styles.emoji} text-heading leading-none`} data-face-emoji="" aria-hidden="true">
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
