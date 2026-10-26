import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { MirroredExhibit } from './mirrored-exhibit';
import type { PairSlug } from './pair-art';
import { RevealSteps } from './reveal-steps.client';

const SOURCES = {
  dellacqua: {
    slug: 'dellacqua-jagged-frontier',
    url: 'https://mitsloan.mit.edu/sites/default/files/2023-10/SSRN-id4573321.pdf',
  },
  becker: { slug: 'becker-early-2025-ai', url: 'https://arxiv.org/abs/2507.09089' },
  learning: {
    slug: 'anthropic-learning-curves',
    url: 'https://www.anthropic.com/research/economic-index-march-2026-report',
  },
  primitives: {
    slug: 'anthropic-economic-index-primitives',
    url: 'https://www.anthropic.com/research/economic-index-primitives',
  },
} as const;

/** The three moments, in the order the voice takes them. */
const ROWS: readonly PairSlug[] = ['handoff', 'onboard', 'chunks'];
/** The AI side's note and target, where the mock marks one. */
const AI_NOTES = {
  onboard: 'new-session-new-contributor',
  chunks: 'splitting-tasks-lengthens-them',
} as const;
/**
 * The disclosure (Option 3b): the three upper halves at rest, then each lower half, then the closing line. The closing
 * line states the Slide's claim, so it shows at full strength from rest and its step only gives it emphasis.
 */
const FIRST_AI_HALF = 2;
const CLOSING = 5;

/**
 * Practise it today, at work (Option 3b): three tall exhibits side by side, each a moment at work above a "same move"
 * line and its reflection with AI below, in Slide 1's frame and wall label, so the Slide compares them. The line on the
 * shared discipline and the closing line hang under the row. Overrules `master: grid-3x1`, keeps `motion: local`.
 */
export const practiseItTodayAtWork = slide({
  slug: 'practise-it-today-at-work',
  messages: { en, de },
  notes: [
    { slug: 'briefing-context-checking', target: 'exhibits', sources: [SOURCES.dellacqua] },
    { slug: 'new-session-new-contributor', target: 'onboard', sources: [SOURCES.becker] },
    { slug: 'experience-predicts-results', target: 'closing', sources: [SOURCES.learning] },
    { slug: 'splitting-tasks-lengthens-them', target: 'chunks', sources: [SOURCES.primitives] },
  ],
  segments: [
    { slug: 'practise-on-people' },
    { slug: 'the-handoff' },
    { slug: 'the-new-teammate' },
    { slug: 'chunks-and-seams' },
    { slug: 'an-invitation' },
  ],
  content: ({ t, Marker }) => {
    const words = { work: t('sides.work'), ai: t('sides.ai'), sameMove: t('sameMove') };
    return (
      <SlideFrame className="mt-10">
        <RevealSteps steps={CLOSING} className="@container">
          <div className="flex flex-col gap-8 rounded-xl bg-muted px-4 py-6 @min-[40rem]:px-8 @min-[40rem]:py-10">
            <ol
              data-target="exhibits"
              className="focus-group focus-group--dim-others grid grid-cols-1 gap-10 @min-[40rem]:grid-cols-3 @min-[40rem]:gap-x-8 @min-[40rem]:gap-y-0"
            >
              {ROWS.map((slug, index) => {
                const note = slug === 'handoff' ? undefined : AI_NOTES[slug];
                return (
                  <MirroredExhibit
                    key={slug}
                    slug={slug}
                    target={slug === 'handoff' ? undefined : slug}
                    words={words}
                    reveal={FIRST_AI_HALF + index}
                    label={{
                      title: t(`rows.${slug}.title`),
                      era: t(`rows.${slug}.era`),
                      line: t(`rows.${slug}.line`),
                    }}
                    work={{ title: t(`rows.${slug}.work`), detail: t(`rows.${slug}.workDetail`) }}
                    ai={{
                      title: t(`rows.${slug}.ai`),
                      detail: t(`rows.${slug}.aiDetail`),
                      ...(note && { marker: <Marker note={note} className="relative top-0 right-0 shrink-0" /> }),
                    }}
                  />
                );
              })}
            </ol>
            <p className="flex items-center justify-center gap-1 text-center text-caption text-muted-foreground">
              {t('discipline')}
              <Marker note="briefing-context-checking" className="relative top-0 right-0 shrink-0" />
            </p>
            <div className="flex justify-center">
              <p
                data-target="closing"
                data-reveal-emphasis={CLOSING}
                className="flex items-center gap-2 rounded-md bg-primary px-8 py-3 text-center text-body font-semibold text-primary-foreground shadow-lg"
              >
                {t('closing')}
                <Marker
                  note="experience-predicts-results"
                  className="relative top-0 right-0 shrink-0 text-primary-foreground hover:text-primary-foreground"
                />
              </p>
            </div>
          </div>
        </RevealSteps>
      </SlideFrame>
    );
  },
});
