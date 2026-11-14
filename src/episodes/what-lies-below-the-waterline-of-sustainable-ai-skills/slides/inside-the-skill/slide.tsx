import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './inside.module.css';
import { CardHead, SkillNote, SkillTree, StepArrow, StepCell, SupportingFile } from './parts';

const MOVE_DETAIL = 'move-detail-out-of-skill-md-and-say-when-to-read-it';
const CONTENTS = 'long-reference-files-start-with-a-contents-list';
const ONE_LEVEL = 'references-stay-one-level-deep';
const DISCLOSURE = 'progressive-disclosure-as-anthropic-names-it';

const AGENT_SKILLS_SPEC = { slug: 'agent-skills-specification', url: 'https://agentskills.io/specification' };
const ANTHROPIC_BEST_PRACTICES = {
  slug: 'anthropic-skill-best-practices',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices',
};

/** The skill's folder, as Slide 3 names it: paths and pointer code are never translated. */
const ROOT = 'collect-sediment-sample/';
const PATHS = {
  arm: 'scripts/arm-preset.py',
  guide: 'references/species-guide.md',
  label: 'assets/label-template.md',
} as const;
const CODING_POINTERS = {
  s3: `Run ${PATHS.arm}.`,
  s4: `Read ${PATHS.guide}, starting with its contents.`,
  s6: `Fill in ${PATHS.label}.`,
} as const;
const CHAPTERS = [
  { slug: 'corals', page: 2 },
  { slug: 'sponges', page: 9 },
  { slug: 'worms', page: 15 },
  { slug: 'crustaceans', page: 22 },
  { slug: 'unknown', page: 30 },
] as const;
/** The lit step: its row fills `primary`, its arrow turns solid and its file slides out. */
const FOCUS = 4;

/** An empty cell of the three-column grid, there only to keep each file level with its step on wide screens. */
const Gap = () => <div aria-hidden className="hidden @4xl:block" />;

/** The control-room wall behind the card, faceted, lit from the upper left. */
function Wall() {
  return (
    <g className={styles.wall}>
      <rect x={0} y={0} width={1200} height={800} data-tone="room" />
      <polygon points="0,0 560,0 140,620" data-tone="room-lit" />
      <polygon points="560,0 820,0 420,460" data-tone="room-lit" />
      <polygon points="760,800 1200,320 1200,800" data-tone="room-shade" />
    </g>
  );
}

/**
 * "Inside the skill" (Spec Option 16a): keeps `master: three-column` (instructions, supporting files, rules for long
 * files), each file level with the step that uses it, on the control-room wall. Keeps `motion: local`: step 4 fills
 * `primary`, its arrow turns solid and the species guide slides out of the sleeve, once on entry; at rest it shows slid
 * out. The rows are a grid rather than the build notes' inline SVG, so every word reads at phone width too.
 */
export const insideTheSkill = slide({
  slug: 'inside-the-skill',
  messages: { en, de },
  presentation: atDepth(4, 'page'),
  captionNote: MOVE_DETAIL,
  notes: [
    {
      slug: MOVE_DETAIL,
      target: 'long-rule',
      sources: [
        AGENT_SKILLS_SPEC,
        { slug: 'agent-skills-best-practices', url: 'https://agentskills.io/skill-creation/best-practices' },
      ],
    },
    { slug: CONTENTS, target: 'contents-rule', sources: [ANTHROPIC_BEST_PRACTICES] },
    { slug: ONE_LEVEL, target: 'files-head', sources: [ANTHROPIC_BEST_PRACTICES, AGENT_SKILLS_SPEC] },
    {
      slug: DISCLOSURE,
      target: 'disclosure',
      sources: [
        {
          slug: 'anthropic-agent-skills-overview',
          url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview',
        },
      ],
    },
  ],
  segments: [{ slug: 'extras-by-step' }, { slug: 'the-long-step' }, { slug: 'contents-first' }],
  content: ({ t, marker, target }) => {
    const pointer = (step: keyof typeof CODING_POINTERS) => ({
      chat: t(`pointers.${step}`),
      coding: CODING_POINTERS[step],
    });
    const file = (slug: keyof typeof PATHS) => ({
      kind: t(`files.${slug}.kind`),
      name: t(`files.${slug}.name`),
      hint: t(`files.${slug}.hint`),
      path: PATHS[slug],
    });
    return (
      <SlideFrame className="@container mt-6 gap-6">
        <p
          {...target('disclosure')}
          className="max-w-3xl rounded-lg border-l-4 border-foreground bg-card px-4 py-2 text-caption text-card-foreground shadow-sm"
        >
          <span className="font-semibold">{t('disclosure.lead')}</span>{' '}
          {t.rich('disclosure.text', { marker: marker(DISCLOSURE) })}
        </p>
        <ZoneScene
          zone="twilight"
          iceberg="none"
          label={t('alt.scene')}
          className="rounded-2xl shadow-md"
          overlay={
            <div className="focus-group focus-group--dim-others grid gap-x-4 p-4 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)] @4xl:p-8">
              {/* Row: the column heads, and the key under "Supporting files". */}
              <p className="pb-3 text-body font-semibold">{t('columns.instructions')}</p>
              <div {...target('files-head')} className="flex flex-col gap-1 pb-3">
                <p className="text-body font-semibold">{t('columns.files')}</p>
                <p className="text-caption">
                  <span className="font-semibold">{t('key.domain.term')}</span>{' '}
                  <span className="text-muted-foreground">{t('key.domain.text')}</span>
                </p>
                <p className="text-caption">
                  <span className="font-semibold">{t('key.project.term')}</span>{' '}
                  <span className="text-muted-foreground">{t('key.project.text')}</span>
                </p>
              </div>
              <Gap />
              {/* Row: the card's head in its sleeve. */}
              <CardHead label={t('card.label')} title={t('card.title')} />
              <Gap />
              <Gap />
              <StepCell n={1} text={t('steps.s1')} />
              <Gap />
              <Gap />
              <StepCell n={2} text={t('steps.s2')} />
              <Gap />
              <Gap />
              <StepCell n={3} text={t('steps.s3')} pointer={pointer('s3')} />
              <div className="flex items-center gap-2 py-2 pl-6 @4xl:pl-0">
                <StepArrow />
                <SupportingFile step={3} {...file('arm')} />
              </div>
              <div className="flex flex-col justify-end gap-3 py-2">
                <SkillTree
                  label={t.rich('tree', { marker: marker(ONE_LEVEL) })}
                  root={ROOT}
                  entries={[
                    { path: 'SKILL.md' },
                    { path: PATHS.arm },
                    { path: PATHS.guide, focal: true },
                    { path: PATHS.label },
                  ]}
                />
                <p className="hidden text-caption font-semibold text-muted-foreground uppercase @4xl:block">
                  {t('rules.head')}
                </p>
              </div>
              <StepCell n={FOCUS} text={t('steps.s4')} pointer={pointer('s4')} focus />
              <div className="flex items-center gap-2 py-2 pl-6 @4xl:pl-0">
                <StepArrow focal />
                <SupportingFile
                  step={FOCUS}
                  focal
                  {...file('guide')}
                  contents={{
                    head: t('guide.contents'),
                    rows: CHAPTERS.map(({ slug, page }) => ({
                      label: t(`guide.chapters.${slug}`),
                      page: t('guide.page', { page }),
                    })),
                  }}
                />
              </div>
              <div className="py-2">
                <SkillNote {...target('contents-rule')}>
                  {t.rich('rules.contents', { marker: marker(CONTENTS) })}
                </SkillNote>
              </div>
              <StepCell n={5} text={t('steps.s5')} long={{ text: t('long.text'), more: t('long.more') }} />
              <div className="hidden items-center @4xl:flex">
                <StepArrow long />
              </div>
              <div className="py-2">
                <SkillNote {...target('long-rule')}>{t.rich('rules.long', { marker: marker(MOVE_DETAIL) })}</SkillNote>
              </div>
              <StepCell n={6} text={t('steps.s6')} pointer={pointer('s6')} last />
              <div className="flex items-center gap-2 py-2 pl-6 @4xl:pl-0">
                <StepArrow />
                <SupportingFile step={6} {...file('label')} />
              </div>
              <Gap />
            </div>
          }
        >
          <Wall />
        </ZoneScene>
        <InView view="chat" as="p" className="max-w-xl border-t border-border pt-4 text-caption text-foreground">
          <span className="font-semibold text-foreground">{t('footer.lead')}</span>{' '}
          {t.rich('footer.chat', { marker: marker(CONTENTS) })}
        </InView>
        <InView view="coding" as="p" className="max-w-xl border-t border-border pt-4 text-caption text-foreground">
          <span className="font-semibold text-foreground">{t('footer.codingLead')}</span>{' '}
          {t.rich('footer.coding', { marker: marker(ONE_LEVEL) })}
        </InView>
      </SlideFrame>
    );
  },
});
