'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { cn } from '@/shared/lib/utils';
import { useState, type ReactNode } from 'react';
import { FIRST_PART, hasStep, stepPart, type Part } from './anatomy.pure';
import styles from './what-youre-looking-at.module.css';

export interface AnatomyWords {
  readonly parts: Readonly<Record<Part, { readonly name: string; readonly explanation: string }>>;
  /** The prompt each system shows, by the toolbar's system value (`mac`, `windows`, `linux`). */
  readonly prompts: Readonly<Record<string, string>>;
  readonly command: string;
  readonly output: string;
  readonly windowTitle: string;
  readonly previous: string;
  readonly next: string;
  readonly hint: string;
}

interface HotspotProps {
  readonly part: Part;
  readonly active: Part;
  readonly name: string;
  readonly onActive: (part: Part) => void;
  readonly className?: string;
  readonly children: ReactNode;
}

/** A part drawn in the window: a button that lights when it is the active part and takes hover, focus and tap. */
function Hotspot({ part, active, name, onActive, className, children }: HotspotProps) {
  const on = part === active;
  const pick = () => onActive(part);
  const look = on ? 'bg-primary/15 ring-2 ring-primary' : 'hover:bg-muted';
  return (
    <button
      type="button"
      data-part={part}
      aria-pressed={on}
      aria-label={name}
      onMouseEnter={pick}
      onFocus={pick}
      onClick={pick}
      className={cn(
        'inline-flex items-center rounded-md px-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        look,
        className,
      )}
    >
      {children}
    </button>
  );
}

/** A callout: its dotted line from the window to its label. Decoration, named by the part's own button. */
function Callout({ part, active, name }: { part: Part; active: Part; name: string }) {
  const on = part === active;
  return (
    <span data-callout={part} aria-hidden="true" className="flex items-center gap-2 py-1">
      <span className={cn('min-w-4 flex-1 border-t-2 border-dotted', on ? 'border-primary' : 'border-border')} />
      <span className={cn('text-caption', on ? 'font-semibold text-primary' : 'text-muted-foreground')}>{name}</span>
    </span>
  );
}

interface DrawingProps {
  readonly words: AnatomyWords;
  readonly active: Part;
  readonly prompt: string;
  readonly onActive: (part: Part) => void;
}

/** The callout column: one cell per window row, the last row holding two. */
function Callouts({ words, active }: Pick<DrawingProps, 'words' | 'active'>) {
  const callout = (part: Part) => <Callout part={part} active={active} name={words.parts[part].name} />;
  return (
    <>
      <div className="row-start-1 col-start-2 flex items-center">{callout('close')}</div>
      <div className="row-start-2 col-start-2 flex items-center">{callout('command')}</div>
      <div className="row-start-3 col-start-2 flex items-center">{callout('output')}</div>
      <div className="row-start-4 col-start-2 flex flex-col justify-center">
        {callout('prompt')}
        {callout('cursor')}
      </div>
    </>
  );
}

/** The two grey dots beside the close one. */
const Dots = () => (
  <>
    <span className="size-3 shrink-0 rounded-full bg-border" />
    <span className="size-3 shrink-0 rounded-full bg-border" />
  </>
);

/** The title bar: the close button first, two grey dots, the window's name. */
function TitleBar({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
      {children}
      <Dots />
      <span className="ml-3 truncate text-caption text-muted-foreground">{title}</span>
    </div>
  );
}

/** The window itself: four rows, each a row of the grid the callouts share. */
function Window({ words, active, prompt, onActive }: DrawingProps) {
  const hotspot = (part: Part, className: string | undefined, children: ReactNode) => (
    <Hotspot part={part} active={active} name={words.parts[part].name} onActive={onActive} className={className}>
      {children}
    </Hotspot>
  );
  return (
    <div className="row-span-4 grid grid-rows-subgrid overflow-hidden rounded-xl border border-border bg-card shadow-md">
      <TitleBar title={words.windowTitle}>
        {hotspot('close', 'size-5 justify-center', <span className="size-3 rounded-full bg-destructive" />)}
      </TitleBar>
      <div className="flex items-center gap-2 px-5 pt-4 font-mono text-caption">
        <span className="text-muted-foreground">{prompt}</span>
        {hotspot(
          'command',
          undefined,
          <span className={cn(styles.command, 'inline-block overflow-hidden whitespace-nowrap')}>{words.command}</span>,
        )}
      </div>
      <div className="flex items-center px-5 font-mono text-caption">
        {hotspot('output', undefined, <span className={styles.output}>{words.output}</span>)}
      </div>
      <div className="flex items-center gap-2 px-5 pb-4 font-mono text-caption">
        {hotspot('prompt', undefined, <span className="text-muted-foreground">{prompt}</span>)}
        {hotspot('cursor', 'h-6', <span className={cn(styles.cursor, 'inline-block h-4 w-2 bg-primary')} />)}
      </div>
    </div>
  );
}

/** The window with the callouts in the column beside its rows. */
function Drawing(props: DrawingProps) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
      <Window {...props} />
      <Callouts words={props.words} active={props.active} />
    </div>
  );
}

const STEP_BUTTON = 'min-h-9 rounded-full px-4 text-caption font-semibold disabled:opacity-40';

/** The active part's explanation, with Previous and Next for a keyboard or a touch screen. */
function Explanation({ words, active, onActive }: Pick<DrawingProps, 'words' | 'active' | 'onActive'>) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted p-4">
      <p data-explanation aria-live="polite" className="text-body text-pretty">
        <span className="font-semibold">{words.parts[active].name}.</span> {words.parts[active].explanation}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          data-step="previous"
          disabled={!hasStep(active, -1)}
          onClick={() => onActive(stepPart(active, -1))}
          className={cn(STEP_BUTTON, 'border border-border bg-card')}
        >
          {words.previous}
        </button>
        <button
          type="button"
          data-step="next"
          disabled={!hasStep(active, 1)}
          onClick={() => onActive(stepPart(active, 1))}
          className={cn(STEP_BUTTON, 'bg-primary text-primary-foreground')}
        >
          {words.next}
        </button>
        <span className="text-caption text-muted-foreground">{words.hint}</span>
      </div>
    </div>
  );
}

/**
 * The drawn terminal window with a dotted callout to each part, and the explanation of the active part under it.
 * Pointing at, focusing or tapping a part makes it active; Previous and Next walk the tour for a keyboard or a
 * touch screen. The only state is the active part (FE-001); the prompt follows the page's operating system pick.
 */
export function Anatomy({ words }: { words: AnatomyWords }) {
  const [active, setActive] = useState<Part>(FIRST_PART);
  const [os] = usePagePick('os', 'mac');
  const prompt = words.prompts[os] ?? words.prompts['mac'] ?? '';
  return (
    <div data-anatomy className="flex flex-col gap-5">
      <Drawing words={words} active={active} prompt={prompt} onActive={setActive} />
      <Explanation words={words} active={active} onActive={setActive} />
    </div>
  );
}
