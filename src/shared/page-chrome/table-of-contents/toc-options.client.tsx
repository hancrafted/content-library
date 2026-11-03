'use client';

import { useTocMenu } from '@/shared/hooks/use-toc-menu';
import type { TocPresentation } from '@/shared/lib/table-of-contents.pure';
import { cn } from '@/shared/lib/utils';
import { Check, EllipsisVertical } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { TocLabels } from './toc-heading';

interface OptionsProps {
  labels: TocLabels;
  mode: TocPresentation;
  onChange: (mode: TocPresentation) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  hasCollection: boolean;
  zoomedOut: boolean;
  onZoomChange: () => void;
}

interface Command {
  key: string;
  label: string;
  choose: () => void;
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
    });
  if (props.hasCollection && props.mode === 'zoom')
    commands.push({
      key: 'zoom',
      label: props.zoomedOut ? props.labels.zoomIn : props.labels.zoomOut,
      choose: props.onZoomChange,
    });
  return commands;
}

function TreeOption(props: OptionsProps & { menu: ReturnType<typeof useTocMenu> }) {
  return (
    <div role="group" aria-label={props.labels.presentation} className="mt-1 border-t pt-1">
      <div aria-hidden className="px-3 py-1 text-caption text-muted-foreground">
        {props.labels.presentation}
      </div>
      <button
        id={`${props.menu.id}-tree`}
        type="button"
        role="menuitemcheckbox"
        aria-checked={props.mode === 'tree'}
        tabIndex={-1}
        onClick={() => {
          props.onChange(props.mode === 'tree' ? 'zoom' : 'tree');
          props.menu.close();
        }}
        className={ITEM}
      >
        <Check aria-hidden className={cn('size-4', props.mode !== 'tree' && 'invisible')} />
        {props.labels.showAsTree}
      </button>
    </div>
  );
}

function CommandItem(props: { command: Command; menu: ReturnType<typeof useTocMenu> }) {
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
      {props.hasCollection && <TreeOption {...props} />}
    </div>
  );
}

export function TocOptions(props: OptionsProps) {
  const commands = commandsOf(props);
  const menu = useTocMenu([...commands.map(({ key }) => key), ...(props.hasCollection ? ['tree'] : [])]);
  if (commands.length === 0 && !props.hasCollection) return null;
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
