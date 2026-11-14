import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { PersonalCopy, Readers, SharedCopy } from './copies';
import { FieldCard } from './field-card';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ControlRoom } from './room';

const ENTERPRISE = {
  slug: 'anthropic-skills-for-enterprise',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise',
};
const KCS = {
  slug: 'kcs-v6-article-state',
  url: 'https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030',
};
const SPECIFICATION = { slug: 'agent-skills-specification', url: 'https://agentskills.io/specification' };

/** The control block's three fields, with their `metadata` keys in the Coding agent view. */
const FIELDS = [
  { slug: 'owner', codingKey: 'owner' },
  { slug: 'version', codingKey: 'version' },
  { slug: 'review', codingKey: 'next-review' },
] as const;
/** The three AIs that run the shared skill; every one runs the version the control block names. */
const READERS = ['yours', 'colleague', 'otherTeam'] as const;
/** The skill both copies hold, by its folder name. */
const SKILL = 'collect-sediment-sample';

/**
 * "Shared skills are knowledge articles" (Spec Option 20b): the control room at Midnight, your notebook in your hand,
 * the same skill in the fleet manual with its control block stamped on, and the dotted reach to three AIs running
 * version 1.3. Overrules `grid-1x2` for one room drawing and a three-card row; keeps `motion: local`, the control block
 * stamping onto the page, then the reach lines drawing in, once.
 */
export const sharedSkillsAreKnowledgeArticles = slide({
  slug: 'shared-skills-are-knowledge-articles',
  messages: { en, de },
  presentation: atDepth(6, 'page'),
  notes: [
    { slug: 'a-skill-registry-entry', target: 'owner', sources: [ENTERPRISE] },
    { slug: 'a-skill-review-date-is-an-adaptation', target: 'review', sources: [KCS] },
    {
      slug: 'the-agent-skills-format-has-no-owner-field',
      target: 'format',
      sources: [SPECIFICATION, ENTERPRISE],
    },
  ],
  segments: [{ slug: 'your-notebook' }, { slug: 'into-the-fleet-manual' }, { slug: 'why' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <div className="relative grid gap-4">
        <ZoneScene
          zone="midnight"
          iceberg="none"
          label={t('alt.scene')}
          className="aspect-[2/1] w-full rounded-2xl shadow-md"
        >
          <ControlRoom />
        </ZoneScene>
        <div className="grid gap-4 @xl:grid-cols-2 @5xl:contents">
          <PersonalCopy
            pill={t('pills.personal')}
            sub={t('personalSub')}
            className="@5xl:absolute @5xl:top-[26%] @5xl:left-[7%]"
          />
          <SharedCopy
            pill={t('pills.shared')}
            heading={t('controlBlock')}
            slug={SKILL}
            skill={{ name: t('skill.name'), description: t('skill.description'), step: t('skill.step') }}
            fields={FIELDS.map(({ slug, codingKey }) => ({
              key: t(`fields.${slug}.key`),
              value: t(`fields.${slug}.value`),
              codingKey,
            }))}
            className="@xl:row-span-2 @5xl:absolute @5xl:top-[29%] @5xl:left-[28.5%] @5xl:w-[29%]"
          />
          <Readers
            className="@5xl:contents"
            readers={READERS.map((who) => ({
              who: { chat: t(`who.${who}.chat`), coding: t(`who.${who}.coding`) },
              runs: t('runs'),
              version: t('fields.version.value'),
            }))}
          />
        </div>
      </div>
      <ul className="focus-group focus-group--dim-others grid gap-4 @3xl:grid-cols-3">
        <FieldCard
          {...target('owner')}
          name={t('fields.owner.key')}
          value={t('fields.owner.value')}
          codingKey="owner"
          job={t('fields.owner.job')}
          source={
            <>
              {t('fields.owner.source')} <Marker note="a-skill-registry-entry" placement="beside" />
            </>
          }
        />
        <FieldCard
          name={t('fields.version.key')}
          value={t('fields.version.value')}
          codingKey="version"
          job={t('fields.version.job')}
        />
        <FieldCard
          name={t('fields.review.key')}
          value={t('fields.review.value')}
          codingKey="next-review"
          job={
            <span {...target('review')}>
              {t('fields.review.job')} <Marker note="a-skill-review-date-is-an-adaptation" placement="beside" />
            </span>
          }
          source={
            <>
              {t('fields.review.source')}{' '}
              <Marker note="the-agent-skills-format-has-no-owner-field" placement="beside" />
            </>
          }
        />
      </ul>
      <p className="text-caption text-muted-foreground">{t('personalNote')}</p>
      <p className="flex items-center gap-3 text-body font-semibold">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-caption text-primary-foreground">
          3
        </span>
        {t('thirdStep')}
      </p>
      <footer className="flex flex-col gap-4 border-t border-border pt-4 @4xl:flex-row @4xl:items-start @4xl:justify-between @4xl:gap-10">
        <p className="max-w-md text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('footer.story')}</span> {t('analogy')}
        </p>
        <p {...target('format')} className="max-w-xl text-caption text-muted-foreground @4xl:text-right">
          {t.rich('formatNote', { code: (chunks) => <code className="font-mono text-foreground">{chunks}</code> })}{' '}
          <Marker note="the-agent-skills-format-has-no-owner-field" placement="beside" />
        </p>
      </footer>
    </SlideFrame>
  ),
});
