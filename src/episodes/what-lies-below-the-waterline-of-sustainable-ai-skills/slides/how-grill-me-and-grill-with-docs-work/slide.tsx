import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { GlossaryTerms, ProjectFile, RunColumn, type GlossaryTerm } from './run-column';
import { SkillNest } from './skill-nest';
import styles from './slide.module.css';

const CONTEXT_ENGINEERING = {
  slug: 'anthropic-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const BEST_PRACTICES = {
  slug: 'agent-skills-best-practices',
  url: 'https://agentskills.io/skill-creation/best-practices',
};
const POCOCK_SKILLS = { slug: 'pocock-skills', url: 'https://github.com/mattpocock/skills' };
const NOTE = 'project-context-written-beside-the-skill';

/** Paths and the command are code: the same in every locale, never translated. */
const PATHS = {
  outer: 'grill-with-docs/SKILL.md',
  grilling: 'grilling/SKILL.md',
  domain: 'domain-modeling/SKILL.md',
  glossary: 'GLOSSARY.md',
  decisions: 'docs/adr/',
  command: '/grill-with-docs',
} as const;
/** Each decision record: its entry in the Chat app view, its file in the Coding agent view. */
const DECISIONS = [
  { entry: '0', file: '0001-depth-from-dive-plan.md' },
  { entry: '1', file: '0002-label-cores-by-site.md' },
] as const;

const STEPS = ['0', '1', '2', '3'] as const;
/** Monday settles two terms and one decision; Thursday reads them and adds the third term and a second decision. */
type TermSlug = 'site' | 'divePlan' | 'core';
const RUNS: readonly { n: 1 | 2; terms: readonly TermSlug[]; decisions: number }[] = [
  { n: 1, terms: ['site', 'divePlan'], decisions: 1 },
  { n: 2, terms: ['site', 'divePlan', 'core'], decisions: 2 },
];
const NEW_TERM: TermSlug = 'core';

/** A dashed "runs" arrow down from the skill to a run, with its label. */
function RunsArrow({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center gap-2 pl-[20%]">
      <svg aria-hidden viewBox="0 0 12 40" className={cn(styles.arrow, 'h-10 w-3')}>
        <line x1={6} y1={0} x2={6} y2={32} strokeWidth={2} strokeDasharray="4 3" />
        <polygon points="1,30 11,30 6,40" />
      </svg>
      <p className="rounded-full bg-card px-2 text-caption font-semibold text-card-foreground shadow-sm">{label}</p>
    </div>
  );
}

/** The read-back current: Monday's files carried into the start of Thursday's run. Drawn as the focal line. */
function ReadBackCurrent({ label }: { readonly label: string }) {
  return (
    <div className="flex items-center justify-center @3xl:items-start">
      <svg
        role="img"
        aria-label={label}
        viewBox="0 0 64 160"
        preserveAspectRatio="none"
        className={cn(styles.current, 'h-16 w-16 rotate-90 @3xl:h-full @3xl:min-h-40 @3xl:rotate-0')}
      >
        <path d="M 4 156 C 40 150, 30 60, 50 18" strokeWidth={6} fill="none" vectorEffect="non-scaling-stroke" />
        <polygon points="40,20 60,0 60,28" />
      </svg>
    </div>
  );
}

/**
 * "grill-with-docs keeps context beside the skill" (Spec Option 19b): one skill against two runs, outside the control
 * room, on the real files. Overrules `three-column` for a Scene from `SlideFrame`: grill-with-docs spans the top as one
 * sheet holding the two skills it runs; Monday's and Thursday's runs sit beneath it, each writing a glossary and
 * decision records beside it. Keeps `motion: local`, recast: the current carries Monday's files in, then Thursday's
 * glossary gains "Core", its row filling primary.
 */
export const howGrillMeAndGrillWithDocsWork = slide({
  slug: 'how-grill-me-and-grill-with-docs-work',
  messages: { en, de },
  presentation: atDepth(5, 'page'),
  notes: [{ slug: NOTE, target: 'run-2', sources: [CONTEXT_ENGINEERING, BEST_PRACTICES, POCOCK_SKILLS] }],
  segments: [{ slug: 'the-interview-is-the-card' }, { slug: 'follow-the-arrow' }, { slug: 'skills-can-run-skills' }],
  content: ({ t, target, Marker }) => {
    const sheet = (id: 'grilling' | 'domain') => ({
      kind: t(`sheets.${id}.kind`),
      path: PATHS[id],
      steps: STEPS.map((step) => ({ chat: t(`sheets.${id}.steps.${step}`), coding: t(`coding.${id}.${step}`) })),
    });
    const term = (slug: TermSlug): GlossaryTerm => ({
      slug,
      chat: {
        name: t(`terms.${slug}.name`),
        text: t(`terms.${slug}.text`),
        ...(slug === NEW_TERM && { avoid: t('terms.core.avoid') }),
      },
      coding: {
        name: t(`coding.terms.${slug}.name`),
        text: t(`coding.terms.${slug}.text`),
        ...(slug === NEW_TERM && { avoid: t('coding.terms.core.avoid') }),
      },
      isNew: slug === NEW_TERM,
    });
    const leads = {
      1: t.rich('runs.1.coding', { command: PATHS.command, glossary: PATHS.glossary, decisions: PATHS.decisions }),
      2: t.rich('runs.2.coding', { command: PATHS.command }),
    };
    const runs = RUNS.map(({ n, terms, decisions }) => {
      const grows = terms.includes(NEW_TERM);
      return (
        <RunColumn
          key={n}
          n={n}
          label={t(`runs.${n}.label`)}
          lead={{ chat: t(`runs.${n}.lead`), coding: leads[n] }}
          after={n === 2 ? <Marker note={NOTE} placement="beside" /> : undefined}
          target={n === 2 ? target('run-2') : undefined}
        >
          <ProjectFile
            kind={{ chat: t('files.glossary.kind'), coding: PATHS.glossary }}
            beside={t('beside')}
            focus={grows}
            tag={grows ? t('files.glossary.added') : undefined}
          >
            <GlossaryTerms
              heading={{ chat: t('files.glossary.heading'), coding: t('coding.glossaryHeading') }}
              terms={terms.map(term)}
            />
          </ProjectFile>
          <ProjectFile kind={{ chat: t('files.decisions.kind'), coding: PATHS.decisions }} beside={t('beside')}>
            <ol className="flex flex-col gap-1">
              {DECISIONS.slice(0, decisions).map(({ entry, file }, index) => (
                <li key={file} className={cn(grows && index === decisions - 1 && 'font-semibold')}>
                  <InView view="chat">{t(`files.decisions.entries.${entry}`)}</InView>
                  <InView view="coding" className="font-mono break-words">
                    {file}
                  </InView>
                </li>
              ))}
            </ol>
          </ProjectFile>
        </RunColumn>
      );
    });
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <ZoneScene
          zone="twilight"
          label={t('alt.scene')}
          className="rounded-2xl shadow-md"
          overlay={
            <div className="flex flex-col gap-2 p-4 @3xl:p-6">
              <SkillNest
                outer={{ path: PATHS.outer, name: t('outer.name'), desc: t('outer.desc'), coding: t('coding.outer') }}
                stays={t('stays')}
                inner={[sheet('grilling'), sheet('domain')]}
              />
              <div className="grid grid-cols-2">
                <RunsArrow label={t('arrows.runs')} />
                <RunsArrow label={t('arrows.again')} />
              </div>
              <div className="grid gap-3 @3xl:grid-cols-[1fr_4rem_1fr]">
                {runs[0]}
                <ReadBackCurrent label={t('arrows.current')} />
                {runs[1]}
              </div>
              <p className="mt-2 max-w-xs self-end rounded-md bg-card px-3 py-2 text-caption text-muted-foreground shadow-md">
                <span className="font-semibold text-foreground">{t('story.label')}</span> {t('story.text')}
              </p>
            </div>
          }
        />
        <footer className="flex flex-col gap-3 border-t border-border pt-4 @2xl:flex-row @2xl:items-start">
          <p className="w-fit shrink-0 rounded-full border border-border px-3 text-caption font-semibold text-muted-foreground">
            {t('closing.chip')}
          </p>
          <p className="text-body text-muted-foreground">{t('closing.text')}</p>
        </footer>
      </SlideFrame>
    );
  },
});
