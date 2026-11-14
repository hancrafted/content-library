import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import { ControlRoom, PILL_PLACES } from './control-room';
import { HomeCard } from './home-card';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { VERDICT_DELAY } from './motion';
import styles from './where.module.css';

const NNG = 'information-architecture-as-nielsen-norman-group-defines-it';
const AUTHORS = 'information-architecture-in-its-authors-words';
const TOKENS = 'every-line-of-a-loaded-skill-is-a-recurring-token-cost';

/** The three homes' files in the Coding agent view, and the lines holding the depth: code, so never translated. */
const SKILL_FILE = 'collect-sediment-sample/SKILL.md';
const PROJECT_FILE = 'AGENTS.md';
const CONTEXT_FILE = 'CONTEXT.md';
const CODE = {
  skill: [['## Steps', '1. Check the arm and tubes.', '2. Descend to 40 m.']],
  instructions: [['## Dive sites', '- Site 4: 40 m', '- Site 7: 120 m']],
  file: [
    ['# SKILL.md, step 2', 'Descend to the depth', 'in CONTEXT.md.'],
    ['# CONTEXT.md', 'Site 4: 40 m'],
  ],
} as const;
/** The card's steps by role (FE-002 §5.1); step 2's depth is the dashed slot. */
const STEPS = ['check-gear', 'descend', 'lower-arm', 'identify'] as const;

/**
 * "What context goes where" (Spec Option 14a): the information-architecture concept card, then the control room with
 * one fact, today's site depth, and its three homes, each numbered by a pin, and the three home cards beneath in one
 * row with their plain costs. No home wins; the focal mark is the verdict line. `master: grid-1x2` is overruled to a
 * Scene, as the build notes say; `motion: local` is kept: the depth note travels from the card's slot onto the dive
 * plan, then the verdict lights; at rest the note sits on the plan.
 */
export const whatGoesWhereIsInformationArchitecture = slide({
  slug: 'what-goes-where-is-information-architecture',
  messages: { en, de },
  presentation: atDepth(4, 'page'),
  notes: [
    {
      slug: NNG,
      target: 'ia-callout',
      sources: [
        { slug: 'nngroup-ia-vs-sitemaps', url: 'https://www.nngroup.com/articles/information-architecture-sitemaps/' },
      ],
    },
    {
      slug: AUTHORS,
      target: 'ia-callout',
      sources: [
        {
          slug: 'rosenfeld-part-one',
          url: 'https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/part01.html',
        },
        {
          slug: 'rosenfeld-chapter-two',
          url: 'https://www.oreilly.com/library/view/information-architecture-4th/9781491913529/ch02.html',
        },
      ],
    },
    {
      slug: TOKENS,
      target: 'homes',
      sources: [
        { slug: 'claude-code-skills', url: 'https://code.claude.com/docs/en/skills' },
        { slug: 'agent-skills-best-practices', url: 'https://agentskills.io/skill-creation/best-practices' },
      ],
    },
  ],
  segments: [{ slug: 'a-home-for-each-fact' }, { slug: 'three-costs' }, { slug: 'three-homes' }],
  content: ({ t, marker, target }) => {
    const tokens = { marker: marker(TOKENS) };
    const rows = { load: t('rows.load'), fit: t('rows.fit') };
    const marks = { cost: t('marks.cost'), benefit: t('marks.benefit') };
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <aside
          {...target('ia-callout')}
          aria-label={t('iaCallout.label')}
          className="rounded-xl border-l-4 border-primary bg-card px-5 py-4 text-card-foreground shadow-md"
        >
          <p className="text-caption font-semibold text-muted-foreground uppercase">{t('iaCallout.label')}</p>
          <p className="mt-1 text-body">{t.rich('iaCallout.quote', { marker: marker(NNG) })}</p>
          <p className="mt-1 text-caption text-muted-foreground">{t('iaCallout.source')}</p>
        </aside>
        <ZoneScene
          zone="twilight"
          iceberg="none"
          label={t('alt.room')}
          className="aspect-[2/1] w-full rounded-2xl shadow-md"
          overlay={
            <InView view="coding" as="div" className="pointer-events-none absolute inset-0 hidden @3xl:block">
              {[SKILL_FILE, t('pills.instructions'), CONTEXT_FILE].map((path, index) => (
                <span
                  key={path}
                  data-path
                  translate="no"
                  style={PILL_PLACES[index]}
                  className="absolute -translate-x-1/2 rounded-full bg-foreground px-2 py-0.5 font-mono text-caption whitespace-nowrap text-background"
                >
                  {path}
                </span>
              ))}
            </InView>
          }
        >
          <ControlRoom
            brief={{ title: t('art.brief'), slot: t('art.slot') }}
            card={{ title: t('art.card.title'), steps: STEPS.map((step) => t(`art.card.steps.${step}`)) }}
            plan={{ title: t('art.plan'), hint: t('art.planHint') }}
            note={t('art.note')}
          />
        </ZoneScene>
        <ol
          {...target('homes')}
          aria-label={t('homesLabel')}
          className="focus-group focus-group--dim-others grid gap-4 @3xl:grid-cols-3"
        >
          <HomeCard
            n="1"
            term={t('homes.skill.term')}
            scene={t('homes.skill.scene')}
            load={{ good: false, text: t.rich('homes.skill.load', tokens) }}
            fit={{ good: false, text: t('homes.skill.fit') }}
            rows={rows}
            marks={marks}
            coding={{ path: SKILL_FILE, lead: t('homes.skill.lead'), code: CODE.skill }}
          />
          <HomeCard
            n="2"
            term={t('homes.instructions.term')}
            scene={t('homes.instructions.scene')}
            load={{ good: false, text: t.rich('homes.instructions.load', tokens) }}
            fit={{ good: true, text: t('homes.instructions.fit') }}
            rows={rows}
            marks={marks}
            coding={{ path: PROJECT_FILE, lead: t('homes.instructions.lead'), code: CODE.instructions }}
          />
          <HomeCard
            n="3"
            term={t('homes.file.term')}
            scene={t('homes.file.scene')}
            load={{ good: true, text: t('homes.file.load') }}
            fit={{ good: true, text: t('homes.file.fit') }}
            rows={rows}
            marks={marks}
            coding={{ path: CONTEXT_FILE, lead: t('homes.file.lead'), code: CODE.file }}
          />
        </ol>
        <p
          data-verdict
          data-motion="late"
          style={VERDICT_DELAY}
          className={cn(
            styles.late,
            'rounded-xl border-l-4 border-primary bg-card px-5 py-3 text-body text-card-foreground shadow-md',
          )}
        >
          {t('verdict.lead')} <span className="font-semibold">{t('verdict.emphasis')}</span>
        </p>
        <p className="max-w-md border-t border-border pt-4 text-caption text-foreground">
          <span className="font-semibold text-foreground">{t('analogyLead')}</span> {t('analogy')}
        </p>
      </SlideFrame>
    );
  },
});
