import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { HumanInTheLoop } from '@/explorables/human-in-the-loop/human-in-the-loop';
import type { PopoverCopy } from '@/explorables/human-in-the-loop/human-in-the-loop.types';
import { Sparkle } from '@/shared/components/core-components/glyphs/glyphs';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { InterviewChat, type ChatTurnCopy } from './interview-chat.client';

const INTERVIEW = 'interview';
const REQUIREMENTS = 'requirements';
const RESEARCH = 'research';
const PAGE = 'page';

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

/** The stages the Slide words a popover for: the keys of its own `stages` messages. */
type StageId = keyof typeof en.stages;

/**
 * Your first human-in-the-loop agentic workflow: the whole summer party walked through BRIEF as the `summer-party`
 * Workflow, opening in the Stages view. Four stage cards carry their BRIEF letters, the worked Interview chat of the Plan
 * stage opens from under the diagram (a `<dialog>` cannot sit in a stage title), Requirements is the gate you sign off before research, Research is one fresh chat per ticket, and
 * Page is the second gate. Every stage name opens a two-line popover. The markup reads as an ordered list of stages.
 */
export const firstHumanInTheLoopAgenticWorkflow = slide({
  slug: 'first-human-in-the-loop-agentic-workflow',
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
      target: RESEARCH,
      sources: [
        { slug: 'anthropic-claude-code-best-practices', url: 'https://code.claude.com/docs/en/best-practices' },
      ],
    },
    {
      slug: 'the-answer-can-be-right-and-the-work-wrong',
      target: PAGE,
      sources: [{ slug: 'uesato-process-and-outcome-feedback', url: 'https://arxiv.org/abs/2211.14275' }],
    },
  ],
  segments: [
    { slug: 'restate' },
    { slug: 'interview-and-plan' },
    { slug: 'requirements' },
    { slug: 'research-fresh-each-time' },
    { slug: 'one-page' },
    { slug: 'live-next' },
  ],
  content: ({ t, locale, target, Marker }) => {
    const popover = (id: StageId): PopoverCopy => ({
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
    const stageSlot = (id: StageId) => ({ popover: popover(id) });
    return (
      <SlideFrame className="mt-10 gap-6">
        <HumanInTheLoop
          workflow="summer-party"
          locale={locale}
          view="stages"
          diagram={{
            label: t('workflowLabel'),
            initials: true,
            stages: {
              plan: {
                ...stageSlot('plan'),
                target: target(INTERVIEW),
                aside: <Marker note="a-wrong-early-guess-sticks" placement="beside" />,
              },
              requirements: {
                ...stageSlot('requirements'),
                target: target(REQUIREMENTS),
                aside: <Marker note="why-the-sign-off-is-a-gate" placement="beside" />,
              },
              research: {
                ...stageSlot('research'),
                target: target(RESEARCH),
                aside: (
                  <>
                    <Marker note="focus-beats-volume" placement="beside" />
                    <Marker note="plan-then-fresh-session" placement="beside" />
                  </>
                ),
              },
              page: {
                ...stageSlot('page'),
                target: target(PAGE),
                aside: <Marker note="the-answer-can-be-right-and-the-work-wrong" placement="beside" />,
              },
            },
          }}
        />
        <div className="flex flex-wrap items-center gap-3 text-caption text-muted-foreground">
          {t('chat.lead')}
          {chat}
        </div>
      </SlideFrame>
    );
  },
});
