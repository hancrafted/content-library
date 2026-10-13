import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { useId, type ReactNode } from 'react';
import { DayAxis } from './day-axis';
import de from './i18n/de.json';
import en from './i18n/en.json';

interface PosterProps {
  task: string;
  deliverable: string;
  deadline: string;
  axis: ReactNode;
  'data-target'?: string;
}

// The poster tile, copied from the grid-1x1 master on a flat neutral fill, sized to its content; the task labels it.
function Poster({ task, deliverable, deadline, axis, ...rest }: PosterProps) {
  const id = `the-plan-${useId()}`;
  return (
    <article {...rest} aria-labelledby={id} className="rounded-xl bg-muted p-6 md:p-10">
      <p id={id} className="text-subheading font-semibold text-balance text-foreground">
        {task}
      </p>
      <p className="mt-2 text-subheading font-normal text-balance text-muted-foreground">{deliverable}</p>
      <p className="mt-2 text-subheading font-normal text-balance text-muted-foreground">{deadline}</p>
      {axis}
    </article>
  );
}

/*
 * The task that lands on the desk: the grid-1x1 master, copied with changes. The one feature cell is a flat poster
 * tile stating the brief in three lines, over the working day as an axis that fills to the 17:00 deadline, so the
 * deadline is a picture, not a word. CSS only, so no client widget.
 */
export const thePlanIsDueByEndOfDay = slide({
  slug: 'the-plan-is-due-by-end-of-day',
  messages: { en, de },
  notes: [
    {
      slug: 'onboarding-as-the-yardstick',
      target: 'brief',
      sources: [{ slug: 'karpathy-post', url: 'https://x.com/karpathy/status/1868061331355840704' }],
    },
  ],
  segments: [{ slug: 'the-task' }, { slug: 'the-clock' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div className="mt-10">
        <Poster
          {...target('brief')}
          task={t('brief.task')}
          deliverable={t('brief.deliverable')}
          deadline={t('brief.deadline')}
          axis={<DayAxis label={t('day.label')} start={t('day.start')} due={t('day.due')} />}
        />
      </div>
    </SlideFrame>
  ),
});
