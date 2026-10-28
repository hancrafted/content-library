import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

type Kind = 'start' | 'theory' | 'demo' | 'close';

/**
 * The session's blocks in the order they run, each at its start from 0:00 (the clock time differs per Event), as keys of `blocks` and the kind each is: the kind picks its colour. Add
 * or drop a block here and in both Translation files; `n` numbers an Episode's block ("Episode 1").
 */
const BLOCKS: readonly {
  key: 'welcome' | 'first' | 'grill' | 'second' | 'workflow' | 'third' | 'qa';
  kind: Kind;
  n?: number;
}[] = [
  { key: 'welcome', kind: 'start' },
  { key: 'first', kind: 'theory', n: 1 },
  { key: 'grill', kind: 'demo' },
  { key: 'second', kind: 'theory', n: 2 },
  { key: 'workflow', kind: 'demo' },
  { key: 'third', kind: 'theory', n: 3 },
  { key: 'qa', kind: 'close' },
];

/**
 * What a kind looks like: its disc on the rail and its label, in one of three colours (theory blue, demo orange,
 * start and wrap-up grey); every other text is the foreground colour.
 */
const LOOK: Record<Kind, { disc: string; label: string }> = {
  start: { disc: 'bg-muted-foreground text-background', label: 'text-muted-foreground' },
  close: { disc: 'bg-muted-foreground text-background', label: 'text-muted-foreground' },
  theory: { disc: 'bg-(--info) text-info-foreground', label: 'text-(--info)' },
  demo: { disc: 'bg-brand-accent text-background', label: 'text-brand-accent' },
};

/** One line of the rail beside a disc: as tall as the disc at least, its text centred on the disc's middle. */
const BESIDE_DISC = 'flex min-h-12 items-center';

// The session plan as a numbered vertical rail: per line a disc, the start time, the block and its kind, the disc and the kind in the kind's colour. The Slide header shows the title and caption; the Scene holds the rail.
export const agenda = slide({
  slug: 'agenda',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'items' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <ol
        {...target('items')}
        data-workshop-items=""
        aria-label={t('title')}
        className="focus-group focus-group--dim-others flex flex-col"
      >
        {BLOCKS.map(({ key, kind, n }, index) => {
          const look = LOOK[kind];
          const last = index === BLOCKS.length - 1;
          return (
            <li key={key} className="focus-group__item flex gap-4 md:gap-6">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-12 flex-none items-center justify-center rounded-full text-body font-semibold ${look.disc}`}
                >
                  {index + 1}
                </span>
                {!last && <span className="w-0.5 grow bg-border" />}
              </div>
              <div
                className={`grid flex-1 grid-cols-1 items-start gap-x-4 md:grid-cols-[5rem_1fr_10rem] ${last ? '' : 'pb-6'}`}
              >
                <span className={`${BESIDE_DISC} text-body font-semibold tabular-nums`}>{t(`blocks.${key}.time`)}</span>
                <p className={BESIDE_DISC}>
                  <span className="text-body font-semibold">
                    {t(`blocks.${key}.title`)}
                    {n !== undefined && (
                      <span className="block text-caption font-normal text-muted-foreground">
                        {t('episode', { n })}
                      </span>
                    )}
                  </span>
                </p>
                <span className={`${BESIDE_DISC} text-caption font-semibold tracking-widest uppercase ${look.label}`}>
                  {t(`kinds.${kind}`)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </SlideFrame>
  ),
});
