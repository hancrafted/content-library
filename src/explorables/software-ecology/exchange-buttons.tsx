import { Download, Upload, type LucideIcon } from 'lucide-react';
import { useRef } from 'react';
import type { ExchangeWords } from './exchange-words.types';
import styles from './software-ecology.module.css';
import { ToolTip } from './toolbar-tip.client';

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

function FileButton(p: { icon: LucideIcon; label: string; tip: string; onClick: () => void }) {
  return (
    <ToolTip tip={p.tip}>
      <button type="button" className={`${styles.tbtn} ${styles.tbtnLine} text-caption`} onClick={p.onClick}>
        <p.icon size={16} aria-hidden="true" />
        <span>{p.label}</span>
      </button>
    </ToolTip>
  );
}

export function ExchangeButtons(p: ExchangeButtonsProps) {
  const file = useRef<HTMLInputElement>(null);
  const w = p.words;
  return (
    <div className={styles.fileRow}>
      <FileButton icon={Download} label={w.download} tip={w.downloadTip} onClick={p.onDownload} />
      <FileButton icon={Upload} label={w.upload} tip={w.uploadTip} onClick={() => file.current?.click()} />
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
