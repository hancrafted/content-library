import { Download, Upload, type LucideIcon } from 'lucide-react';
import { useRef, type RefObject } from 'react';
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

function FileButton(p: { icon: LucideIcon; label: string; tip: string; control: string; onClick: () => void }) {
  return (
    <ToolTip tip={p.tip}>
      <button
        type="button"
        className={`${styles.tbtn} ${styles.tbtnLine} text-caption`}
        data-control={p.control}
        onClick={p.onClick}
      >
        <p.icon size={16} aria-hidden="true" />
        <span>{p.label}</span>
      </button>
    </ToolTip>
  );
}

/** The hidden file input Upload opens. */
function FileInput({ file, onFile }: { file: RefObject<HTMLInputElement | null>; onFile: (f: File) => void }) {
  return (
    <input
      ref={file}
      type="file"
      data-control="settings.upload.file"
      accept={ACCEPT}
      hidden
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) onFile(f);
        e.target.value = '';
      }}
    />
  );
}

export function ExchangeButtons(p: ExchangeButtonsProps) {
  const file = useRef<HTMLInputElement>(null);
  const w = p.words;
  return (
    <div className={styles.fileRow}>
      <FileButton
        control="settings.download"
        icon={Download}
        label={w.download}
        tip={w.downloadTip}
        onClick={p.onDownload}
      />
      <FileButton
        control="settings.upload"
        icon={Upload}
        label={w.upload}
        tip={w.uploadTip}
        onClick={() => file.current?.click()}
      />
      <FileInput file={file} onFile={p.onFile} />
    </div>
  );
}
