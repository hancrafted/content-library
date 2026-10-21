import type { ChangeEvent } from 'react';
import { toClaudeLog } from './claude-log-writer.pure';
import { CONTROLS, controlOf, type ControlDef } from './context-controls.pure';
import { PARTS } from './context-state.pure';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import type { Chat, Part, Preset } from './context.types';
import { ControlIcon, IconButton } from './control-icons';

/* The one toolbar: the controls the registry places there, in registry order: parts, Technical, collapse, the log. */

/** What the toolbar shows and the events it sends up: the parent owns the state. */
export interface ToolbarProps {
  readonly words: ContextWords;
  readonly preset: Preset;
  readonly chat: Chat;
  readonly parts: Readonly<Record<Part, boolean>>;
  /** The global renderMode is Technical: what the toolbar's Technical last set for every part. */
  readonly technical: boolean;
  readonly chatCollapsed: boolean;
  readonly onPart: (part: Part) => void;
  readonly onTechnical: (on: boolean) => void;
  readonly onCollapse: () => void;
  readonly onOpen: (text: string) => void;
}

function ShowGroup({ v }: { readonly v: ToolbarProps }) {
  return (
    <div className={styles.show} role="group" aria-label={v.words.showParts}>
      {PARTS.map((part) => (
        <button
          key={part}
          type="button"
          aria-pressed={v.parts[part]}
          className={v.parts[part] ? 'font-semibold' : undefined}
          onClick={() => v.onPart(part)}
        >
          {v.words.parts[part]}
        </button>
      ))}
    </div>
  );
}

function download(chat: Chat) {
  const url = URL.createObjectURL(new Blob([toClaudeLog(chat)], { type: 'application/x-ndjson' }));
  const link = Object.assign(document.createElement('a'), { download: `${chat.id}.jsonl` });
  link.setAttribute('href', url);
  link.click();
  URL.revokeObjectURL(url);
}

function UploadButton({ v }: { readonly v: ToolbarProps }) {
  const open = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) v.onOpen(await file.text());
    event.target.value = '';
  };
  return (
    <label className={`${styles.icon} ${styles.upload}`} title={v.words.upload}>
      <ControlIcon name="upload" />
      <input type="file" accept=".jsonl,application/x-ndjson" aria-label={v.words.upload} onChange={open} />
    </label>
  );
}

/** Whether a control belongs on screen now: collapse needs the chat on it. */
function usable(v: ToolbarProps, def: ControlDef): boolean {
  return def.type === 'toggle' && def.flips === 'collapse' ? v.parts.chat : true;
}

function toggled(v: ToolbarProps, flips: string): { pressed: boolean; run: () => void } {
  if (flips === 'technical') return { pressed: v.technical, run: () => v.onTechnical(!v.technical) };
  return { pressed: v.chatCollapsed, run: v.onCollapse };
}

function Control({ v, def }: { readonly v: ToolbarProps; readonly def: ControlDef }) {
  if (def.type === 'chips') return <ShowGroup v={v} />;
  if (def.type === 'segmented' || def.type === 'readout') return null;
  if (def.type === 'action')
    return def.run === 'upload' ? (
      <UploadButton v={v} />
    ) : (
      <IconButton label={v.words[def.label]} tip={v.words[def.tip]} control={def.id} onClick={() => download(v.chat)}>
        <ControlIcon name={def.icon} />
      </IconButton>
    );
  const { pressed, run } = toggled(v, def.flips);
  return (
    <IconButton label={v.words[def.label]} tip={v.words[def.tip]} pressed={pressed} control={def.id} onClick={run}>
      <ControlIcon name={def.icon} />
    </IconButton>
  );
}

/** The toolbar a Preset allows; a Preset that shows none of its controls draws none of it. */
export function Toolbar(v: ToolbarProps) {
  const shown = CONTROLS.filter((def) => def.placement === 'toolbar')
    .map((def) => controlOf(v.preset, def.id))
    .filter((def) => def.show && usable(v, def));
  if (shown.length === 0) return null;
  const [first, ...rest] = shown;
  return (
    <div className={styles.top} role="toolbar" aria-label={v.words.controls} data-toolbar="">
      {first ? <Control v={v} def={first} /> : null}
      {first?.type === 'chips' && rest.length ? <span className={styles.sep} aria-hidden="true" /> : null}
      {rest.map((def) => (
        <Control key={def.id} v={v} def={def} />
      ))}
    </div>
  );
}
