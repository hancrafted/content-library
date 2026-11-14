import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { AgentTerminal, SkillFile } from './agent-terminal';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MorningScene, type Day } from './morning-scene';
import { DraftCard, EmptyCard, WrittenCard } from './procedure-card';
import styles from './slide.module.css';

const FOWLER = {
  slug: 'fowler-refactoring-slides',
  url: 'https://pdfs.semanticscholar.org/2f09/a866bc7cb521227dc5ab2c4092096077c1ac.pdf',
};
const PROMPTING = {
  slug: 'anthropic-prompting-best-practices',
  url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
};
const SKILLS_ENGINEERING = {
  slug: 'anthropic-equipping-agents-with-skills',
  url: 'https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills',
};
const MEMORY = { slug: 'anthropic-claude-memory', url: 'https://code.claude.com/docs/en/memory' };
const GPT_41 = {
  slug: 'openai-gpt-4-1-prompting-guide',
  url: 'https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide',
};
const SYCOPHANCY = { slug: 'sharma-sycophancy', url: 'https://arxiv.org/abs/2310.13548' };

/** The skill's name, as Slide 3 gives it: code, not translated. */
const SKILL_NAME = 'collect-sediment-sample';
const PANELS = ['first', 'second', 'third'] as const;
const STEPS = ['hold', 'camera', 'lower', 'identify', 'seal', 'label'] as const;

interface PanelProps {
  readonly heading: string;
  readonly focal?: boolean;
  readonly chatPicture: ReactNode;
  readonly codingPicture: ReactNode;
  readonly chip: string;
  readonly chat: ReactNode;
  readonly coding: ReactNode;
}

/** One comic panel: its AI head, the morning's picture, and the card row; the view switch swaps words, never the art. */
function ComicPanel({ heading, focal, chatPicture, codingPicture, chip, chat, coding }: PanelProps) {
  return (
    <li
      data-panel
      data-focal={focal ? '' : undefined}
      className={cn(
        'focus-group__item flex min-w-0 flex-col overflow-hidden rounded-lg border-2 bg-muted @2xl:grid @2xl:grid-cols-2 @5xl:flex',
        focal ? cn(styles.fill, 'border-primary') : 'border-foreground',
      )}
    >
      <p
        className={cn(
          'border-b-2 px-3 py-2 text-body font-semibold @2xl:col-span-2',
          focal
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-foreground bg-card text-card-foreground',
        )}
      >
        {heading}
      </p>
      <div className="relative">
        <InView view="chat" as="div">
          {chatPicture}
        </InView>
        <InView view="coding" as="div">
          {codingPicture}
          <p
            data-session-chip
            className="absolute bottom-3 left-3 rounded-full bg-foreground px-3 py-1 font-mono text-caption font-semibold text-background"
          >
            {chip}
          </p>
        </InView>
      </div>
      <InView view="chat" as="div" className="flex-1 p-4">
        {chat}
      </InView>
      <InView view="coding" as="div" className="flex-1 p-4">
        {coding}
      </InView>
    </li>
  );
}

/**
 * "The third time is the signal" (picked Option 8a): a callback to the first Slide's comic, three mornings in the
 * control room, each headed by what happens with the AI, the first Slide's empty card filling until the third panel
 * holds it written with its green good-result line. Keeps `master: grid-1x3` as three comic panels with a card row,
 * and `motion: local`, the one emphasis motion of the card filling line by line. In the Coding agent view the
 * speech gives way to a session chip and the cards to two sessions that start fresh and the new `SKILL.md`.
 */
export const theThirdTimeIsTheSignal = slide({
  slug: 'the-third-time-is-the-signal',
  messages: { en, de },
  presentation: atDepth(2, 'page'),
  captionNote: 'the-model-as-a-new-employee',
  notes: [
    { slug: 'when-to-write-a-skill', target: 'fowler', sources: [FOWLER] },
    { slug: 'the-model-as-a-new-employee', target: 'comic', sources: [PROMPTING, SKILLS_ENGINEERING] },
    { slug: 'where-the-model-is-not-like-a-person', target: 'skill-file', sources: [MEMORY, GPT_41, SYCOPHANCY] },
  ],
  segments: [{ slug: 'three-tries' }, { slug: 'not-only-repetition' }, { slug: 'did-you-know' }],
  content: ({ t, marker, target }) => {
    const kind = t('card.kind');
    const picture = (panel: (typeof PANELS)[number], day: Day, speech: boolean) => (
      <MorningScene
        day={day}
        label={t(`panels.${panel}.alt`)}
        says={speech ? { captain: t(`panels.${panel}.captainLine`), pilot: t(`panels.${panel}.pilotLine`) } : undefined}
      />
    );
    const terminal = (session: 'first' | 'second') => (
      <AgentTerminal
        title={t(`terminal.${session}.title`)}
        rows={[
          { who: 'you', text: t(`terminal.${session}.ask`) },
          { who: 'agent', text: t(`terminal.${session}.agent`) },
          { who: 'you', text: t(`terminal.${session}.answer`) },
        ]}
      />
    );
    const steps = STEPS.map((step) => t(`card.steps.${step}`));
    const cards: Record<(typeof PANELS)[number], { chat: ReactNode; coding: ReactNode }> = {
      first: {
        chat: (
          <EmptyCard
            label={{ state: t('card.emptyLabel'), kind }}
            fields={{ title: t('card.titleField'), useWhen: t('card.useWhenField') }}
            question={t('card.need')}
          />
        ),
        coding: terminal('first'),
      },
      second: {
        chat: (
          <DraftCard
            label={{ state: t('card.draftLabel'), kind }}
            title={t('card.title')}
            useWhen={t('card.useWhenField')}
            steps={[
              { text: t('card.draftSteps.hold') },
              { text: t('card.draftSteps.grab'), struck: true },
              { text: t.rich('card.draftSteps.lower') },
              { text: t('card.draftSteps.label') },
            ]}
            question={t('card.goodQuestion')}
          />
        ),
        coding: terminal('second'),
      },
      third: {
        chat: (
          <WrittenCard
            label={{ state: t('card.writtenLabel'), kind }}
            title={t('card.title')}
            useWhen={t.rich('card.useWhen')}
            steps={steps}
            goodResult={t('card.goodResult')}
          />
        ),
        coding: (
          <div {...target('skill-file')} className="h-full">
            <SkillFile
              path={`${SKILL_NAME}/SKILL.md`}
              badge={t('skillFile.newFile')}
              name={SKILL_NAME}
              description={t('skillFile.description')}
              body={steps}
              goodResult={t('card.goodResult')}
              footer={t.rich('skillFile.footer', {
                marker: marker('where-the-model-is-not-like-a-person', 'text-background'),
              })}
            />
          </div>
        ),
      },
    };
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <ol
          {...target('comic')}
          aria-label={t('comic')}
          className="focus-group focus-group--dim-others grid items-stretch gap-4 @5xl:grid-cols-3"
        >
          {PANELS.map((panel, index) => (
            <ComicPanel
              key={panel}
              heading={t(`panels.${panel}.heading`)}
              focal={panel === 'third'}
              chatPicture={picture(panel, (index + 1) as Day, true)}
              codingPicture={picture(panel, (index + 1) as Day, false)}
              chip={t(`panels.${panel}.sessionChip`)}
              chat={cards[panel].chat}
              coding={cards[panel].coding}
            />
          ))}
        </ol>
        <div className="grid items-start gap-6 @3xl:grid-cols-12">
          <p
            data-not-enough
            className="rounded-lg border-l-4 border-(--success) bg-card px-4 py-3 text-body text-card-foreground shadow-sm @3xl:col-span-7"
          >
            {t.rich('notEnough')}
          </p>
          <aside {...target('fowler')} className="flex items-start gap-3 py-3 @3xl:col-span-5">
            <span className="shrink-0 rounded-full border border-border px-2 py-1 text-caption font-medium whitespace-nowrap text-muted-foreground">
              {t('didYouKnow.label')}
            </span>
            <p className="text-caption text-muted-foreground">
              {t.rich('didYouKnow.text', { marker: marker('when-to-write-a-skill') })}
            </p>
          </aside>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-3 border-t border-border pt-4">
          <p className="max-w-md text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">{t('story.label')}</span> {t('story.analogy')}
          </p>
          <InView view="coding" as="p" className="max-w-md text-caption text-muted-foreground">
            {t.rich('agent.analogy', { marker: marker('where-the-model-is-not-like-a-person') })}
          </InView>
        </div>
      </SlideFrame>
    );
  },
});
