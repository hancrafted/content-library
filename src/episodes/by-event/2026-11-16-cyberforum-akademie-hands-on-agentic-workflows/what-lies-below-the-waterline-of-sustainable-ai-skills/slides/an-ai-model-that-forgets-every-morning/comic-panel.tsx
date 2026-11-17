import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties, ReactNode } from 'react';
import styles from './forgets.module.css';

const PANEL_STEP_MILLISECONDS = 500;

export interface ComicPanelProps {
  /** The panel's place in the strip, from 0: it appears that many steps after the first. */
  readonly index: number;
  readonly label?: { readonly chat: string; readonly coding: string };
  readonly className?: string;
  readonly children: ReactNode;
  readonly data?: Readonly<Record<`data-${string}`, string>>;
}

const HEADER = 'border-b-2 border-foreground px-3 py-1 text-caption font-semibold uppercase';

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

export function ComicPanel({ index, label, className, children, data }: ComicPanelProps) {
  const delay = { '--panel-delay': `${index * PANEL_STEP_MILLISECONDS}ms` } as CSSProperties;
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
