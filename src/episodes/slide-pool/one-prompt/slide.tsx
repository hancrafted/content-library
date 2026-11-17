import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PromptToPlan, TRAITS } from './prompt-to-plan';

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
