import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { SkillIndexBoard, WallBrief } from './index-and-wall';
import { ControlRoom } from './room';
import styles from './slide.module.css';
import { TermCard, VercelBars } from './term-cards';

const HICK = { slug: 'hick-rate-of-gain-of-information', url: 'https://doi.org/10.1080/17470215208416600' };
const HYMAN = { slug: 'hyman-stimulus-information', url: 'https://doi.org/10.1037/h0056940' };
const VERCEL = {
  slug: 'vercel-agents-md-outperforms-skills',
  url: 'https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals',
};
const BEST_PRACTICES = {
  slug: 'agent-skills-best-practices',
  url: 'https://agentskills.io/skill-creation/best-practices',
};
const ANTHROPIC = {
  slug: 'anthropic-skill-authoring-best-practices',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices',
};

/** The index board's eight cards, by skill folder, left to right and row by row; four near-twins among them. */
const CARDS = [
  { folder: 'sample', twin: true },
  { folder: 'collect-water-sample', twin: false },
  { folder: 'take-sample', twin: true },
  { folder: 'collect-sediment-sample', twin: false },
  { folder: 'film-transect', twin: false },
  { folder: 'seabed-sample-v2', twin: true },
  { folder: 'log-dive', twin: false },
  { folder: 'collect-mud-sample', twin: true },
] as const;
/** The wall's short list; its first line is lit and led to its card. */
const WALL = ['collect-sediment-sample', 'film-transect', 'log-dive'] as const;
const LIT = WALL[0];
/** Vercel's pass rates: the skill by default, then with a line in AGENTS.md telling the agent to use it. */
const PASS_RATES = [
  { slug: 'default', value: 53 },
  { slug: 'agents-md-line', value: 79 },
] as const;
/** The naming rule's examples: the Episode's own skill folders. */
const NAMES = ['collect-sediment-sample', 'film-transect', 'log-dive'] as const;

/**
 * "More skills, harder choice" (Spec Option 13a): the index crowded with near-twins over a guessing pilot, and the
 * project brief on the wall whose short list settles it. Overrules `grid-1x2`: the index and the wall are two objects of
 * one room, then the two term cards, the evidence strip and the naming rule; keeps `motion: local`, the twins fading
 * back as the wall's first line lights and its leader draws, once.
 */
export const moreSkillsHarderChoice = slide({
  slug: 'more-skills-harder-choice',
  messages: { en, de },
  presentation: atDepth(3, 'page'),
  captionNote: 'skills-too-broad-or-too-narrow',
  notes: [
    { slug: 'choosing-among-many-skills-hick-and-hyman', target: 'hick', sources: [HICK, HYMAN] },
    { slug: 'agents-md-index-beat-skills-vercels-test', target: 'vercel', sources: [VERCEL] },
    { slug: 'skills-too-broad-or-too-narrow', target: 'caption', sources: [BEST_PRACTICES] },
    { slug: 'name-each-skill-as-an-action', target: 'naming', sources: [ANTHROPIC] },
  ],
  segments: [
    { slug: 'near-twins' },
    { slug: 'a-short-list-on-the-wall' },
    { slug: 'hicks-law' },
    { slug: 'name-it-as-an-action' },
  ],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div className="grid gap-4">
        <ZoneScene
          zone="sunlit"
          iceberg="none"
          label={t('alt.room')}
          className="aspect-[2/1] w-full rounded-2xl shadow-md @5xl:col-start-1 @5xl:row-start-1"
        >
          <ControlRoom />
        </ZoneScene>
        <SkillIndexBoard
          className="@5xl:col-start-1 @5xl:row-start-1 @5xl:mt-[3%] @5xl:ml-[36%] @5xl:w-[34%] @5xl:self-start @5xl:justify-self-start"
          label={{ chat: t('index.label'), coding: t('index.labelCoding') }}
          target={LIT}
          cards={CARDS.map(({ folder, twin }) => ({ folder, twin, name: t(`index.cards.${folder}`) }))}
        />
        <WallBrief
          className="@5xl:col-start-1 @5xl:row-start-1 @5xl:mt-[6%] @5xl:mr-[2%] @5xl:w-[25%] @5xl:self-start @5xl:justify-self-end"
          chat={{ title: t('wall.title'), lead: t('wall.lead') }}
          coding={{ title: '# AGENTS.md', heading: '## Skills', lead: t('wall.lead') }}
          items={WALL.map((folder) => ({ folder, name: t(`index.cards.${folder}`) }))}
          lit={LIT}
          pill={{ chat: t('wall.pill'), coding: t('wall.pillCoding') }}
        />
        <svg
          aria-hidden
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
          className="pointer-events-none relative hidden size-full @5xl:col-start-1 @5xl:row-start-1 @5xl:block"
        >
          <path
            d="M 892 204 C 862 204, 862 180, 832 180"
            pathLength={1}
            strokeWidth={3}
            vectorEffect="non-scaling-stroke"
            className={`fill-none stroke-primary ${styles.leader}`}
          />
        </svg>
      </div>
      <ol className="focus-group focus-group--dim-others grid gap-4 @3xl:grid-cols-2" aria-label={t('terms.label')}>
        <TermCard
          n={1}
          term={t('terms.index.term')}
          scene={t('terms.index.scene')}
          kind={t('terms.index.kind')}
          line={t('terms.index.line')}
          code={[
            '.claude/skills/',
            ' sample/SKILL.md',
            ' take-sample/SKILL.md',
            ' seabed-sample-v2/',
            ' collect-mud-sample/SKILL.md',
            t('terms.index.more'),
          ]}
          marker={<Marker note="skills-too-broad-or-too-narrow" placement="beside" />}
        />
        <TermCard
          n={2}
          focal
          term={t('terms.instructions.term')}
          scene={t('terms.instructions.scene')}
          kind={t('terms.instructions.kind')}
          line={t('terms.instructions.line')}
          code={['# AGENTS.md', '## Skills', t('wall.lead'), ...WALL.map((folder) => `- ${folder}`)]}
        />
      </ol>
      <div className="grid gap-4 @3xl:grid-cols-2" aria-label={t('evidence')}>
        <aside {...target('hick')} className="flex flex-col gap-2 rounded-xl bg-card p-4 text-card-foreground">
          <p className="flex items-center gap-2 text-body font-semibold">
            {t('hick.title')}
            <Marker note="choosing-among-many-skills-hick-and-hyman" placement="beside" />
          </p>
          <p className="text-caption">{t('hick.text')}</p>
          <p className="text-caption text-muted-foreground">{t('hick.source')}</p>
        </aside>
        <aside {...target('vercel')} className="flex flex-col gap-2 rounded-xl bg-card p-4 text-card-foreground">
          <p className="flex items-center gap-2 text-body font-semibold">
            {t('vercel.title')}
            <Marker note="agents-md-index-beat-skills-vercels-test" placement="beside" />
          </p>
          <VercelBars
            rows={PASS_RATES.map(({ slug, value }) => ({ slug, value, label: t.rich(`vercel.rows.${slug}`) }))}
          />
          <p className="text-caption text-muted-foreground">{t('vercel.note')}</p>
        </aside>
      </div>
      <aside
        {...target('naming')}
        className="flex flex-col gap-4 rounded-xl bg-card p-4 text-card-foreground @3xl:flex-row @3xl:items-start @3xl:justify-between"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="flex items-center gap-2 text-body font-semibold">
            {t('naming.rule')}
            <Marker note="name-each-skill-as-an-action" placement="beside" />
          </p>
          <p className="text-caption text-muted-foreground">{t.rich('naming.source')}</p>
        </div>
        <ul className="flex shrink-0 flex-col gap-1.5">
          {NAMES.map((name) => (
            <li key={name} className="rounded-md bg-foreground px-3 py-1 font-mono text-caption text-background">
              {name}
            </li>
          ))}
        </ul>
      </aside>
      <footer className="border-t border-border pt-4">
        <p className="max-w-xl text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
        </p>
      </footer>
    </SlideFrame>
  ),
});
