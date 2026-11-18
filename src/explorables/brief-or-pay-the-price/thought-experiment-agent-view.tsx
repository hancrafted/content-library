import type { CSSProperties } from 'react';
import { QUESTION_IDS, type AgentThoughtExperimentWords } from './brief-or-pay-the-price.types';
import styles from './thought-experiment.module.css';

const delay = (seconds: number): CSSProperties => ({ '--delay': `${seconds}s` }) as CSSProperties;

function Questions({ words }: { readonly words: AgentThoughtExperimentWords }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {QUESTION_IDS.map((id, index) => (
        <li
          key={id}
          data-question={id}
          style={delay(0.9 + index * 0.35)}
          className={`${styles.pop} rounded-full border border-border bg-card px-3 py-1 text-caption`}
        >
          {words.questions[id]}
        </li>
      ))}
    </ul>
  );
}

// decision: FE-012 §4.5
export function AgentThoughtExperimentView({ words }: { readonly words: AgentThoughtExperimentWords }) {
  return (
    <section
      aria-label={words.title}
      data-thought-experiment="agent"
      className="grid grid-cols-1 items-center gap-4 rounded-lg border border-border bg-card p-3 @3xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] @3xl:gap-8 @3xl:p-6"
    >
      <div
        style={delay(0)}
        className={`${styles.rise} rounded-lg border border-border bg-human/10 p-3 text-center @3xl:p-6`}
      >
        <div className="font-semibold">{words.hire}</div>
        <div className="text-caption text-muted-foreground">{words.day}</div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <p style={delay(0.3)} className={`${styles.rise} font-semibold`}>
          {words.task}
        </p>
        <Questions words={words} />
        <p style={delay(3.2)} className={`${styles.rise} text-caption text-muted-foreground`}>
          {words.caption}
        </p>
      </div>
    </section>
  );
}
