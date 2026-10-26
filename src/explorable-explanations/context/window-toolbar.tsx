import type { ChangeEvent, PointerEvent } from 'react';
import { toClaudeLog } from './claude-log-writer.pure';
import { CONTROLS, controlOf, type ControlDef, type Flips } from './context-controls.pure';
import type { Flip } from './context-parts.types';
import type { ContextWords } from './context-words.types';
import styles from './context.module.css';
import type { Chat, Part, Preset } from './context.types';
import { ControlIcon, IconButton } from './control-icons';
import { Moves } from './moves.client';
import { useChipDrag } from './window-chip-drag';

/* The one toolbar: the controls the registry places there, in registry order: parts, Technical, the log. */

/** What the toolbar shows and the events it sends up: the parent owns the state. */
export interface ToolbarProps {
  readonly words: ContextWords;
  readonly preset: Preset;
  readonly chat: Chat;
  readonly parts: Readonly<Record<Part, boolean>>;
  /** The parts in the order the chips list them. */
  readonly order: readonly Part[];
  /** What a toggle shows and flips, by the registry's `flips`. */
  readonly flip: (flips: Flips) => Flip;
  readonly onPart: (part: Part) => void;
  /** A chip was dragged past another: the part takes that one's place. */
  readonly onReorder: (part: Part, before: Part) => void;
  readonly onOpen: (text: string) => void;
}

function Chip({
  v,
  part,
  lifted,
  onPointerDown,
}: {
  readonly v: ToolbarProps;
  readonly part: Part;
  readonly lifted: boolean;
  readonly onPointerDown: (event: PointerEvent<HTMLElement>) => void;
}) {
  return (
    <Moves
      as="button"
      trigger={`${v.parts[part]}|${lifted}`}
      type="button"
      data-chip={part}
      data-lifted={lifted ? '' : undefined}
      aria-pressed={v.parts[part]}
      className={v.parts[part] ? 'font-semibold' : undefined}
      onClick={() => v.onPart(part)}
      onPointerDown={onPointerDown}
    >
      {v.words.parts[part]}
    </Moves>
  );
}

function ShowGroup({ v }: { readonly v: ToolbarProps }) {
  const reorder = controlOf(v.preset, 'parts').reorder !== false;
  const drag = useChipDrag({ enabled: reorder, order: v.order, onMove: v.onReorder });
  return (
    <div
      className={styles.show}
      role="group"
      aria-label={v.words.showParts}
      data-reorder={reorder ? '' : undefined}
      data-dragging={drag.dragging ?? undefined}
      onClickCapture={drag.onClickCapture}
    >
      {v.order.map((part) => (
        <Chip key={part} v={v} part={part} lifted={drag.dragging === part} onPointerDown={drag.onPointerDown(part)} />
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

function Control({ v, def }: { readonly v: ToolbarProps; readonly def: ControlDef }) {
  if (def.type === 'chips') return <ShowGroup v={v} />;
  if (def.type === 'segmented' || def.type === 'readout' || def.type === 'menu') return null;
  if (def.type === 'action')
    return def.run === 'upload' ? (
      <UploadButton v={v} />
    ) : (
      <IconButton label={v.words[def.label]} tip={v.words[def.tip]} control={def.id} onClick={() => download(v.chat)}>
        <ControlIcon name={def.icon} />
      </IconButton>
    );
  const { pressed, onToggle } = v.flip(def.flips);
  return (
    <IconButton label={v.words[def.label]} tip={v.words[def.tip]} pressed={pressed} control={def.id} onClick={onToggle}>
      <ControlIcon name={def.icon} />
    </IconButton>
  );
}

/** The toolbar a Preset allows; a Preset that shows none of its controls draws none of it. */
export function Toolbar(v: ToolbarProps) {
  const shown = CONTROLS.filter((def) => def.placement === 'toolbar')
    .map((def) => controlOf(v.preset, def.id))
    .filter((def) => def.show);
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
