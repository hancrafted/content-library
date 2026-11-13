import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import { at, ControlRoomArt, PULLED, TASK, wide } from './control-room-art';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { IndexBoard, SLUGS, SyntaxRow, WayLabel } from './parts';
import styles from './slide.module.css';

const CLAUDE_SKILLS = { slug: 'anthropic-claude-code-skills', url: 'https://code.claude.com/docs/en/skills' };
const CODEX = { slug: 'openai-codex-build-skills', url: 'https://learn.chatgpt.com/docs/build-skills' };
const OPENAI_ACADEMY = {
  slug: 'openai-academy-skills',
  url: 'https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills',
};
const COPILOT_SKILLS = {
  slug: 'github-copilot-cli-skills',
  url: 'https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills',
};
const GEMINI_WORKFLOWS = {
  slug: 'google-gemini-apps-workflows',
  url: 'https://support.google.com/gemini/answer/17094507?hl=en',
};
const GEMS_TO_SKILLS = {
  slug: 'google-gems-to-skills',
  url: 'https://support.google.com/gemini/answer/18560919?hl=en',
};
const GEMINI_CLI = {
  slug: 'google-gemini-cli-skills',
  url: 'https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md',
};
const VERCEL = {
  slug: 'vercel-agents-md-vs-skills',
  url: 'https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals',
};
const DAY_3 = { slug: 'google-day-3-agent-skills', url: 'https://www.kaggle.com/whitepaper-agent-skills' };

/** The three skills of the index, by folder name: code, never translated. */
const ENTRY_KEYS = ['0', '1', '2'] as const;
const CALL = `/${SLUGS[0]}`;
const MENTION = `@${SLUGS[0]}`;

/**
 * "Two ways to call a skill" (Spec Option 7a): one drawing split by a bulkhead carries both halves, called by name on
 * the left and picked from its description on the right, and two cards below keep the 1×2 grid; the 56% figure sits in
 * the right card it measures. Overrules `grid-1x2` for the Scene; keeps `motion: local`, the highlight landing on the
 * index line before the scan line draws.
 */
export const twoWaysToCallASkill = slide({
  slug: 'two-ways-to-call-a-skill',
  messages: { en, de },
  presentation: atDepth(1, 'page'),
  notes: [
    {
      slug: 'calling-a-skill-by-name-differs-by-app',
      target: 'by-name',
      sources: [CLAUDE_SKILLS, CODEX, OPENAI_ACADEMY, COPILOT_SKILLS, GEMINI_WORKFLOWS, GEMS_TO_SKILLS],
    },
    { slug: 'the-model-picks-a-skill-by-its-description', target: 'by-description', sources: [GEMINI_CLI] },
    { slug: 'skills-left-unused-what-the-56-measures', target: 'stat', sources: [VERCEL] },
    {
      slug: 'unused-skills-in-googles-day-3-two-misreadings-of-vercel',
      target: 'stat-scope',
      sources: [DAY_3, VERCEL],
    },
  ],
  segments: [{ slug: 'by-name' }, { slug: 'by-description' }, { slug: 'unused-is-real' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className={cn(styles.scene, '@container mt-6 flex flex-col gap-6')}>
      <ZoneScene
        zone="surface"
        iceberg="none"
        label={t('alt.room')}
        className="aspect-[2/1] w-full rounded-2xl shadow-md"
        overlay={
          <div className="hidden @3xl:contents">
            <WayLabel x={30} y={215}>
              {t('byName.title')} · {t('byName.who')}
            </WayLabel>
            <WayLabel x={630} y={215}>
              {t('byDescription.title')} · {t('byDescription.who')}
            </WayLabel>
            <p
              data-speech-bubble
              style={{ ...at(120, 260), width: wide(260) }}
              className="absolute rounded-xl bg-card px-3 py-2 text-caption font-semibold text-card-foreground shadow-md"
            >
              <InView view="chat">{t('art.say')}</InView>
              <InView view="coding" className="font-mono">
                &gt; {CALL}
              </InView>
            </p>
            <p
              style={{ ...at(PULLED.x + 10, PULLED.y + 14), width: wide(PULLED.width - 20) }}
              className="absolute flex -rotate-3 flex-col text-caption leading-tight text-foreground"
            >
              <InView view="chat" className="font-semibold">
                {t('index.entries.0.name')}
              </InView>
              <InView view="coding" className="font-mono font-semibold">
                {SLUGS[0]}
              </InView>
              <span className="text-muted-foreground">{t('art.openedByName')}</span>
            </p>
            <p
              style={{ ...at(TASK.x, TASK.y), width: wide(200) }}
              className="absolute rounded-xl bg-card px-3 py-2 text-caption text-card-foreground shadow-md"
            >
              <span className="block text-muted-foreground">{t('art.taskLabel')}</span>
              <span className="font-semibold">{t('art.task')}</span>
            </p>
            <IndexBoard
              title={t('index.title')}
              subtitle={t('index.subtitle')}
              coding={t('index.coding')}
              entries={ENTRY_KEYS.map((key, index) => ({
                slug: SLUGS[index],
                name: t(`index.entries.${key}.name`),
                useWhen: t(`index.entries.${key}.useWhen`),
              }))}
            />
            <span style={at(150, 735)} className="absolute -translate-x-1/2 text-caption font-semibold text-foreground">
              {t('art.you')}
            </span>
            <span style={at(250, 735)} className="absolute -translate-x-1/2 text-caption font-semibold text-foreground">
              {t('art.model')}
            </span>
            <span style={at(632, 735)} className="absolute -translate-x-1/2 text-caption font-semibold text-foreground">
              {t('art.model')}
            </span>
          </div>
        }
      >
        <ControlRoomArt />
      </ZoneScene>
      <div aria-label={t('cardsLabel')} role="group" className="grid items-start gap-4 @3xl:grid-cols-2">
        <section
          {...target('by-name')}
          className="card-hover card-hover--raise flex flex-col gap-3 rounded-xl bg-card p-5 text-card-foreground shadow-md"
        >
          <p className="flex items-center gap-1 text-body font-semibold">
            {t('byName.title')}
            <Marker note="calling-a-skill-by-name-differs-by-app" placement="beside" />
          </p>
          <p className="text-body">{t('byName.text')}</p>
          <InView view="chat" as="div" className="flex flex-col gap-2 text-caption">
            <p className="text-muted-foreground">{t('byName.chatLead')}</p>
            <ul className="flex flex-col gap-1">
              <SyntaxRow app="Claude" syntax={t('byName.claude')} />
              <SyntaxRow app="ChatGPT" syntax={MENTION} />
              <SyntaxRow app="Gemini app" syntax={MENTION} />
            </ul>
          </InView>
          <InView view="coding" as="div" className="flex flex-col gap-2 text-caption">
            <p className="text-muted-foreground">{t('byName.codingLead')}</p>
            <ul className="flex flex-col gap-1">
              <SyntaxRow app="Claude Code" syntax={CALL} />
              <SyntaxRow app="Copilot CLI" syntax={CALL} />
              <SyntaxRow app="Codex" syntax={`$${SLUGS[0]}`} />
            </ul>
            <p className="text-right font-mono text-muted-foreground">{t('byName.skillsMenu')}</p>
          </InView>
        </section>
        <section
          {...target('by-description')}
          className="card-hover card-hover--raise flex flex-col gap-3 rounded-xl bg-card p-5 text-card-foreground shadow-md ring-2 ring-foreground"
        >
          <p className="flex items-center gap-1 text-body font-semibold">
            {t('byDescription.title')}
            <Marker note="the-model-picks-a-skill-by-its-description" placement="beside" />
          </p>
          <p className="text-body">{t('byDescription.text')}</p>
          <InView view="chat" as="p" className="text-caption text-muted-foreground">
            {t('byDescription.chatLead')}
          </InView>
          <InView view="coding" as="div" className="flex flex-col gap-2 text-caption">
            <p className="text-muted-foreground">{t.rich('byDescription.codingTask')}</p>
            <ol className="flex flex-col gap-1 rounded-md bg-foreground p-3 font-mono text-background">
              {ENTRY_KEYS.map((key, index) => (
                <li key={key} className={cn(index === 0 ? 'font-semibold' : 'opacity-60')}>
                  {SLUGS[index]}/SKILL.md
                  <br />
                  description: {t(`index.entries.${key}.useWhen`)}
                </li>
              ))}
            </ol>
          </InView>
          <div {...target('stat')} className="flex flex-col gap-2 rounded-lg bg-muted p-4">
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-subheading font-semibold">{t('stat.figure')}</span>
              <span className="text-caption text-muted-foreground">{t('stat.text')}</span>
              <Marker note="skills-left-unused-what-the-56-measures" placement="beside" />
            </p>
            <InView view="chat" as="p" className="text-caption text-muted-foreground">
              {t('stat.chatScope')}
            </InView>
            <InView view="coding" as="p" className="flex items-start gap-1 text-caption text-muted-foreground">
              <span {...target('stat-scope')}>{t('stat.codingScope')}</span>
              <Marker note="unused-skills-in-googles-day-3-two-misreadings-of-vercel" placement="beside" />
            </InView>
          </div>
        </section>
      </div>
      <footer className="flex flex-col gap-2 border-t pt-4 text-caption text-muted-foreground @3xl:flex-row @3xl:justify-between">
        <p>
          <span className="font-semibold text-foreground">{t('analogy.label')}</span> {t('analogy.text')}
        </p>
        <p className="flex items-center gap-1">
          <InView view="chat">{t('footer.chat')}</InView>
          <InView view="chat">
            <Marker note="calling-a-skill-by-name-differs-by-app" placement="beside" />
          </InView>
          <InView view="coding">{t('footer.coding')}</InView>
          <InView view="coding">
            <Marker note="the-model-picks-a-skill-by-its-description" placement="beside" />
          </InView>
        </p>
      </footer>
    </SlideFrame>
  ),
});
