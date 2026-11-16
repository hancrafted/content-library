import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Cross, DoneBy, Tick } from '@/episodes/components/slide-shared/seam-sum/marks';
import { FAIL_CHIP, type Half } from '@/episodes/components/slide-shared/seam-sum/types';
import { FailureFocus } from './failure-focus.client';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PartyResult } from './party-result';

/** Each card, the half of the goal its seam failure breaks, in board order. */
const CARDS = [
  { slug: 'activities', breaks: 'together' },
  { slug: 'travel', breaks: 'safely' },
  { slug: 'venue', breaks: 'safely' },
  { slug: 'food', breaks: 'together' },
] as const satisfies readonly { slug: string; breaks: Half }[];

const HALVES = ['together', 'safely'] as const satisfies readonly Half[];

/*
 * "The thought experiment" (Spec Option A, cards plus the cause on hover): the party board as a sum. Four cards, each
 * ticked by a person, add up to the party, which fails. Each card shows one fact and one result line at rest, so all
 * four failures read without a pointer; lighting one dims the other three and adds the cause from the card it met.
 * The setup slide carries the manager's question, so this Slide asks none. No stepping, no motion beyond the dimming.
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
  segments: [{ slug: 'everyone-delivered' }, { slug: 'none-of-it-adds-up' }],
  content: ({ t, Marker, target }) => (
    <SlideFrame>
      <div
        data-seam-sum
        {...target('board')}
        className="@container flex flex-col gap-4 rounded-xl bg-muted p-4 shadow-inner"
      >
        <p data-sum-label className="flex flex-wrap items-center gap-x-1.5 text-caption text-muted-foreground">
          <span className="font-medium text-foreground">{t('board.label')}</span> <span aria-hidden>·</span>{' '}
          <span>{t('board.detail')}</span>
          <Marker note="a-real-version-of-the-board" placement="beside" />
        </p>
        <FailureFocus
          label={t('cardsLabel')}
          items={CARDS.map(({ slug, breaks }) => ({
            slug,
            body: (
              <>
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span
                    data-card-label
                    className="rounded-full bg-foreground px-3 py-0.5 text-caption font-medium text-background"
                  >
                    {t(`cards.${slug}.label`)}
                  </span>
                  <DoneBy who="person" label={t('doneByPerson')} />
                </div>
                <div className="flex items-start gap-1.5">
                  <Tick label={t('done')} />
                  <p data-fact className="text-body leading-snug font-semibold break-words hyphens-auto">
                    {t(`cards.${slug}.fact`)}
                  </p>
                </div>
                <div className="relative flex flex-col gap-1.5 rounded-sm border-2 border-destructive px-2 pt-1.5 pb-2">
                  <Cross label={t('fails')} />
                  <p data-failure-result className="text-caption font-medium text-destructive">
                    {t(`cards.${slug}.result`)}
                  </p>
                  <span data-breaks className={`self-start ${FAIL_CHIP}`}>
                    {t(`breaks.${breaks}`)}
                  </span>
                </div>
              </>
            ),
            cause: (
              <>
                <b className="font-medium text-foreground">{t(`cards.${slug}.causeCard`)}</b> {t('hadSet')}{' '}
                {t(`cards.${slug}.cause`)}
              </>
            ),
          }))}
        />
        <PartyResult
          title={t('result.title')}
          goal={t('result.goal')}
          fails={t('fails')}
          broken={HALVES.map((half) => ({
            half,
            chip: `✗ ${t(`halves.${half}`)}`,
            by: t(`result.broken.${half}`),
          }))}
        />
      </div>
    </SlideFrame>
  ),
});
