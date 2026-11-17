'use client';
// spec: docs/features/explorables/software-ecology.md#interaction
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
  readonly sub: string;
  readonly speed: number;
  readonly onSpeed: (n: number) => void;
  readonly onClear: () => void;
  readonly clock: string;
  readonly clockAt: ClockAt;
  readonly statesTarget?: TargetProps;
  readonly statesMarker?: ReactNode;
  readonly scenarios: readonly ScenarioChoice[];
  readonly scenarioMarkers?: Readonly<Partial<Record<string, ReactNode>>>;
  readonly canTour: boolean;
  readonly touring: boolean;
  readonly onTour: () => void;
  readonly modified: boolean;
  readonly model: ModelMenuProps;
  readonly mechanics: MechanicsMenuProps;
  readonly display: DisplayMenuProps;
  readonly compare: CompareWidgetProps;
  readonly exchange: ExchangeButtonsProps;
}

type MenuId = 'scenarios' | 'speed' | 'settings' | null;
type Opener = (id: Exclude<MenuId, null>) => (on: boolean) => void;
interface MenuState {
  readonly open: MenuId;
  readonly opener: Opener;
}

const STEP_MARKS = ['①', '②', '③'] as const;

const nextMenu = (cur: MenuId, id: Exclude<MenuId, null>, on: boolean): MenuId => (on ? id : cur === id ? null : cur);

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

export function FactoryToolbar(p: ToolbarProps) {
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
