import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { SeamSum, type Half, type SeamSumCard } from '@/episodes/components/slide-shared/seam-sum/seam-sum';
import { ContextList } from './context-list';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SpeedCard } from './speed-card';

/** Each card, the half of the goal its seam failure breaks, in board order: the same places as on Slide 1. */
const CARDS = [
  { slug: 'activities', breaks: 'together' },
  { slug: 'travel', breaks: 'safely' },
  { slug: 'venue', breaks: 'safely' },
  { slug: 'food', breaks: 'together' },
] as const satisfies readonly { slug: SeamSumCard['slug']; breaks: Half }[];

const HALVES = ['together', 'safely'] as const satisfies readonly Half[];

/** Each line of what no agent was told, and the Speaker note its Context marker opens. */
const CONTEXT = [
  { slug: 'public-text', note: 'a-model-can-learn-from-public-text-alone' },
  { slug: 'own-talk', note: 'customer-conversations-are-not-training-data' },
  { slug: 'rare-facts', note: 'rare-facts-are-learned-poorly' },
  { slug: 'with-the-task', note: 'the-context-must-be-supplied' },
] as const;

/*
 * "Now with agents" (Spec Option 2a): Slide 1's sum replayed, an agent on every card, each stamped 2 min, the same four
 * failures in the same places in the compact card form. Beside it the speed card, the one `primary` fill, and what no
 * agent was told, one Context marker per line. No motion: the stamps and failures show at rest.
 */
export const nowWithAgents = slide({
  slug: 'now-with-agents',
  messages: { en, de },
  notes: [
    {
      slug: 'a-model-can-learn-from-public-text-alone',
      target: 'context',
      sources: [{ slug: 'touvron-llama', url: 'https://arxiv.org/abs/2302.13971' }],
    },
    {
      slug: 'customer-conversations-are-not-training-data',
      target: 'context',
      sources: [
        {
          slug: 'anthropic-commercial-training',
          url: 'https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training',
        },
      ],
    },
    {
      slug: 'rare-facts-are-learned-poorly',
      target: 'context',
      sources: [{ slug: 'kandpal-long-tail', url: 'https://arxiv.org/abs/2211.08411' }],
    },
    {
      slug: 'the-context-must-be-supplied',
      target: 'context',
      sources: [{ slug: 'lewis-rag', url: 'https://arxiv.org/abs/2005.11401' }],
    },
  ],
  segments: [{ slug: 'speed-not-context' }, { slug: 'plausible-guess' }],
  content: ({ t, Marker, target }) => (
    <SlideFrame>
      <div className="@container">
        <div className="grid items-start gap-6 @5xl:grid-cols-12">
          <div className="@5xl:col-span-9">
            <SeamSum
              compact
              label={{ name: t('board.label'), detail: t('board.detail') }}
              cards={CARDS.map(({ slug, breaks }) => ({
                slug,
                label: t(`cards.${slug}.label`),
                doneBy: 'agent',
                goal: t('ownGoalMet'),
                stamp: t('stamp'),
                failure: {
                  fact: t(`cards.${slug}.fact`),
                  seam: { card: t(`cards.${slug}.seamCard`), held: t(`cards.${slug}.held`) },
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
                breaks: { together: t('breaks.together'), safely: t('breaks.safely') },
                halves: { together: t('halves.together'), safely: t('halves.safely') },
                doneBy: { person: t('doneBy.person'), agent: t('doneBy.agent') },
                done: t('done'),
                fails: t('fails'),
              }}
            />
          </div>
          <div className="flex flex-col gap-4 px-2 @5xl:col-span-3 @5xl:pt-8">
            <SpeedCard
              label={t('speed.label')}
              value={t('speed.value')}
              before={t('speed.before')}
              claim={t('speed.claim')}
            />
            <div {...target('context')}>
              <ContextList
                title={t('context.title')}
                items={CONTEXT.map(({ slug, note }) => ({
                  slug,
                  text: t(`context.items.${slug}`),
                  note: <Marker note={note} placement="beside" />,
                }))}
              />
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  ),
});
