import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { DayOneNote } from '@/components/slide-shared/day-one-note';
import { useId, type ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './prompting-like-a-tool.module.css';

interface HalfProps {
  title: string;
  side: 'start' | 'end';
  children: ReactNode;
}

// One half of the split, copied from the grid-1x2 master and reduced to its header and the idea itself: the halves
// face each other across the hairline; no hover, no index, so both read at rest.
function Half({ title, side, children }: HalfProps) {
  const id = `prompting-${useId()}`;
  const facing = side === 'start' ? 'md:pr-10' : 'md:pl-10';
  const accent = side === 'start' ? 'bg-muted-foreground' : 'bg-primary';
  return (
    <article aria-labelledby={id} className={`flex flex-col gap-6 py-8 md:py-4 ${facing}`}>
      <h4 id={id} className="flex items-center gap-3 text-body font-semibold text-foreground">
        <span aria-hidden className={`size-2 rounded-full ${accent}`} />
        {title}
      </h4>
      {children}
    </article>
  );
}

const NOTE_ROWS = ['last-year', 'budget', 'access', 'ask', 'check'] as const;

/*
 * One line against a first day: the grid-1x2 master, copied with changes. The left half is the one-line prompt, bare
 * on purpose; the right half is the same task as the day-one note, its rows filling top to bottom once when the Slide
 * becomes active. The left half never moves. CSS only, so no client widget.
 */
export const promptingLikeATool = slide({
  slug: 'prompting-like-a-tool',
  messages: { en, de },
  notes: [
    {
      slug: 'unstated-requirements-are-guessed',
      target: 'prompt',
      sources: [{ slug: 'what-prompts-dont-say', url: 'https://arxiv.org/abs/2505.13360' }],
    },
    {
      slug: 'say-it-up-front',
      target: 'note',
      sources: [{ slug: 'lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' }],
    },
    {
      slug: 'relevant-specific-context',
      target: 'note',
      sources: [
        { slug: 'lost-in-the-middle', url: 'https://arxiv.org/pdf/2307.03172' },
        {
          slug: 'effective-context-engineering',
          url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
        },
      ],
    },
  ],
  segments: [{ slug: 'back-to-the-hook' }, { slug: 'the-answer-to-the-hanging-why' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-10 grid grid-cols-1 divide-y divide-border border-y border-border md:grid-cols-2 md:divide-x md:divide-y-0">
        <Half side="start" title={t('halves.tool.title')}>
          <p
            {...target('prompt')}
            className="rounded-md border border-border px-4 py-3 font-mono text-body text-foreground"
          >
            {t('prompt')}
            <span aria-hidden className="inline-block h-[1.1em] w-0.5 bg-foreground align-middle" />
          </p>
        </Half>
        <Half side="end" title={t('halves.colleague.title')}>
          <DayOneNote
            {...target('note')}
            label={t('note.label')}
            rowClassName={styles.row}
            rows={NOTE_ROWS.map((id) => ({
              id,
              term: t(`note.rows.${id}.term`),
              text: t(`note.rows.${id}.text`),
            }))}
          />
        </Half>
      </div>
    </SlideFrame>
  ),
});
