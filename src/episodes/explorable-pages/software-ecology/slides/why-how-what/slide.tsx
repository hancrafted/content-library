import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { externalHref } from '@/shared/lib/external-link.pure';
import { DashboardStill } from './dashboard-still';
import { FactoryStill } from './factory-still';
import { factoryStillState } from './factory-still-state';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PinNote } from './pin-note';
import { PinNumber } from './pin-number';
import { ToolbarStill } from './toolbar-still';

const DORA_2025 = { slug: 'dora-2025', url: 'https://dora.dev/research/2025/dora-report/' };
const MENDEZ_NAMING_THE_PAIN = { slug: 'mendez-naming-the-pain', url: 'https://arxiv.org/abs/1611.10288' };
const BROOKS_NO_SILVER_BULLET = {
  slug: 'brooks-no-silver-bullet',
  url: 'https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf',
};
const BENDER_TIPPING_POINT = { slug: 'bender-tipping-point', url: 'https://www.youtube.com/watch?v=2n41YjR5QfU' };

/** The still's frame (Spec Option 2b): a muted card with a soft shadow. */
const FRAME = 'flex flex-col gap-3 rounded-xl border border-border bg-muted p-4 shadow-md';

/**
 * The page's one text Slide (Spec Option 2b, which overrules `master: grid-1x3`): one annotated still of the factory at
 * the AI-unbalanced tour's last step, its toolbar above it and the Analysis dashboard under it, beside three numbered
 * notes, Why, How and What, whose numbers match the still's pins. The stills read the Explorable's own model at that
 * step at build time (`factory-still-state.ts`), so they show the state a viewer reaches with Tour. Below `md` the
 * notes stack Why first and the dashboard drops under them. No motion of its own.
 */
export const whyHowWhat = slide({
  slug: 'why-how-what',
  messages: { en, de },
  segments: [
    { slug: 'why-you-may-leave-it' },
    { slug: 'why-the-problem-is-the-system' },
    { slug: 'clear-orders-lower-it' },
    { slug: 'how-play-it' },
    { slug: 'what-two-dials-everywhere' },
    { slug: 'take-it-back-to-monday' },
  ],
  notes: [
    { slug: 'ai-amplifies', target: 'why', sources: [DORA_2025] },
    { slug: 'incomplete-requirements', target: 'why', sources: [MENDEZ_NAMING_THE_PAIN] },
    { slug: 'specifying-is-hard', target: 'what', sources: [BROOKS_NO_SILVER_BULLET] },
    { slug: 'people-and-technology', target: 'what', sources: [BENDER_TIPPING_POINT] },
  ],
  content: ({ t, template, locale, marker, target }) => {
    const state = factoryStillState(locale);
    const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
    const qa = state.stations.find((s) => s.inspection);
    const at = t('still.at', { week: state.week });
    const note = state.words.stage.note;
    return (
      <SlideFrame>
        <div className="mt-8 flex flex-col gap-8">
          <figure className={FRAME}>
            <ToolbarStill
              states={state.toolbar.states}
              scenarios={state.words.toolbar.scenarios}
              tour={state.words.toolbar.tour}
              speed={state.toolbar.speed}
              clock={state.toolbar.clock}
              useCase={state.toolbar.useCase}
              pin={<PinNumber n={2} />}
            />
            <div className="rounded-lg bg-card/60 p-2">
              <FactoryStill
                state={state}
                locale={locale}
                pins={[
                  { n: 1, at: 'qa' },
                  { n: 3, at: 'ba' },
                ]}
                words={{
                  label: t('still.label', {
                    week: state.week,
                    waiting: qa?.waiting ?? 0,
                    output: `${number.format(state.customer.output)}×`,
                  }),
                  overflow: template('still.overflow'),
                  aiExtra: template('still.aiExtra'),
                }}
              />
            </div>
            <figcaption className="flex flex-wrap justify-between gap-x-3 text-caption text-muted-foreground">
              <span className="font-semibold text-foreground">{at}</span>
              <span className="italic">{note}</span>
            </figcaption>
          </figure>
          <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12">
            <figure
              className="order-2 flex flex-col gap-2 md:order-1 md:col-span-5"
              aria-label={t('stills.dashboard.label', { week: state.week })}
            >
              <p className="flex items-center gap-2">
                <PinNumber n={3} />
                <span className="text-caption text-muted-foreground">{t('still.openHint')}</span>
              </p>
              <DashboardStill
                state={state}
                locale={locale}
                words={{
                  aiLeavesIt: t('stills.dashboard.aiLeavesIt'),
                  people: t('stills.dashboard.people'),
                  tools: t('stills.dashboard.tools'),
                  withAiHere: t('stills.dashboard.withAiHere'),
                  light: template('stills.dashboard.light'),
                }}
              />
              <figcaption className="mt-2 flex flex-wrap justify-between gap-x-3 text-caption text-muted-foreground">
                <span className="font-semibold text-foreground">{at}</span>
                <span className="italic">{note}</span>
              </figcaption>
            </figure>
            <div className="focus-group focus-group--dim-others order-1 flex flex-col gap-4 md:order-2 md:col-span-7">
              <PinNote
                n={1}
                slug="why"
                word={t('words.why')}
                title={t('columns.why.title')}
                caption={t.rich('columns.why.caption', {
                  talk: (chunks) => (
                    <a
                      href={externalHref(BENDER_TIPPING_POINT.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="italic underline underline-offset-2"
                    >
                      {chunks}
                    </a>
                  ),
                  amplifies: marker('ai-amplifies'),
                  pain: marker('incomplete-requirements'),
                })}
                targetProps={target('why')}
              />
              <PinNote
                n={2}
                slug="how"
                word={t('words.how')}
                title={t('columns.how.title')}
                caption={t('columns.how.caption')}
              />
              <PinNote
                n={3}
                slug="what"
                word={t('words.what')}
                title={t('columns.what.title')}
                caption={t.rich('columns.what.caption', {
                  hard: marker('specifying-is-hard'),
                  people: marker('people-and-technology'),
                })}
                targetProps={target('what')}
              />
            </div>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
