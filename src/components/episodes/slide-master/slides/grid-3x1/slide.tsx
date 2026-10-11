import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { useId } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

interface AgendaRowProps {
  index: string;
  hover: string;
  title: string;
  caption: string;
}

// One agenda row: a large ordinal, the title and the caption share one baseline (stacked below md), ruled by hairlines.
// Hover indents the row and colours its ordinal. CSS only, so no client widget; under reduced motion it jumps.
function AgendaRow({ index, hover, title, caption }: AgendaRowProps) {
  const id = `grid-3x1-${useId()}`;
  return (
    <li className="group">
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 py-7 transition-[padding] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:pl-3 motion-reduce:transition-none sm:grid-cols-[5rem_minmax(0,1fr)] md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1.1fr)] md:gap-x-8 md:py-9 md:group-hover:pl-6">
        <span
          aria-hidden
          className={`${hover} font-serif text-5xl leading-none text-muted-foreground/45 italic tabular-nums transition-colors duration-300 motion-reduce:transition-none md:text-7xl`}
        >
          {index}
        </span>
        <h4
          id={id}
          className="text-2xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-3xl"
        >
          {title}
        </h4>
        <p className="col-start-2 text-base text-pretty text-muted-foreground md:col-start-3">{caption}</p>
      </div>
    </li>
  );
}

// Three full-width rows read like an editorial agenda: numbered top to bottom, separated by hairlines.
export const grid3x1 = slide({
  slug: 'grid-3x1',
  messages: { en, de },
  notes: [{ slug: 'layout', target: 'grid' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <ol {...target('grid')} className="mt-10 divide-y divide-border border-y border-border">
        <AgendaRow
          index="01"
          hover="group-hover:text-machine"
          title={t('cells.c1.title')}
          caption={t('cells.c1.caption')}
        />
        <AgendaRow
          index="02"
          hover="group-hover:text-human"
          title={t('cells.c2.title')}
          caption={t('cells.c2.caption')}
        />
        <AgendaRow index="03" hover="group-hover:text-ai" title={t('cells.c3.title')} caption={t('cells.c3.caption')} />
      </ol>
    </SlideFrame>
  ),
});
