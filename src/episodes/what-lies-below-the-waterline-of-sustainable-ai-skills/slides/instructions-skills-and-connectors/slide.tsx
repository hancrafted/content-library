import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { localizePath, stripLocale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import { at, ControlRoomArt, PILLS, THINGS, ThingTile, type Thing } from './control-room-art';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './slide.module.css';

const CLAUDE_FEATURES = {
  slug: 'anthropic-claude-code-features',
  url: 'https://code.claude.com/docs/en/features-overview',
};
const COPILOT_SKILLS = {
  slug: 'github-copilot-cli-skills',
  url: 'https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills',
};
const PERSONALIZATION = {
  slug: 'anthropic-personalization-features',
  url: 'https://support.claude.com/en/articles/10185728-understanding-claude-s-personalization-features',
};
const OPENAI_ACADEMY = {
  slug: 'openai-academy-skills',
  url: 'https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills',
};
const GEMINI_WORKFLOWS = {
  slug: 'google-gemini-apps-workflows',
  url: 'https://support.google.com/gemini/answer/17094507?hl=en',
};
const COPILOT_MCP = { slug: 'github-copilot-mcp', url: 'https://docs.github.com/en/copilot/concepts/context/mcp' };
const DAY_3 = { slug: 'google-day-3-agent-skills', url: 'https://www.kaggle.com/whitepaper-agent-skills' };
const DAY_1 = { slug: 'google-day-1-new-sdlc', url: 'https://www.kaggle.com/whitepaper-the-new-SDLC-with-vibe-coding' };

/** Each thing's file in the Coding agent view; paths are code and stay untranslated. */
const PATHS: Readonly<Record<Thing, string | undefined>> = {
  personal: '~/.claude/CLAUDE.md',
  project: 'AGENTS.md',
  skills: 'collect-sediment-sample/SKILL.md',
  connectors: undefined,
};
const KIND: Readonly<Record<Thing, 'static' | 'dynamic'>> = {
  personal: 'static',
  project: 'static',
  skills: 'dynamic',
  connectors: 'dynamic',
};
type NoteSlug =
  | 'instructions-are-always-loaded-skills-are-not'
  | 'skill-vs-agents-md-as-google-puts-it'
  | 'connectors-reach-skills-know-how';
const MARKED: Readonly<Partial<Record<Thing, NoteSlug>>> = {
  personal: 'instructions-are-always-loaded-skills-are-not',
  project: 'skill-vs-agents-md-as-google-puts-it',
  connectors: 'connectors-reach-skills-know-how',
};

/** A Slide link (`slideHref`) taken apart into its logical path and anchor, so the `href` goes through `localizePath`. */
function partsOf(link: string) {
  const [path = '', anchor] = link.split('#');
  return { path: stripLocale(path), anchor };
}

/**
 * "Instructions, skills and connectors" (Spec Option 6a): the control room as one picture, its four things numbered
 * where they stand, then one row per thing, its cartoon panel on the left and on the right its AI label, its static or
 * dynamic tag linking back to the Slide on dynamic context, and what it does (or, in the Coding agent view, its file).
 * Overrules `three-column`; keeps `motion: none`. Skills carries the focus.
 */
export const instructionsSkillsAndConnectors = slide({
  slug: 'instructions-skills-and-connectors',
  messages: { en, de },
  presentation: atDepth(1, 'page'),
  captionNote: 'instructions-are-always-loaded-skills-are-not',
  notes: [
    {
      slug: 'instructions-are-always-loaded-skills-are-not',
      target: 'thing-personal',
      sources: [CLAUDE_FEATURES, COPILOT_SKILLS],
    },
    {
      slug: 'names-in-chat-apps',
      target: 'footer',
      sources: [PERSONALIZATION, OPENAI_ACADEMY, GEMINI_WORKFLOWS],
    },
    { slug: 'connectors-reach-skills-know-how', target: 'thing-connectors', sources: [COPILOT_MCP, CLAUDE_FEATURES] },
    { slug: 'skill-vs-agents-md-as-google-puts-it', target: 'thing-project', sources: [DAY_3, DAY_1] },
  ],
  segments: [{ slug: 'four-things-in-the-room' }, { slug: 'read-the-tags' }, { slug: 'your-words-may-differ' }],
  content: ({ t, target, Marker, slideHref, locale }) => {
    const dynamicContext = partsOf(slideHref('skills-are-dynamic-context'));
    const targets: Readonly<Record<Thing, { 'data-target': string } | undefined>> = {
      personal: target('thing-personal'),
      project: target('thing-project'),
      skills: undefined,
      connectors: target('thing-connectors'),
    };
    const marker = (thing: Thing): ReactNode => {
      const note = MARKED[thing];
      return note === undefined ? null : <Marker note={note} placement="beside" />;
    };
    return (
      <SlideFrame className={cn(styles.scene, '@container mt-6 flex flex-col gap-6')}>
        <ZoneScene
          zone="surface"
          iceberg="none"
          label={t('alt.room')}
          className="aspect-[2/1] w-full rounded-2xl shadow-md"
          overlay={
            <>
              <p
                style={at(425, 262)}
                className="absolute hidden -translate-x-1/2 text-caption font-semibold text-foreground @2xl:block"
              >
                {t('art.brief')}
              </p>
              <p
                style={at(1095, 214)}
                className="absolute hidden -translate-x-1/2 text-caption font-semibold text-foreground @2xl:block"
              >
                {t('art.labDatabase')}
              </p>
              <p
                style={at(1140, 740)}
                className="absolute hidden -translate-x-1/2 text-caption font-semibold text-foreground @2xl:block"
              >
                {t('art.sonar')}
              </p>
              {THINGS.map((thing, index) => (
                <span
                  key={thing}
                  data-thing-pill={thing}
                  style={at(PILLS[thing].x, PILLS[thing].y)}
                  className={cn(
                    'absolute hidden -translate-x-1/2 rounded-full px-3 py-0.5 text-caption font-semibold whitespace-nowrap shadow-md @2xl:block',
                    thing === 'skills' ? 'bg-foreground text-background' : 'bg-card text-card-foreground',
                  )}
                >
                  {index + 1} · <InView view="chat">{t(`things.${thing}.term`)}</InView>
                  <InView view="coding" className="font-mono">
                    {PATHS[thing] ?? t('things.connectors.coding.path')}
                  </InView>
                </span>
              ))}
            </>
          }
        >
          <ControlRoomArt />
        </ZoneScene>
        <ol aria-label={t('listLabel')} className="focus-group--dim-others flex flex-col gap-4">
          {THINGS.map((thing, index) => {
            const focal = thing === 'skills';
            return (
              <li
                key={thing}
                {...targets[thing]}
                data-thing={thing}
                className={cn(
                  'focus-group__item card-hover card-hover--raise grid gap-4 rounded-xl bg-card p-4 text-card-foreground shadow-md @3xl:grid-cols-2',
                  focal && 'ring-2 ring-primary',
                )}
              >
                <div className="relative">
                  <ThingTile thing={thing} label={t(`things.${thing}.alt`)} />
                  <span className="absolute top-2 left-2 rounded-full bg-card px-3 text-body font-semibold text-card-foreground">
                    {t(`things.${thing}.panel`)}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="flex items-center gap-2 text-body font-semibold">
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full text-caption',
                        focal ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background',
                      )}
                    >
                      {index + 1}
                    </span>
                    {t(`things.${thing}.term`)}
                    {marker(thing)}
                  </p>
                  <a
                    data-load-tag={KIND[thing]}
                    href={localizePath(dynamicContext.path, locale, dynamicContext.anchor)}
                    className={cn(
                      'w-fit rounded-full border px-2 text-caption font-semibold underline-offset-2 hover:underline',
                      KIND[thing] === 'dynamic' && 'border-foreground bg-foreground text-background',
                    )}
                  >
                    {t(`tags.${KIND[thing]}`)}
                  </a>
                  <InView view="chat" as="div" className="flex flex-col gap-1">
                    <p className="text-body">{t(`things.${thing}.scope`)}</p>
                    <p className="text-caption text-muted-foreground">{t(`things.${thing}.scene`)}</p>
                  </InView>
                  <InView view="coding" as="div" className="flex flex-col gap-1">
                    <p className="font-mono text-body font-semibold break-all">
                      {PATHS[thing] ?? t('things.connectors.coding.path')}
                    </p>
                    <p className="text-caption text-muted-foreground">{t(`things.${thing}.coding.lead`)}</p>
                    <p className="rounded-md bg-foreground px-3 py-2 font-mono text-caption whitespace-pre-wrap text-background">
                      {t(`things.${thing}.coding.code`)}
                    </p>
                  </InView>
                </div>
              </li>
            );
          })}
        </ol>
        <footer className="flex flex-col gap-2 border-t pt-4 text-caption text-muted-foreground @3xl:flex-row @3xl:justify-between">
          <p>
            <span className="font-semibold text-foreground">{t('analogy.label')}</span> {t('analogy.text')}
          </p>
          <p {...target('footer')} className="flex items-center gap-1">
            <InView view="chat">{t('footer.chat')}</InView>
            <InView view="chat">
              <Marker note="names-in-chat-apps" placement="beside" />
            </InView>
            <InView view="coding">{t('footer.coding')}</InView>
            <InView view="coding">
              <Marker note="skill-vs-agents-md-as-google-puts-it" placement="beside" />
            </InView>
          </p>
        </footer>
      </SlideFrame>
    );
  },
});
