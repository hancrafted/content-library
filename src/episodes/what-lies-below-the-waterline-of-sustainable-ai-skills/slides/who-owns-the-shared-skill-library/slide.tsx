import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { SkillScopeSquare } from '@/episodes/components/slide-shared/skill-scope-matrix/skill-scope-matrix';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import { FrontPage } from './front-page';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './slide.module.css';

const PROVISION = {
  slug: 'anthropic-provision-and-manage-skills',
  url: 'https://support.claude.com/en/articles/13119606-provision-and-manage-skills-for-your-organization',
};
const ENTERPRISE = {
  slug: 'anthropic-skills-for-enterprise',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise',
};
const CLAUDE_CODE_SKILLS = { slug: 'claude-code-skills', url: 'https://code.claude.com/docs/en/skills' };
const SWE_SKILLS_BENCH = { slug: 'swe-skills-bench', url: 'https://arxiv.org/abs/2603.15401' };

const ADDS = 'who-adds-reviews-and-removes-shared-skills';
const TIERS = 'shared-skills-are-tiered-by-audience';
const COST = 'token-cost-and-model-fit-are-per-skill-facts';
const JUDGEMENT = 'skill-governance-still-being-worked-out-is-a-judgement';

/** The front page's lines in the Voice script's order, each with the note its Context marker opens. */
const ROWS = [
  { slug: 'add', note: ADDS, scene: false },
  { slug: 'tier', note: TIERS, scene: true },
  { slug: 'cost', note: COST, scene: false },
  { slug: 'models', note: COST, scene: true },
  { slug: 'retire', note: ADDS, scene: false },
] as const;
/** The `metadata` map a `SKILL.md` might carry by convention; front matter, not translated. */
const FRONT_MATTER = [
  '---',
  'name: collect-sediment-sample',
  'description: Use when we reach a new site and need a sample …',
  'metadata:',
  '  owner: survey-team',
  '  version: "1.3"',
  '  tier: organisation',
  '  works-with: Claude Code, Codex',
  '  retire-when: evals keep failing',
  '---',
];

/** The robot on its cable, lamp lit, the depth marker at the lower left of the Midnight water. */
function DepthMarker() {
  return (
    <g aria-hidden>
      <line x1={90} y1={0} x2={90} y2={640} strokeWidth={3} className={styles.cable} />
      <g transform="translate(90 640) scale(1.6)">
        <Robot aim="ahead" />
      </g>
    </g>
  );
}

/** The faceted beam that opens the square into the page, between the two on a wide Slide. */
function ZoomBeam() {
  return (
    <div className="relative hidden @5xl:block">
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        data-motion="zoom"
        className={cn(styles.zoomBeam, 'absolute inset-0 size-full')}
      >
        <polygon points="0,14 100,0 100,100 0,62" className={styles.beam} />
        <polyline
          points="0,14 100,0"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
          className={styles.beamEdge}
        />
        <polyline
          points="0,62 100,100"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
          className={styles.beamEdge}
        />
      </svg>
    </div>
  );
}

/**
 * "Who owns the shared skill library" (Spec Option 21a): Slide 18's matrix returns, cropped onto its shared, general
 * square, and a beam opens that square into the shared library's front page, its lower corner left dark. Overrules
 * `grid-2x2` for one Midnight Scene holding matrix, beam and page; keeps `motion: local`, the zoom into the square,
 * once on entry.
 */
export const whoOwnsTheSharedSkillLibrary = slide({
  slug: 'who-owns-the-shared-skill-library',
  messages: { en, de },
  presentation: atDepth(6, 'page'),
  captionNote: JUDGEMENT,
  notes: [
    { slug: TIERS, target: 'tier', sources: [PROVISION] },
    { slug: ADDS, target: 'add', sources: [PROVISION, ENTERPRISE] },
    { slug: COST, target: 'cost', sources: [CLAUDE_CODE_SKILLS, SWE_SKILLS_BENCH] },
    { slug: JUDGEMENT, target: 'caption', sources: [ENTERPRISE] },
  ],
  segments: [{ slug: 'back-to-the-square' }, { slug: 'what-the-front-page-needs' }, { slug: 'the-dark-corner' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <ZoneScene
        zone="midnight"
        iceberg="none"
        label={t('alt.scene')}
        className={cn(styles.scene, 'rounded-2xl p-4 shadow-md @xl:p-6')}
        overlay={
          <div className="grid gap-4 @5xl:grid-cols-[minmax(0,30%)_minmax(0,7%)_minmax(0,1fr)] @5xl:gap-0">
            <SkillScopeSquare
              className="max-w-sm @5xl:max-w-none @5xl:self-start"
              back={t('matrix.back')}
              locator={t('matrix.locator')}
              care={t('matrix.care')}
              axes={{ who: t('matrix.shared'), where: t('matrix.general') }}
              square={{
                id: 'sg',
                care: 4,
                careLabel: t('matrix.careLevel'),
                head: t('matrix.chat.title'),
                sub: t('matrix.chat.sub'),
                coding: { head: t('matrix.coding.title'), sub: t('matrix.coding.sub') },
                picture: 'fleet',
                label: { chat: t('matrix.pill'), coding: t('matrix.pillCoding') },
                focus: true,
              }}
            />
            <ZoomBeam />
            <FrontPage
              label={t('page.label')}
              scope={t('page.scope')}
              title={t('page.title')}
              rows={ROWS.map(({ slug, note, scene }) => ({
                slug,
                term: t(`rows.${slug}.term`),
                marker: <Marker note={note} placement="beside" />,
                scene: scene ? t(`rows.${slug}.scene`) : undefined,
                chat: t(`rows.${slug}.chat`),
                coding: t.rich(`rows.${slug}.coding`),
                target: slug === 'add' || slug === 'tier' || slug === 'cost' ? target(slug) : undefined,
              }))}
              inset={{
                heading: (
                  <>
                    {t.rich('inset.heading')}
                    <Marker note={ADDS} placement="beside" />
                  </>
                ),
                lines: FRONT_MATTER,
                note: t('inset.note'),
              }}
              darkCorner={
                <>
                  {t('darkCorner')}
                  <Marker note={JUDGEMENT} placement="beside" />
                </>
              }
            />
          </div>
        }
      >
        <DepthMarker />
      </ZoneScene>
      <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
        <p className="max-w-md text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
        </p>
        <p className="flex max-w-xl items-start gap-1 text-caption text-muted-foreground @4xl:text-right">
          <span>
            <InView view="chat">{t('footer.chat')}</InView>
            <InView view="coding">{t('footer.coding')}</InView>
          </span>
          <Marker note={TIERS} placement="beside" />
        </p>
      </footer>
    </SlideFrame>
  ),
});
