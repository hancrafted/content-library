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

/** What a kind looks like: the number disc on the rail, the time pill and the label. Colour by kind, structure only. */
const LOOK: Record<Kind, { disc: string; pill: string; label: string }> = {
  start: { disc: 'bg-muted', pill: 'bg-muted', label: 'text-muted-foreground' },
  close: { disc: 'bg-muted', pill: 'bg-muted', label: 'text-muted-foreground' },
  theory: { disc: 'bg-(--info) text-info-foreground', pill: 'bg-(--info)/15', label: 'text-(--info)' },
  demo: {
    disc: 'bg-primary text-primary-foreground',
    pill: 'bg-primary text-primary-foreground',
    label: 'text-brand-accent',
  },
};

// The session plan as a numbered vertical rail: a time pill, the block and its kind per line, colour by kind. The Slide header shows the title and caption; the Scene holds the rail.
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
          const isDemo = kind === 'demo';
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
                className={`grid flex-1 grid-cols-1 items-start gap-2 md:grid-cols-12 md:gap-4 ${last ? '' : 'pb-6'}`}
              >
                <span
                  className={`inline-flex w-fit rounded-full px-4 py-1 text-body font-semibold md:col-span-2 ${look.pill}`}
                >
                  {t(`blocks.${key}.time`)}
                </span>
                <p
                  className={`text-body font-semibold md:col-span-6 ${isDemo ? 'rounded-xl border-2 border-primary bg-brand-accent/15 px-4 py-2' : 'md:mt-1'}`}
                >
                  {t(`blocks.${key}.title`)}
                  {n !== undefined && (
                    <span className="block text-caption font-normal text-muted-foreground">{t('episode', { n })}</span>
                  )}
                </p>
                <span
                  className={`text-caption font-semibold tracking-widest uppercase md:col-span-4 ${isDemo ? '' : 'md:mt-2'} ${look.label}`}
                >
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
