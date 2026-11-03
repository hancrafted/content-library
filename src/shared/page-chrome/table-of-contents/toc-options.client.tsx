'use client';

import { useTocMenu } from '@/shared/hooks/use-toc-menu';
import { EllipsisVertical, PanelLeftClose, PanelLeftOpen, type LucideIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { TocLabels } from './toc-heading';

interface OptionsProps {
  labels: TocLabels;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface Command {
  key: string;
  label: string;
  choose: () => void;
  icon: LucideIcon;
}
const ITEM =
  'flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 text-left text-caption hover:bg-accent focus-visible:outline-2';

function commandsOf(props: OptionsProps): Command[] {
  const commands: Command[] = [];
  if (props.onToggleCollapse)
    commands.push({
      key: 'collapse',
      label: props.collapsed ? props.labels.expand : props.labels.collapse,
      choose: props.onToggleCollapse,
      icon: props.collapsed ? PanelLeftOpen : PanelLeftClose,
    });
  return commands;
}

function CommandItem(props: { command: Command; menu: ReturnType<typeof useTocMenu> }) {
  const Icon = props.command.icon;
  return (
    <button
      id={`${props.menu.id}-${props.command.key}`}
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={ITEM}
      onClick={() => {
        props.command.choose();
        props.menu.close();
      }}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      {props.command.label}
    </button>
  );
}

function OptionsPopover(props: OptionsProps & { commands: readonly Command[]; menu: ReturnType<typeof useTocMenu> }) {
  const { menu } = props;
  return (
    <div
      ref={menu.popup}
      id={menu.id}
      hidden={!menu.open}
      role="menu"
      aria-label={props.labels.options}
      style={menu.position}
      className="pointer-events-auto fixed z-50 max-h-[calc(100dvh-2rem)] w-64 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border bg-background p-1 text-foreground shadow-header"
    >
      {props.commands.map((command) => (
        <CommandItem key={command.key} command={command} menu={menu} />
      ))}
    </div>
  );
}

export function TocOptions(props: OptionsProps) {
  const commands = commandsOf(props);
  const menu = useTocMenu(commands.map(({ key }) => key));
  if (commands.length === 0) return null;
  const popover = <OptionsPopover {...props} commands={commands} menu={menu} />;
  return (
    <div className="relative shrink-0" onKeyDown={menu.onKeyDown}>
      <button
        ref={menu.trigger}
        type="button"
        aria-label={props.labels.options}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        aria-controls={menu.open ? menu.id : undefined}
        onClick={menu.toggle}
        className="grid size-11 cursor-pointer place-items-center rounded-lg hover:bg-accent hover:text-foreground focus-visible:outline-2 md:size-8"
      >
        <EllipsisVertical aria-hidden className="size-4" />
      </button>
      {menu.open && menu.root ? createPortal(popover, menu.root) : popover}
    </div>
  );
}
