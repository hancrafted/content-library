'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { useState, type ReactNode } from 'react';
import { CompareWidget, type CompareWidgetProps } from './compare-widget';
import type { DisplayMenuProps } from './display-menu';
import type { ExchangeButtonsProps } from './exchange-buttons';
import { Glyph } from './factory-glyph-view';
import type { MechanicsMenuProps } from './mechanics-menu.client';
import type { ModelMenuProps } from './model-menu.client';
import { ScenarioNotes, ScenariosMenu, TourButton, type ScenarioChoice } from './scenario-menu';
import { SettingsMenu } from './settings-menu.client';
import type { SettingsWords, ToolbarWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { TimeControls, type ClockAt } from './time-controls.client';
import { ToolbarMenu } from './toolbar-menu.client';
import { ToolTip } from './toolbar-tip.client';

export interface Choice {
  readonly id: string;
  readonly name: string;
}

export interface ToolbarProps {
  readonly words: ToolbarWords;
  readonly settingsWords: SettingsWords;
  readonly states: readonly Choice[];
  readonly preset: string;
  readonly onPreset: (id: string) => void;
  readonly useCases: readonly Choice[];
  readonly useCase: string;
  readonly onUseCase: (id: string) => void;
  /** The use case's one-line description: the picker's tooltip, since the toolbar carries no description line. */
  readonly sub: string;
  readonly speed: number;
  readonly onSpeed: (n: number) => void;
  readonly onClear: () => void;
  readonly clock: string;
  readonly clockAt: ClockAt;
  readonly statesTarget?: TargetProps;
  readonly statesMarker?: ReactNode;
  /** Every state off the row, for the Scenarios menu, and the markers a Slide places beside its entries. */
  readonly scenarios: readonly ScenarioChoice[];
  readonly scenarioMarkers?: Readonly<Partial<Record<string, ReactNode>>>;
  /** The state has a tour; a tour is on. */
  readonly canTour: boolean;
  readonly touring: boolean;
  readonly onTour: () => void;
  readonly modified: boolean;
  readonly model: ModelMenuProps;
  readonly mechanics: MechanicsMenuProps;
  readonly display: DisplayMenuProps;
  /** Compare mode: the toggle, the picked slots, Show and Exit. */
  readonly compare: CompareWidgetProps;
  /** Download YAML and Upload, at the Settings popover's foot. */
  readonly exchange: ExchangeButtonsProps;
}

type MenuId = 'scenarios' | 'speed' | 'settings' | null;
type Opener = (id: Exclude<MenuId, null>) => (on: boolean) => void;
interface MenuState {
  readonly open: MenuId;
  readonly opener: Opener;
}

/** The circled digits before the three state steps' names. */
const STEP_MARKS = ['①', '②', '③'] as const;

/** A close never undoes the other menu's open: the outside click that opens one closes only the other. */
const nextMenu = (cur: MenuId, id: Exclude<MenuId, null>, on: boolean): MenuId => (on ? id : cur === id ? null : cur);

/** One state button; the active one carries a dot once a dial was turned after picking it. */

interface StateButtonProps {
  readonly s: Choice;
  readonly n: number;
  readonly on: boolean;
  readonly modified: boolean;
  readonly words: ToolbarWords;
  readonly onPick: () => void;
}

function StateButton(p: StateButtonProps) {
  const dotted = p.on && p.modified;
  return (
    <ToolTip tip={dotted ? p.words.modifiedTip : ''}>
      <button
        type="button"
        className={`${styles.state} text-caption font-medium`}
        data-control={`toolbar.state.${p.s.id}`}
        aria-pressed={p.on}
        onClick={p.onPick}
      >
        <span className={`${styles.stepNo} text-caption`} aria-hidden="true">
          {STEP_MARKS[p.n - 1]}
        </span>
        {p.s.name}
        {dotted ? (
          <>
            <span className={styles.modDot} aria-hidden="true" />
            <span className="sr-only">{` (${p.words.modified})`}</span>
          </>
        ) : null}
      </button>
    </ToolTip>
  );
}

/** The three steps, Who does what, In theory and In practice, numbered, as one segmented group; the Scenarios menu; Tour; the markers a Slide places. */
function States(p: ToolbarProps & MenuState) {
  return (
    <div className={styles.states} role="group" aria-label={p.words.states} {...p.statesTarget}>
      <span className={styles.stateSeg}>
        {p.states.map((s, i) => (
          <StateButton
            key={s.id}
            s={s}
            n={i + 1}
            on={p.preset === s.id}
            modified={p.modified}
            words={p.words}
            onPick={() => p.onPreset(s.id)}
          />
        ))}
      </span>
      <ScenariosMenu
        words={p.words}
        scenarios={p.scenarios}
        preset={p.preset}
        open={p.open === 'scenarios'}
        onOpen={p.opener('scenarios')}
        onPick={p.onPreset}
      />
      <TourButton {...p} />
      <ScenarioNotes scenarios={p.scenarios} markers={p.scenarioMarkers} />
      {p.statesMarker}
    </div>
  );
}

/** The use case picker: the factory glyph and the name; its tooltip is the use case's description. */
function UseCase(p: Pick<ToolbarProps, 'words' | 'useCases' | 'useCase' | 'onUseCase' | 'sub'>) {
  return (
    <ToolTip tip={p.sub}>
      <span className={styles.usecase}>
        <Glyph name="factory" className={styles.ico} />
        <select
          className={`${styles.select} text-caption font-semibold`}
          data-control="toolbar.use-case"
          aria-label={p.words.useCase}
          value={p.useCase}
          onChange={(e) => p.onUseCase(e.target.value)}
        >
          {p.useCases.map((u) => (
            <option key={u.id} value={u.id} data-control={`toolbar.use-case.${u.id}`}>
              {u.name}
            </option>
          ))}
        </select>
      </span>
    </ToolTip>
  );
}

/** The one Settings button and its popover: Model, Mechanics and Display in two columns, Reset and the file at the foot. */
function Settings(p: ToolbarProps & MenuState) {
  const w = p.settingsWords;
  return (
    <ToolbarMenu
      open={p.open === 'settings'}
      onOpen={p.opener('settings')}
      face={<Glyph name="settings" className={styles.ico} />}
      control="toolbar.settings"
      ariaLabel={w.button}
      tip={w.tip}
      buttonClass={`${styles.tbtn} ${styles.tbtnLine} text-caption`}
      label={w.label}
      role="dialog"
      placement="window"
    >
      {(close) => (
        <SettingsMenu
          words={w}
          model={p.model}
          mechanics={p.mechanics}
          display={p.display}
          exchange={p.exchange}
          onClose={close}
        />
      )}
    </ToolbarMenu>
  );
}

/**
 * The toolbar, one row at laptop width (feature guide, Interaction 1; feedback 08): the states, Scenarios, Tour and a
 * Slide's markers; Compare; Pause, speed, Clear and the clock; the use case; Settings. Below laptop width it wraps.
 */
export function FactoryToolbar(p: ToolbarProps) {
  // the Scenarios, speed and Settings menus: one open at a time
  const [open, setOpen] = useState<MenuId>(null);
  const opener: Opener = (id) => (on) => setOpen((cur) => nextMenu(cur, id, on));
  return (
    <div className={styles.toolbar} role="toolbar" aria-label={p.words.label}>
      <States {...p} open={open} opener={opener} />
      <CompareWidget {...p.compare} />
      <TimeControls
        words={p.words}
        speed={p.speed}
        onSpeed={p.onSpeed}
        onClear={p.onClear}
        clock={p.clock}
        clockAt={p.clockAt}
        open={open === 'speed'}
        onOpen={opener('speed')}
      />
      <span className={styles.tbEnd}>
        <UseCase {...p} />
        <Settings {...p} open={open} opener={opener} />
      </span>
    </div>
  );
}
