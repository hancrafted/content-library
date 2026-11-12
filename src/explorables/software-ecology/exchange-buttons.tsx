import { useRef } from 'react';
import type { ExchangeWords } from './exchange-words.types';
import { Glyph } from './factory-glyph-view';
import styles from './software-ecology.module.css';

/*
 * Download YAML and Upload on the toolbar's second row, between Model and ⋮, as the reference build has them. Upload
 * opens the file picker; the parent reads the file.
 */

export interface ExchangeButtonsProps {
  readonly words: ExchangeWords;
  readonly onDownload: () => void;
  readonly onFile: (f: File) => void;
}

const ACCEPT = '.yaml,.yml,text/yaml,application/yaml';

/** A toolbar button with its glyph and a label that hides on a narrow toolbar, so its name stays on `aria-label`. */
function ToolButton(p: { icon: string; label: string; tip: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.tbtn} text-caption`}
      data-tip={p.tip}
      aria-label={p.label}
      onClick={p.onClick}
    >
      <Glyph name={p.icon} className={styles.ico} />
      <span className={styles.tbtnLabel}>{p.label}</span>
    </button>
  );
}

export function ExchangeButtons(p: ExchangeButtonsProps) {
  const file = useRef<HTMLInputElement>(null);
  const w = p.words;
  return (
    <div className={styles.tgroup}>
      <ToolButton icon="download" label={w.download} tip={w.downloadTip} onClick={p.onDownload} />
      <ToolButton icon="upload" label={w.upload} tip={w.uploadTip} onClick={() => file.current?.click()} />
      <input
        ref={file}
        type="file"
        accept={ACCEPT}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) p.onFile(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
