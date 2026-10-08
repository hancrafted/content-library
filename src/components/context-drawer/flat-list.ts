/*
 * Notes and segments are a flat list inside the drawer card, never cards of
 * their own (docs/agents/context-drawer-design.md). A short, centred divider
 * sits in the gap above each item, absolutely placed so a tint behind the item
 * (`data-context-active`, see globals.css) never covers it. The padding gives
 * that tint room; the negative margin keeps the text aligned with its neighbours.
 */
export const FLAT_LIST = 'flex flex-col';
export const FLAT_ITEM =
  "relative -mx-2 flex flex-col gap-2 rounded-md px-2 py-1.5 break-inside-avoid not-first:mt-10 not-first:before:absolute not-first:before:-top-5 not-first:before:left-1/2 not-first:before:h-px not-first:before:w-6 not-first:before:-translate-x-1/2 not-first:before:bg-muted-foreground/40 not-first:before:content-['']";
