import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { ComicPanel } from './comic-panel';
import { ControlRoom } from './control-room';
import { EmptyProcedureCard } from './empty-procedure-card';
import styles from './forgets.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PILOT_HEAD, PhotoOnDeck } from './photo-on-deck';

const MOLLICK = {
  slug: 'mollick-good-enough-prompting',
  url: 'https://www.oneusefulthing.org/p/getting-started-with-ai-good-enough',
};
const CLAUDE_MEMORY = { slug: 'anthropic-claude-code-memory', url: 'https://code.claude.com/docs/en/memory' };

/** The three mornings, in order: only the mug count on the console changes. */
const MORNINGS = [
  { day: 'd1', mugs: 1 },
  { day: 'd2', mugs: 2 },
  { day: 'd3', mugs: 3 },
] as const;

/** The panels' places in the strip's 12 columns, wide enough: photo and two mornings, then the third and the question. */
const SPAN = {
  photo: '@5xl:col-span-4',
  d1: '@5xl:col-span-4',
  d2: '@5xl:col-span-4',
  d3: '@5xl:col-span-5',
  question: '@2xl:col-span-2 @5xl:col-span-7',
} as const;

const PERCENT = 100;

/**
 * "An AI model that forgets every morning" (Spec Option 1a): a five-panel comic in the low-poly Iceberg register. The
 * framed photo of you and your pilot of ten years, tagged AI model; three identical mornings in the control room, each a
 * Surface `ZoneScene` where only the coffee mugs pile up; then "What would you do?" beside an empty procedure card.
 * Keeps `master: grid-bento` and `motion: local`: the panels appear one after another on entry, at rest all show. The
 * Coding agent view turns the mornings into sessions and adds the fresh-context-window line to the footer.
 */
export const anAiModelThatForgetsEveryMorning = slide({
  slug: 'an-ai-model-that-forgets-every-morning',
  messages: { en, de },
  presentation: atDepth(0, 'page'),
  captionNote: 'each-ai-conversation-starts-fresh',
  notes: [{ slug: 'each-ai-conversation-starts-fresh', target: 'caption', sources: [MOLLICK, CLAUDE_MEMORY] }],
  segments: [{ slug: 'three-mornings' }, { slug: 'the-hook' }, { slug: 'what-would-you-do' }],
  content: ({ t }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <ol
        aria-label={t('strip')}
        className="focus-group focus-group--dim-others grid grid-cols-1 gap-4 @2xl:grid-cols-2 @5xl:grid-cols-12"
      >
        <ComicPanel
          index={0}
          label={{ chat: t('photo.label'), coding: t('photo.codingLabel') }}
          className={`border-foreground ${SPAN.photo}`}
        >
          <div className={`${styles.room} flex flex-1 flex-col justify-between gap-3 bg-(--room) p-3`}>
            <div className="relative rounded-sm border-8 border-(--frame) shadow-md">
              <ZoneScene zone="surface" iceberg="none" label={t('alt.photo')} className="aspect-[3/2] w-full">
                <PhotoOnDeck />
              </ZoneScene>
              <span
                data-ai-tag
                style={{ left: `${PILOT_HEAD.left * PERCENT}%`, top: `${PILOT_HEAD.top * PERCENT}%` }}
                className="absolute -translate-x-1/2 -translate-y-full rounded-full border-2 border-ai bg-card px-2 text-caption font-semibold text-card-foreground shadow-sm"
              >
                {t('aiTag')}
              </span>
            </div>
            <p className="rounded-md border border-foreground bg-card px-3 py-1 text-caption text-card-foreground">
              {t('photo.caption')}
            </p>
          </div>
        </ComicPanel>
        {MORNINGS.map(({ day, mugs }, index) => (
          <ComicPanel
            key={day}
            index={index + 1}
            label={{ chat: t(`days.${day}.label`), coding: t(`days.${day}.sessionLabel`) }}
            className={`border-foreground ${SPAN[day]}`}
            data={{ 'data-morning': String(mugs) }}
          >
            <ZoneScene
              zone="surface"
              iceberg="none"
              label={t('alt.morning', { day: index + 1, mugs })}
              className="aspect-[6/5] w-full flex-1"
            >
              <ControlRoom mugs={mugs} captainLine={t(`days.${day}.captainLine`)} greeting={t('greeting')} />
            </ZoneScene>
          </ComicPanel>
        ))}
        <ComicPanel index={MORNINGS.length + 1} className={`border-primary ${SPAN.question}`}>
          <div className="flex flex-1 flex-col items-center gap-8 p-6 @2xl:flex-row @2xl:p-8">
            <div className="flex flex-1 flex-col gap-3">
              <p className="text-caption font-semibold text-muted-foreground uppercase">{t('questionDay')}</p>
              <p className="text-body font-semibold">{t('question')}</p>
              <p className="text-body text-muted-foreground">{t('questionBody')}</p>
            </div>
            <EmptyProcedureCard
              labels={{
                card: t('card.label'),
                title: t('card.title'),
                useWhen: t('card.useWhen'),
                steps: t('card.steps'),
              }}
            />
          </div>
        </ComicPanel>
      </ol>
      <div className="flex flex-col gap-3 border-t border-border pt-4 @2xl:flex-row @2xl:items-start @2xl:justify-between @2xl:gap-10">
        <p className="max-w-md text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('analogyLead')}</span> {t('analogy')}
        </p>
        <InView view="coding" as="p" className="max-w-md font-mono text-caption text-muted-foreground @2xl:text-right">
          {t('agent.caption')}
        </InView>
      </div>
    </SlideFrame>
  ),
});
