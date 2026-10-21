import { Code, Download, EyeOff, PanelLeftClose, Upload } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { toClaudeLog } from './claude-log-writer.pure';
import { offers, PARTS } from './context-state.pure';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import type { Chat, Control, Part, Preset } from './context.types';

/* The one toolbar: parts · Technical · collapse · meter · the chat as a log. */

/** What the toolbar shows and the events it sends up: the parent owns the state. */
export interface ToolbarProps {
  readonly words: ContextWords;
  readonly preset: Preset;
  readonly chat: Chat;
  readonly parts: Readonly<Record<Part, boolean>>;
  /** The global renderMode is Technical: what the toolbar's Technical last set for every part. */
  readonly technical: boolean;
  readonly chatCollapsed: boolean;
  readonly meterHidden: boolean;
  readonly onPart: (part: Part) => void;
  readonly onTechnical: (on: boolean) => void;
  readonly onCollapse: () => void;
  readonly onMeter: () => void;
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

interface IconProps {
  readonly label: string;
  readonly tip: string;
  readonly pressed: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

function IconButton({ label, tip, pressed, onClick, children }: IconProps) {
  return (
    <button
      type="button"
      className={styles.icon}
      aria-label={label}
      title={tip}
      data-tip={tip}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function download(chat: Chat) {
  const url = URL.createObjectURL(new Blob([toClaudeLog(chat)], { type: 'application/x-ndjson' }));
  const link = Object.assign(document.createElement('a'), { download: `${chat.id}.jsonl` });
  link.setAttribute('href', url);
  link.click();
  URL.revokeObjectURL(url);
}

function LogButtons({ v }: { readonly v: ToolbarProps }) {
  const open = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) v.onOpen(await file.text());
    event.target.value = '';
  };
  return (
    <>
      {v.preset.download ? (
        <button
          type="button"
          className={styles.icon}
          aria-label={v.words.download}
          title={v.words.download}
          onClick={() => download(v.chat)}
        >
          <Download aria-hidden="true" />
        </button>
      ) : null}
      {v.preset.upload ? (
        <label className={`${styles.icon} ${styles.upload}`} title={v.words.upload}>
          <Upload aria-hidden="true" />
          <input type="file" accept=".jsonl,application/x-ndjson" aria-label={v.words.upload} onChange={open} />
        </label>
      ) : null}
    </>
  );
}

interface Toggle {
  readonly control: Control;
  readonly Icon: typeof Code;
  readonly words: (v: ToolbarProps) => { readonly label: string; readonly tip: string };
  readonly pressed: (v: ToolbarProps) => boolean;
  /** Collapse needs the chat on screen, the meter the context. */
  readonly shown: (v: ToolbarProps) => boolean;
  readonly run: (v: ToolbarProps) => void;
}

const TOGGLES: readonly Toggle[] = [
  {
    control: 'depth',
    Icon: Code,
    words: (v) => ({ label: v.words.technical, tip: v.words.technicalTip }),
    pressed: (v) => v.technical,
    shown: () => true,
    run: (v) => v.onTechnical(!v.technical),
  },
  {
    control: 'collapse',
    Icon: PanelLeftClose,
    words: (v) => ({ label: v.words.collapse, tip: v.words.collapseTip }),
    pressed: (v) => v.chatCollapsed,
    shown: (v) => v.parts.chat,
    run: (v) => v.onCollapse(),
  },
  {
    control: 'meter',
    Icon: EyeOff,
    words: (v) => ({ label: v.words.meter, tip: v.words.meterTip }),
    pressed: (v) => v.meterHidden,
    shown: (v) => v.parts.context,
    run: (v) => v.onMeter(),
  },
];

function ToggleButton({ v, toggle }: { readonly v: ToolbarProps; readonly toggle: Toggle }) {
  if (!offers(v.preset, toggle.control) || !toggle.shown(v)) return null;
  const { label, tip } = toggle.words(v);
  return (
    <IconButton label={label} tip={tip} pressed={toggle.pressed(v)} onClick={() => toggle.run(v)}>
      <toggle.Icon aria-hidden="true" />
    </IconButton>
  );
}

const CONTROLS_AFTER_SHOW: readonly Control[] = ['depth', 'collapse', 'meter'];

/** Whether anything sits after the parts group: a control or a log button. */
const hasRest = (v: ToolbarProps) =>
  CONTROLS_AFTER_SHOW.some((control) => offers(v.preset, control)) || v.preset.download || v.preset.upload;

function Controls({ v }: { readonly v: ToolbarProps }) {
  const [depth, ...folds] = TOGGLES;
  return (
    <>
      {depth ? <ToggleButton v={v} toggle={depth} /> : null}
      {folds.map((toggle) => (
        <ToggleButton key={toggle.control} v={v} toggle={toggle} />
      ))}
      <LogButtons v={v} />
    </>
  );
}

/** The toolbar a Preset allows; a Preset that hides its controls shows none of it. */
export function Toolbar(v: ToolbarProps) {
  const show = offers(v.preset, 'show');
  const rest = hasRest(v);
  if (v.preset.controlsHidden || (!show && !rest)) return null;
  return (
    <div className={styles.top} role="toolbar" aria-label={v.words.controls} data-toolbar="">
      {show ? <ShowGroup v={v} /> : null}
      {show && rest ? <span className={styles.sep} aria-hidden="true" /> : null}
      <Controls v={v} />
    </div>
  );
}
