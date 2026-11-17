import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { localizePath, stripLocale } from '@/shared/lib/locale.pure';
import { cn } from '@/shared/lib/utils';
import { ScriptArt, TemplateArt } from './card-art';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './inside.module.css';
import { CardHead, SkillNote, SkillTree, SlideTrail, StepArrow, StepCell } from './parts';
import { SupportingFile } from './supporting-file';
import { ConsoleEdge, WallArt } from './wall-art';

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
// decision: FE-002 §5.1
const CODING_POINTERS = {
  'lower-arm': `Run ${PATHS.arm}.`,
  identify: `Read ${PATHS.guide}, starting with its contents.`,
  label: `Fill in ${PATHS.label}.`,
} as const;
function partsOf(link: string) {
  const [path = '', anchor] = link.split('#');
  return { path: stripLocale(path), anchor };
}
const CHAPTERS = [
  { slug: 'corals', page: 2 },
  { slug: 'sponges', page: 9 },
  { slug: 'worms', page: 15 },
  { slug: 'crustaceans', page: 22 },
  { slug: 'unknown', page: 30 },
] as const;
const FOCUS = 4;

const Gap = () => <div aria-hidden className="hidden @4xl:block" />;

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
  content: ({ t, locale, marker, target, slideHref }) => {
    const loading = partsOf(slideHref('three-levels-of-loading'));
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
          className="max-w-3xl rounded-lg border-l-4 border-primary bg-card px-4 py-2 text-caption text-card-foreground shadow-sm"
        >
          <span className="font-semibold">{t('disclosure.lead')}</span>{' '}
          {t.rich('disclosure.text', {
            marker: marker(DISCLOSURE),
            link: (chunks) => (
              <a className="font-semibold underline" href={localizePath(loading.path, locale, loading.anchor)}>
                {chunks}
              </a>
            ),
          })}
        </p>
        <ZoneScene
          zone="twilight"
          iceberg="none"
          label={t('alt.scene')}
          className={cn(styles.scene, 'rounded-2xl shadow-md')}
          overlay={
            <>
              <div className="focus-group focus-group--dim-others grid gap-x-4 p-4 @4xl:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_minmax(0,3fr)] @4xl:grid-rows-[repeat(6,auto)_1fr_auto] @4xl:p-8">
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
                <CardHead label={t('card.label')} title={t('card.title')} root={ROOT} file="SKILL.md" />
                <Gap />
                <Gap />
                <StepCell n={1} text={t('steps.hover')} />
                <Gap />
                <Gap />
                <StepCell n={2} text={t('steps.check-camera')} />
                <Gap />
                <Gap />
                <StepCell n={3} text={t('steps.lower-arm')} pointer={pointer('lower-arm')} />
                <div className="flex items-center gap-2 py-2 pl-6 @4xl:py-0 @4xl:pl-0">
                  <StepArrow />
                  <SupportingFile step={3} {...file('arm')} art={<ScriptArt />} />
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
                <StepCell n={FOCUS} text={t('steps.identify')} pointer={pointer('identify')} focus />
                <div className="relative flex items-center gap-2 py-2 pl-6 @4xl:col-start-2 @4xl:row-span-2 @4xl:row-start-6 @4xl:mb-6 @4xl:items-start @4xl:pl-0 @4xl:[&>[data-arrow]]:mt-7">
                  <StepArrow focal />
                  <SlideTrail />
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
                <div className="py-2 @4xl:col-start-3 @4xl:row-span-2 @4xl:row-start-6">
                  <SkillNote {...target('contents-rule')}>
                    {t.rich('rules.contents', { marker: marker(CONTENTS) })}
                  </SkillNote>
                </div>
                <StepCell n={5} text={t('steps.seal')} long={{ text: t('long.text'), more: t('long.more') }} />
                <div className="hidden items-end pb-6 @4xl:col-start-2 @4xl:row-start-7 @4xl:flex">
                  <StepArrow long />
                </div>
                <div className="py-2 @4xl:col-start-3 @4xl:row-start-7 @4xl:self-end">
                  <SkillNote {...target('long-rule')}>
                    {t.rich('rules.long', { marker: marker(MOVE_DETAIL) })}
                  </SkillNote>
                </div>
                <StepCell n={6} text={t('steps.label')} pointer={pointer('label')} last />
                <div className="flex items-center gap-2 py-2 pl-6 @4xl:pl-0">
                  <StepArrow />
                  <SupportingFile step={6} {...file('label')} art={<TemplateArt />} />
                </div>
                <Gap />
              </div>
              <ConsoleEdge />
            </>
          }
        >
          <WallArt />
        </ZoneScene>
        <div
          data-footer
          className="flex flex-col gap-2 border-t border-border pt-4 text-caption @3xl:flex-row @3xl:items-start @3xl:justify-between @3xl:gap-10"
        >
          <p data-analogy className="max-w-md text-foreground">
            <span className="font-semibold text-foreground">{t('footer.lead')}</span> {t('footer.analogy')}
          </p>
          <p className="max-w-md text-foreground @3xl:text-right">
            <InView view="chat">{t.rich('footer.chat', { marker: marker(CONTENTS) })}</InView>
            <InView view="coding">{t.rich('footer.coding', { marker: marker(ONE_LEVEL) })}</InView>
          </p>
        </div>
      </SlideFrame>
    );
  },
});
