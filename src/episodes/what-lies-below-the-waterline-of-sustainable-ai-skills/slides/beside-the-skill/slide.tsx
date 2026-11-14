import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SiteDive } from './site-dive';
import { SkillWall } from './skill-wall';

const BEST_PRACTICES = {
  slug: 'agent-skills-best-practices',
  url: 'https://agentskills.io/skill-creation/best-practices',
};
const CLAUDE_SKILLS = { slug: 'claude-code-skills', url: 'https://code.claude.com/docs/en/skills' };
const NOTE = 'a-skill-teaches-the-class-of-problem';

/** Paths and variables are code: the same in every locale, never translated. */
const SKILL_PATH = 'collect-sediment-sample/SKILL.md';
const PROJECT_FILE = 'CONTEXT.md';
const PROJECT_DIR = '${CLAUDE_PROJECT_DIR}';
const SCHEMA = 'references/schema.yaml';

const STEPS = ['0', '1', '2', '3'] as const;
/** Step 2 points to the project file; Site 7 is today's row, level with it. */
const FOCAL_STEP = 1;
const SITES = [
  { site: 'site4', today: false },
  { site: 'site7', today: true },
] as const;
const SEABED_M = 120;
const GHOST_M = 40;
const TICKS = [40, 80, 120];

/**
 * "Beside the skill" (Spec Option 17a): the mistake of Slide 15, fixed. Keeps `grid-1x2`: on the left the skill's step
 * points to today's dive plan, a project file it reads when it runs; on the right the same skill at site 7 reaches
 * the seabed at 120 m. Keeps `motion: local`: the line draws to the Site 7 row, the row fills, the robot descends past
 * the dashed 40 m outline and the check appears.
 */
export const besideTheSkill = slide({
  slug: 'beside-the-skill',
  messages: { en, de },
  presentation: atDepth(5, 'page'),
  captionNote: NOTE,
  notes: [{ slug: NOTE, target: 'caption', sources: [BEST_PRACTICES, CLAUDE_SKILLS] }],
  segments: [{ slug: 'the-card-points' }, { slug: 'same-card-any-site' }, { slug: 'for-developers' }],
  content: ({ t, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div className="grid gap-8 @4xl:grid-cols-2">
        <section className="flex flex-col gap-3">
          <h4 className="text-body font-semibold">{t('wall.head')}</h4>
          <SkillWall
            skillTag={t('wall.skillTag')}
            fileTag={t('wall.fileTag')}
            pointsTo={t('wall.pointsTo')}
            card={{
              title: { chat: t('wall.card.title'), coding: SKILL_PATH },
              description: { chat: t('wall.card.description'), coding: t('wall.card.codingDescription') },
              steps: STEPS.map((step) => ({
                chat: t(`wall.card.steps.${step}`),
                coding: t(`wall.card.codingSteps.${step}`, { path: `${PROJECT_DIR}/${PROJECT_FILE}` }),
              })),
              focal: FOCAL_STEP,
            }}
            plan={{
              title: { chat: t('wall.plan.title'), coding: PROJECT_FILE },
              sub: t('wall.plan.sub'),
              rows: SITES.map(({ site, today }) => ({ site, today, label: t(`wall.plan.rows.${site}`) })),
              today: t('wall.plan.today'),
            }}
          />
          <InView view="chat" as="p" className="text-body">
            {t('wall.verdict')}
          </InView>
          <InView view="coding" as="p" className="flex items-start gap-1 text-body">
            <span>{t.rich('wall.codingVerdict', { file: PROJECT_FILE, variable: PROJECT_DIR })}</span>
            <Marker note={NOTE} placement="beside" />
          </InView>
        </section>
        <section className="flex flex-col gap-3">
          <h4 className="text-body font-semibold">{t('dive.head')}</h4>
          <SiteDive
            label={t('alt.dive')}
            seabedM={SEABED_M}
            ghostM={GHOST_M}
            ticks={TICKS}
            words={{
              site: t('dive.site'),
              ghost: t('dive.ghost'),
              seabed: t('dive.seabed'),
              reached: t('dive.reached'),
              metres: (metres) => t('dive.metres', { metres }),
            }}
          />
          <InView view="chat" as="p" className="text-body">
            {t('dive.verdict')}
          </InView>
          <InView view="coding" as="p" className="flex items-start gap-1 text-body">
            <span>{t.rich('dive.codingVerdict', { schema: SCHEMA })}</span>
            <Marker note={NOTE} placement="beside" />
          </InView>
        </section>
      </div>
      <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
        <p className="max-w-md text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
        </p>
        <p className="flex max-w-xl items-start gap-1 text-caption text-muted-foreground @4xl:text-right">
          <span>
            <InView view="chat">{t('footer.chat')}</InView>
            <InView view="coding">{t.rich('footer.coding', { variable: PROJECT_DIR })}</InView>
          </span>
          <Marker note={NOTE} placement="beside" />
        </p>
      </footer>
    </SlideFrame>
  ),
});
