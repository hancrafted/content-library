import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import { ContextGauge, DayPanel } from './day-panel';
import { RoomPicture, RunPicture } from './day-pictures';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { NotesLane, SkillCard } from './paths';
import styles from './slide.module.css';

const BEST_PRACTICES = {
  slug: 'agentskills-best-practices',
  url: 'https://agentskills.io/skill-creation/best-practices',
};
const SKILL_CREATOR = {
  slug: 'anthropic-skill-creator',
  url: 'https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md',
};
const GOOGLE_WHITEPAPER = {
  slug: 'google-agent-skills-whitepaper',
  url: 'https://www.kaggle.com/whitepaper-agent-skills',
};

/** The skill's name and file, as Slides 3 and 6 give them: code, not translated. */
const SKILL_NAME = 'collect-sediment-sample';
const QUESTIONS = ['depth', 'order', 'failure'] as const;

/**
 * "Write it from a good run" (picked Option 10b): two paths into one skill. Above, the interview path as one day in
 * four panels: the run that worked, the AI interviewing you for the why, the AI writing the skill that evening while
 * the run is in its context window, and the next morning starting fresh with the card on the wall. Below, the notes
 * lane joins at the skill card. `master: grid-1x2` and `motion: local` are overruled, as the Option says, for this
 * Scene and its one emphasis motion: the day plays panel by panel and both arrows draw into the card.
 */
export const writeItFromAGoodRun = slide({
  slug: 'write-it-from-a-good-run',
  messages: { en, de },
  presentation: atDepth(2, 'page'),
  captionNote: 'write-the-skill-from-a-real-run',
  notes: [
    { slug: 'write-the-skill-from-a-real-run', target: 'run', sources: [BEST_PRACTICES] },
    { slug: 'the-agent-can-interview-you', target: 'interview', sources: [SKILL_CREATOR] },
    { slug: 'googles-route', target: 'notes-lane', sources: [GOOGLE_WHITEPAPER] },
  ],
  segments: [{ slug: 'two-starting-points' }, { slug: 'capture-the-why' }, { slug: 'while-he-still-knows' }],
  content: ({ t, marker, target }) => (
    <SlideFrame className={cn(styles.day, '@container mt-8 gap-6')}>
      <p className="flex flex-wrap items-baseline gap-x-3">
        <span className="text-body font-semibold">{t('lane.interview')}</span>
        <span className="text-caption text-muted-foreground">{t('lane.interviewSub')}</span>
      </p>
      <ol
        aria-label={t('lane.label')}
        className="focus-group focus-group--dim-others grid items-stretch gap-4 @2xl:grid-cols-2 @5xl:grid-cols-4"
      >
        <DayPanel
          n={1}
          step={t.rich('day.0.step', { marker: marker('write-the-skill-from-a-real-run') })}
          time={t('day.0.time')}
          ai={t('day.0.ai')}
          marked={target('run')}
          picture={<RunPicture label={t('alt.run')} depth={t('art.depth')} />}
          coding={<p className="text-muted-foreground">{t('day.0.coding')}</p>}
        />
        <DayPanel
          n={2}
          step={t.rich('day.1.step', { marker: marker('the-agent-can-interview-you') })}
          time={t('day.1.time')}
          ai={t('day.1.ai')}
          picture={<RoomPicture panel="interview" label={t('alt.interview')} />}
          chat={QUESTIONS.map((question) => (
            <p
              key={question}
              data-question
              className="rounded-md border-2 border-ai px-2 py-0.5 text-caption font-medium"
            >
              {t(`day.1.questions.${question}`)}
            </p>
          ))}
          coding={
            <code {...target('interview')} className="flex flex-col gap-1 rounded-md bg-foreground p-2 text-background">
              <span data-request>&gt; {t('coding.request')}</span>
              <span className="text-background/70">{t('coding.readsFirst')}</span>
              <span>{t('coding.asks')}</span>
            </code>
          }
        />
        <DayPanel
          n={3}
          focal
          step={t('day.2.step')}
          time={t('day.2.time')}
          ai={t('day.2.ai')}
          picture={
            <>
              <RoomPicture panel="writing" label={t('alt.evening')} />
              <ContextGauge label={t('art.full')} state="full" />
            </>
          }
          chat={<p className="text-caption font-semibold">{t('day.2.chat')}</p>}
          coding={<p className="font-semibold">{t.rich('day.2.coding')}</p>}
        />
        <DayPanel
          n={4}
          step={t('day.3.step')}
          time={t('day.3.time')}
          ai={t('day.3.ai')}
          picture={
            <>
              <RoomPicture panel="next-morning" label={t('alt.nextMorning')} greeting={t('day.3.greeting')} />
              <ContextGauge label={t('art.empty')} state="empty" />
            </>
          }
          coding={<p className="text-muted-foreground">{t.rich('day.3.coding')}</p>}
        />
      </ol>
      <div className="grid items-start gap-4 @5xl:grid-cols-4">
        <NotesLane
          heading={t('notesLane.heading')}
          story={t('notesLane.story')}
          chat={t('notesLane.text')}
          coding={t.rich('notesLane.coding', { marker: marker('googles-route') })}
          tip={t('tip')}
          logbook={{
            label: t('alt.logbook'),
            pages: [t('logbook.first'), t('logbook.second'), t('logbook.third')],
          }}
          targetProps={target('notes-lane')}
        />
        <div className="flex flex-col items-center gap-1 @5xl:col-start-3">
          <span aria-hidden className={cn(styles.arrow, 'text-heading text-foreground')}>
            ↓
          </span>
          <SkillCard
            label={t('skill.label')}
            title={t('skill.title')}
            steps={[
              { text: t('skill.steps.hold.text'), why: t('skill.steps.hold.why') },
              { text: t('skill.steps.lower.text') },
              { text: t('skill.steps.label.text'), why: t('skill.steps.label.why') },
            ]}
            failedIf={t('skill.failedIf')}
            file={[
              '---',
              `name: ${SKILL_NAME}`,
              `description: ${t('skill.file.description')}`,
              '---',
              t('skill.file.hold'),
              t('skill.file.holdWhy'),
              t('skill.file.lower'),
              t('skill.file.label'),
              t('skill.file.failedIf'),
            ]}
          />
        </div>
      </div>
      <p data-first-step className="flex items-center gap-3 text-body font-semibold">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          1
        </span>
        {t('firstStep')}
      </p>
      <p className="max-w-md border-t border-border pt-4 text-caption text-muted-foreground">
        <span className="font-semibold text-foreground">{t('story.label')}</span> {t('story.analogy')}
      </p>
    </SlideFrame>
  ),
});
