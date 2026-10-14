import type { ReplayControls } from '@/lib/dashboard-replay.pure';
import { stageTitle } from '@/lib/dashboard-stages.pure';
import { fillTemplate } from '@/lib/template.pure';
import type { KeyboardEvent } from 'react';
import { useId } from 'react';
import type { DashboardCopy } from './dashboard-evidence';

const SECOND = 1000;
/** Arrow keys move a minute, Page Up and Page Down ten; Home and End keep their native jump to either end. */
const KEY_STEPS: Readonly<Record<string, number>> = {
  ArrowRight: 60,
  ArrowUp: 60,
  ArrowLeft: -60,
  ArrowDown: -60,
  PageUp: 600,
  PageDown: -600,
};
const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function position(at: number, start: number, copy: DashboardCopy) {
  return fillTemplate(copy.timeTravel.position, {
    minutes: Math.floor((at - start) / (60 * SECOND)),
    time: clock.format(at),
  });
}

interface SliderProps {
  replay: ReplayControls;
  range: NonNullable<ReplayControls['range']>;
  at: number;
  copy: DashboardCopy;
}

function StageTicks({
  id,
  replay,
  start,
  copy,
}: {
  id: string;
  replay: ReplayControls;
  start: number;
  copy: DashboardCopy;
}) {
  return (
    <datalist id={id}>
      {replay.marks.map((mark) => (
        <option
          key={mark.stage}
          value={Math.round((mark.at - start) / SECOND)}
          label={stageTitle(mark.stage, copy.graph.stageNames)}
        />
      ))}
    </datalist>
  );
}

/** Seconds since Run start; the stage marks become tick marks through the datalist. */
function RangeInput({ replay, range, at, copy, id }: SliderProps & { id: string }) {
  const ticks = useId();
  const max = Math.ceil((range.end - range.start) / SECOND);
  const value = Math.round((at - range.start) / SECOND);
  const moveTo = (seconds: number) => replay.seek(range.start + Math.min(Math.max(seconds, 0), max) * SECOND);
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const step = KEY_STEPS[event.key];
    if (step === undefined) return;
    event.preventDefault();
    moveTo(value + step);
  };
  return (
    <>
      <input
        id={id}
        type="range"
        min={0}
        max={max}
        step={1}
        value={value}
        list={ticks}
        onChange={(event) => moveTo(Number(event.target.value))}
        onKeyDown={onKeyDown}
        aria-valuetext={position(at, range.start, copy)}
        className="h-11 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
      <StageTicks id={ticks} replay={replay} start={range.start} copy={copy} />
    </>
  );
}

function ReplaySlider({ replay, range, at, copy }: SliderProps) {
  const slider = useId();
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <label htmlFor={slider} className="text-caption font-medium">
          {copy.timeTravel.slider}
        </label>
        <p className="font-mono text-caption tabular-nums">{position(at, range.start, copy)}</p>
      </div>
      <RangeInput replay={replay} range={range} at={at} copy={copy} id={slider} />
      <p className="text-caption text-muted-foreground">{copy.timeTravel.replaying}</p>
    </div>
  );
}

/** The Live checkbox and, off, the slider that replays the Run up to a chosen moment. */
export function TimeTravel({ replay, copy }: { replay: ReplayControls; copy: DashboardCopy }) {
  const help = useId();
  return (
    <section
      aria-label={copy.timeTravel.title}
      className="space-y-3 rounded-2xl border border-border bg-card p-4 sm:p-6"
    >
      <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3 text-body font-medium">
        <input
          type="checkbox"
          checked={replay.live}
          disabled={replay.range === null}
          onChange={(event) => replay.setLive(event.target.checked)}
          aria-describedby={help}
          className="size-5 cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        />
        {copy.timeTravel.live}
      </label>
      <p id={help} className="text-caption text-muted-foreground">
        {copy.timeTravel.liveHelp}
      </p>
      {replay.range !== null && replay.at !== null ? (
        <ReplaySlider replay={replay} range={replay.range} at={replay.at} copy={copy} />
      ) : null}
    </section>
  );
}
