import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { DiveScene, type DiveOutcome, type DiveReader } from './dive-scene';
import de from './i18n/de.json';
import en from './i18n/en.json';

const LEHMAN = { slug: 'lehman-ramil-wernick-laws', url: 'https://users.ece.utexas.edu/~perry/work/papers/feast1.pdf' };
const HERRAIZ = { slug: 'herraiz-laws-review', url: 'https://doi.org/10.1145/2543581.2543595' };
const GODFREY = { slug: 'godfrey-tu-linux', url: 'https://plg2.cs.uwaterloo.ca/~migod/papers/2000/icsm00.pdf' };
const ANTHROPIC = {
  slug: 'anthropic-prompting-best-practices',
  url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
};
const OPENAI = {
  slug: 'openai-gpt-4-1-prompting-guide',
  url: 'https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide',
};
const SQUIRE_HM = { slug: 'squire-legacy-of-hm', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2649674/' };
const SQUIRE_SYSTEMS = { slug: 'squire-memory-systems', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4355270/' };
const SWE_SKILLS = { slug: 'swe-skills-bench', url: 'https://arxiv.org/abs/2603.15401' };

/** The skill file both dives read, in the Coding agent view: path and front matter are code, never translated. */
const SKILL_PATH = 'collect-sediment-sample/SKILL.md';
const FRONT_MATTER = [
  '---',
  'name: collect-sediment-sample',
  'description: Use when we reach a new site',
  '  and need a sample from the seabed.',
  '---',
  '…',
];

/** The two halves: what changed the reader, the dive it gave, and who reads the card in the porthole. */
const HALVES: readonly { half: 'update' | 'switch'; outcome: DiveOutcome; reader: DiveReader }[] = [
  { half: 'update', outcome: 'short', reader: 'same-pilot' },
  { half: 'switch', outcome: 'silt', reader: 'other-school' },
];

/**
 * "The model changes, the skill doesn't" (Spec Option 24a): the same skill card drops into two dives that end apart,
 * a model update and a different model or agent, beside Lehman's laws and the note on new readers. Keeps `grid-1x2`
 * as a copy holding one Scene per half; keeps `motion: local`, both robots descending once.
 */
export const theModelChangesTheSkillDoesnT = slide({
  slug: 'the-model-changes-the-skill-doesn-t',
  messages: { en, de },
  presentation: atDepth(7, 'page'),
  captionNote: 'each-model-reads-instructions-differently',
  notes: [
    { slug: 'lehmans-laws-and-their-limits', target: 'lehman', sources: [LEHMAN, HERRAIZ, GODFREY] },
    { slug: 'each-model-reads-instructions-differently', target: 'caption', sources: [ANTHROPIC, OPENAI] },
    { slug: 'model-memory-and-patient-hm', target: 'analogy-only', sources: [SQUIRE_HM, SQUIRE_SYSTEMS] },
    { slug: 'the-agent-changes-the-skill-too', target: 'switch', sources: [SWE_SKILLS] },
  ],
  segments: [{ slug: 'not-the-only-pilot' }, { slug: 'update-and-switch' }, { slug: 'hand-over-the-verdict' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-8">
      <ZoneCard className="mx-auto flex w-full max-w-md flex-col gap-2 rounded-xl p-5 shadow-md">
        <p className="flex items-center justify-between gap-4">
          <InView view="chat" className="text-caption text-muted-foreground">
            {t('card.label')}
          </InView>
          <InView view="coding" className="font-mono text-caption text-muted-foreground">
            {SKILL_PATH}
          </InView>
          <span className="shrink-0 rounded-full border border-border px-2 text-caption font-semibold">
            {t('card.same')}
          </span>
        </p>
        <InView view="chat" as="div">
          <p className="text-body font-semibold">{t('card.name')}</p>
          <p className="text-caption text-muted-foreground">{t('card.description')}</p>
        </InView>
        <InView view="coding" as="div" className="font-mono text-caption">
          {FRONT_MATTER.map((line) => (
            <span key={line} translate="no" className="block whitespace-pre-wrap">
              {line}
            </span>
          ))}
        </InView>
        <p className="rounded-lg border border-border bg-muted px-3 py-2 text-body font-semibold">{t('card.step')}</p>
      </ZoneCard>
      <div className="focus-group focus-group--dim-others grid gap-6 @3xl:grid-cols-2">
        {HALVES.map(({ half, outcome, reader }) => (
          <section
            key={half}
            {...(half === 'switch' ? target('switch') : {})}
            className="focus-group__item flex flex-col gap-3 rounded-xl border border-border p-4"
          >
            <p className="text-body font-semibold">{t(`halves.${half}.term`)}</p>
            <p className="text-body">
              <InView view="chat">{t(`halves.${half}.text`)}</InView>
              <InView view="coding">{t.rich(`halves.${half}.coding`)}</InView>
              {half === 'switch' ? <Marker note="the-agent-changes-the-skill-too" placement="beside" /> : null}
            </p>
            <InView view="coding" as="p" className="flex flex-wrap gap-x-4 font-mono text-caption">
              <span>
                {SKILL_PATH} <b className="font-semibold">{t('unchanged')}</b>
              </span>
              <span>
                {t(`halves.${half}.changed`)} <b className="font-semibold">{t(`halves.${half}.changedValue`)}</b>
              </span>
            </InView>
            <DiveScene
              outcome={outcome}
              reader={reader}
              label={t(`alt.${half}`)}
              labels={{ today: t(`art.${outcome}`), yesterday: t('art.yesterday') }}
            />
          </section>
        ))}
      </div>
      <div className="grid gap-6 @3xl:grid-cols-2">
        <aside {...target('lehman')} className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <p className="flex flex-wrap items-center gap-2 text-body font-semibold">
            <span className="rounded-full border border-border px-2 text-caption font-normal">
              {t('lehman.didYouKnow')}
            </span>
            {t('lehman.term')}
            <Marker note="lehmans-laws-and-their-limits" placement="beside" />
          </p>
          <p className="text-body">{t('lehman.text')}</p>
          <p className="text-caption text-muted-foreground">{t('lehman.dispute')}</p>
        </aside>
        <aside className="flex flex-col gap-2 rounded-xl border border-border p-4">
          <p className="flex items-center gap-2 text-body font-semibold">
            {t('reader.title')}
            <Marker note="each-model-reads-instructions-differently" placement="beside" />
          </p>
          <InView view="chat" as="p" className="text-body">
            {t('reader.chat')}
          </InView>
          <InView view="coding" as="p" className="text-body">
            {t('reader.coding')}
          </InView>
        </aside>
      </div>
      <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
        <p className="max-w-md text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('story')}</span> {t('analogy')}
        </p>
        <p
          {...target('analogy-only')}
          className="flex max-w-xl items-start gap-1 text-caption text-muted-foreground @4xl:text-right"
        >
          <span>{t('analogyOnly')}</span>
          <Marker note="model-memory-and-patient-hm" placement="beside" />
        </p>
      </footer>
    </SlideFrame>
  ),
});
