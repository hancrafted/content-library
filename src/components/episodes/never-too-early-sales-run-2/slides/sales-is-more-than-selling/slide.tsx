import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { ConvergingNotes } from './converging-notes';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The three payoffs of early selling, top to bottom; each is the target of its Speaker note. */
const PAYOFFS = ['market-insight', 'trust', 'repeatable-process'] as const;

/*
 * Selling pays three ways before revenue: market insight, trust and a repeatable process, each with an arrow into
 * one outcome, increased trust. A Scene in place of the Dossier's basic page (the ticket's overrule): the board of
 * notes is the body, and a paragraph cannot hold it.
 */
export const salesIsMoreThanSelling = slide({
  slug: 'sales-is-more-than-selling',
  messages: { en, de },
  notes: [
    {
      slug: 'your-guess-of-the-customer-is-wrong',
      target: 'market-insight',
      sources: [{ slug: 'graham-do-things-that-dont-scale', url: 'https://paulgraham.com/ds.html' }],
    },
    {
      slug: 'investors-read-the-team',
      target: 'trust',
      sources: [{ slug: 'gompers-how-vcs-decide', url: 'https://www.nber.org/papers/w22587' }],
    },
    {
      slug: 'scale-after-you-find-the-process',
      target: 'repeatable-process',
      sources: [
        {
          slug: 'blank-marketing-problem',
          url: 'https://steveblank.com/2010/02/11/it-must-be-a-marketing-problem/',
        },
      ],
    },
  ],
  segments: [
    { slug: 'market-insight' },
    { slug: 'trust' },
    { slug: 'repeatable-process' },
    { slug: 'converge-on-trust' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <div className="mt-12">
        <ConvergingNotes
          label={t('board.label')}
          notes={PAYOFFS.map((slug) => ({
            slug,
            label: t(`board.notes.${slug}.label`),
            line: t(`board.notes.${slug}.line`),
            target: target(slug),
          }))}
          outcome={{ label: t('board.outcome.label'), line: t('board.outcome.line') }}
        />
      </div>
    </SlideFrame>
  ),
});
