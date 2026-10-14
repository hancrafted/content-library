import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { Board, type BoardColumnProps } from '@/components/slide-shared/board/board';
import { BoardArrow } from '@/components/slide-shared/board/board-arrow';
import { StickyNote, type StickyNoteProps } from '@/components/slide-shared/board/sticky-note';
import { cn } from '@/lib/utils';
import type { CSSProperties } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './stages-of-sale.module.css';

/** The reading order of the board's marks: each note and arrow appears in turn. */
const ORDER = {
  research: 0,
  contact: 1,
  toOpportunities: 2,
  work: 3,
  toClosing: 4,
  contract: 5,
  toLater: 6,
  delivery: 7,
};

const step = (i: number) => ({ '--i': i }) as CSSProperties;

/** Each arrow spans two columns on the board's first row, so it centres on the gap between them. */
const ARROW_PLACE = 'hidden lg:flex row-start-1 w-10 self-center justify-self-center';

/*
 * The arrows are placed on the board's first row, so from `lg` the columns are pinned to their own tracks too:
 * grid auto-placement would otherwise skip the cells the arrows hold and push the columns down a row.
 */
const PIN_COLUMNS =
  'lg:[&>[data-board-column]]:row-start-1 lg:[&>[data-board-column]:nth-child(1)]:col-start-1 ' +
  'lg:[&>[data-board-column]:nth-child(2)]:col-start-2 lg:[&>[data-board-column]:nth-child(3)]:col-start-3 ' +
  'lg:[&>[data-board-column]:nth-child(4)]:col-start-4';

const LATE_PAYMENT = {
  slug: 'late-payment-directive',
  url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32011L0007',
};

/*
 * The three stages of a sale on the board, read left to right: Leads (the second and third actionables), the work
 * of Opportunities, Closing, then a faint step after it, because delivery and payment still follow the deal. A Scene
 * in place of the Dossier's three-column page (the ticket's overrule): a paragraph cannot hold notes and arrows.
 */
export const stagesOfSale = slide({
  slug: 'stages-of-sale',
  messages: { en, de },
  notes: [
    { slug: 'delivery-is-not-payment', target: 'delivery', sources: [LATE_PAYMENT] },
    { slug: 'acceptance-adds-time', target: 'delivery', sources: [LATE_PAYMENT] },
  ],
  segments: [
    { slug: 'three-stages' },
    { slug: 'second-actionable-lead-list' },
    { slug: 'third-actionable-first-contact' },
    { slug: 'opportunities-are-the-work' },
    { slug: 'lag-after-the-deal' },
  ],
  content: ({ t, target, Title }) => {
    const note = (label: string, i: number, extra?: Partial<StickyNoteProps>) => (
      <StickyNote tone="neutral" fill label={label} className={styles.note} style={step(i)} {...extra} />
    );
    const task = (text: string) => <p className="text-caption font-medium text-primary">{text}</p>;
    const columns: readonly BoardColumnProps[] = [
      {
        slug: 'leads',
        label: t('stages.leads'),
        primary: true,
        children: (
          <>
            {task(t('tasks.second'))}
            {note(t('board.research'), ORDER.research)}
            {task(t('tasks.third'))}
            {note(t('board.contact'), ORDER.contact)}
          </>
        ),
      },
      { slug: 'opportunities', label: t('stages.opportunities'), children: note(t('board.work'), ORDER.work) },
      { slug: 'closing', label: t('stages.closing'), children: note(t('board.contract'), ORDER.contract) },
      {
        slug: 'later',
        label: t('stages.later'),
        dashed: true,
        children: note(t('board.delivery'), ORDER.delivery, { target: target('delivery') }),
      },
    ];
    const arrows = (
      <>
        <BoardArrow
          direction="right"
          style={step(ORDER.toOpportunities)}
          className={cn(styles.arrow, ARROW_PLACE, 'col-span-2 col-start-1 text-foreground')}
        />
        <BoardArrow
          direction="right"
          style={step(ORDER.toClosing)}
          className={cn(styles.arrow, ARROW_PLACE, 'col-span-2 col-start-2 text-foreground')}
        />
        <BoardArrow
          direction="right"
          dashed
          style={step(ORDER.toLater)}
          className={cn(styles.arrow, ARROW_PLACE, 'col-span-2 col-start-3 text-muted-foreground')}
        />
      </>
    );
    return (
      <SlideFrame>
        <Title>{t('title')}</Title>
        <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
        <Board
          columns={columns}
          overlay={arrows}
          aria-label={t('figure')}
          className={cn('mt-10 [--columns:1] lg:[--columns:4]', PIN_COLUMNS)}
        />
      </SlideFrame>
    );
  },
});
