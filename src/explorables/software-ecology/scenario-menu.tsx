import { fillTemplate } from '@/shared/lib/template.pure';
import type { KeyboardEvent, ReactNode } from 'react';
import { Glyph } from './factory-glyph-view';
import type { ToolbarWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { MenuFace, ToolbarMenu } from './toolbar-menu.client';
import { ToolTip } from './toolbar-tip.client';

/*
 * The Scenarios menu's entries (feature guide, Interaction 2), as the reference build's `renderStates` lists them:
 * every state off the toolbar's row, each with its name, its "what to watch" line and, with a tour, its length. Arrow
 * keys move between the entries. Beside it, the Tour button and, for each Context marker a Slide places on a scenario
 * (spot `scenario:<id>`), the marker alone, its tooltip naming the scenario (feedback 08).
 */

export interface ScenarioChoice {
  readonly id: string;
  readonly name: string;
  readonly watch: string;
  /** Its tour's steps; 0 without a tour. */
  readonly steps: number;
}

export interface ScenarioMenuProps {
  readonly scenarios: readonly ScenarioChoice[];
  readonly preset: string;
  /** "{n}-step tour" */
  readonly tourSteps: string;
  readonly onPick: (id: string) => void;
}

const ARROWS: Readonly<Record<string, (i: number, n: number) => number>> = {
  ArrowDown: (i, n) => (i + 1) % n,
  ArrowUp: (i, n) => (i - 1 + n) % n,
  Home: () => 0,
  End: (_, n) => n - 1,
};

const moveFocus = (e: KeyboardEvent<HTMLDivElement>) => {
  const to = ARROWS[e.key];
  if (!to) return;
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]')];
  if (!items.length) return;
  e.preventDefault();
  items[to(items.indexOf(document.activeElement as HTMLElement), items.length)]?.focus();
};

export function ScenarioMenu(p: ScenarioMenuProps) {
  return (
    <div className="contents" onKeyDown={moveFocus}>
      {p.scenarios.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`${styles.scnI} text-caption`}
          data-control={`toolbar.scenario.${s.id}`}
          role="menuitemradio"
          aria-checked={p.preset === s.id}
          onClick={() => p.onPick(s.id)}
        >
          <b className="font-semibold">{s.name}</b>
          <span className="text-muted-foreground">{s.watch}</span>
          {s.steps ? <span className={styles.scnTour}>{fillTemplate(p.tourSteps, { n: s.steps })}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** The Scenarios button on the state row and its menu; pressed while one of its states is on. */
export function ScenariosMenu(
  p: Omit<ScenarioMenuProps, 'tourSteps'> & {
    readonly words: ToolbarWords;
    readonly open: boolean;
    readonly onOpen: (open: boolean) => void;
  },
) {
  if (!p.scenarios.length) return null;
  const pick = (id: string) => {
    p.onOpen(false);
    p.onPick(id);
  };
  return (
    <ToolbarMenu
      open={p.open}
      onOpen={p.onOpen}
      control="toolbar.scenarios"
      face={<MenuFace text={p.words.scenarios} />}
      buttonClass={`${styles.state} ${styles.stateMenu} text-caption font-medium`}
      tip=""
      label={p.words.scenariosLabel}
      pressed={p.scenarios.some((s) => s.id === p.preset)}
      role="menu"
      menuClass={styles.scn}
    >
      <ScenarioMenu {...p} tourSteps={p.words.tourSteps} onPick={pick} />
    </ToolbarMenu>
  );
}

/** Each Context marker a Slide places on a scenario, an icon beside the Tour button, its tooltip the scenario's name. */
export function ScenarioNotes(p: {
  readonly scenarios: readonly ScenarioChoice[];
  readonly markers?: Readonly<Partial<Record<string, ReactNode>>>;
}) {
  return p.scenarios.map((s) =>
    p.markers?.[s.id] ? (
      <ToolTip key={s.id} tip={s.name}>
        <span className={styles.markerHost} data-scenario-marker={s.id}>
          {p.markers[s.id]}
        </span>
      </ToolTip>
    ) : null,
  );
}

/** Tour: a guided tour of the current state, when it has one; pressed while it runs. */
export function TourButton(p: {
  readonly words: ToolbarWords;
  readonly canTour: boolean;
  readonly touring: boolean;
  readonly onTour: () => void;
}) {
  return (
    <ToolTip tip={p.words.tourTip}>
      <button
        type="button"
        className={`${styles.state} ${styles.stateTour} text-caption font-medium`}
        data-control="toolbar.tour"
        aria-disabled={!p.canTour}
        aria-pressed={p.touring}
        onClick={() => {
          if (p.canTour) p.onTour();
        }}
      >
        <Glyph name="play" className={styles.ico} />
        <span>{p.words.tour}</span>
      </button>
    </ToolTip>
  );
}
