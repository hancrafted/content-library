import type { ReactNode } from 'react';
import { DisplayMenu, type DisplayMenuProps } from './display-menu';
import { ExchangeButtons, type ExchangeButtonsProps } from './exchange-buttons';
import { MechanicsMenu, type MechanicsMenuProps } from './mechanics-menu.client';
import { ModelMenu, type ModelMenuProps } from './model-menu.client';
import type { SettingsWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';

/*
 * The Settings popover's body (feature guide, Interaction 3; feedback 08 merged the Model menu and the ⋮ menu into it):
 * three columns, Model · Mechanics · Display, that stack on a narrow screen, and the File row at its foot.
 */

export interface SettingsMenuProps {
  readonly words: SettingsWords;
  readonly model: ModelMenuProps;
  readonly mechanics: MechanicsMenuProps;
  readonly display: DisplayMenuProps;
  readonly exchange: ExchangeButtonsProps;
}

function Column(p: { readonly title: string; readonly note?: string; readonly children: ReactNode }) {
  return (
    <section className={styles.setCol} aria-label={p.title}>
      <p className={`${styles.setH} m-0 text-caption font-semibold`}>{p.title}</p>
      {p.note ? <p className="m-0 text-caption text-muted-foreground">{p.note}</p> : null}
      {p.children}
    </section>
  );
}

export function SettingsMenu(p: SettingsMenuProps) {
  const w = p.words;
  return (
    <>
      <div className={styles.setCols}>
        <Column title={w.model}>
          <ModelMenu {...p.model} />
        </Column>
        <Column title={w.mechanics} note={w.mechanicsNote}>
          <MechanicsMenu {...p.mechanics} />
        </Column>
        <Column title={w.display}>
          <DisplayMenu {...p.display} />
        </Column>
      </div>
      <footer className={styles.setFoot} aria-label={w.file}>
        <span className={`${styles.setH} text-caption font-semibold`}>{w.file}</span>
        <ExchangeButtons {...p.exchange} />
      </footer>
    </>
  );
}
