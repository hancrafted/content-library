import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Gap } from './gap';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RevealSteps } from './reveal-steps.client';
import { Room } from './room';

const SOURCES = {
  fluency: { slug: 'anthropic-ai-fluency-index', url: 'https://academy.claude.com/tutorials/the-ai-fluency-index' },
  lee: {
    slug: 'lee-critical-thinking',
    url: 'https://www.microsoft.com/en-us/research/uploads/prod/2025/01/lee_2025_ai_critical_thinking_survey.pdf',
  },
  primitives: {
    slug: 'anthropic-economic-index-primitives',
    url: 'https://www.anthropic.com/research/economic-index-primitives',
  },
  pocock: {
    slug: 'pocock-software-fundamentals',
    url: 'https://ai.engineer/talks/v4F1gFy-hqg-software-fundamentals-for-ai-coding',
  },
} as const;

/** The disclosure (Option 2a): the two rooms at rest, then the gap and its label, then the four stones one by one. */
const REVEAL = { gap: 2, firstStone: 3 } as const;
const STEPS = 6;
const STONES = ['breakDown', 'goals', 'review', 'delegate'] as const;

/**
 * You were promoted (Option 2a): two framed rooms on the wall, execution and management, with the misalignment
 * between them as a gap crossed on four stepping stones, each room with its full wall label. Three columns (3 / 6 / 3)
 * when the Scene is wide; narrower, the rooms sit side by side over the gap, and on a phone all three stack in reading
 * order. Overrules `master: horizontal-rail`, keeps `motion: local`.
 */
export const youWerePromoted = slide({
  slug: 'you-were-promoted',
  messages: { en, de },
  notes: [
    { slug: 'many-skip-the-management-steps', target: 'gap', sources: [SOURCES.fluency] },
    { slug: 'workers-describe-the-shift', target: 'caption', sources: [SOURCES.lee] },
    { slug: 'stepping-stone-break-it-down', target: 'first-stone', sources: [SOURCES.primitives] },
    { slug: 'communication-barrier', target: 'stones', sources: [SOURCES.pocock] },
  ],
  segments: [
    { slug: 'you-were-promoted' },
    { slug: 'the-misalignment' },
    { slug: 'four-stepping-stones' },
    { slug: 'the-barrier' },
  ],
  content: ({ t, Marker }) => {
    const room = (slug: 'execution' | 'management') => ({
      claim: t(`rooms.${slug}.claim`),
      label: { title: t(`rooms.${slug}.title`), era: t(`rooms.${slug}.era`), line: t(`rooms.${slug}.line`) },
    });
    const stones = STONES.map((slug, index) => ({
      slug,
      title: t(`stones.${slug}.title`),
      detail: t(`stones.${slug}.detail`),
      ...(index === 0 && {
        target: 'first-stone',
        marker: <Marker note="stepping-stone-break-it-down" className="relative top-0 right-0 shrink-0" />,
      }),
    }));
    return (
      <SlideFrame className="mt-10">
        <RevealSteps steps={STEPS} className="@container">
          <div className="rounded-xl bg-muted px-4 py-6 @min-[40rem]:px-8 @min-[40rem]:py-10">
            <div className="grid grid-cols-1 items-start gap-6 @min-[36rem]:grid-cols-2 @min-[56rem]:grid-cols-12">
              <Room slug="execution" {...room('execution')} className="@min-[56rem]:col-span-3" />
              <Gap
                label={t('gap.label')}
                many={
                  <>
                    {t('gap.many')}
                    <Marker note="many-skip-the-management-steps" className="relative top-0 right-0 shrink-0" />
                  </>
                }
                stones={stones}
                reveal={REVEAL}
                className="@min-[36rem]:order-last @min-[36rem]:col-span-2 @min-[56rem]:order-none @min-[56rem]:col-span-6 @min-[56rem]:pt-8"
              />
              <Room slug="management" {...room('management')} className="@min-[56rem]:col-span-3" />
            </div>
          </div>
        </RevealSteps>
      </SlideFrame>
    );
  },
});
