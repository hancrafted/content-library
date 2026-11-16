import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ManagerStack } from './manager-stack';

const FREELANCERS = ['activities', 'travel', 'venue', 'food'] as const;
const TRAITS = ['probabilistic', 'relentless', 'informed', 'confident', 'every-word-billed'] as const;

/*
 * The section slide of "A thought experiment" (Spec Option A, Stack): "You're the manager", the sibling of
 * "You're the new hire" with the roles reversed. The slug stays `a-thought-experiment`, the Section's published
 * anchor (FE-002 §5), so shared links to the Section and its Slides still land. Its Voice script opens the Episode
 * and ends on the question, which the room answers before the reveal.
 */
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
          doneBy: t('doneByPerson'),
          cards: FREELANCERS.map((slug) => ({ slug, label: t(`freelancers.${slug}`) })),
        }}
        price={{
          label: t('price.label'),
          traits: TRAITS.map((slug) => ({
            slug,
            initial: t(`price.${slug}.initial`),
            name: t(`price.${slug}.name`),
          })),
        }}
        rule={t('rule')}
        goal={{ label: t('goal.label'), text: t('goal.text') }}
        manager={{ label: t('manager.label'), question: t('manager.question') }}
      />
    </SlideFrame>
  ),
});
