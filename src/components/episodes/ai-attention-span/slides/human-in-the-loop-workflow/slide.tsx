import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { HumanInTheLoop } from '@/components/slide-shared/human-in-the-loop/human-in-the-loop';
import de from './i18n/de.json';
import en from './i18n/en.json';

const CLEAN_WINDOWS = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const CONTEXT_LENGTH = { slug: 'du-context-length-alone-hurts', url: 'https://arxiv.org/abs/2510.05381' };

const CRITERIA = ['guests', 'budget', 'stepFree', 'vegetarian', 'quiet'] as const;
const STAGE_IDS = ['party', 'interview', 'requirements', 'research', 'compare', 'recommendation'] as const;

const WORKERS = 'workers';
const LOOP_NOTE = 'loop-note';

/**
 * The human in the loop workflow: the brief-the-venue pipeline whole (its columns, connectors and the fan-out to the
 * worker chats and back in), only without bold first letters and the acronym unnamed. The loop strip did not fit
 * beside it at 1280x800, so its message (planner chat, worker chats, you checking) lives in the caption.
 */
export const humanInTheLoopWorkflow = slide({
  slug: 'human-in-the-loop-workflow',
  messages: { en, de },
  notes: [
    { slug: 'clean-windows-for-each-part', target: WORKERS, sources: [CLEAN_WINDOWS] },
    { slug: 'short-tasks-beat-long-ones', target: LOOP_NOTE, sources: [CONTEXT_LENGTH] },
  ],
  segments: [
    { slug: 'recall' },
    { slug: 'human-in-the-loop' },
    { slug: 'planner-and-handoff' },
    { slug: 'worker-chats' },
    { slug: 'you-check' },
  ],
  content: ({ t, locale, target, marker, Marker }) => {
    const words = {
      stages: Object.fromEntries(
        STAGE_IDS.map((id) => [id, { name: t(`stages.${id}.name`), move: t(`stages.${id}.move`) }]),
      ),
      jobs: {
        pieces: {
          title: t('jobs.party.venue'),
          parked: [
            t('jobs.party.travel'),
            t('jobs.party.catering'),
            t('jobs.party.invitations'),
            t('jobs.party.budget'),
          ],
        },
        interview: { title: t('jobs.interview.label') },
        spec: { title: t('card.title') },
        compare: { title: t('jobs.compare.label'), detail: t('jobs.compare.detail') },
        plan: { title: t('jobs.recommendation.label'), detail: t('jobs.recommendation.detail') },
      },
    };
    const jobsLabel = (id: (typeof STAGE_IDS)[number]) => t('jobsLabel', { stage: t(`stages.${id}.name`) });
    const gates = { requirements: t('card.gate'), compare: t('jobs.compare.gate') };
    return (
      <SlideFrame className="mt-10 gap-10">
        <HumanInTheLoop
          workflow="summer-party"
          locale={locale}
          words={{ workflow: words }}
          diagram={{
            label: t('pipelineLabel'),
            checked: t('jobs.research.checked'),
            initials: false,
            stages: {
              ...Object.fromEntries(STAGE_IDS.map((id) => [id, { jobsLabel: jobsLabel(id) }])),
              requirements: { jobsLabel: jobsLabel('requirements'), gate: gates.requirements },
              research: {
                jobsLabel: jobsLabel('research'),
                target: target(WORKERS),
                aside: <Marker note="clean-windows-for-each-part" placement="beside" />,
              },
              compare: { jobsLabel: jobsLabel('compare'), gate: gates.compare },
            },
            jobs: {
              interview: {
                detail: (
                  <>
                    {t('jobs.interview.detail')}
                    <br />
                    {t.rich('jobs.interview.forgot', { marker: (chunks) => chunks })}
                  </>
                ),
              },
              spec: { criteria: CRITERIA.map((criterion) => t(`card.criteria.${criterion}`)) },
            },
          }}
        />
        <p {...target(LOOP_NOTE)} className="text-caption text-pretty text-muted-foreground">
          {t.rich('loop.note', { marker: marker('short-tasks-beat-long-ones') })}
        </p>
      </SlideFrame>
    );
  },
});
