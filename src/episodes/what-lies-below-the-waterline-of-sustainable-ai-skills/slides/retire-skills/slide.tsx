import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { InView } from '@/episodes/components/slide-shared/agent-view/in-view';
import { ZoneCard } from '@/episodes/components/slide-shared/iceberg/zone-card';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { NightRoom } from './night-room';
import styles from './retire.module.css';
import { AfterIndex, ArchiveCrate, BeforeIndex, TaskLog } from './sheets';

const KCS = {
  slug: 'kcs-v6-article-state',
  url: 'https://library.serviceinnovation.org/KCS/KCS_v6/KCS_v6_Practices_Guide/030/040/010/030',
};
const ENTERPRISE = {
  slug: 'anthropic-skills-enterprise',
  url: 'https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise',
};

/**
 * Slide 9's index lines in its order, each by its skill folder (code, never translated) and its uses this season; 0
 * is unused. The counts are the scene's, not data.
 */
const BEFORE = [
  ['rinse-camera-dome', 2],
  ['sample-old', 0],
  ['take-sample-v2', 0],
  ['name-photo-folders', 4],
  ['sediment-quick', 0],
  ['sample-like-ana', 0],
  ['collect-sediment-sample', 6],
  ['sample-but-faster', 0],
  ['tuesday-weather-note', 3],
  ['clean-arm-maybe', 0],
  ['collect-sediment-sample-copy', 0],
  ['log-depth-draft', 0],
  ['crew-coffee-order', 5],
  ['check-winch-again', 2],
  ['sample-v3', 0],
  ['label-cores-alt', 0],
  ['dive-log-short', 5],
] as const;
const NEEDED = 'collect-sediment-sample';
/** The season's tasks the log shows, each with the skill it used. */
const LOG = [
  ['k4', 'collect-sediment-sample'],
  ['photos', 'name-photo-folders'],
  ['briefing', 'crew-coffee-order'],
  ['m5', 'collect-sediment-sample'],
] as const;
const RETIRED_CARDS = 5;

/**
 * "Retire skills" (Spec Option 25b): the control room at night, the skill index read against the season's task log,
 * the unused skills into a dated archive crate and the short index left behind, the one you need back in view.
 * Overrules `grid-1x2` for one flow across the room; keeps `motion: local`, the index closing up once on entry.
 */
export const retireSkills = slide({
  slug: 'retire-skills',
  messages: { en, de },
  presentation: atDepth(7, 'page'),
  notes: [{ slug: 'retire-a-skill-archive-over-delete', target: 'archive', sources: [KCS, ENTERPRISE] }],
  segments: [{ slug: 'read-the-log' }, { slug: 'the-archive-box' }, { slug: 'short-index-again' }],
  content: ({ t, target, Marker }) => {
    const byView = (key: 'heading' | 'count', sheet: 'before' | 'after') => ({
      chat: t(`${sheet}.${key}.chat`),
      coding: t(`${sheet}.${key}.coding`),
    });
    return (
      <SlideFrame className="@container mt-8 gap-6">
        <ZoneScene
          zone="abyss"
          label={t('alt.scene')}
          className={cn('rounded-2xl', styles.room)}
          overlay={
            <div className="focus-group focus-group--dim-others grid items-start gap-5 p-5 @4xl:grid-cols-3 @4xl:p-6">
              <BeforeIndex
                heading={byView('heading', 'before')}
                count={byView('count', 'before')}
                season={t('season')}
                more={t('before.more')}
                lines={BEFORE.map(([folder, uses]) => ({
                  folder,
                  uses,
                  label: t(`index.${folder}`),
                  usesLabel: uses === 0 ? t('before.unused') : t('before.uses', { count: uses }),
                }))}
              />
              <div className="flex flex-col gap-5">
                <TaskLog
                  heading={t('log.heading')}
                  season={t('season')}
                  more={t('log.more')}
                  rows={LOG.map(([key, folder]) => ({
                    key,
                    date: t(`log.rows.${key}.date`),
                    task: t(`log.rows.${key}.task`),
                    skill: { chat: t(`index.${folder}`), coding: folder },
                  }))}
                />
                <ArchiveCrate
                  cards={RETIRED_CARDS}
                  lines={(['title', 'count', 'restore'] as const).map((line) => ({
                    chat: t(`archive.chat.${line}`),
                    coding: t(`archive.coding.${line}`),
                  }))}
                />
                <p className={cn('text-center text-caption font-semibold', styles.ink)}>{t('closesUp')} →</p>
              </div>
              <AfterIndex
                heading={byView('heading', 'after')}
                count={byView('count', 'after')}
                neededLabel={t('after.needed')}
                callback={t('after.callback')}
                lines={BEFORE.filter(([, uses]) => uses > 0).map(([folder]) => ({
                  folder,
                  label: t(`index.${folder}`),
                  needed: folder === NEEDED,
                }))}
              />
            </div>
          }
        >
          <NightRoom />
        </ZoneScene>
        <div className="grid gap-6 @4xl:grid-cols-3">
          <ZoneCard className="flex flex-col gap-2 rounded-xl p-4 shadow-md">
            <p className="text-body font-semibold">{t('callouts.method.heading')}</p>
            <InView view="chat" as="p" className="text-body">
              {t('callouts.method.body')}
            </InView>
            <InView view="coding" as="p" className="text-body">
              {t.rich('callouts.method.bodyCoding')}
            </InView>
            <InView view="chat" as="p" className="text-caption text-muted-foreground">
              {t('callouts.method.sub')}
            </InView>
            <InView view="coding" as="p" className="text-caption text-muted-foreground">
              {t('callouts.method.subCoding')}
            </InView>
          </ZoneCard>
          {(['archive', 'when'] as const).map((callout) => (
            <aside
              key={callout}
              {...(callout === 'archive' ? target('archive') : {})}
              className="flex flex-col gap-2 p-1"
            >
              <p className="flex flex-wrap items-center gap-2 text-body font-semibold">
                <span className="rounded-full border border-border px-2 text-caption font-normal">
                  {t('didYouKnow')}
                </span>
                {t(`callouts.${callout}.heading`)}
              </p>
              <p className="text-caption text-muted-foreground">
                {t(`callouts.${callout}.body`)} <Marker note="retire-a-skill-archive-over-delete" placement="beside" />
              </p>
            </aside>
          ))}
        </div>
        <footer className="border-t border-border pt-4">
          <p className="max-w-xl text-caption text-muted-foreground">
            <span className="font-semibold text-foreground">{t('story')}</span> {t('analogy')}
          </p>
        </footer>
      </SlideFrame>
    );
  },
});
