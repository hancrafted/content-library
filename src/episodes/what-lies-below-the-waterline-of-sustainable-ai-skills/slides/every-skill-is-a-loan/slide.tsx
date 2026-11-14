import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ZoneScene } from '@/episodes/components/slide-shared/iceberg/zone-scene';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { cn } from '@/shared/lib/utils';
import { CableStepper } from './cable-stepper';
import type { ClampIcon } from './clamp';
import de from './i18n/de.json';
import en from './i18n/en.json';
import styles from './loan.module.css';
import { UpkeepStack } from './upkeep-stack';

const CUNNINGHAM = { slug: 'cunningham-wycash', url: 'https://c2.com/doc/oopsla92.html' };

/** The statement's entries, day one to the latest; the overlapping description is the focal mark. */
const ENTRIES: readonly ClampIcon[] = ['written', 'sites', 'arm', 'overlap'];
const FOCAL: ClampIcon = 'overlap';
/** Where the debt sits in the Coding agent view: file lines, never translated. */
const CODE: Record<ClampIcon, readonly string[]> = {
  written: [
    '---',
    'name: collect-sediment-sample',
    'description: Use when we reach a new site',
    '  and need a sample from the seabed.',
    '---',
  ],
  sites: ['1. Check the site on the site list.', "   (the list is last season's)"],
  arm: ['Run scripts/arm-preset.py', '   (written for the old arm)'],
  overlap: [
    'collect-sediment-sample: Use when we reach a new',
    '  site and need a sample from the seabed.',
    'seabed-survey: Use when we reach a new',
    '  site and need to survey the seabed.',
  ],
};
/** One block in the stack per fix, bottom first, named as the entries are. */
const BLOCKS = ['sites', 'arm', 'overlap'] as const;

/**
 * "Every skill is a loan" (Spec Option 23b): the skill's running statement hung on the robot's cable in the Abyss,
 * beside writing weighed against keeping it right, and Ward Cunningham's technical debt. Keeps `vertical-stepper` as a
 * copy, every step open at rest; keeps `motion: local`, the statement growing one entry at a time.
 */
export const everySkillIsALoan = slide({
  slug: 'every-skill-is-a-loan',
  messages: { en, de },
  presentation: atDepth(7, 'page'),
  notes: [{ slug: 'skill-upkeep-as-technical-debt', target: 'debt', sources: [CUNNINGHAM] }],
  segments: [{ slug: 'quick-to-write' }, { slug: 'a-running-tab' }, { slug: 'owning-thirty' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8 gap-6">
      <ZoneScene
        zone="abyss"
        className={cn('rounded-2xl', styles.stage)}
        overlay={
          <div className="grid gap-6 p-5 pb-20 @4xl:grid-cols-12 @4xl:gap-8 @4xl:p-8 @4xl:pb-28">
            <div className="@4xl:col-span-7">
              <CableStepper
                label={t('statement')}
                robotLabel={t('alt.robot')}
                next={{ label: t('next.label'), count: t('next.count') }}
                entries={ENTRIES.map((key) => ({
                  key,
                  month: t(`entries.${key}.month`),
                  term: t(`entries.${key}.term`),
                  scene: t(`entries.${key}.scene`),
                  chat: t(`entries.${key}.chat`),
                  coding: { lead: t(`coding.${key}.lead`), code: CODE[key] },
                  iconLabel: t(`alt.icons.${key}`),
                  focal: key === FOCAL,
                }))}
              />
            </div>
            <div className="flex flex-col gap-6 @4xl:col-span-5">
              <UpkeepStack
                label={t('stack.label')}
                alt={t('alt.stack')}
                writing={{ label: t('stack.writing'), hint: t('stack.writingHint') }}
                keeping={{ label: t('stack.keeping'), hint: t('stack.keepingHint') }}
                blocks={BLOCKS.map((key) => ({ key, label: t(`stack.blocks.${key}`) }))}
                next={{ key: 'next', label: t('stack.blocks.next') }}
                note={t('stack.note')}
              />
              <aside {...target('debt')} className={cn('rounded-xl p-5', styles.glass)}>
                <p className="flex items-center gap-2 text-body font-semibold">
                  {t('debt.term')}
                  <Marker note="skill-upkeep-as-technical-debt" placement="beside" />
                </p>
                <p className="mt-2 text-body">{t('debt.quote')}</p>
                <p className={cn('mt-2 text-caption', styles.soft)}>{t('debt.source')}</p>
              </aside>
            </div>
          </div>
        }
      />
      <p className="text-body font-semibold">{t('thirty')}</p>
      <footer className="border-t border-border pt-4">
        <p className="max-w-xl text-caption text-muted-foreground">
          <span className="font-semibold text-foreground">{t('story')}</span> {t('analogy')}
        </p>
      </footer>
    </SlideFrame>
  ),
});
