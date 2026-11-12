'use client';

import { RotateCcw, X } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import { DisplayMenu, type DisplayMenuProps } from './display-menu';
import { ExchangeButtons, type ExchangeButtonsProps } from './exchange-buttons';
import { MechanicsMenu, type MechanicsMenuProps } from './mechanics-menu.client';
import { ModelMenu, type ModelMenuProps } from './model-menu.client';
import { HelpNameProvider, HelpTip } from './settings-field.client';
import type { SettingsWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

/*
 * The Settings popover's body (feature guide, Interaction 3; feedback 08 merged the Model menu and the ⋮ menu into it,
 * feedback 09 laid it out again): a header with the title and a close button; two columns, Model, and Mechanics over
 * Display, that stack below 800 px; and the foot with Reset to default on the left, Download YAML and Upload on the
 * right. The sections' descriptions are help tooltips.
 */

export interface SettingsMenuProps {
  readonly words: SettingsWords;
  readonly model: ModelMenuProps;
  readonly mechanics: MechanicsMenuProps;
  readonly display: DisplayMenuProps;
  readonly exchange: ExchangeButtonsProps;
  readonly onClose: () => void;
}

/** A section: its bold title, with a help icon when it has a description, and its form fields. */
function Section(p: { readonly title: string; readonly tip?: string; readonly children: ReactNode }) {
  const id = useId();
  return (
    <section className={styles.setSec} aria-labelledby={id}>
      <div className={styles.setSecHead}>
        <p id={id} className={`${styles.setSecTitle} m-0 text-body font-semibold`}>
          {p.title}
        </p>
        {p.tip ? <HelpTip name={p.title} tip={p.tip} /> : null}
      </div>
      {p.children}
    </section>
  );
}

function Header(p: Pick<SettingsMenuProps, 'words' | 'onClose'>) {
  return (
    <header className={styles.setHead}>
      <p className={`${styles.setTitle} m-0 text-body font-semibold`}>{p.words.label}</p>
      <ToolTip tip={p.words.close}>
        <button type="button" className={styles.iconBtn} aria-label={p.words.close} onClick={p.onClose}>
          <X size={16} aria-hidden="true" />
        </button>
      </ToolTip>
    </header>
  );
}

function Foot(p: Pick<SettingsMenuProps, 'model' | 'exchange'>) {
  const w = p.model.words;
  return (
    <footer className={styles.setFoot}>
      <ToolTip tip={w.tips.reset}>
        <button type="button" className={`${styles.tbtn} ${styles.tbtnLine} text-caption`} onClick={p.model.onReset}>
          <RotateCcw size={16} aria-hidden="true" />
          <span>{w.reset}</span>
        </button>
      </ToolTip>
      <ExchangeButtons {...p.exchange} />
    </footer>
  );
}

export function SettingsMenu(p: SettingsMenuProps) {
  const w = p.words;
  return (
    <HelpNameProvider value={w.help}>
      <Header words={w} onClose={p.onClose} />
      <div className={styles.setCols}>
        <div className={styles.setCol}>
          <Section title={w.model} tip={p.model.words.note}>
            <ModelMenu {...p.model} />
          </Section>
        </div>
        <div className={styles.setCol}>
          <Section title={w.mechanics} tip={w.mechanicsNote}>
            <MechanicsMenu {...p.mechanics} />
          </Section>
          <Section title={w.display}>
            <DisplayMenu {...p.display} />
          </Section>
        </div>
      </div>
      <Foot model={p.model} exchange={p.exchange} />
    </HelpNameProvider>
  );
}
