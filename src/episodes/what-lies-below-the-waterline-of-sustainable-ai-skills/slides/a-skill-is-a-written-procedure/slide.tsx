import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import { Folder } from 'lucide-react';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { EXTRA_FOLDER, EXTRAS, ProcedureCard, type Extra } from './procedure-card';
import { RoomWall } from './room';
import styles from './slide.module.css';

const SPEC = { slug: 'agent-skills-specification', url: 'https://agentskills.io/specification' };
const OPENAI_ACADEMY = {
  slug: 'openai-academy-skills',
  url: 'https://academy.openai.com/public/clubs/work-users-ynjqu/resources/skills',
};
const GEMS_TO_SKILLS = {
  slug: 'google-gems-to-skills',
  url: 'https://support.google.com/gemini/answer/18560919?hl=en',
};
const GEMINI_CLI = {
  slug: 'google-gemini-cli-skills',
  url: 'https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md',
};
const DAY_3 = { slug: 'google-day-3-agent-skills', url: 'https://www.kaggle.com/whitepaper-agent-skills' };
const ANTHROPIC = { slug: 'anthropic-introducing-agent-skills', url: 'https://claude.com/blog/skills' };

const SKILL = 'collect-sediment-sample';
const FILES: Readonly<Record<Extra, string>> = {
  guide: 'species-guide.md',
  label: 'label-template.md',
  preset: 'arm-preset.py',
};
const STEP_KEYS = ['0', '1', '2', '3', '4', '5'] as const;

/** A numbered heading over one of the two previews on the right. */
function PreviewHeading({ n, children }: { readonly n: number; readonly children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-caption font-semibold text-muted-foreground uppercase">
      <span className="flex size-5 items-center justify-center rounded-full bg-foreground text-background">{n}</span>
      {children}
    </p>
  );
}

/** One part of SKILL.md in the Chat app view: its AI term first, the card's word beneath. */
function PartLabel(props: {
  readonly n: number;
  readonly term: string;
  readonly scene: string;
  readonly focal?: boolean;
}) {
  return (
    <li className="flex gap-3">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-caption font-semibold',
          props.focal ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground',
        )}
      >
        {props.n}
      </span>
      <div className="min-w-0">
        <p className="text-body font-semibold">{props.term}</p>
        <p className="mt-1 text-caption text-muted-foreground">{props.scene}</p>
      </div>
    </li>
  );
}

/** The Coding agent view of SKILL.md: the file itself, its frontmatter and its body each tagged. */
function SkillMdPanel(props: {
  readonly oneFile: string;
  readonly frontmatter: string;
  readonly body: string;
  readonly description: string;
  readonly steps: readonly string[];
}) {
  const tag = 'w-fit rounded-sm bg-background px-1.5 font-sans text-caption font-semibold text-foreground';
  return (
    <div className="overflow-hidden rounded-xl bg-foreground text-background shadow-md">
      <p className="flex items-center gap-2 border-b border-background/20 px-4 py-2 font-mono text-caption font-semibold break-all">
        {SKILL}/SKILL.md
        <span className="ml-auto font-sans font-normal text-background/70">{props.oneFile}</span>
      </p>
      <div className="flex flex-col gap-1 px-4 py-3 font-mono text-caption whitespace-pre-wrap">
        <p className={tag}>{props.frontmatter}</p>
        <p>---</p>
        <p>name: {SKILL}</p>
        <p>description: {props.description}</p>
        <p>---</p>
        <p className={cn(tag, 'mt-2')}>{props.body}</p>
        {props.steps.map((step, index) => (
          <p key={step}>
            {index + 1}. {step}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * "A skill is a folder of instructions" (Spec Option 3a): Anthropic's definition as the caption, then two visuals.
 * Left, `SKILL.md` alone as one continuous clipboard on the control-room wall: the procedure card in its clear sleeve,
 * head, body and the pocket of extras. Right, the two parts of the file named by their AI terms (or the file itself
 * in the Coding agent view), then the folder of optional supporting files beside it. Overrules `grid-1x1` for
 * `grid-1x2`; `motion: none`, since Round 5's two visuals keep no leaders to draw.
 */
export const aSkillIsAWrittenProcedure = slide({
  slug: 'a-skill-is-a-written-procedure',
  messages: { en, de },
  presentation: atDepth(1, 'page'),
  captionNote: 'anthropics-definition-of-a-skill',
  notes: [
    { slug: 'what-a-skill-is-made-of', target: 'folder', sources: [SPEC, OPENAI_ACADEMY] },
    { slug: 'names-differ-by-app', target: 'app-names', sources: [GEMS_TO_SKILLS, GEMINI_CLI] },
    { slug: 'the-description-is-the-routing-line', target: 'routing', sources: [DAY_3] },
    { slug: 'anthropics-definition-of-a-skill', target: 'caption', sources: [ANTHROPIC] },
  ],
  segments: [{ slug: 'name-and-use-when' }, { slug: 'steps-in-the-body' }, { slug: 'for-developers' }],
  content: ({ t, target, Marker }) => {
    const steps = STEP_KEYS.map((key) => t(`card.steps.${key}`));
    const extras = { guide: t('extras.guide'), label: t('extras.label'), preset: t('extras.preset') };
    return (
      <SlideFrame className="@container mt-6 flex flex-col gap-6">
        <p data-quote-source className="text-caption font-semibold text-muted-foreground">
          {t('quoteSource')}
        </p>
        <div className="grid gap-8 @3xl:grid-cols-2">
          <ZoneScene
            zone="surface"
            iceberg="none"
            label={t('alt.scene')}
            className={cn(styles.scene, 'rounded-2xl p-4 shadow-md @md:p-8')}
            overlay={
              <ProcedureCard
                label={t('card.label')}
                title={t('card.title')}
                useWhenLead={t('card.useWhenLead')}
                useWhen={t('card.useWhen')}
                backLabel={t('card.backLabel')}
                steps={steps}
                extras={extras}
              />
            }
          >
            <RoomWall />
          </ZoneScene>
          <div className="flex min-w-0 flex-col justify-between gap-8">
            <section aria-label={t('alone')} className="flex flex-col gap-3">
              <PreviewHeading n={1}>{t('alone')}</PreviewHeading>
              <InView view="chat" as="div">
                <ol aria-label={t('labels.parts')} className="flex flex-col gap-5">
                  <PartLabel
                    n={1}
                    term={t('labels.nameDescription.term')}
                    scene={t('labels.nameDescription.scene')}
                    focal
                  />
                  <PartLabel n={2} term={t('labels.instructions.term')} scene={t('labels.instructions.scene')} />
                </ol>
              </InView>
              <InView view="coding" as="div">
                <SkillMdPanel
                  oneFile={t('coding.oneFile')}
                  frontmatter={t('coding.frontmatter')}
                  body={t('coding.body')}
                  description={t('coding.description')}
                  steps={steps}
                />
              </InView>
            </section>
            <section aria-label={t('folder')} {...target('folder')} className="flex flex-col gap-3 border-t pt-6">
              <PreviewHeading n={2}>{t('folder')}</PreviewHeading>
              <div className="flex flex-col gap-3 rounded-xl bg-card p-4 text-card-foreground shadow-md">
                <p className="flex items-center justify-between gap-3">
                  <InView view="chat" className="text-body font-semibold">
                    {t('supporting.title')}
                  </InView>
                  <InView view="coding" className="font-mono text-body font-semibold">
                    {SKILL}/
                  </InView>
                  <span className="rounded-full border px-2 text-caption text-muted-foreground">
                    {t('supporting.optional')}
                  </span>
                </p>
                <ul aria-label={t('supporting.list')} className="flex flex-col gap-2">
                  {EXTRAS.map((extra) => (
                    <li key={extra} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
                      <Folder aria-hidden className="size-4 shrink-0" />
                      <InView view="chat" className="text-body">
                        {extras[extra]}
                      </InView>
                      <InView view="coding" className="font-mono text-caption break-all">
                        <span className="font-semibold">{EXTRA_FOLDER[extra]}</span>
                        {FILES[extra]}
                      </InView>
                      <InView view="chat" className="ml-auto text-caption text-muted-foreground">
                        {t(`supporting.kinds.${extra}`)}
                      </InView>
                      <InView view="coding" className="ml-auto text-caption text-muted-foreground">
                        {t('supporting.optional')}
                      </InView>
                    </li>
                  ))}
                </ul>
                <p className="flex items-center gap-1 text-caption text-muted-foreground">
                  {t('supporting.reach')}
                  <Marker note="what-a-skill-is-made-of" placement="beside" />
                </p>
                <p className="text-caption text-muted-foreground">
                  <a
                    href="https://agentskills.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-foreground underline underline-offset-2"
                  >
                    agentskills.io<span className="sr-only"> {t('supporting.newTab')}</span>
                  </a>{' '}
                  {t('supporting.standard')}
                </p>
              </div>
            </section>
          </div>
        </div>
        <footer className="grid gap-4 border-t pt-4 text-caption @3xl:grid-cols-2">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{t('analogy.label')}</span> {t('analogy.text')}
          </p>
          <div className="flex flex-col gap-2 text-muted-foreground @3xl:items-end @3xl:text-right">
            <p {...target('routing')} className="flex items-center gap-1">
              {t('routing')}
              <Marker note="the-description-is-the-routing-line" placement="beside" />
            </p>
            <p {...target('app-names')} className="flex items-center gap-1">
              {t('appNames')}
              <Marker note="names-differ-by-app" placement="beside" />
            </p>
          </div>
        </footer>
      </SlideFrame>
    );
  },
});
