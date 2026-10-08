/**
 * The two sitenav designs. Behaviour is identical; a skin is only the class
 * names each part wears. `rail` is a light frosted panel with a hairline
 * progress rail on the left; `index` is an inverted panel with big numerals
 * and a progress track on the right whose counter rides the fill.
 */
export const SITENAV_VARIANTS = ['rail', 'index'] as const;
export type SitenavVariant = (typeof SITENAV_VARIANTS)[number];

export interface SitenavSkin {
  panel: string;
  /** Extra panel classes inside the mobile drawer, where a translucent panel washes out over the backdrop. */
  drawerPanel: string;
  /** Where the drawer's close button sits, clear of the progress track. */
  drawerClose: string;
  heading: string;
  percent: string;
  track: string;
  fill: string;
  /** Rides the leading edge of the fill instead of sitting in the heading. */
  ridingCounter: string | null;
  number: string;
  numberActive: string;
  section: string;
  sectionActive: string;
  items: string;
  item: string;
  itemActive: string;
}

const ITEM = 'relative block rounded-lg px-3 py-1.5 transition-colors duration-200';

export const SKINS: Record<SitenavVariant, SitenavSkin> = {
  rail: {
    panel: 'rounded-2xl border bg-background/70 py-5 pr-4 pl-9 shadow-header backdrop-blur-xl backdrop-saturate-150',
    drawerPanel: 'bg-background',
    drawerClose: 'right-3',
    heading: 'text-muted-foreground',
    percent: 'font-mono text-xs text-muted-foreground tabular-nums',
    track: 'top-5 bottom-5 left-4 w-0.5 rounded-full bg-border',
    fill: 'rounded-full bg-foreground',
    ridingCounter: null,
    number: 'font-mono text-[0.7rem] text-muted-foreground transition-colors',
    numberActive: 'text-foreground',
    section: 'text-muted-foreground hover:text-foreground',
    sectionActive: 'font-semibold text-foreground',
    items: 'ml-6 border-l border-border/70 pl-2',
    item: `${ITEM} text-muted-foreground hover:bg-accent/70 hover:text-foreground`,
    itemActive: 'bg-accent font-medium text-foreground',
  },
  index: {
    panel: 'rounded-3xl bg-foreground py-6 pr-12 pl-6 text-background shadow-2xl',
    drawerPanel: '',
    drawerClose: 'right-10',
    heading: 'text-background/55',
    percent: 'hidden',
    track: 'top-6 bottom-6 right-5 w-1 rounded-full bg-background/15',
    fill: 'rounded-full bg-background',
    ridingCounter:
      'left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold text-foreground tabular-nums shadow',
    number: 'text-2xl leading-none font-semibold text-background/35 tabular-nums transition-colors',
    numberActive: 'text-background',
    section: 'text-background/60 hover:text-background',
    sectionActive: 'font-semibold text-background',
    items: 'ml-11',
    item: `${ITEM} text-background/55 hover:text-background after:absolute after:inset-x-3 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 motion-reduce:after:transition-none`,
    itemActive: 'text-background after:scale-x-100',
  },
};
