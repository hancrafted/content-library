import type { TargetProps } from '@/shared/lib/context-link.pure';
import type { ReactNode } from 'react';

/** One layer of the stack: its slug (the Speaker note it carries), what it looks like and its words. */
export interface Layer {
  readonly slug: 'engine' | 'prompting' | 'agentic';
  /** 1 at the bottom, 3 on top. */
  readonly n: 1 | 2 | 3;
  readonly tone: 'ai' | 'info' | 'primary';
  readonly label: string;
  readonly name: string;
  readonly line: string;
  /** The layer's mark of the person, only on the layer the person works in. */
  readonly captain?: ReactNode;
  /** Marks the element a Speaker note explains. */
  readonly target?: TargetProps;
}

/** What a tone looks like, spelled out so Tailwind finds each class: the band, its number disc, its label. */
const LOOK = {
  ai: {
    band: 'w-full border border-ai/60 bg-ai/20',
    disc: 'bg-ai text-background',
    label: 'text-ai',
  },
  info: {
    band: 'w-full md:w-5/6 border border-(--info)/50 bg-(--info)/15',
    disc: 'bg-(--info) text-info-foreground',
    label: 'text-(--info)',
  },
  primary: {
    band: 'w-full md:w-2/3 bg-primary text-primary-foreground shadow-lg',
    disc: 'bg-brand-accent text-background',
    label: 'text-brand-accent',
  },
} as const;

/** The arrow between two layers: the lower one builds the one above. */
function Up() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path
        d="M12 20V5M6 11l6-6 6 6"
        className="fill-none stroke-muted-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The stack (a server part): the layers top to bottom, with an arrow up between each pair. The widest band is the
 * engine at the bottom; the solid band on top is the one thing to look at. Pointing at a band dims the others.
 */
export function GroundingStack({ layers }: { layers: readonly [Layer, Layer, Layer] }) {
  return (
    <div className="focus-group focus-group--dim-others flex flex-col items-center gap-3">
      {layers.map((layer, index) => {
        const look = LOOK[layer.tone];
        return (
          <div key={layer.slug} className="contents">
            {index > 0 && <Up />}
            <div
              {...layer.target}
              className={`focus-group__item card-hover card-hover--raise flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:gap-6 ${look.band}`}
            >
              <span
                className={`flex size-14 flex-none items-center justify-center rounded-xl text-subheading font-semibold ${look.disc}`}
              >
                {layer.n}
              </span>
              <div className="flex-1">
                <p className={`text-caption font-semibold tracking-widest uppercase ${look.label}`}>{layer.label}</p>
                <p className="text-subheading font-semibold">{layer.name}</p>
              </div>
              <p className="text-body md:max-w-72 md:text-right">{layer.line}</p>
              {layer.captain}
            </div>
          </div>
        );
      })}
    </div>
  );
}
