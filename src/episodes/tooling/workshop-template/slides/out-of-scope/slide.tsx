import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The placeholder lines, as keys of `items`: replace their words in the copy, and add or drop a key in both files. */
const ITEMS = ['first', 'second', 'third'] as const;

// What the session leaves out: one line per topic, so no one waits for it. The Slide header shows its title and caption; the Scene holds the list.
export const outOfScope = slide({
  slug: 'out-of-scope',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'items' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <ul
        {...target('items')}
        data-workshop-items=""
        className="flex max-w-prose list-disc flex-col gap-4 pl-6 text-subheading"
      >
        {ITEMS.map((item) => (
          <li key={item}>{t(`items.${item}`)}</li>
        ))}
      </ul>
    </SlideFrame>
  ),
});
