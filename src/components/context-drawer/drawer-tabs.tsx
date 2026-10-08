import { Button } from '@/components/ui/button';
import { tabAfter } from '@/lib/context-drawer.pure';
import { cn } from '@/lib/utils';
import type { KeyboardEvent, Ref } from 'react';

export interface TabSpec<T extends string> {
  readonly id: T;
  readonly label: string;
}

/** Dressed like the site header's nav links: a ghost button, the selected one on `accent`. */
function TabButton<T extends string>(props: {
  tab: TabSpec<T>;
  selected: boolean;
  ids: { tab: string; panel: string };
  onSelect: (tab: T) => void;
  ref: Ref<HTMLButtonElement> | undefined;
}) {
  return (
    <Button
      ref={props.ref}
      id={props.ids.tab}
      type="button"
      role="tab"
      variant="ghost"
      size="sm"
      aria-selected={props.selected}
      aria-controls={props.ids.panel}
      tabIndex={props.selected ? 0 : -1}
      onClick={() => props.onSelect(props.tab.id)}
      className={cn(
        'cursor-pointer max-md:h-10',
        props.selected ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
      )}
    >
      {props.tab.label}
    </Button>
  );
}

/** Arrow, Home and End keys move selection and focus together (automatic activation). */
function tabKeyHandler<T extends string>(props: {
  tabs: readonly TabSpec<T>[];
  selected: T;
  idOf: (tab: T) => { tab: string };
  onSelect: (tab: T) => void;
}) {
  return (event: KeyboardEvent) => {
    const ids = props.tabs.map((tab) => tab.id);
    const next = tabAfter(event.key, props.selected, ids) as T | null;
    if (next === null) return;
    event.preventDefault();
    props.onSelect(next);
    document.getElementById(props.idOf(next).tab)?.focus();
  };
}

/**
 * APG tabs with automatic activation: arrows wrap, Home and End jump, only the
 * selected tab sits in the tab order. `selectedRef` lets the drawer move focus
 * to the selected tab when it opens.
 */
export function DrawerTabs<T extends string>(props: {
  tabs: readonly TabSpec<T>[];
  selected: T;
  idOf: (tab: T) => { tab: string; panel: string };
  onSelect: (tab: T) => void;
  selectedRef: Ref<HTMLButtonElement>;
}) {
  const onKeyDown = tabKeyHandler(props);
  return (
    <div role="tablist" onKeyDown={onKeyDown} className="flex gap-1 print:hidden">
      {props.tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          selected={tab.id === props.selected}
          ids={props.idOf(tab.id)}
          onSelect={props.onSelect}
          ref={tab.id === props.selected ? props.selectedRef : undefined}
        />
      ))}
    </div>
  );
}
