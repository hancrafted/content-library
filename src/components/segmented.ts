/** Shared look of the header's pill-shaped button bars (theme, locale). */
export const SEGMENTED_GROUP = 'inline-flex items-center gap-0.5 rounded-lg border bg-muted/60 p-0.5';

export const segmentedItem = (active: boolean) =>
  active
    ? 'bg-background text-foreground shadow-sm hover:bg-background dark:bg-accent dark:hover:bg-accent'
    : 'text-muted-foreground';
