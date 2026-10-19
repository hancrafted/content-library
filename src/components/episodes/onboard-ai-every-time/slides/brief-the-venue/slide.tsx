import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { InterviewChat, type ChatTurnCopy } from './interview-chat.client';
import type { NodeCopy } from './node-popover.client';
import {
  CompareJob,
  InterviewJob,
  Legend,
  PartyPieces,
  RequirementsCard,
  ResearchChats,
  VenuePlan,
} from './stage-jobs';
import { VenuePipeline, type StageView } from './venue-pipeline';
import { STAGES, type StageId } from './venue-pipeline.pure';

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

const jobsOf = (id: StageId) => STAGES.find((stage) => stage.id === id)?.jobs ?? [];

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
  content: ({ t, target, marker, Marker }) => {
    const initial = (chunks: ReactNode) => <b className="font-semibold text-foreground">{chunks}</b>;
    const popover = (id: StageId): NodeCopy => ({
      title: t(`stages.${id}.name`),
      in: t(`stages.${id}.popover.in`),
      out: t(`stages.${id}.popover.out`),
      inLabel: t('popover.in'),
      outLabel: t('popover.out'),
    });
    const view = (id: StageId, body: ReactNode, extra: Partial<StageView> = {}): StageView => ({
      stage: STAGES.find((stage) => stage.id === id) ?? STAGES[0],
      name: t(`stages.${id}.name`),
      move: t.rich(`stages.${id}.move`, { initial }),
      popover: popover(id),
      jobsLabel: t('jobsLabel', { stage: t(`stages.${id}.name`) }),
      body,
      ...extra,
    });
    const chat = (
      <InterviewChat
        copy={{
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
    const stages: StageView[] = [
      view(
        'party',
        <PartyPieces
          jobs={jobsOf('party')}
          names={{
            venue: t('jobs.party.venue'),
            travel: t('jobs.party.travel'),
            catering: t('jobs.party.catering'),
            invitations: t('jobs.party.invitations'),
            budget: t('jobs.party.budget'),
          }}
          popover={popover('party')}
        />,
      ),
      view(
        INTERVIEW,
        <InterviewJob
          label={t('jobs.interview.label')}
          detail={t('jobs.interview.detail')}
          forgot={t.rich('jobs.interview.forgot', { marker: marker('a-wrong-early-guess-sticks') })}
          chat={chat}
        />,
        { target: target(INTERVIEW) },
      ),
      view(
        REQUIREMENTS,
        <RequirementsCard
          gate={t('card.gate')}
          title={t('card.title')}
          criteria={CRITERIA.map((criterion) => t(`card.criteria.${criterion}`))}
          signOff={t('card.signOff')}
          marker={<Marker note="why-the-sign-off-is-a-gate" placement="beside" />}
        />,
        { target: target(REQUIREMENTS) },
      ),
      view(
        RESEARCH,
        <ResearchChats
          jobs={jobsOf(RESEARCH)}
          names={{
            venue1: t('jobs.research.venue1'),
            venue2: t('jobs.research.venue2'),
            venue3: t('jobs.research.venue3'),
          }}
          checked={t('jobs.research.checked')}
          popover={popover(RESEARCH)}
        />,
        { target: target(RESEARCH), aside: <Marker note="focus-beats-volume" placement="beside" /> },
      ),
      view(
        COMPARE,
        <CompareJob
          label={t('jobs.compare.label')}
          detail={t('jobs.compare.detail')}
          gate={t('jobs.compare.gate')}
          marker={<Marker note="the-answer-can-be-right-and-the-work-wrong" placement="beside" />}
        />,
        { target: target(COMPARE) },
      ),
      view(
        'recommendation',
        <VenuePlan label={t('jobs.recommendation.label')} detail={t('jobs.recommendation.detail')} />,
      ),
    ];
    return (
      <SlideFrame className="mt-10 gap-10">
        <div className="@container">
          <VenuePipeline label={t('pipelineLabel')} stages={stages} />
        </div>
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
