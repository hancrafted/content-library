import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { ContextMiniBars } from '@/components/slide-shared/context/context';
import type { ReactNode } from 'react';
import styles from './everyday-habits.module.css';
import { HabitList } from './habit-list';
import { HandoffCard } from './handoff-card';
import { HandoffMotion } from './handoff-motion.client';
import de from './i18n/de.json';
import en from './i18n/en.json';

const CONTEXT_LENGTH = { slug: 'du-context-length-alone-hurts', url: 'https://arxiv.org/abs/2510.05381' };
const CONTEXT_ROT = { slug: 'hong-context-rot', url: 'https://www.trychroma.com/research/context-rot' };

/** The three habits in order, each with the target its Speaker note lights and the note its Context marker opens. */
const HABITS = [
  { key: '1', target: 'habit-one-chat', note: 'one-job-per-chat' },
  { key: '2', target: 'habit-handoff', note: 'a-short-recap-helped' },
  { key: '3', target: 'habit-next-chat', note: 'length-itself-hurts' },
] as const;

/** One chat's bar under its name: the cornerstone's static mini bar, its numbers from the shared Preset. */
function ChatBar({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex w-56 max-w-full flex-col items-center gap-3 md:items-start">
      <p className="text-body font-semibold">{name}</p>
      {children}
    </div>
  );
}

/** The arrow from the handoff card into the fresh chat: down when the chats stack, right beside each other. */
function Arrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-caption text-primary">
      <svg viewBox="0 0 120 24" className="h-6 w-28 rotate-90 md:rotate-0" aria-hidden="true">
        <path d="M2 12 H108" className="fill-none stroke-primary" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M100 4 L114 12 L100 20"
          className="fill-none stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-center font-medium">{label}</span>
    </div>
  );
}

/**
 * Everyday habits (Spec Option 10a): the old summer-party chat and a fresh one as the cornerstone's mini bars side by
 * side, the handoff card crossing between them into the fresh chat's first message, the two habits the viewer knows
 * as chips above and the three new ones as cards below. The card lights between the bars on the Slide's first
 * `active` and on every mouse enter and keyboard focus.
 */
export const everydayHabits = slide({
  slug: 'everyday-habits',
  messages: { en, de },
  notes: [
    { slug: 'length-itself-hurts', target: 'habit-next-chat', sources: [CONTEXT_LENGTH] },
    { slug: 'one-job-per-chat', target: 'habit-one-chat', sources: [CONTEXT_ROT] },
    { slug: 'a-short-recap-helped', target: 'habit-handoff', sources: [CONTEXT_LENGTH] },
  ],
  segments: [
    { slug: 'break-it-down' },
    { slug: 'fresh-start' },
    { slug: 'one-chat-one-job' },
    { slug: 'ask-for-a-handoff' },
    { slug: 'read-and-correct-it' },
    { slug: 'start-the-next-chat-with-it' },
  ],
  content: ({ t, locale, target, Marker }) => (
    <SlideFrame className="mt-10 gap-8">
      <p className="flex flex-wrap items-center gap-2 text-caption">
        <span className="text-muted-foreground">{t('known.label')}</span>
        <span className="rounded-full bg-muted px-3 py-1 font-medium">{t('known.breakItDown')}</span>
        <span className="rounded-full bg-muted px-3 py-1 font-medium">{t('known.freshStart')}</span>
      </p>
      <HandoffMotion
        label={t('barsLabel')}
        className={`${styles.bars} flex flex-col items-center justify-around gap-6 rounded-xl bg-card p-6 shadow-md md:flex-row md:p-8`}
        before={
          <ChatBar name={t('oldChat')}>
            <ContextMiniBars preset="slide-10-old" locale={locale} />
          </ChatBar>
        }
        card={
          <div className="flex flex-col items-center gap-4">
            <HandoffCard
              title={t('handoff.title')}
              text={t.rich('handoff.text', {
                budget: (chunks: ReactNode) => (
                  <span data-budget className="rounded bg-(--warning)/25 px-1 whitespace-nowrap">
                    {chunks}
                  </span>
                ),
              })}
            />
            <Arrow label={t('handoff.arrow')} />
          </div>
        }
        after={
          <ChatBar name={t('freshChat')}>
            <ContextMiniBars preset="slide-10-fresh" locale={locale} />
          </ChatBar>
        }
      />
      <HabitList
        label={t('habitsLabel')}
        habits={HABITS.map(({ key, target: name, note }) => ({
          title: t(`habits.${key}.title`),
          body: t(`habits.${key}.body`),
          marker: <Marker note={note} placement="beside" />,
          target: target(name),
        }))}
      />
      <p className="text-caption text-pretty text-muted-foreground">{t('illustrative')}</p>
    </SlideFrame>
  ),
});
