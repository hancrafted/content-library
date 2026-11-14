import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './one-job.module.css';
import { TwoDives } from './two-dives';

const COUPLING = 'coupling-as-first-written';
const OVERRIDE = 'project-details-hard-coded-into-a-skill-can-override-the-task';
const STEPS = ['s1', 's2', 's3', 's4'] as const;
const COUPLED_STEP = 's2';

/** The skill as a coding agent holds it: code, so never translated. */
const SKILL_FILE = 'collect-sediment-sample/SKILL.md';
const SKILL_LINES = ['## Steps', '1. Check the arm and tubes.'] as const;
const CODED_STEP = '2. Descend to 40 m.';
const SKILL_TAIL = ['3. Lower the arm.'] as const;

/**
 * "A project detail couples a skill to one project" (Spec Option 15b): one wide water column under one pinned skill
 * card, the same card lowering two robots, and one side card for coupling, ringed in `primary`. `master: grid-1x2` is
 * overruled to a Scene (8 of 12 columns) beside the card; `motion: local` is kept: both robots descend together, site
 * 4's touches the shelf, site 7's stops at 40 m, and the "80 m short" bracket draws; at rest the end state shows.
 */
export const oneSkillOneJob = slide({
  slug: 'one-skill-one-job',
  messages: { en, de },
  presentation: atDepth(4, 'page'),
  captionNote: OVERRIDE,
  notes: [
    {
      slug: COUPLING,
      target: 'pointer',
      sources: [{ slug: 'structured-design', url: 'https://doi.org/10.1147/sj.132.0115' }],
    },
    {
      slug: OVERRIDE,
      target: 'coupling-card',
      sources: [{ slug: 'swe-skills-bench', url: 'https://arxiv.org/abs/2603.15401' }],
    },
  ],
  segments: [{ slug: 'scribbled-in' }, { slug: 'coupling' }],
  content: ({ t, marker, target }) => {
    const override = { marker: marker(OVERRIDE) };
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <div className="grid gap-6 @4xl:grid-cols-12 @4xl:items-start">
          <div className="relative flex flex-col gap-4 @4xl:col-span-8">
            <div
              data-skill-card
              className={cn(
                styles.card,
                '-rotate-1 rounded-md bg-card px-4 py-3 text-card-foreground shadow-md @3xl:absolute @3xl:top-[2%] @3xl:left-1/2 @3xl:z-10 @3xl:w-[min(45%,22rem)] @3xl:-translate-x-1/2',
              )}
            >
              <InView view="chat" as="div">
                <p className="text-caption font-semibold">{t('card.title')}</p>
                <ol className="mt-1 flex flex-col gap-0.5 text-caption text-muted-foreground">
                  {STEPS.map((step) =>
                    step === COUPLED_STEP ? (
                      <li key={step} className="flex flex-wrap items-baseline gap-2">
                        <span
                          className={cn(styles.scribble, 'rounded-sm px-1 font-semibold text-card-foreground italic')}
                        >
                          {t(`card.steps.${step}`)}
                        </span>
                        <span>{t('card.scribble')}</span>
                      </li>
                    ) : (
                      <li key={step}>{t(`card.steps.${step}`)}</li>
                    ),
                  )}
                </ol>
              </InView>
              <InView view="coding" as="div">
                <p className="font-mono text-caption font-semibold break-all">{SKILL_FILE}</p>
                <code
                  translate="no"
                  className="mt-1 block rounded-md bg-foreground px-3 py-2 font-mono text-caption whitespace-pre-wrap text-background"
                >
                  {SKILL_LINES.join('\n')}
                  {'\n'}
                  <span data-coupled-step className={cn(styles.scribbleCode, 'rounded-sm')}>
                    {CODED_STEP}
                  </span>
                  {'\n'}
                  {SKILL_TAIL.join('\n')}
                </code>
              </InView>
              <p className="mt-2 text-caption font-semibold">{t('sameSkill')}</p>
            </div>
            <ZoneScene
              zone="surface"
              iceberg="none"
              label={t('alt.dives')}
              className="aspect-[3/2] w-full rounded-2xl shadow-md"
            >
              <TwoDives
                sites={{ four: t('sites.four'), seven: t('sites.seven') }}
                short={t('short')}
                depth={(metres) => t('depth', { metres })}
              />
            </ZoneScene>
          </div>
          <div
            data-mistake
            {...target('coupling-card')}
            className="flex flex-col gap-3 rounded-xl border-2 border-primary bg-card p-5 text-card-foreground shadow-md @4xl:col-span-4"
          >
            <p className="flex flex-wrap items-center justify-between gap-2">
              <span
                data-term
                className="rounded-full bg-foreground px-3 py-0.5 text-caption font-semibold text-background"
              >
                {t('mistakes.coupling.term')}
              </span>
              <span className="text-caption text-muted-foreground">{t('mistakes.coupling.question')}</span>
            </p>
            <InView view="chat" as="div" className="flex flex-col gap-2">
              <p className="text-body font-semibold">{t('mistakes.coupling.head')}</p>
              <p className="text-body">{t.rich('mistakes.coupling.text', override)}</p>
            </InView>
            <InView view="coding" as="div" className="flex flex-col gap-2">
              <p className="text-body font-semibold">{t('mistakes.coupling.coding.head')}</p>
              <p className="text-body">{t.rich('mistakes.coupling.coding.text', override)}</p>
            </InView>
          </div>
        </div>
        <div {...target('pointer')} className="grid gap-1 @3xl:grid-cols-[auto_1fr] @3xl:gap-6">
          <p className="text-caption text-foreground">{t('pointer.lead')}</p>
          <p className="text-caption text-foreground">
            <span className="font-semibold text-foreground">{t('pointer.head')}</span>{' '}
            {t.rich('pointer.text', { marker: marker(COUPLING) })}
          </p>
        </div>
        <p className="max-w-md border-t border-border pt-4 text-caption text-foreground">
          <span className="font-semibold text-foreground">{t('analogyLead')}</span> {t('analogy')}
        </p>
      </SlideFrame>
    );
  },
});
