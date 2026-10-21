import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The cracks in the plan, in the order the Voice script names their traits. */
const CRACKS = ['informed', 'confident', 'probabilistic', 'relentless', 'every-word-billed'] as const;

/**
 * "What happens with one prompt" (practice round, .scratch/onboard-ai-every-time/handoff.md): one prompt in, a
 * polished plan out, and one crack per trait. A text-only placeholder until its Scene is designed: the plan appears
 * whole, then each crack highlights in turn, matched to its trait. Its last segment is the Section's Bridge.
 */
export const onePrompt = slide({
  slug: 'one-prompt',
  messages: { en, de },
  segments: [
    { slug: 'one-prompt-in' },
    { slug: 'informed' },
    { slug: 'confident' },
    { slug: 'probabilistic' },
    { slug: 'relentless' },
    { slug: 'every-word-billed' },
    { slug: 'you-saw-the-ai' },
    { slug: 'the-mental-model' },
  ],
  content: ({ t }) => (
    <SlideFrame className="mt-8">
      <div className="flex max-w-3xl flex-col gap-6">
        <p className="rounded-2xl border border-border bg-card px-6 py-4 text-body">{t('prompt')}</p>
        <ol className="flex flex-col gap-2 text-body" aria-label={t('cracksLabel')}>
          {CRACKS.map((crack) => (
            <li key={crack} className="flex gap-4 rounded-xl border border-border bg-card px-4 py-2">
              <span className="w-40 shrink-0 font-semibold">{t(`cracks.${crack}.trait`)}</span>
              <span>{t(`cracks.${crack}.crack`)}</span>
            </li>
          ))}
        </ol>
      </div>
    </SlideFrame>
  ),
});
