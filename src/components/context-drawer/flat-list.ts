/*
 * Notes and segments are a flat list inside the drawer card, never cards of
 * their own (FE-010 §9.7): a short, centred divider and generous space set one
 * item from the next.
 */
export const FLAT_LIST = 'flex flex-col';
export const FLAT_ITEM =
  "flex flex-col gap-2 break-inside-avoid not-first:mt-7 not-first:before:mx-auto not-first:before:mb-7 not-first:before:block not-first:before:h-px not-first:before:w-6 not-first:before:bg-muted-foreground/40 not-first:before:content-['']";
