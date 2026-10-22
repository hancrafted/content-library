import { Code, Download, Ellipsis, PanelLeftClose, PanelRight, Upload } from 'lucide-react';
import type { ReactNode } from 'react';
import type { IconName } from './context-controls.pure';
import styles from './context.module.css';
import { Moves } from './moves.client';

/* The icon button every toggle and action of the registry draws, in the toolbar and in a part's head. */

const ICONS: Readonly<Record<IconName, typeof Code>> = {
  code: Code,
  'panel-left-close': PanelLeftClose,
  download: Download,
  upload: Upload,
  'panel-right': PanelRight,
  ellipsis: Ellipsis,
};

export function ControlIcon({ name }: { readonly name: IconName }) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" />;
}

interface IconProps {
  readonly label: string;
  readonly tip: string;
  /** Set for a toggle; an action has none. */
  readonly pressed?: boolean;
  readonly control?: string;
  readonly onClick: () => void;
  readonly children: ReactNode;
}

export function IconButton({ label, tip, pressed, control, onClick, children }: IconProps) {
  return (
    <Moves
      as="button"
      trigger={pressed}
      type="button"
      className={styles.icon}
      aria-label={label}
      title={tip}
      data-tip={tip}
      data-control={control}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Moves>
  );
}
