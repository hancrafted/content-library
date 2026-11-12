'use client';

import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { useId, useState, type ReactNode } from 'react';
import { CompareWidget, type CompareWidgetProps } from './compare-widget';
import { Glyph } from './factory-glyph-view';
import { SPEEDS } from './factory-run.pure.ts';
import { ModelMenu, type ModelMenuProps } from './model-menu';
import { MoreMenu, type MoreMenuProps } from './more-menu';
import { ScenariosMenu, TourButton, type ScenarioChoice } from './scenario-menu';
import type { ToolbarWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { Mechanic } from './software-ecology.types';
import { ToolbarMenu } from './toolbar-menu.client';

export interface Choice {
  readonly id: string;
  readonly name: string;
}

export interface ToolbarProps {
  readonly words: ToolbarWords;
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
  readonly statesTarget?: TargetProps;
  readonly statesMarker?: ReactNode;
  /** Every state off the row, for the Scenarios menu, and the markers a Slide places beside its entries. */
  readonly scenarios: readonly ScenarioChoice[];
  readonly scenarioMarkers?: Readonly<Partial<Record<string, ReactNode>>>;
  /** The state has a tour; a tour is on. */
  readonly canTour: boolean;
  readonly touring: boolean;
  readonly onTour: () => void;
  /** The state's "what to watch" line. */
  readonly watch: string;
  readonly modified: boolean;
  readonly mech: Readonly<Record<Mechanic, boolean>>;
  readonly onMech: (k: Mechanic) => void;
  readonly model: ModelMenuProps;
  readonly more: MoreMenuProps;
  /** Compare mode: the toggle, the picked slots, Show and Exit. */
  readonly compare: CompareWidgetProps;
}

const MECHS: readonly Mechanic[] = ['rework', 'churn', 'complaints'];

type MenuId = 'scenarios' | 'model' | 'more' | null;
type Opener = (id: Exclude<MenuId, null>) => (on: boolean) => void;

/** "modified": a dial was turned after the state was picked. */
function Modified({ words }: { words: ToolbarWords }) {
  return (
    <span className={`${styles.modified} text-caption text-muted-foreground`} data-tip={words.modifiedTip}>
      {words.modified}
    </span>
  );
}

/** Swing, Roles, Ideal and Realistic; the Scenarios menu with the rest; Tour; "modified" once a dial was turned. */
function States(p: ToolbarProps & { open: MenuId; opener: Opener }) {
  return (
    <div className={`${styles.states} relative`} role="group" aria-label={p.words.states} {...p.statesTarget}>
      {p.states.map((s) => (
        <button
          key={s.id}
          type="button"
          className={`${styles.state} text-caption font-medium`}
          aria-pressed={p.preset === s.id}
          onClick={() => p.onPreset(s.id)}
        >
          {s.name}
        </button>
      ))}
      <ScenariosMenu
        words={p.words}
        scenarios={p.scenarios}
        preset={p.preset}
        markers={p.scenarioMarkers}
        open={p.open === 'scenarios'}
        onOpen={p.opener('scenarios')}
        onPick={p.onPreset}
      />
      <TourButton {...p} />
      {p.modified ? <Modified words={p.words} /> : null}
      {p.statesMarker}
    </div>
  );
}

function UseCase(p: Pick<ToolbarProps, 'words' | 'useCases' | 'useCase' | 'onUseCase'>) {
  const id = useId();
  return (
    <div className={styles.usecase}>
      <label className="text-caption text-muted-foreground" htmlFor={id}>
        {p.words.useCase}
      </label>
      <select
        id={id}
        className={`${styles.select} font-semibold`}
        value={p.useCase}
        onChange={(e) => p.onUseCase(e.target.value)}
      >
        {p.useCases.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Speed(p: Pick<ToolbarProps, 'words' | 'speed' | 'onSpeed' | 'onClear' | 'clock'>) {
  const w = p.words;
  return (
    <div className={styles.tgroup} role="group" aria-label={w.speed}>
      {SPEEDS.map((v) => (
        <button
          key={v}
          type="button"
          className={`${styles.tbtn} ${styles.speed} text-caption font-semibold`}
          aria-pressed={p.speed === v}
          aria-label={v ? fillTemplate(w.speedN, { n: v }) : w.pause}
          data-tip={v ? w.speedTips[String(v)] : w.pause}
          onClick={() => p.onSpeed(v)}
        >
          {v ? `${v}×` : <Glyph name="pause" className={styles.ico} />}
        </button>
      ))}
      <button type="button" className={`${styles.tbtn} text-caption`} data-tip={w.clearTip} onClick={p.onClear}>
        <Glyph name="clear" className={styles.ico} />
        <span className={styles.tbtnLabel}>{w.clear}</span>
      </button>
      <span className={`${styles.clock} text-caption font-semibold`} aria-live="off" data-tip={w.clockTip}>
        {p.clock}
      </span>
    </div>
  );
}

function Mechs(p: Pick<ToolbarProps, 'words' | 'mech' | 'onMech'>) {
  return (
    <div className={styles.tgroup} role="group" aria-label={p.words.mechanics}>
      {MECHS.map((k) => (
        <button
          key={k}
          type="button"
          className={`${styles.tbtn} ${styles.mech} text-caption`}
          aria-pressed={p.mech[k]}
          data-tip={p.words.mechs[k].tip}
          onClick={() => p.onMech(k)}
        >
          <Glyph name={k} className={styles.ico} />
          <span className={styles.tbtnLabel}>{p.words.mechs[k].label}</span>
        </button>
      ))}
    </div>
  );
}

/** A close never undoes the other menu's open: the outside click that opens one closes only the other. */
const nextMenu = (cur: MenuId, id: Exclude<MenuId, null>, on: boolean): MenuId => (on ? id : cur === id ? null : cur);

/** The Model and ⋮ menus. */
function Menus(p: Pick<ToolbarProps, 'words' | 'model' | 'more'> & { open: MenuId; opener: Opener }) {
  const { open, opener } = p,
    w = p.words;
  return (
    <>
      <ToolbarMenu
        open={open === 'model'}
        onOpen={opener('model')}
        icon="model"
        text={w.model}
        tip={w.modelTip}
        label={p.model.words.label}
      >
        <ModelMenu {...p.model} />
      </ToolbarMenu>
      <ToolbarMenu
        open={open === 'more'}
        onOpen={opener('more')}
        icon="kebab"
        ariaLabel={w.more}
        tip={w.moreTip}
        label={p.more.words.label}
        end
      >
        <MoreMenu {...p.more} />
      </ToolbarMenu>
    </>
  );
}

/**
 * The toolbar (design-ADR 0024 §16): the states, the Scenarios menu, Tour and the use case; what bad work does downstream,
 * compare mode, speed, Clear and the day clock, the Model menu and the ⋮ menu.
 */
export function FactoryToolbar(p: ToolbarProps) {
  // the Scenarios, Model and ⋮ menus: one open at a time
  const [open, setOpen] = useState<MenuId>(null);
  const opener: Opener = (id) => (on) => setOpen((cur) => nextMenu(cur, id, on));
  return (
    <div className={styles.toolbar} role="toolbar" aria-label={p.words.label}>
      <div className={styles.tbRow}>
        <States {...p} open={open} opener={opener} />
        <UseCase {...p} />
      </div>
      <div className={`${styles.tbRow} ${styles.tbTools}`}>
        <Mechs {...p} />
        <CompareWidget {...p.compare} />
        <Speed {...p} />
        <Menus {...p} open={open} opener={opener} />
      </div>
      <p className={`${styles.usecaseSub} m-0 text-caption text-muted-foreground`}>{p.sub}</p>
      <p className={`${styles.watch} text-caption`} aria-live="polite">
        {p.watch ? (
          <>
            <span className="text-muted-foreground">{p.words.watch}</span> {p.watch}
          </>
        ) : null}
      </p>
    </div>
  );
}
