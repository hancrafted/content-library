import styles from './ai-capability.module.css';
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

const BOX = 'absolute size-3 rounded-sm';
/** Each request travels on its lane, one above the other, so five in flight stay apart. */
const laneTop = (lane: number) => ({ top: `calc(50% + ${lane * 0.85}rem)` });

/**
 * The factory (a pure view): a building with a question mark on it. Each request slides in at its door on its lane, its
 * message goes to the model and back, and only then does its result slide out. Its inside never opens.
 */
export function FactorySceneView({ frame, label }: { readonly frame: Frame; readonly label: string }) {
  const jobs = frame.jobs ?? [];
  return (
    <div role="img" aria-label={label} className={`absolute inset-0 ${frame.running ? styles.running : ''}`}>
      <Building />
      {jobs.map(({ id, lane, step }) =>
        step === 'enter' ? (
          <span
            key={`in-${id}`}
            data-step="enter"
            style={laneTop(lane)}
            className={`${styles.enter} ${BOX} left-[23%] border-2 border-muted-foreground bg-card`}
          />
        ) : step === 'leave' ? (
          <span
            key={`out-${id}`}
            data-step="leave"
            style={laneTop(lane)}
            className={`${styles.leave} ${BOX} left-[76%] bg-(--success)`}
          />
        ) : null,
      )}
    </div>
  );
}
