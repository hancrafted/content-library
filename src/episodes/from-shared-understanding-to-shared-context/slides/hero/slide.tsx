import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AimBoard } from './aim-board';
import styles from './hero.module.css';
import de from './i18n/de.json';
import en from './i18n/en.json';

const HITS = [
  { x: 346, y: 196 },
  { x: 368, y: 190 },
  { x: 354, y: 220 },
  { x: 376, y: 214 },
] as const;

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  presentation: {
    tone: 'inverse',
    style: {
      '--slide-surface': 'color-mix(in oklab, var(--tone-paper) 88%, var(--tone-ink))',
      '--slide-space-after': '160px',
    },
    leave: { effect: 'liquid' },
  },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className={`mt-10 ${styles.beside}`}>
        <div data-hero-beside>
          <div data-tone-flip className="rounded-xl bg-card p-6 md:max-w-xl xl:max-w-none">
            <AimBoard
              label={t('label')}
              handover={t('handover')}
              aim={t('aim')}
              ai={t('ai')}
              speed={t('speed')}
              intent={t('intent')}
              hits={HITS}
            />
          </div>
        </div>
      </SlideFrame>
    </>
  ),
});
