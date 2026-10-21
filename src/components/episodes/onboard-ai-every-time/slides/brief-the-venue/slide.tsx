import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { Sparkle } from '@/components/slide-shared/human-in-the-loop/glyphs';
import { HumanInTheLoop } from '@/components/slide-shared/human-in-the-loop/human-in-the-loop';
import type { NodeCopy } from '@/components/slide-shared/human-in-the-loop/node-popover.client';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { InterviewChat, type ChatTurnCopy } from './interview-chat.client';
import { Legend } from './legend';

const INTERVIEW = 'interview';
const REQUIREMENTS = 'requirements';
const RESEARCH = 'research';
const COMPARE = 'compare';
const LEGEND = 'legend';

const CRITERIA = ['guests', 'budget', 'stepFree', 'vegetarian', 'quiet'] as const;
/** Matt Pocock's skills the worked chat invokes: a grilling to interview you, then a spec from the answers. */
const GRILLING = {
  command: '/grilling',
  url: 'https://github.com/mattpocock/skills/tree/main/skills/productivity/grilling',
};
const TO_SPEC = {
  command: '/to-spec',
  url: 'https://github.com/mattpocock/skills/tree/main/skills/engineering/to-spec',
};

type Reply = 'start' | 'a1' | 'reframe' | 'a2' | 'a3' | 'spec';
type Asked = 'q1' | 'q2' | 'q2Analogy' | 'q3';

/** The replies that invoke a skill; the questions sit apart, since each has two options and a recommendation. */
const SKILLS: Partial<Record<Reply, typeof GRILLING>> = { start: GRILLING, spec: TO_SPEC };

/** The question you had not thought of. */
const FORGOTTEN: Asked = 'q3';

/**
 * The worked chat in order: you start a grilling, the AI asks one numbered question at a time, you ask for an analogy
 * when a question is jargon (meta-prompting), the last question is the one you forgot, and you end with a spec.
 */
const TURNS: readonly (['reply', Reply] | ['question', Asked])[] = [
  ['reply', 'start'],
  ['question', 'q1'],
  ['reply', 'a1'],
  ['question', 'q2'],
  ['reply', 'reframe'],
  ['question', 'q2Analogy'],
  ['reply', 'a2'],
  ['question', 'q3'],
  ['reply', 'a3'],
  ['reply', 'spec'],
];

const STAGE_IDS = ['party', 'interview', 'requirements', 'research', 'compare', 'recommendation'] as const;
type StageId = (typeof STAGE_IDS)[number];

/**
 * Brief the venue (Spec Option 4a): one task walked through BRIEF as a CI-style pipeline. Six stage columns hold their
 * jobs, every job a fresh chat; hairlines fan out to three venue chats and back in, and the signed-off requirements
 * card is the one focal point. Static at rest, hover only: pointing at a stage dims the others, every node opens a
 * two-line popover, and the Interview opens its worked chat. The markup reads as an ordered list of stages.
 */
export const briefTheVenue = slide({
  slug: 'brief-the-venue',
  messages: { en, de },
  notes: [
    {
      slug: 'why-the-sign-off-is-a-gate',
      target: REQUIREMENTS,
      sources: [{ slug: 'yang-what-prompts-dont-say', url: 'https://arxiv.org/abs/2505.13360' }],
    },
    {
      slug: 'a-wrong-early-guess-sticks',
      target: INTERVIEW,
      sources: [{ slug: 'laban-llms-get-lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' }],
    },
    {
      slug: 'focus-beats-volume',
      target: RESEARCH,
      sources: [{ slug: 'hong-context-rot', url: 'https://www.trychroma.com/research/context-rot' }],
    },
    {
      slug: 'plan-then-fresh-session',
      target: LEGEND,
      sources: [
        { slug: 'anthropic-claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' },
      ],
    },
    {
      slug: 'the-answer-can-be-right-and-the-work-wrong',
      target: COMPARE,
      sources: [{ slug: 'uesato-process-and-outcome-feedback', url: 'https://arxiv.org/abs/2211.14275' }],
    },
  ],
  segments: [
    { slug: 'restate' },
    { slug: 'break-it-down' },
    { slug: 'interview' },
    { slug: 'requirements' },
    { slug: 'research-fresh-each-time' },
    { slug: 'compare-and-check' },
    { slug: 'recommendation-and-on' },
  ],
  content: ({ t, locale, target, marker, Marker }) => {
    const popover = (id: StageId): NodeCopy => ({
      title: t(`stages.${id}.name`),
      in: t(`stages.${id}.popover.in`),
      out: t(`stages.${id}.popover.out`),
      inLabel: t('popover.in'),
      outLabel: t('popover.out'),
    });
    const chat = (
      <InterviewChat
        copy={{
          sparkle: <Sparkle className="size-4" />,
          open: t('chat.open'),
          title: t('chat.title'),
          close: t('chat.close'),
          forgotten: t('chat.forgotten'),
          ai: t('chat.ai'),
          you: t('chat.you'),
          recommended: t('chat.recommended'),
          newTab: t('chat.newTab'),
          turns: TURNS.map(([kind, slug]): ChatTurnCopy => {
            if (kind === 'reply') {
              return { slug, speaker: 'you', text: t(`chat.replies.${slug}`), skill: SKILLS[slug] };
            }
            return {
              slug,
              speaker: 'ai',
              text: t(`chat.questions.${slug}.text`),
              options: [t(`chat.questions.${slug}.a`), t(`chat.questions.${slug}.b`)],
              recommended: t(`chat.questions.${slug}.recommended`),
              forgotten: slug === FORGOTTEN,
            };
          }),
        }}
      />
    );
    const workflowWords = {
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
    const stageSlot = (id: StageId) => ({
      popover: popover(id),
      jobsLabel: t('jobsLabel', { stage: t(`stages.${id}.name`) }),
    });
    return (
      <SlideFrame className="mt-10 gap-10">
        <HumanInTheLoop
          workflow="summer-party"
          locale={locale}
          words={{ workflow: workflowWords }}
          diagram={{
            label: t('pipelineLabel'),
            checked: t('jobs.research.checked'),
            initials: locale === 'en',
            stages: {
              party: stageSlot('party'),
              interview: { ...stageSlot('interview'), target: target(INTERVIEW) },
              requirements: { ...stageSlot('requirements'), target: target(REQUIREMENTS), gate: t('card.gate') },
              research: {
                ...stageSlot('research'),
                target: target(RESEARCH),
                aside: <Marker note="focus-beats-volume" placement="beside" />,
              },
              compare: { ...stageSlot('compare'), target: target(COMPARE), gate: t('jobs.compare.gate') },
              recommendation: stageSlot('recommendation'),
            },
            jobs: {
              pieces: { popover: popover('party') },
              interview: {
                detail: (
                  <>
                    {t('jobs.interview.detail')}
                    <br />
                    {t.rich('jobs.interview.forgot', { marker: marker('a-wrong-early-guess-sticks') })}
                  </>
                ),
                after: chat,
              },
              spec: {
                criteria: CRITERIA.map((criterion) => t(`card.criteria.${criterion}`)),
                marker: <Marker note="why-the-sign-off-is-a-gate" placement="beside" />,
              },
              venue: { popover: popover(RESEARCH) },
              compare: {
                marker: <Marker note="the-answer-can-be-right-and-the-work-wrong" placement="beside" />,
              },
            },
          }}
        />
        <div {...target(LEGEND)}>
          <Legend
            label={t('legend.label')}
            freshChat={t.rich('legend.freshChat', { marker: marker('plan-then-fresh-session') })}
            checked={t('legend.checked')}
            parked={t('legend.parked')}
          />
        </div>
      </SlideFrame>
    );
  },
});
