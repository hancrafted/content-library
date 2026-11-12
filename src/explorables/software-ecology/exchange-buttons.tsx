import { useRef } from 'react';
import type { ExchangeWords } from './exchange-words.types';
import { Glyph } from './factory-glyph-view';
import styles from './software-ecology.module.css';

/*
 * Download YAML and Upload, at the foot of the Settings popover (feedback 08). Upload opens the file picker; the parent
 * reads the file. Dropping a file on the factory uploads it too.
 */

export interface ExchangeButtonsProps {
  readonly words: ExchangeWords;
  readonly onDownload: () => void;
  readonly onFile: (f: File) => void;
}

const ACCEPT = '.yaml,.yml,text/yaml,application/yaml';

function FileButton(p: { icon: string; label: string; tip: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`${styles.tbtn} ${styles.tbtnLine} text-caption`}
      data-tip={p.tip}
      onClick={p.onClick}
    >
      <Glyph name={p.icon} className={styles.ico} />
      <span>{p.label}</span>
    </button>
  );
}

export function ExchangeButtons(p: ExchangeButtonsProps) {
  const file = useRef<HTMLInputElement>(null);
  const w = p.words;
  return (
    <div className={styles.fileRow}>
      <FileButton icon="download" label={w.download} tip={w.downloadTip} onClick={p.onDownload} />
      <FileButton icon="upload" label={w.upload} tip={w.uploadTip} onClick={() => file.current?.click()} />
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
