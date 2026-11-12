import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import { BenchRoom } from './bench-room';
import { HandOff } from './hand-off';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PlanningOffice } from './planning-office';
import { WorkOrder } from './work-order';

const LI = { slug: 'li-eliciting-human-preferences', url: 'https://arxiv.org/abs/2310.11589' };
const REPROMPT = { slug: 'shi-reprompt', url: 'https://arxiv.org/abs/2601.16507' };

/** The interview in the office, turn by turn. */
const EXCHANGE = [
  { slug: 'q1', who: 'ai' },
  { slug: 'a1', who: 'human' },
  { slug: 'q2', who: 'ai' },
  { slug: 'a2', who: 'human' },
] as const;

/** The work order's rows, in the order the mock reads them. */
const ROWS = ['goal', 'who', 'must', 'done'] as const;

const MARKED = 'inline-flex items-center gap-1 text-caption';

/**
 * "Meta prompting" (Spec Option 13a): two rooms on one floor. The planning office, a separate chat, keeps its questions
 * and drafts; only one crisp work order crosses to the bike bench. Keeps `grid-1x2` as the idea but builds a Scene of
 * two unequal rooms with the hand-off between them; keeps `motion: none`, the work order raises on hover.
 */
export const metaPrompting = slide({
  slug: 'meta-prompting',
  messages: { en, de },
  notes: [
    { slug: 'users-answer-better-than-they-write', target: 'answer-better', sources: [LI] },
    { slug: 'prompts-generated-from-requirements', target: 'written-from', sources: [REPROMPT] },
  ],
  segments: [{ slug: 'separate-session' }, { slug: 'fresh-chat-clean-work-order' }, { slug: 'why-a-separate-office' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8">
      <div className="grid items-stretch gap-6 rounded-xl bg-muted p-5 @xl:p-8 @4xl:grid-cols-12">
        <div className="flex flex-col @4xl:col-span-5">
          <PlanningOffice
            label={t('office.label')}
            exchange={EXCHANGE.map(({ slug, who }) => ({ slug, who, text: t(`office.exchange.${slug}`) }))}
            you={t.rich('office.you', { b: (chunks: ReactNode) => <b className="font-semibold">{chunks}</b> })}
            answerBetter={
              <p {...target('answer-better')} className={`${MARKED} font-semibold text-foreground`}>
                {t('office.answerBetter')}
                <Marker note="users-answer-better-than-they-write" placement="beside" />
              </p>
            }
            residue={t('office.residue')}
          />
        </div>
        <HandOff label={t('handOff.label')} note={t('handOff.note')} />
        <div className="flex flex-col @4xl:col-span-5">
          <BenchRoom label={t('bench.label')} drawing={t('bench.drawing')} worker={t('bench.worker')}>
            <WorkOrder
              title={t('workOrder.title')}
              rows={ROWS.map((row) => ({
                slug: row,
                term: t(`workOrder.rows.${row}.term`),
                value: t(`workOrder.rows.${row}.value`),
              }))}
              source={
                <p {...target('written-from')} className={`${MARKED} mt-3 text-muted-foreground`}>
                  {t('workOrder.source')}
                  <Marker note="prompts-generated-from-requirements" placement="beside" />
                </p>
              }
            />
          </BenchRoom>
        </div>
      </div>
    </SlideFrame>
  ),
});
