import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { Callouts, type CalloutSlug } from './callouts';
import { Cutaway } from './cutaway';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { CodeFile, Gloss, TermTile } from './term-tile';

const SKILLS_OVERVIEW = {
  slug: 'anthropic-agent-skills-overview',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview',
};
const NOTE = 'a-skill-spares-you-the-repeat';

/** The example skill's folder name and the project instructions file: code, so never translated. */
const SKILL_NAME = 'collect-sediment-sample';
const SKILL_FILE = `${SKILL_NAME}/SKILL.md`;
const PROJECT_FILE = 'AGENTS.md';
const STEPS = ['s1', 's2', 's3'] as const;
const LINES = ['l1', 'l2'] as const;
const CALLOUT_ORDER: readonly CalloutSlug[] = ['skill', 'description', 'project'];

/**
 * "A skill hands the AI your procedure" (Spec Option 2a): one wide cutaway of the research ship at the Surface, the
 * control room cut open, with three numbered callouts naming the AI terms on what they stand for (1 Skill on the
 * procedure card, 2 Description on the manual's index, 3 Project instructions on the brief), and the same three as tiles
 * beneath, in the page's Chat app or Coding agent view. Keeps `master: grid-1x1` and `motion: local`: the card slides
 * out of the manual on entry, its pill and leader last; at rest it shows out.
 */
export const aSkillHandsTheAiYourProcedure = slide({
  slug: 'a-skill-hands-the-ai-your-procedure',
  messages: { en, de },
  presentation: atDepth(0, 'page'),
  captionNote: NOTE,
  notes: [{ slug: NOTE, target: 'skill-tile', sources: [SKILLS_OVERVIEW] }],
  segments: [{ slug: 'the-answer' }, { slug: 'three-things-to-remember' }, { slug: 'the-card-slides-out' }],
  content: ({ t, marker, target }) => {
    const steps = STEPS.map((step) => t(`card.steps.${step}`));
    const lines = LINES.map((line) => t(`brief.lines.${line}`));
    const words = Object.fromEntries(
      CALLOUT_ORDER.map((slug, index) => [
        slug,
        { term: t(`callouts.${slug}.term`), scene: t(`callouts.${slug}.scene`), number: String(index + 1) },
      ]),
    ) as Record<CalloutSlug, { term: string; scene: string; number: string }>;
    const tag = { marker: marker(NOTE) };
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <ZoneScene
          zone="surface"
          iceberg="none"
          label={t('alt.cutaway')}
          className="aspect-[3/2] w-full rounded-xl"
          overlay={<Callouts words={words} />}
        >
          <Cutaway request={t('request')} />
        </ZoneScene>
        <ol aria-label={t('tilesLabel')} className="focus-group focus-group--dim-others grid gap-4 @2xl:grid-cols-3">
          <TermTile
            focal
            term={words.skill.term}
            chat={
              <>
                <div className="-rotate-1 rounded-md border border-border bg-background px-3 py-2 shadow-md">
                  <p className="text-caption font-semibold">{t('card.title')}</p>
                  <ol className="mt-1 flex list-inside list-decimal flex-col gap-1 text-caption">
                    {steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
                <Gloss>
                  <span {...target('skill-tile')}>{t.rich('tiles.skill.gloss', tag)}</span>
                </Gloss>
              </>
            }
            code={
              <>
                <CodeFile
                  path={SKILL_FILE}
                  text={[`# ${t('card.title')}`, ...steps.map((step, index) => `${index + 1}. ${step}`)].join('\n')}
                />
                <Gloss>{t.rich('tiles.skill.codeGloss', tag)}</Gloss>
              </>
            }
          />
          <TermTile
            term={words.description.term}
            chat={
              <>
                <div className="rounded-md bg-muted px-3 py-2">
                  <p className="text-caption font-semibold">{t('card.title')}</p>
                  <p className="text-caption text-muted-foreground">{t('card.description')}</p>
                </div>
                <Gloss>{t('tiles.description.gloss')}</Gloss>
              </>
            }
            code={
              <>
                <CodeFile
                  path={SKILL_FILE}
                  text={['---', `name: ${SKILL_NAME}`, `description: ${t('card.description')}`, '---'].join('\n')}
                />
                <Gloss>{t('tiles.description.codeGloss')}</Gloss>
              </>
            }
          />
          <TermTile
            term={words.project.term}
            chat={
              <>
                <div className="rounded-md bg-muted px-3 py-2 text-caption">
                  <p className="font-semibold">{t('brief.title')}</p>
                  {lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <Gloss>{t('tiles.project.gloss')}</Gloss>
              </>
            }
            code={
              <>
                <CodeFile
                  path={PROJECT_FILE}
                  text={[`# ${t('brief.title')}`, ...lines.map((line) => `- ${line}`)].join('\n')}
                />
                <Gloss>{t.rich('tiles.project.codeGloss')}</Gloss>
              </>
            }
          />
        </ol>
        <p className="max-w-md border-t border-border pt-4 text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('analogyLead')}</span> {t('analogy')}
        </p>
      </SlideFrame>
    );
  },
});
