import { Code, Download, EyeOff, PanelLeftClose, Upload } from 'lucide-react';
import type { ChangeEvent, ReactNode } from 'react';
import { toClaudeLog } from './claude-log-writer.pure';
import type { ViewEvent } from './context-state.pure';
import { offers, PARTS } from './context-state.pure';
import type { View } from './context-view';
import styles from './context.module.css';
import type { Chat, Control, Mode } from './context.types';

/* The one toolbar: parts · Technical · Explain/Attention · collapse · meter · the chat as a log. */

const MODES: readonly Mode[] = ['explain', 'attention'];

function ShowGroup({ v }: { readonly v: View }) {
  return (
    <div className={styles.show} role="group" aria-label={v.words.showParts}>
      {PARTS.map((part) => (
        <button
          key={part}
          type="button"
          aria-pressed={v.state.parts[part]}
          className={v.state.parts[part] ? 'font-semibold' : undefined}
          onClick={() => v.dispatch({ type: 'TOGGLE_PART', part })}
        >
          {v.words.parts[part]}
        </button>
      ))}
    </div>
  );
}

function ModeSwitch({ v }: { readonly v: View }) {
  const index = MODES.indexOf(v.state.mode);
  return (
    <div className={styles.seg} role="group" aria-label={v.words.modeGroup} style={{ '--i': index } as never}>
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          aria-pressed={v.state.mode === mode}
          className={v.state.mode === mode ? 'font-semibold' : undefined}
          onClick={() => v.dispatch({ type: 'SET_MODE', value: mode })}
        >
          {v.words.modes[mode]}
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

function LogButtons({ v, onOpen }: { readonly v: View; readonly onOpen: (text: string) => void }) {
  const open = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) onOpen(await file.text());
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
  readonly words: (v: View) => { readonly label: string; readonly tip: string };
  readonly pressed: (v: View) => boolean;
  /** Collapse needs the chat on screen, the meter the context. */
  readonly shown: (v: View) => boolean;
  readonly event: (v: View) => ViewEvent;
}

const TOGGLES: readonly Toggle[] = [
  {
    control: 'depth',
    Icon: Code,
    words: (v) => ({ label: v.words.technical, tip: v.words.technicalTip }),
    pressed: (v) => v.tech,
    shown: () => true,
    event: (v) => ({ type: 'SET_DEPTH', value: v.tech ? 'simple' : 'technical' }),
  },
  {
    control: 'collapse',
    Icon: PanelLeftClose,
    words: (v) => ({ label: v.words.collapse, tip: v.words.collapseTip }),
    pressed: (v) => v.state.chatCollapsed,
    shown: (v) => v.state.parts.chat,
    event: () => ({ type: 'TOGGLE_CHAT' }),
  },
  {
    control: 'meter',
    Icon: EyeOff,
    words: (v) => ({ label: v.words.meter, tip: v.words.meterTip }),
    pressed: (v) => v.state.meterHidden,
    shown: (v) => v.state.parts.context,
    event: () => ({ type: 'TOGGLE_METER' }),
  },
];

function ToggleButton({ v, toggle }: { readonly v: View; readonly toggle: Toggle }) {
  if (!offers(v.preset, toggle.control) || !toggle.shown(v)) return null;
  const { label, tip } = toggle.words(v);
  return (
    <IconButton label={label} tip={tip} pressed={toggle.pressed(v)} onClick={() => v.dispatch(toggle.event(v))}>
      <toggle.Icon aria-hidden="true" />
    </IconButton>
  );
}

const CONTROLS_AFTER_SHOW: readonly Control[] = ['depth', 'mode', 'collapse', 'meter'];

/** Whether anything sits after the parts group: a control or a log button. */
const hasRest = (v: View) =>
  CONTROLS_AFTER_SHOW.some((control) => offers(v.preset, control)) || v.preset.download || v.preset.upload;

function Controls({ v, onOpen }: { readonly v: View; readonly onOpen: (text: string) => void }) {
  const [depth, ...folds] = TOGGLES;
  return (
    <>
      {depth ? <ToggleButton v={v} toggle={depth} /> : null}
      {offers(v.preset, 'mode') ? <ModeSwitch v={v} /> : null}
      {folds.map((toggle) => (
        <ToggleButton key={toggle.control} v={v} toggle={toggle} />
      ))}
      <LogButtons v={v} onOpen={onOpen} />
    </>
  );
}

/** The toolbar a Preset allows; a Preset that hides its controls shows none of it. */
export function Toolbar({ v, onOpen }: { readonly v: View; readonly onOpen: (text: string) => void }) {
  const show = offers(v.preset, 'show');
  const rest = hasRest(v);
  if (v.preset.controlsHidden || (!show && !rest)) return null;
  return (
    <div className={styles.top} role="toolbar" aria-label={v.words.controls} data-toolbar="">
      {show ? <ShowGroup v={v} /> : null}
      {show && rest ? <span className={styles.sep} aria-hidden="true" /> : null}
      <Controls v={v} onOpen={onOpen} />
    </div>
  );
}
