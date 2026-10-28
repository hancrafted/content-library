import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

// A placeholder statement card: replace the words in both Translation files. The Slide header shows the title and caption.
export const theProof = slide({
  slug: 'the-proof',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'statement' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div
        {...target('statement')}
        className="max-w-3xl rounded-2xl border border-(--info)/40 border-l-8 border-l-(--info) bg-(--info)/10 p-8 text-subheading font-semibold text-balance"
      >
        {t('statement')}
      </div>
    </SlideFrame>
  ),
});
