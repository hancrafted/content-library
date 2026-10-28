import styles from './ai-disciplines.module.css';
import type { Frame } from './scene-frames.pure';

const LATER = ['', styles.later, styles.latest] as const;

/** The building: a chimney with smoke, a saw-tooth roof and a question mark where its inside would show. */
function Building() {
  return (
    <svg viewBox="0 0 220 176" className="absolute inset-0 size-full" aria-hidden="true">
      <circle cx="151" cy="34" r="6" className={`${styles.smoke} fill-border`} />
      <rect x="144" y="40" width="14" height="40" className="fill-muted-foreground" />
      <path
        d="M60 150V86l26-18v18l26-18v18l26-18v18h28v64z"
        className="fill-card stroke-muted-foreground"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <text x="113" y="132" textAnchor="middle" className="fill-muted-foreground text-heading font-semibold">
        ?
      </text>
    </svg>
  );
}

/**
 * The factory (a pure view): a building with a question mark on it, requests sliding in on the left, results sliding
 * out on the right while it runs. What happens inside is the open question, so it never opens.
 */
export function FactorySceneView({ frame, label }: { readonly frame: Frame; readonly label: string }) {
  return (
    <div role="img" aria-label={label} className={`absolute inset-0 ${frame.running ? styles.running : ''}`}>
      <Building />
      {LATER.map((delay, index) => (
        <span
          key={`in-${index}`}
          className={`${styles.item} ${styles.in} ${delay} absolute top-[67%] left-[4%] h-5 w-4 rounded-sm border-2 border-muted-foreground bg-card`}
        />
      ))}
      {LATER.map((delay, index) => (
        <span
          key={`out-${index}`}
          className={`${styles.item} ${styles.out} ${delay} absolute top-[67%] left-[74%] h-5 w-4 rounded-sm bg-(--success)`}
        />
      ))}
    </div>
  );
}
