'use client';

import type { ReplayControls } from '@/hooks/use-dashboard-replay';
import { scrubPosition, scrubTime } from '@/lib/dashboard-scrub.pure';
import { fillTemplate } from '@/lib/template.pure';
import { useId, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { formatDuration } from '../../../skills/new-episode/scripts/run-log-tree.pure';
import type { DashboardCopy } from './dashboard-evidence';
import styles from './dashboard-graph.module.css';

const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const STEPS: Readonly<Record<string, number>> = {
  ArrowRight: 60_000,
  ArrowUp: 60_000,
  ArrowLeft: -60_000,
  ArrowDown: -60_000,
  PageUp: 600_000,
  PageDown: -600_000,
};

export function LiveToggle({ replay, copy }: { replay: ReplayControls; copy: DashboardCopy }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-body font-medium">
      <input
        type="checkbox"
        checked={replay.live}
        disabled={!replay.range}
        onChange={(event) => replay.setLive(event.target.checked)}
        className="size-5 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-ring"
      />
      {copy.timeTravel.live}
    </label>
  );
}

interface ScrubProps {
  replay: ReplayControls;
  range: NonNullable<ReplayControls['range']>;
  copy: DashboardCopy;
}

function scrubState({ replay, range, copy }: ScrubProps) {
  const at = replay.at ?? range.end;
  const fraction = replay.live ? 1 : scrubPosition(replay.timeline, at);
  const text = fillTemplate(copy.timeTravel.position, {
    minutes: Math.floor((at - range.start) / 60_000),
    time: clock.format(at),
  });
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const step = STEPS[event.key];
    if (step === undefined && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    replay.seek(event.key === 'Home' ? range.start : event.key === 'End' ? range.end : at + step);
  };
  return { fraction, text, onKeyDown };
}

interface InputProps {
  replay: ReplayControls;
  copy: DashboardCopy;
  state: ReturnType<typeof scrubState>;
  help: string;
  onDrag: (dragging: boolean) => void;
}

function ScrubInput({ replay, copy, state, help, onDrag }: InputProps) {
  return (
    <input
      type="range"
      role="slider"
      min={0}
      max={10000}
      step={1}
      value={Math.round(state.fraction * 10000)}
      aria-label={copy.timeTravel.slider}
      aria-valuetext={state.text}
      aria-describedby={help}
      onChange={(event) => replay.seek(scrubTime(replay.timeline, Number(event.target.value) / 10000))}
      onKeyDown={state.onKeyDown}
      onPointerDown={() => onDrag(true)}
      onPointerUp={() => onDrag(false)}
      onPointerCancel={() => onDrag(false)}
      onBlur={() => onDrag(false)}
      className={styles.scrubInput}
    />
  );
}

function Scrubber({ replay, range, copy }: ScrubProps) {
  const help = useId();
  const [dragging, setDragging] = useState(false);
  const state = scrubState({ replay, range, copy });
  return (
    <div className={styles.scrubber} style={{ '--scrub-position': `${state.fraction * 100}%` } as CSSProperties}>
      <div className="relative">
        {dragging ? (
          <output className={`${styles.bubble} text-caption`} aria-hidden="true">
            {state.text}
          </output>
        ) : null}
        <ScrubInput replay={replay} copy={copy} state={state} help={help} onDrag={setDragging} />
      </div>
      <div className="flex items-baseline justify-between gap-3 font-mono text-caption text-muted-foreground tabular-nums">
        <time dateTime={new Date(range.start).toISOString()}>{clock.format(range.start)}</time>
        <span aria-label={copy.duration}>{formatDuration(range.end - range.start)}</span>
      </div>
      <p id={help} className="sr-only">
        {copy.timeTravel.keyboard} {copy.timeTravel.replaying}
      </p>
    </div>
  );
}

/** The progress track itself is the native keyboard- and pointer-operable scrubber. */
export function TimeTravel({ replay, copy }: { replay: ReplayControls; copy: DashboardCopy }) {
  return replay.range ? <Scrubber replay={replay} range={replay.range} copy={copy} /> : null;
}
