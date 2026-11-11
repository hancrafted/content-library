import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BenchStrip } from './bench-strip';
import { GrillChat } from './grill-chat';
import { GrillSpec } from './grill-spec.client';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SpecCard } from './spec-card';

const AMBIG_SWE = { slug: 'vijayvargiya-ambig-swe', url: 'https://arxiv.org/abs/2502.13069' };
const LABAN = { slug: 'laban-lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' };
/** Where grill-me comes from: Matt Pocock's own skill collection and his video on it, the author's primary sources. */
const POCOCK_SKILLS = { slug: 'pocock-skills', url: 'https://github.com/mattpocock/skills' };
const POCOCK_VIDEO = { slug: 'pocock-skills-video', url: 'https://www.youtube.com/watch?v=M6mYodf0dJM' };

/** The spec's rows, in the order the mock reads them. */
const SPEC_ROWS = ['for', 'must', 'bookedBy', 'out', 'done'] as const;

/**
 * "Grill-me" (Spec Option 14a): the interview as a real chat, rounds of numbered questions with one answer each, ending
 * in the spec, which slides from the chat onto a clean bench. Keeps `basic-page` and `motion: local`: the spec card's
 * slide plays on first entry and replays on hover or focus; the card raises on hover.
 */
export const grillMe = slide({
  slug: 'grill-me',
  messages: { en, de },
  captionNote: 'where-grill-me-comes-from',
  notes: [
    { slug: 'where-grill-me-comes-from', target: 'caption', sources: [POCOCK_SKILLS, POCOCK_VIDEO] },
    { slug: 'asking-beats-guessing-on-unclear-tasks', target: 'first-round', sources: [AMBIG_SWE] },
    { slug: 'rounds-are-inferred', target: 'rounds-note', sources: [LABAN] },
  ],
  segments: [{ slug: 'matt-pococks-skill' }, { slug: 'next-30-minutes' }, { slug: 'actionable-one' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8">
      <div className="grid gap-6 @4xl:grid-cols-12">
        <div className="@4xl:col-span-8">
          <GrillChat
            task={t('chat.task')}
            roleSwitch={t('chat.roleSwitch')}
            rounds={[
              {
                slug: 'goal',
                label: (
                  <>
                    {t('chat.rounds.goal.label')}
                    <Marker note="asking-beats-guessing-on-unclear-tasks" placement="beside" />
                  </>
                ),
                questions: [
                  t('chat.rounds.goal.questions.q1'),
                  t('chat.rounds.goal.questions.q2'),
                  t('chat.rounds.goal.questions.q3'),
                ],
                answer: t('chat.rounds.goal.answer'),
                collapsed: false,
                target: target('first-round'),
              },
              {
                slug: 'limits',
                label: t('chat.rounds.limits.label'),
                questions: [t('chat.rounds.limits.questions.q1'), t('chat.rounds.limits.questions.q2')],
                answer: t('chat.rounds.limits.answer'),
                collapsed: false,
              },
              {
                slug: 'done',
                label: t('chat.rounds.done.label'),
                questions: [],
                answer: t('chat.rounds.done.answer'),
                collapsed: true,
              },
            ]}
            closing={t('chat.closing')}
            roundsNote={
              <span {...target('rounds-note')} className="inline-flex items-center gap-1">
                {t('chat.roundsNote')}
                <Marker note="rounds-are-inferred" placement="beside" />
              </span>
            }
          />
        </div>
        <div className="flex flex-col justify-end gap-4 px-3 @4xl:col-span-4">
          <svg viewBox="0 0 200 60" className="hidden w-full @4xl:block" aria-hidden="true">
            <path
              d="M20 8 C 80 8, 150 10, 170 50"
              className="fill-none stroke-primary"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <path
              d="M152 44 L172 54 L178 32"
              className="fill-none stroke-primary"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <GrillSpec label={t('spec.label')}>
            <SpecCard
              title={t('spec.title')}
              rows={SPEC_ROWS.map((row) => ({
                slug: row,
                term: t(`spec.rows.${row}.term`),
                value: t(`spec.rows.${row}.value`),
              }))}
            />
          </GrillSpec>
          <BenchStrip label={t('bench.label')} drawing={t('bench.drawing')} />
        </div>
      </div>
    </SlideFrame>
  ),
});
