import styles from './ai-disciplines.module.css';
import type { Frame } from './scene-frames.pure';

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

const BOX = 'absolute top-[69%] h-4 w-3 rounded-sm';

/**
 * The factory (a pure view): a building with a question mark on it. Each request slides in at its door, its message goes
 * to the model and back, and only then does a result slide out. Its inside never opens.
 */
export function FactorySceneView({ frame, label }: { readonly frame: Frame; readonly label: string }) {
  const jobs = frame.jobs ?? [];
  return (
    <div role="img" aria-label={label} className={`absolute inset-0 ${frame.running ? styles.running : ''}`}>
      <Building />
      {jobs.map(({ id, step }) =>
        step === 'enter' ? (
          <span
            key={`in-${id}`}
            data-step="enter"
            className={`${styles.enter} ${BOX} left-[22%] border-2 border-muted-foreground bg-card`}
          />
        ) : step === 'leave' ? (
          <span key={`out-${id}`} data-step="leave" className={`${styles.leave} ${BOX} left-[74%] bg-(--success)`} />
        ) : null,
      )}
    </div>
  );
}
