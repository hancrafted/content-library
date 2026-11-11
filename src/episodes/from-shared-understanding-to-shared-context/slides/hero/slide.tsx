import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { AimBoard } from './aim-board';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** Where the four document darts land: all on the bull. */
const HITS = [
  { x: 346, y: 196 },
  { x: 368, y: 190 },
  { x: 354, y: 220 },
  { x: 376, y: 214 },
] as const;

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif of picked Option 0c: the dartboard. What you
 * hand the agent sets the aim, AI speeds every throw, and the documents land on the bull, the intent. The shared header
 * renders the `h1` and this Slide's caption above it; the board sits in the right half, as the mock's six columns do.
 * Each section slide echoes the board. On the inverse surface the board sits on a `data-tone-flip` card, so its
 * darts keep the page's own contrast. The empty Backdrop is the Title slide's one Backdrop, holding no glow.
 */
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
      <SlideFrame className="mt-10">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div data-tone-flip className="rounded-xl bg-card p-6 md:col-span-6 md:col-start-7">
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
