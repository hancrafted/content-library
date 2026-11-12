import { fillTemplate } from '@/shared/lib/template.pure';
import { COMPARE_MAX, type CompareState } from './compare-stream.pure.ts';
import { Glyph } from './factory-glyph-view';
import type { CompareWords } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

/*
 * Compare mode on the toolbar (design-ADR 0024 §17), an icon button since feedback 08, as the reference build's `renderCompareWidget`
 * draws it: the Compare toggle; while picking or comparing, three slots (a picked work center's glyph removes it),
 * then Show, or Exit once the stream is shown; and the hint beside it. Every change goes up through a callback.
 */

export interface CompareSlot {
  readonly id: string;
  readonly title: string;
  readonly icon: string;
}

export interface CompareWidgetProps {
  readonly words: CompareWords;
  readonly state: CompareState;
  /** The picked work centers, in pick order. */
  readonly slots: readonly CompareSlot[];
  /** Compare: toggles picking, or exits the stream. */
  readonly onToggle: () => void;
  readonly onRemove: (id: string) => void;
  readonly onShow: () => void;
  readonly onExit: () => void;
}

function Slots(p: CompareWidgetProps) {
  return (
    <span className={styles.slots} role="group" aria-label={p.words.slots}>
      {Array.from({ length: COMPARE_MAX }, (_, i) => {
        const s = p.slots[i];
        return s ? (
          <button
            key={s.id}
            type="button"
            className={styles.slot}
            data-control={`compare.slot.${s.id}`}
            data-tip={fillTemplate(p.words.remove, { title: s.title })}
            aria-label={fillTemplate(p.words.removeFrom, { title: s.title })}
            onClick={() => p.onRemove(s.id)}
          >
            <Glyph name={s.icon} className={styles.gly} />
          </button>
        ) : (
          <span key={`empty-${i}`} className={`${styles.slot} ${styles.slotEmpty}`} aria-hidden="true" />
        );
      })}
    </span>
  );
}

/** While picking: Show, once a work center is picked; while the stream is shown: Exit. */
function Go(p: CompareWidgetProps) {
  const cls = `${styles.tbtn} ${styles.tbtnSolid} text-caption`;
  return p.state.open ? (
    <button type="button" className={cls} data-control="compare.exit" onClick={p.onExit}>
      {p.words.exit}
    </button>
  ) : (
    <button type="button" className={cls} data-control="compare.show" disabled={!p.state.ids.length} onClick={p.onShow}>
      {p.words.show}
    </button>
  );
}

export function CompareWidget(p: CompareWidgetProps) {
  const { state: c, words: w } = p;
  return (
    <div className={styles.tgroup}>
      <ToolTip tip={w.tip}>
        <button
          type="button"
          className={`${styles.tbtn} text-caption`}
          aria-pressed={c.picking || c.open}
          aria-label={w.button}
          data-control="toolbar.compare"
          onClick={p.onToggle}
        >
          <Glyph name="compare" className={styles.ico} />
        </button>
      </ToolTip>
      {c.picking || c.open ? (
        <>
          <Slots {...p} />
          <Go {...p} />
        </>
      ) : null}
      <span className={`${styles.cmpNote} text-caption`} aria-live="polite">
        {c.note ? w[c.note] : ''}
      </span>
    </div>
  );
}
