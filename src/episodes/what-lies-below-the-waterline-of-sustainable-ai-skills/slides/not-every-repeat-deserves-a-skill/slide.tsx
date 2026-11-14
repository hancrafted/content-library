import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';
import { ConsoleCorner } from './console-corner';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './slide.module.css';

const KNUTH = { slug: 'knuth-structured-programming', url: 'https://dl.acm.org/doi/10.1145/356635.356640' };
const JEFFRIES = { slug: 'jeffries-yagni', url: 'https://ronjeffries.com/xprog/articles/practices/pracnotneed/' };
const FOWLER_YAGNI = { slug: 'fowler-yagni', url: 'https://martinfowler.com/bliki/Yagni.html' };
const CLAUDE_CODE_SKILLS = { slug: 'anthropic-claude-code-skills', url: 'https://code.claude.com/docs/en/skills' };
const CODEX_SKILLS = { slug: 'openai-codex-build-skills', url: 'https://learn.chatgpt.com/docs/build-skills' };

/**
 * The skill index, in the order it grew: the entry you need is the seventh, buried. The coding names are folder names,
 * code, not translated; `collect-sediment-sample` is the name Slide 3 gives the skill.
 */
const ENTRIES = [
  { key: 'rinseCameraDome', name: 'rinse-camera-dome', tilt: 'rotate-2', untested: true },
  { key: 'sampleOld', name: 'sample-old' },
  { key: 'takeSampleV2', name: 'take-sample-v2', tilt: 'rotate-1', untested: true },
  { key: 'namePhotoFolders', name: 'name-photo-folders' },
  { key: 'sedimentQuick', name: 'sediment-quick' },
  { key: 'sampleLikeAna', name: 'sample-like-ana' },
  { key: 'collectSedimentSample', name: 'collect-sediment-sample', needed: true },
  { key: 'sampleButFaster', name: 'sample-but-faster', tilt: '-rotate-2', untested: true },
  { key: 'tuesdayWeatherNote', name: 'tuesday-weather-note' },
  { key: 'cleanArmMaybe', name: 'clean-arm-maybe', tilt: '-rotate-1', untested: true },
  { key: 'collectSedimentSampleCopy', name: 'collect-sediment-sample-copy' },
  { key: 'logDepthDraft', name: 'log-depth-draft', tilt: '-rotate-1', untested: true },
  { key: 'crewCoffeeOrder', name: 'crew-coffee-order' },
  { key: 'checkWinchAgain', name: 'check-winch-again' },
  { key: 'sampleV3', name: 'sample-v3', tilt: 'rotate-1', untested: true },
  { key: 'labelCoresAlt', name: 'label-cores-alt' },
  { key: 'diveLogShort', name: 'dive-log-short' },
] as const;

const QUESTIONS = ['repeat', 'rules', 'cost'] as const;

/** An empty check box drawn before each question. */
const Box = () => <span aria-hidden className="size-5 shrink-0 rounded-sm border-2 border-foreground" />;

/**
 * "Not every repeat deserves a skill" (picked Option 9a): the pilot at his console beside a binder bursting with thin
 * cards, the skill index spilling off the stage with several entries stamped "never tested" and the one you need
 * buried seventh, and beside it the three-question check. `master: grid-1x2` is overruled for a Scene from
 * `SlideFrame`, as the Option says, so the index can run off the stage; `motion: local` keeps the index growing line
 * by line. In the Coding agent view the lines become folder names and the verdict a SKILL.md you do not write.
 */
export const notEveryRepeatDeservesASkill = slide({
  slug: 'not-every-repeat-deserves-a-skill',
  messages: { en, de },
  presentation: atDepth(2, 'page'),
  notes: [
    { slug: 'skills-written-too-early', target: 'callout', sources: [KNUTH] },
    { slug: 'skills-nobody-needs-yet', target: 'callout', sources: [JEFFRIES, FOWLER_YAGNI] },
    { slug: 'a-crowded-skill-index', target: 'price', sources: [CLAUDE_CODE_SKILLS, CODEX_SKILLS] },
  ],
  segments: [{ slug: 'too-early' }, { slug: 'a-thin-card-has-a-price' }, { slug: 'three-questions' }],
  content: ({ t, marker, target }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div
        data-stage
        className="focus-group focus-group--dim-others grid items-start gap-6 overflow-hidden rounded-2xl bg-card/40 p-4 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)] @3xl:p-6"
      >
        <div className="self-end">
          <ConsoleCorner label={t('alt.scene')} />
        </div>
        <ZoneCard
          data-index
          style={{ '--entries': ENTRIES.length } as CSSProperties}
          className={cn(
            styles.index,
            styles.sheet,
            'focus-group__item -mb-6 max-h-[34rem] rounded-t-lg px-4 pt-4 shadow-md',
          )}
        >
          <p className="flex items-end justify-between gap-2 border-b-2 border-foreground px-2 pb-1 text-caption">
            <InView view="chat" className="font-semibold">
              {t('index.heading.chat')}
            </InView>
            <InView view="coding" className="font-semibold">
              {t.rich('index.heading.coding')}
            </InView>
            <InView view="chat" className="text-muted-foreground">
              {t('index.count.chat')}
            </InView>
            <InView view="coding" className="text-muted-foreground">
              {t('index.count.coding')}
            </InView>
          </p>
          <ol className="flex flex-col">
            {ENTRIES.map((entry, line) => {
              const needed = 'needed' in entry;
              return (
                <li
                  key={entry.key}
                  data-entry={entry.name}
                  data-needed={needed ? '' : undefined}
                  data-motion="grow"
                  style={{ '--line': line } as CSSProperties}
                  className={cn(
                    'flex min-h-7 items-center justify-between gap-2 px-2 text-caption',
                    needed
                      ? cn(styles.needed, 'rounded-md bg-primary font-semibold text-primary-foreground')
                      : cn(styles.entry, 'border-b border-border'),
                  )}
                >
                  <InView view="chat" className="truncate">
                    {t(`index.entries.${entry.key}.label`)}
                  </InView>
                  <InView view="coding" className="truncate font-mono">
                    {entry.name}
                  </InView>
                  {needed && (
                    <span className="shrink-0 rounded-full border border-primary-foreground px-2">{t('needed')}</span>
                  )}
                  {'untested' in entry && (
                    <span
                      data-stamp
                      className={cn(
                        styles.stamp,
                        entry.tilt,
                        'shrink-0 rounded-sm border-2 border-destructive px-1.5 font-semibold text-destructive opacity-50',
                      )}
                    >
                      {t('stamp')}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </ZoneCard>
        <ZoneCard data-check className="focus-group__item card-hover card-hover--raise rounded-lg p-5 shadow-md">
          <p className="text-body font-semibold text-primary">{t('check.heading')}</p>
          <ol className="mt-4 flex flex-col gap-3 text-body">
            {QUESTIONS.map((question) => (
              <li key={question} data-question className="flex items-center gap-3">
                <Box />
                <span>{t.rich(`check.${question}`)}</span>
              </li>
            ))}
          </ol>
          <InView view="chat" as="p" className="mt-5 border-t border-border pt-3 text-body">
            {t('check.verdict.chat')}
          </InView>
          <InView view="coding" as="p" className="mt-5 border-t border-border pt-3 text-body">
            {t.rich('check.verdict.coding')}
          </InView>
          <p className="mt-2 text-caption text-muted-foreground">{t('check.disclaimer')}</p>
          <p className="mt-2 text-caption text-muted-foreground opacity-60">{t('check.after')}</p>
          <p {...target('price')} className="mt-4 border-t border-border pt-3 text-caption">
            <span className="font-semibold">{t('price.title')}</span>{' '}
            <span className="text-muted-foreground">
              {t.rich('price.body', { marker: marker('a-crowded-skill-index') })}
            </span>
          </p>
        </ZoneCard>
      </div>
      <div className="grid items-start gap-6 border-t border-border pt-4 @3xl:grid-cols-12">
        <p className="text-caption text-muted-foreground @3xl:col-span-4">
          <span className="font-semibold text-foreground">{t('story.label')}</span> {t('story.analogy')}
        </p>
        <aside
          {...target('callout')}
          className="flex items-start gap-3 rounded-lg bg-muted px-4 py-3 text-muted-foreground @3xl:col-span-8"
        >
          <span className="shrink-0 rounded-full border border-border px-2 py-1 text-caption font-medium whitespace-nowrap">
            {t('didYouKnow.label')}
          </span>
          <p className="text-caption">
            {t.rich('didYouKnow.yagni', { marker: marker('skills-nobody-needs-yet') })}{' '}
            {t.rich('didYouKnow.knuth', { marker: marker('skills-written-too-early') })}
          </p>
        </aside>
      </div>
    </SlideFrame>
  ),
});
