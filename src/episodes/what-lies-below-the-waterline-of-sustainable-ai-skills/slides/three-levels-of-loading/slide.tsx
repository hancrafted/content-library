import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { SCENE_WIDTH, ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { at, ControlRoomArt, PROPPED } from './control-room-art';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { Badge, LevelCard } from './level-card';
import styles from './slide.module.css';

const SPEC = { slug: 'agent-skills-specification', url: 'https://agentskills.io/specification' };
const OVERVIEW = {
  slug: 'anthropic-agent-skills-overview',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview',
};
const DAY_3 = { slug: 'google-day-3-agent-skills', url: 'https://www.kaggle.com/whitepaper-agent-skills' };
const CODEX = { slug: 'openai-codex-build-skills', url: 'https://learn.chatgpt.com/docs/build-skills' };
const GEMINI_CLI = {
  slug: 'google-gemini-cli-skills',
  url: 'https://raw.githubusercontent.com/google-gemini/gemini-cli/main/docs/cli/skills.md',
};
const NNG = { slug: 'nngroup-progressive-disclosure', url: 'https://www.nngroup.com/articles/progressive-disclosure/' };

const SKILL = 'collect-sediment-sample';
const FILES = ['references/species-guide.md', 'assets/label-template.md', 'scripts/arm-preset.py'];

/**
 * "How AI discovers and reads a skill" (Spec Option 4b): the concept first, Nielsen Norman Group's definition of
 * progressive disclosure quoted above three steps; then the example, a skill's three loading levels as one row of
 * cards above one control room read left to right (the manual's index, the propped card, the sleeve under the lamp).
 * Overrules `vertical-stepper` for this horizontal Scene; keeps `motion: local`, the light moving in loading order.
 */
export const threeLevelsOfLoading = slide({
  slug: 'three-levels-of-loading',
  messages: { en, de },
  presentation: atDepth(1, 'page'),
  captionNote: 'three-levels-stated-by-the-standard',
  notes: [
    { slug: 'three-levels-stated-by-the-standard', target: 'caption', sources: [SPEC, OVERVIEW, DAY_3] },
    { slug: 'other-apps-load-in-stages-too', target: 'other-apps', sources: [CODEX, GEMINI_CLI] },
    { slug: 'scripts-documented-for-claude-only', target: 'level-extras', sources: [OVERVIEW, DAY_3] },
    { slug: 'what-the-skill-index-costs', target: 'level-index', sources: [DAY_3] },
    { slug: 'progressive-disclosure-as-anthropic-names-it', target: 'concept-skills', sources: [OVERVIEW] },
    { slug: 'progressive-disclosure-as-nielsen-norman-group-defines-it', target: 'concept', sources: [NNG] },
  ],
  segments: [{ slug: 'the-concept' }, { slug: 'step-one' }, { slug: 'step-two' }, { slug: 'step-three' }],
  content: ({ t, target, Marker }) => {
    const note = 'text-caption text-muted-foreground';
    const code = 'rounded-md bg-foreground px-2 py-1 font-mono text-caption whitespace-pre-wrap text-background';
    return (
      <SlideFrame className="@container mt-6 flex flex-col gap-6">
        <section
          aria-label={t('concept.label')}
          className="grid gap-6 rounded-xl bg-muted p-5 text-foreground @3xl:grid-cols-[3fr_2fr] @3xl:items-center"
        >
          <div {...target('concept')} className="flex flex-col gap-2">
            <p className="text-caption text-muted-foreground uppercase">{t('concept.label')}</p>
            <p className="text-body font-semibold">{t('concept.term')}</p>
            <p className="flex items-start gap-1 text-body">
              <q className="[quotes:none]">{t('concept.quote')}</q>
              <Marker note="progressive-disclosure-as-nielsen-norman-group-defines-it" placement="beside" />
            </p>
            <p className="text-caption font-semibold text-muted-foreground">{t('concept.source')}</p>
            <p {...target('concept-skills')} className="flex items-center gap-1 text-caption text-muted-foreground">
              {t('concept.skills')}
              <Marker note="progressive-disclosure-as-anthropic-names-it" placement="beside" />
            </p>
          </div>
          <ol
            aria-label={t('concept.stepsLabel')}
            className="flex flex-wrap items-center gap-2 text-body font-semibold"
          >
            <li className="rounded-lg bg-foreground px-4 py-1.5 text-background">{t('concept.steps.overview')}</li>
            <ArrowRight aria-hidden className="size-5" />
            <li className="rounded-lg bg-foreground px-6 py-3 text-background">{t('concept.steps.detail')}</li>
            <ArrowRight aria-hidden className="size-5" />
            <li className="rounded-lg border-2 border-dashed border-foreground px-6 py-4">
              {t('concept.steps.extras')}
            </li>
          </ol>
        </section>
        <p className="text-caption font-semibold text-muted-foreground">{t('example')}</p>
        <ol aria-label={t('levelsLabel')} className="grid gap-4 @3xl:grid-cols-3">
          <LevelCard
            level="index"
            n={1}
            label={t('levels.index.label')}
            target={target('level-index')}
            chat={
              <>
                <p className="text-body">{t('levels.index.chat')}</p>
                <p className={cn(note, 'flex items-center gap-1')}>
                  {t('levels.index.chatNote')}
                  <Marker note="what-the-skill-index-costs" placement="beside" />
                </p>
              </>
            }
            coding={
              <>
                <p className="text-body">{t('levels.index.coding')}</p>
                <p className={code}>
                  name: {SKILL}
                  {'\n'}description: {t('description')}
                </p>
                <p className={cn(note, 'flex items-center gap-1')}>
                  {t('levels.index.codingNote')}
                  <Marker note="what-the-skill-index-costs" placement="beside" />
                </p>
              </>
            }
          />
          <LevelCard
            level="card"
            n={2}
            label={t('levels.card.label')}
            chat={
              <>
                <p className="text-body">{t('levels.card.chat')}</p>
                <p className={note}>{t('levels.card.chatNote')}</p>
              </>
            }
            coding={
              <>
                <p className="text-body">{t('levels.card.coding')}</p>
                <p className={code}>{t('levels.card.codingSteps')}</p>
              </>
            }
          />
          <LevelCard
            level="extras"
            n={3}
            label={t('levels.extras.label')}
            target={target('level-extras')}
            chat={
              <>
                <p className="text-body">{t('levels.extras.chat')}</p>
                <p className={cn(note, 'flex items-center gap-1')}>
                  {t('levels.extras.chatNote')}
                  <Marker note="scripts-documented-for-claude-only" placement="beside" />
                </p>
              </>
            }
            coding={
              <>
                <p className="text-body">{t('levels.extras.coding')}</p>
                <p className={code}>{FILES.join('\n')}</p>
                <p className={cn(note, 'flex items-center gap-1')}>
                  {t('levels.extras.codingNote')}
                  <Marker note="scripts-documented-for-claude-only" placement="beside" />
                </p>
              </>
            }
          />
        </ol>
        <div aria-hidden className="hidden grid-cols-3 justify-items-center @3xl:grid">
          <ArrowDown className="size-5" />
          <ArrowDown className="size-5" />
          <ArrowDown className="size-5" />
        </div>
        <ZoneScene
          zone="surface"
          iceberg="none"
          label={t('alt.room')}
          className={cn(styles.scene, 'aspect-[2/1] w-full rounded-2xl shadow-md')}
          overlay={
            <>
              <Badge n={1} x={60} y={242} />
              <Badge n={2} x={PROPPED.x} y={PROPPED.y} />
              <Badge n={3} x={925} y={500} />
              <div
                style={{ ...at(PROPPED.x, PROPPED.y), width: `${(PROPPED.width / SCENE_WIDTH) * 100}%` }}
                className="absolute hidden flex-col gap-0.5 p-2 text-caption leading-tight text-foreground @3xl:flex"
              >
                <span className="font-semibold">{t('art.cardTitle')}</span>
                <span>{t('art.cardSteps.0')}</span>
                <span>{t('art.cardSteps.1')}</span>
                <span>{t('art.cardSteps.2')}</span>
              </div>
              <p
                style={at(225, 640)}
                className="absolute hidden -translate-x-1/2 text-caption font-semibold whitespace-nowrap text-foreground @3xl:block"
              >
                {t('art.shelfLabel')}
              </p>
              <p
                style={at(1030, 628)}
                className="absolute hidden -translate-x-1/2 gap-2 text-caption font-semibold whitespace-nowrap text-foreground @3xl:flex"
              >
                <span>{t('art.extras.guide')}</span>
                <span>{t('art.extras.label')}</span>
                <span>{t('art.extras.preset')}</span>
              </p>
            </>
          }
        >
          <ControlRoomArt />
        </ZoneScene>
        <footer className="flex flex-col gap-2 border-t pt-4 text-caption text-muted-foreground @3xl:flex-row @3xl:justify-between">
          <p>
            <span className="font-semibold text-foreground">{t('analogy.label')}</span> {t('analogy.text')}
          </p>
          <p {...target('other-apps')} className="flex items-center gap-1">
            <InView view="chat">{t('otherApps.chat')}</InView>
            <InView view="coding">{t('otherApps.coding')}</InView>
            <Marker note="other-apps-load-in-stages-too" placement="beside" />
          </p>
        </footer>
      </SlideFrame>
    );
  },
});
