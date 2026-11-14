import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { DescriptionCard } from './description-card';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ManualIndex } from './manual-index';
import { ControlRoom } from './room';

const OPTIMIZING = {
  slug: 'agent-skills-optimizing-descriptions',
  url: 'https://agentskills.io/skill-creation/optimizing-descriptions',
};
const PIROLLI = { slug: 'pirolli-card-information-foraging', url: 'https://doi.org/10.1037/0033-295X.106.4.643' };

/** The index rows, in the mock's order; two vague among the clear ones, the sediment sample the focal entry. */
const ENTRIES = [
  { slug: 'samples', vague: true },
  { slug: 'collect-sediment-sample', vague: false },
  { slug: 'misc-procedures', vague: true },
  { slug: 'run-camera-survey', vague: false },
] as const;
const FOCAL = 'collect-sediment-sample';
/** Both descriptions are drafts of the same skill file. */
const SKILL_PATH = 'collect-sediment-sample/SKILL.md';

/**
 * "The description is the trigger" (Spec Option 11a): the control room from the pilot's chair, the manual's index open
 * in front of every closed card. Overrules `grid-1x2` for one picture with its close-up, the art on top and an 8 + 4
 * grid below; keeps `motion: local`, the clear entry lighting up as the captain names the task.
 */
export const theDescriptionIsAllTheAiSees = slide({
  slug: 'the-description-is-all-the-ai-sees',
  messages: { en, de },
  presentation: atDepth(3, 'page'),
  captionNote: 'description-carries-the-whole-burden',
  notes: [
    { slug: 'description-carries-the-whole-burden', target: 'caption', sources: [OPTIMIZING] },
    { slug: 'descriptions-and-information-scent', target: 'scent', sources: [PIROLLI] },
  ],
  segments: [{ slug: 'the-pilots-view' }, { slug: 'two-entries' }, { slug: 'scent' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div className="grid gap-4">
        <ZoneScene
          zone="sunlit"
          iceberg="none"
          label={t('alt.scene')}
          className="aspect-[2/1] w-full rounded-2xl shadow-md @5xl:col-start-1 @5xl:row-start-1"
        >
          <ControlRoom says={t('task.text')} />
        </ZoneScene>
        <ManualIndex
          className="@5xl:col-start-1 @5xl:row-start-1 @5xl:mt-[3%] @5xl:mr-[5%] @5xl:w-[36%] @5xl:self-start @5xl:justify-self-end"
          heading={t('index.heading')}
          headingNote={t('index.headingNote')}
          headingCoding={t('index.headingCoding')}
          loaded={{ chat: t('pills.loaded'), coding: t('pills.loadedCoding') }}
          closed={{ chat: t('pills.closed'), coding: t('pills.closedCoding') }}
          entries={ENTRIES.map(({ slug, vague }) => ({
            slug,
            vague,
            focal: slug === FOCAL,
            name: t(`index.entries.${slug}.name`),
            description: t(`index.entries.${slug}.description`),
          }))}
        />
      </div>
      <div className="grid gap-6 @4xl:grid-cols-12">
        <div className="flex flex-col gap-3 @4xl:col-span-8">
          <p className="text-body font-semibold">{t('question')}</p>
          <div className="focus-group focus-group--dim-others grid gap-4 @xl:grid-cols-2">
            {(['vague', 'clear'] as const).map((kind) => (
              <DescriptionCard
                key={kind}
                kind={kind}
                label={t(`descriptions.${kind}.label`)}
                tag={t(`descriptions.${kind}.tag`)}
                text={t('descriptions.quoted', { text: t(`descriptions.${kind}.text`) })}
                coding={{ path: SKILL_PATH, name: FOCAL, description: t(`descriptions.${kind}.coding`) }}
              />
            ))}
          </div>
        </div>
        <aside {...target('scent')} className="flex flex-col gap-2 self-end rounded-xl bg-card p-4 @4xl:col-span-4">
          <p className="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
            {t('scent.title')}
            <Marker note="descriptions-and-information-scent" placement="beside" />
          </p>
          <p className="text-caption text-muted-foreground">
            {t.rich('scent.text', { b: (chunks) => <b className="font-semibold text-foreground">{chunks}</b> })}
          </p>
          <p className="text-caption text-muted-foreground">{t('scent.source')}</p>
        </aside>
      </div>
      <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
        <p className="max-w-md text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
        </p>
        <p className="flex max-w-xl items-start gap-1 text-caption text-muted-foreground @4xl:text-right">
          <span>
            <InView view="chat">{t('footer.quote')}</InView>
            <InView view="coding">{t.rich('footer.coding')}</InView>
          </span>
          <Marker note="description-carries-the-whole-burden" placement="beside" />
        </p>
      </footer>
    </SlideFrame>
  ),
});
