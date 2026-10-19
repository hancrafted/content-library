import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import { CounterMatrix } from './counter-matrix';
import { BRIEF, TRAITS } from './counter-matrix.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The Context marker inside a filled primary move pill: in flow and `relative`, so its hit area stays on the pill; in the pill's own ink. */
const ON_PILL =
  'relative top-0 right-0 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground';

/*
 * The second cornerstone (Spec Option 3c): the five BRIEF moves answer the five PRICE traits on one checklist board,
 * a tick wherever a move counters a trait, many to many, with the totals in the footer. The Slide header above shows
 * the heading and caption; the body is a Scene in `SlideFrame`. Each move's pill carries the Context marker to its
 * Speaker note, and its row is that note's target.
 */
export const manageThePrice = slide({
  slug: 'manage-the-price',
  messages: { en, de },
  notes: [
    {
      slug: 'break-it-down',
      target: 'break-it-down',
      sources: [
        { slug: 'zhou-least-to-most', url: 'https://arxiv.org/abs/2205.10625' },
        { slug: 'press-compositionality-gap', url: 'https://arxiv.org/abs/2210.03350' },
      ],
    },
    {
      slug: 'requirements-first',
      target: 'requirements-first',
      sources: [{ slug: 'yang-underspecification', url: 'https://arxiv.org/abs/2505.13360' }],
    },
    {
      slug: 'interview-yourself-with-ai',
      target: 'interview-yourself-with-ai',
      sources: [
        { slug: 'vijayvargiya-ambig-swe', url: 'https://arxiv.org/abs/2502.13069' },
        { slug: 'li-eliciting-preferences', url: 'https://arxiv.org/abs/2310.11589' },
      ],
    },
    {
      slug: 'evaluate-each-step',
      target: 'evaluate-each-step',
      sources: [
        { slug: 'lightman-verify-step-by-step', url: 'https://arxiv.org/abs/2305.20050' },
        { slug: 'huang-cannot-self-correct', url: 'https://arxiv.org/abs/2310.01798' },
      ],
    },
    {
      slug: 'fresh-start-for-each-piece',
      target: 'fresh-start-for-each-piece',
      sources: [
        { slug: 'laban-lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' },
        { slug: 'hong-context-rot', url: 'https://www.trychroma.com/research/context-rot' },
      ],
    },
    {
      slug: 'a-limit-on-break-it-down',
      target: 'break-it-down',
      sources: [{ slug: 'dziri-faith-and-fate', url: 'https://arxiv.org/abs/2305.18654' }],
    },
  ],
  segments: [
    { slug: 'one-prompt-is-not-enough' },
    { slug: 'break-it-down-requirements-first' },
    { slug: 'interview-evaluate' },
    { slug: 'fresh-start' },
    { slug: 'refrain' },
  ],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="mt-10">
      <CounterMatrix
        traits={TRAITS.map((slug) => ({
          slug,
          initial: t(`traits.${slug}.initial`),
          rest: t(`traits.${slug}.rest`),
        }))}
        moves={BRIEF.map(({ slug, counters }) => ({
          slug,
          counters,
          initial: t(`moves.${slug}.initial`),
          rest: t(`moves.${slug}.rest`),
          line: t(`moves.${slug}.line`),
          marker: <Marker note={slug} className={ON_PILL} />,
          target: target(slug),
        }))}
        labels={{
          table: t('tableLabel'),
          corner: t.rich('corner', {
            acronym: (chunks: ReactNode) => (
              <span className="font-semibold tracking-widest text-foreground">{chunks}</span>
            ),
          }),
          tick: t('tick'),
          foot: t('footLabel'),
          count: (count) =>
            t.rich('movesCount', {
              count,
              figure: (chunks: ReactNode) => <span className="text-body font-semibold text-foreground">{chunks}</span>,
            }),
        }}
      />
    </SlideFrame>
  ),
});
