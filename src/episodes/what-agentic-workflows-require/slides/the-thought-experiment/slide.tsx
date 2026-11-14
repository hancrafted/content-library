import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { SeamSum, type Half, type SeamSumCard } from '@/episodes/components/slide-shared/seam-sum/seam-sum';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** Each card, the half of the goal its seam failure breaks, in board order. */
const CARDS = [
  { slug: 'activities', breaks: 'together' },
  { slug: 'travel', breaks: 'safely' },
  { slug: 'venue', breaks: 'safely' },
  { slug: 'food', breaks: 'together' },
] as const satisfies readonly { slug: SeamSumCard['slug']; breaks: Half }[];

const HALVES = ['together', 'safely'] as const satisfies readonly Half[];

/*
 * "The thought experiment" (Spec Option 1c): the party board as a sum. Four cards, each ticked by a person against its
 * own goal, add up plus by plus to the party, which fails; each card carries its failure at the seam with another card
 * and the half of the goal it breaks. The manager's question sits under it as the one `primary` banner. The marks stay
 * unexplained; later Slides resolve them. No motion: the sum reads in a still frame.
 */
export const theThoughtExperiment = slide({
  slug: 'the-thought-experiment',
  messages: { en, de },
  notes: [
    {
      slug: 'a-real-version-of-the-board',
      target: 'board',
      sources: [
        {
          slug: 'anthropic-multi-agent-research',
          url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
        },
      ],
    },
  ],
  segments: [{ slug: 'everyone-delivered' }, { slug: 'none-of-it-adds-up' }, { slug: 'your-question' }],
  content: ({ t, Marker, target }) => (
    <SlideFrame className="gap-5">
      <div {...target('board')}>
        <SeamSum
          label={{
            name: t('board.label'),
            detail: t('board.detail'),
            marker: <Marker note="a-real-version-of-the-board" placement="beside" />,
          }}
          cards={CARDS.map(({ slug, breaks }) => ({
            slug,
            label: t(`cards.${slug}.label`),
            doneBy: 'person',
            goal: t(`cards.${slug}.goal`),
            failure: {
              fact: t(`cards.${slug}.fact`),
              seam: { card: t(`cards.${slug}.seamCard`), held: t(`cards.${slug}.held`) },
              result: t(`cards.${slug}.result`),
              breaks,
            },
          }))}
          result={{
            title: t('result.title'),
            goal: t('result.goal'),
            broken: HALVES.map((half) => ({ half, by: t(`result.broken.${half}`) })),
          }}
          words={{
            cards: t('cardsLabel'),
            ownGoal: t('ownGoal'),
            breaks: { together: t('breaks.together'), safely: t('breaks.safely') },
            halves: { together: t('halves.together'), safely: t('halves.safely') },
            doneBy: { person: t('doneBy.person'), agent: t('doneBy.agent') },
            done: t('done'),
            fails: t('fails'),
          }}
        />
      </div>
      <div
        data-question
        className="flex flex-col gap-1 rounded-sm bg-primary px-5 py-3 text-primary-foreground shadow-xl sm:flex-row sm:items-center sm:gap-4"
      >
        <span className="shrink-0 text-caption font-medium uppercase">{t('question.label')}</span>{' '}
        <p className="text-body font-semibold">{t('question.text')}</p>
      </div>
    </SlideFrame>
  ),
});
