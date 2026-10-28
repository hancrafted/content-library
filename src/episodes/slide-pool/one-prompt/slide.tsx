import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PromptToPlan, TRAITS } from './prompt-to-plan';

/**
 * "What happens with one prompt" (practice round, .scratch/onboard-ai-every-time/handoff.md): one short prompt in one chat, one
 * long polished answer out, and each PRICE trait wired to the mark it left in them; the callout says
 * what that costs you. Its last segment is the Section's Bridge.
 */
export const onePrompt = slide({
  slug: 'one-prompt',
  messages: { en, de },
  segments: [
    { slug: 'one-prompt-in' },
    { slug: 'probabilistic' },
    { slug: 'relentless' },
    { slug: 'informed' },
    { slug: 'confident' },
    { slug: 'every-word-billed' },
    { slug: 'you-saw-the-ai' },
    { slug: 'the-mental-model' },
  ],
  content: ({ t }) => (
    <SlideFrame className="mt-8">
      <PromptToPlan
        prompt={{ label: t('promptLabel'), text: t('prompt') }}
        stackLabel={t('stackLabel')}
        traitsLabel={t('traitsLabel')}
        cracks={TRAITS.map((slug) => ({
          slug,
          initial: t(`cracks.${slug}.initial`),
          trait: t(`cracks.${slug}.trait`),
          gloss: t(`cracks.${slug}.gloss`),
          why: t(`cracks.${slug}.why`),
          produced: t(`cracks.${slug}.produced`),
        }))}
        callout={t.rich('callout', { strong: (chunks) => <strong className="font-semibold">{chunks}</strong> })}
      />
    </SlideFrame>
  ),
});
