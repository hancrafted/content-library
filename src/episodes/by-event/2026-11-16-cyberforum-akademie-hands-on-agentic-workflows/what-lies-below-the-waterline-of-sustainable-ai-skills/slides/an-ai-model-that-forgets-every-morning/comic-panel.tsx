import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './forgets.module.css';

/** The strip's panels appear this far apart once the Slide turns active (Spec Option 1a: 0.5 s). */
const PANEL_STEP_MS = 500;

export interface ComicPanelProps {
  /** The panel's place in the strip, from 0: it appears that many steps after the first. */
  readonly index: number;
  /** The panel header in each view: Chat app first, then Coding agent. */
  readonly label?: { readonly chat: string; readonly coding: string };
  readonly className?: string;
  readonly children: ReactNode;
  /** Extra attributes a test or Speaker note reads, such as `data-morning`. */
  readonly data?: Readonly<Record<`data-${string}`, string>>;
}

const HEADER = 'border-b-2 border-foreground px-3 py-1 text-caption font-semibold uppercase';

/** The panel's header, in the reader's view: Chat app or Coding agent. */
function PanelHeader({ label }: { readonly label: NonNullable<ComicPanelProps['label']> }) {
  return (
    <>
      <InView view="chat" as="p" className={HEADER}>
        {label.chat}
      </InView>
      <InView view="coding" as="p" className={HEADER}>
        {label.coding}
      </InView>
    </>
  );
}

/**
 * One panel of the comic strip: a bordered card with its header in the reader's view, a `focus-group__item` so pointing
 * at one dims the others. It appears in its turn when the Slide turns active; at rest every panel shows.
 */
export function ComicPanel({ index, label, className, children, data }: ComicPanelProps) {
  const delay = { '--panel-delay': `${index * PANEL_STEP_MS}ms` } as CSSProperties;
  return (
    <li
      data-panel
      data-motion="panel"
      {...data}
      style={delay}
      className={cn(
        styles.panel,
        'focus-group__item flex flex-col overflow-hidden rounded-lg border-2 bg-card text-card-foreground',
        className,
      )}
    >
      {label && <PanelHeader label={label} />}
      {children}
    </li>
  );
}
