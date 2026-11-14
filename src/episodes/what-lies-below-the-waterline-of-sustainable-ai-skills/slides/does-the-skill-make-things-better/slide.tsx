import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { DescriptionTest } from './description-test';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RunScore } from './run-score';
import { runClass, TestDive } from './test-dive';

const SKILLSBENCH = { slug: 'skillsbench', url: 'https://arxiv.org/abs/2602.12670' };
const VERCEL = {
  slug: 'vercel-agents-md-outperforms-skills',
  url: 'https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals',
};
const SWE_SKILLS_BENCH = { slug: 'swe-skills-bench', url: 'https://arxiv.org/abs/2603.15401' };
const OPTIMIZING = {
  slug: 'agent-skills-optimizing-descriptions',
  url: 'https://agentskills.io/skill-creation/optimizing-descriptions',
};
const BEST_PRACTICES = {
  slug: 'anthropic-skill-authoring-best-practices',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices',
};
const GOOGLE = { slug: 'google-agent-skills-whitepaper', url: 'https://www.kaggle.com/whitepaper-agent-skills' };

/**
 * The checks of `collect-sediment-sample`, and which each run passed: an illustration of the viewer's own test, not a
 * measured result. The skill has no step for core length, so the with-skill run misses that one alone.
 */
const CHECKS = [
  { slug: 'hold', without: false, with: true },
  { slug: 'camera', without: false, with: true },
  { slug: 'seal', without: true, with: true },
  { slug: 'core', without: true, with: false },
] as const;
const RUNS = ['without', 'with'] as const;
const SHOULD = ['0', '1', '2'] as const;
/** The requests that should not trigger the skill; the last sounds like it and needs something else. */
const SHOULD_NOT = [
  { key: '0', nearMiss: false },
  { key: '1', nearMiss: false },
  { key: '2', nearMiss: true },
] as const;
const SKILL = 'collect-sediment-sample';

/**
 * "Does the skill make things better?" (Spec Option 22a): two test dives of the same task side by side, without the
 * skill and with it, each scored, then the description test and the SkillsBench callout. Keeps `grid-1x2` for the two
 * runs with a row beneath; keeps `motion: local`, the two scores filling in, left then right, once on entry.
 */
export const doesTheSkillMakeThingsBetter = slide({
  slug: 'does-the-skill-make-things-better',
  messages: { en, de },
  presentation: atDepth(6, 'page'),
  notes: [
    {
      slug: 'skills-that-score-below-no-skill-skillsbench-not-vercel',
      target: 'callout',
      sources: [SKILLSBENCH, VERCEL],
    },
    { slug: 'bad-skills-can-hurt-many-do-nothing', target: 'harm', sources: [SWE_SKILLS_BENCH, SKILLSBENCH] },
    { slug: 'test-the-skills-description-too', target: 'description-test', sources: [OPTIMIZING, BEST_PRACTICES] },
    { slug: 'trigger-tests-in-googles-day-3-two-sizes', target: 'footnote', sources: [GOOGLE] },
    { slug: 'skill-evals-in-googles-day-3-one-figure-misread', target: 'vercel', sources: [GOOGLE, VERCEL] },
  ],
  segments: [{ slug: 'same-task-twice' }, { slug: 'the-callout' }, { slug: 'test-the-label' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <p data-task className="flex flex-wrap items-center justify-center gap-3 text-caption">
        <span className="rounded-full bg-foreground px-3 py-1 font-semibold text-(--slide-surface)">
          {t('task.chip')}
        </span>
        <InView view="chat">{`${t('quote.open')}${t('task.text')}${t('quote.close')}`}</InView>
        <InView
          view="coding"
          className="font-mono"
        >{`prompt: ${t('quote.open')}${t('task.text')}${t('quote.close')}`}</InView>
      </p>
      <div className="grid gap-4 @3xl:grid-cols-2">
        {RUNS.map((run) => (
          <ZoneCard key={run} data-run={run} className={runClass(run === 'with')}>
            <p className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-body font-semibold">{t(`runs.${run}.label`)}</span>
              <span className="text-caption text-muted-foreground">
                <InView view="chat">{t(`runs.${run}.sub`)}</InView>
                <InView view="coding" className="font-mono">
                  {run === 'with' ? `${SKILL}/SKILL.md ${t('runs.with.loaded')}` : t('runs.without.subCoding')}
                </InView>
              </span>
            </p>
            <TestDive
              run={run}
              label={t(`alt.${run}`)}
              gauge={t('art.gauge')}
              pills={{
                card:
                  run === 'with'
                    ? { chat: t('art.card'), coding: 'SKILL.md' }
                    : { chat: t('art.noCard'), coding: t('art.noCard') },
                silt: run === 'with' ? undefined : t('art.silt'),
              }}
            />
            <RunScore
              run={run}
              label={t('score.label')}
              verdict={{ pass: t('score.pass'), fail: t('score.fail') }}
              checks={CHECKS.map((check) => ({ label: t(`checks.${check.slug}`), pass: check[run] }))}
            />
          </ZoneCard>
        ))}
      </div>
      <div className="grid gap-4 @4xl:grid-cols-12">
        <div className="@4xl:col-span-8">
          <DescriptionTest
            target={target('description-test')}
            footnoteTarget={target('footnote')}
            title={
              <>
                {t('descTest.title')}
                <Marker note="test-the-skills-description-too" placement="beside" />
              </>
            }
            lead={{ chat: t('descTest.lead'), coding: t('descTest.leadCoding') }}
            frontMatter={{ name: SKILL, description: t('descTest.frontMatter') }}
            should={{
              label: t('descTest.should'),
              requests: SHOULD.map((key) => ({ text: t(`requests.should.${key}`) })),
            }}
            shouldNot={{
              label: t('descTest.shouldNot'),
              requests: SHOULD_NOT.map(({ key, nearMiss }) => ({ text: t(`requests.shouldNot.${key}`), nearMiss })),
            }}
            nearMiss={t('descTest.nearMiss')}
            quote={{ open: t('quote.open'), close: t('quote.close') }}
            footnote={
              <>
                <span>{t('descTest.footnote')}</span>
                <Marker note="trigger-tests-in-googles-day-3-two-sizes" placement="beside" />
              </>
            }
          />
        </div>
        <ZoneCard {...target('callout')} className="flex flex-col gap-3 rounded-xl p-4 shadow-md @4xl:col-span-4">
          <span className="w-fit rounded-full border border-border px-3 py-0.5 text-caption text-muted-foreground">
            {t('callout.tag')}
          </span>
          <p className="flex items-start justify-between gap-2 text-body">
            {t('callout.text')}
            <Marker note="skills-that-score-below-no-skill-skillsbench-not-vercel" placement="beside" />
          </p>
          <p className="text-caption text-muted-foreground">{t('callout.source')}</p>
          <p
            {...target('harm')}
            className="flex items-start justify-between gap-2 border-t border-border pt-3 text-caption text-muted-foreground"
          >
            {t('callout.aside')}
            <Marker note="bad-skills-can-hurt-many-do-nothing" placement="beside" />
          </p>
        </ZoneCard>
      </div>
      <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
        <p className="max-w-md text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
        </p>
        <p
          {...target('vercel')}
          className="flex max-w-xl items-start gap-1 text-caption text-muted-foreground @4xl:text-right"
        >
          {t('vercel')}
          <Marker note="skill-evals-in-googles-day-3-one-figure-misread" placement="beside" />
        </p>
      </footer>
    </SlideFrame>
  ),
});
