import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

type Kind = 'start' | 'theory' | 'handsOn' | 'break' | 'close';

const BLOCKS: readonly {
  key: 'welcome' | 'first' | 'break1' | 'grill' | 'second' | 'quiz' | 'third' | 'break2' | 'skill' | 'qa';
  kind: Kind;
  n?: number;
}[] = [
  { key: 'welcome', kind: 'start' },
  { key: 'first', kind: 'theory', n: 1 },
  { key: 'grill', kind: 'handsOn' },
  { key: 'break1', kind: 'break' },
  { key: 'second', kind: 'theory', n: 2 },
  { key: 'quiz', kind: 'handsOn' },
  { key: 'break2', kind: 'break' },
  { key: 'third', kind: 'theory', n: 3 },
  { key: 'skill', kind: 'handsOn' },
  { key: 'qa', kind: 'close' },
];

const MUTED = { disc: 'bg-muted-foreground text-background', label: 'text-muted-foreground' };
const LOOK: Record<Kind, { disc: string; label: string }> = {
  start: MUTED,
  break: MUTED,
  close: MUTED,
  theory: { disc: 'bg-(--info) text-info-foreground', label: 'text-(--info)' },
  handsOn: { disc: 'bg-brand-accent text-background', label: 'text-brand-accent' },
};

const BESIDE_DISC = 'flex min-h-10 items-center';

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
                  className={`flex size-10 flex-none items-center justify-center rounded-full text-body font-semibold ${look.disc}`}
                >
                  {index + 1}
                </span>
                {!last && <span className="w-0.5 grow bg-border" />}
              </div>
              <div
                className={`grid flex-1 grid-cols-1 items-start gap-x-4 md:grid-cols-[5rem_1fr_10rem] ${last ? '' : 'pb-3'}`}
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
