import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ManagerStack } from './manager-stack';

const FREELANCERS = ['activities', 'travel', 'venue', 'food'] as const;
const TRAITS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;

// decision: FE-002 §5
export const aThoughtExperiment = slide({
  slug: 'a-thought-experiment',
  messages: { en, de },
  segments: [{ slug: 'now-you-are-the-manager' }, { slug: 'four-price-freelancers' }, { slug: 'your-job' }],
  content: ({ t }) => (
    <SlideFrame>
      <ManagerStack
        task={{ label: t('task.label'), text: t('task.text') }}
        freelancers={{
          label: t('freelancers.label'),
          cards: FREELANCERS.map((slug) => ({ slug, label: t(`freelancers.${slug}`) })),
        }}
        price={{
          label: t('price.label'),
          traits: TRAITS.map((slug) => ({
            slug,
            initial: t(`price.${slug}.initial`),
            name: t(`price.${slug}.name`),
            gloss: t(`price.${slug}.gloss`),
          })),
        }}
        rule={t('rule')}
        goal={{ label: t('goal.label'), text: t('goal.text') }}
        manager={{ label: t('manager.label'), question: t('manager.question') }}
      />
    </SlideFrame>
  ),
});
