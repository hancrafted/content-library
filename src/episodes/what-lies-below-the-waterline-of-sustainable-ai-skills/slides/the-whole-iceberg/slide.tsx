import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import type { Zone } from '@/episodes/components/slide-shared/iceberg/ruler.pure';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { DeckScene } from './deck-scene';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { TakeawayRows, type TakeawayLine } from './takeaway-rows';

const ENTERPRISE = {
  slug: 'anthropic-skills-enterprise',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise',
};
const SKILLDEX = { slug: 'skilldex', url: 'https://arxiv.org/abs/2604.16911' };

/** The zones from the Surface down, and which takeaway line carries which of the three steps. */
const ZONES: readonly Zone[] = ['surface', 'sunlit', 'twilight', 'midnight', 'abyss'];
const STEPS: Partial<Record<Zone, readonly [TakeawayLine['step'], TakeawayLine['step']]>> = {
  sunlit: [1, 2],
  midnight: [3, undefined],
};
/** The short index: the skill named by its moment, and the two skills Slide 19 shows. Names are code. */
const FOCAL_SKILL = 'collect-sediment-sample';
const OTHER_SKILLS = ['grilling', 'domain-modeling'] as const;
const SKILL_HOME = '~/.claude/skills/<name>/';
const FRONT_MATTER = [
  '---',
  `name: ${FOCAL_SKILL}`,
  'description: Takes a sediment core. Use when',
  '  we reach a new site and need a sample from the',
  '  seabed.',
  '---',
];
const CALLS = [`Claude Code: /${FOCAL_SKILL}`, `Codex: $${FOCAL_SKILL}`];

/**
 * "The whole iceberg" (Spec Option 26a): the depth from the Surface to the Abyss with each Section's takeaway at its
 * depth, the ship on top with the robot back on deck and the manual open at a short index, and the three steps below.
 * Overrules `horizontal-rail` for a Scene; keeps `motion: local`, each row lighting as the robot rises past it.
 */
export const theWholeIceberg = slide({
  slug: 'the-whole-iceberg',
  messages: { en, de },
  presentation: atDepth(7, 'page'),
  notes: [{ slug: 'skill-governance-settled-and-not', target: 'governance', sources: [ENTERPRISE, SKILLDEX] }],
  segments: [{ slug: 'three-steps' }, { slug: 'the-honest-caveat' }, { slug: 'your-first-card' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div className="overflow-hidden rounded-2xl shadow-md">
        <div className="relative">
          <div className="aspect-[120/37] overflow-hidden">
            <DeckScene label={t('alt')} />
          </div>
          <ZoneCard className="m-3 flex flex-col gap-1.5 rounded-lg p-4 shadow-md @3xl:absolute @3xl:top-4 @3xl:left-4 @3xl:m-0 @3xl:w-[38%]">
            <InView view="chat" as="p" className="flex flex-col">
              <span className="text-body font-semibold">{t('index.title')}</span>
              <span className="text-caption text-muted-foreground">{t('index.lead')}</span>
            </InView>
            <InView view="coding" as="p" className="flex flex-col">
              <span translate="no" className="font-mono text-caption font-semibold">
                ~/.claude/skills/{FOCAL_SKILL}/
              </span>
              <span className="text-caption text-muted-foreground">{t('index.codingLead')}</span>
            </InView>
            <ul className="flex flex-col gap-1">
              <li data-index-entry={FOCAL_SKILL} className="flex flex-col">
                <InView view="chat" className="font-mono text-caption font-semibold">
                  {FOCAL_SKILL}
                </InView>
                <InView view="chat" className="text-caption">
                  {t('index.description')}
                </InView>
                <InView view="coding" as="span" className="font-mono text-caption">
                  {FRONT_MATTER.map((line) => (
                    <span key={line} className="block whitespace-pre-wrap">
                      {line}
                    </span>
                  ))}
                </InView>
              </li>
              {OTHER_SKILLS.map((name) => (
                <li
                  key={name}
                  data-index-entry={name}
                  translate="no"
                  className="font-mono text-caption text-muted-foreground"
                >
                  {name}
                </li>
              ))}
            </ul>
            <InView view="coding" as="p" className="flex flex-col font-mono text-caption">
              {CALLS.map((call) => (
                <span key={call}>{call}</span>
              ))}
            </InView>
          </ZoneCard>
        </div>
        <TakeawayRows
          label={t('takeaways')}
          rows={ZONES.map((zone) => {
            const steps = STEPS[zone];
            return {
              zone,
              name: t(`zones.${zone}.name`),
              lines: [
                { text: t(`zones.${zone}.line1`), step: steps?.[0] },
                { text: t(`zones.${zone}.line2`), step: steps?.[1] },
              ],
              marker:
                zone === 'midnight' ? <Marker note="skill-governance-settled-and-not" placement="beside" /> : undefined,
            };
          })}
        />
      </div>
      <ol className="grid gap-4 @3xl:grid-cols-3">
        {([0, 1, 2] as const).map((step) => (
          <li key={step} {...(step === 2 ? target('governance') : {})}>
            <ZoneCard className="card-hover card-hover--raise flex h-full flex-col gap-3 rounded-xl p-5 shadow-md">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-body font-semibold text-primary-foreground">
                {step + 1}
              </span>
              <p className="text-body font-semibold">
                {t(`steps.${step}.text`)}
                {step === 2 ? <Marker note="skill-governance-settled-and-not" placement="beside" /> : null}
              </p>
              <InView view="coding" as="p" className="text-caption text-muted-foreground">
                {step === 0 ? t('steps.0.agent', { path: SKILL_HOME }) : t.rich(`steps.${step}.agent`)}
              </InView>
            </ZoneCard>
          </li>
        ))}
      </ol>
      <footer className="border-t border-border pt-4">
        <p className="max-w-xl text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('story')}</span> {t('analogy')}
        </p>
      </footer>
    </SlideFrame>
  ),
});
