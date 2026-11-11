import styles from './ai-capability.module.css';
import type { SceneWords } from './ai-capability.types';
import type { Frame } from './scene-frames.pure';

/** The lifecycle's four stages, in order, and who runs each: people pass the gates, agents do the work between. */
const STAGES = [
  { key: 'spec', by: 'person' },
  { key: 'build', by: 'agent' },
  { key: 'test', by: 'agent' },
  { key: 'release', by: 'person' },
] as const;

/** A person at a gate, or an agent at work, drawn above its stage. */
function Runner({ by }: { readonly by: 'person' | 'agent' }) {
  return by === 'person' ? (
    <svg viewBox="0 0 16 16" className="size-4 text-foreground" aria-hidden="true">
      <circle cx="8" cy="5" r="3" className="fill-none stroke-current" strokeWidth="1.6" />
      <path d="M2.5 15c0-3.5 2.5-5.5 5.5-5.5s5.5 2 5.5 5.5" className="fill-none stroke-current" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" className="size-4 text-(--tone)" aria-hidden="true">
      <rect x="2.5" y="4" width="11" height="9" rx="2.5" className="fill-none stroke-current" strokeWidth="1.6" />
      <path d="M8 1.5V4" className="stroke-current" strokeWidth="1.6" />
      <circle cx="6" cy="8.5" r="1" className="fill-current" />
      <circle cx="10" cy="8.5" r="1" className="fill-current" />
    </svg>
  );
}

/** The four stages in a row, each with who runs it. */
function Stages({ words }: { readonly words: SceneWords }) {
  return (
    <ol aria-hidden="true" className="absolute inset-x-[14%] top-5 grid grid-cols-4 gap-1">
      {STAGES.map(({ key, by }) => (
        <li key={key} className="flex flex-col items-center gap-1">
          <Runner by={by} />
          <span
            className={`w-full truncate rounded-md border px-0.5 py-1 text-center text-caption ${
              by === 'person' ? 'border-foreground bg-card' : 'border-(--tone) bg-(--tone)/10'
            }`}
          >
            {words[key]}
          </span>
        </li>
      ))}
    </ol>
  );
}

const BOX = 'absolute size-3 rounded-sm';
/** Each request travels on its lane, one above the other, so five in flight stay apart. */
const laneTop = (lane: number) => ({ top: `calc(62% + ${lane * 0.55}rem)` });

/**
 * The factory (a pure view): an AI-run lifecycle, spec, build, test and release, with people at the first and last gate
 * and agents between. Each request slides in on its lane, its message goes to the model and back, and only then does
 * its result slide out.
 */
export function FactorySceneView({ frame, words }: { readonly frame: Frame; readonly words: SceneWords }) {
  const jobs = frame.jobs ?? [];
  return (
    <div role="img" aria-label={words.factory} className={`absolute inset-0 ${frame.running ? styles.running : ''}`}>
      <Stages words={words} />
      <span
        aria-hidden="true"
        className="absolute inset-x-[14%] top-[62%] mt-1.5 border-t border-dashed border-border"
      />
      {jobs.map(({ id, lane, step }) =>
        step === 'enter' ? (
          <span
            key={`in-${id}`}
            data-step="enter"
            style={laneTop(lane)}
            className={`${styles.enter} ${BOX} left-[8%] border-2 border-muted-foreground bg-card`}
          />
        ) : step === 'leave' ? (
          <span
            key={`out-${id}`}
            data-step="leave"
            style={laneTop(lane)}
            className={`${styles.leave} ${BOX} left-[84%] bg-(--success)`}
          />
        ) : null,
      )}
    </div>
  );
}
