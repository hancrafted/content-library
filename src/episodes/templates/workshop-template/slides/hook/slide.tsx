import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The session's opening statement: one soft card with an accent rail, the line the room hears first. The Slide header shows the title and caption; the Scene holds the statement.
export const hook = slide({
  slug: 'hook',
  messages: { en, de },
  notes: [{ slug: 'talking-points', target: 'statement' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div
        {...target('statement')}
        data-workshop-items=""
        className="max-w-3xl rounded-2xl border border-(--info)/40 border-l-8 border-l-(--info) bg-(--info)/10 p-8 text-subheading font-semibold text-balance"
      >
        {t('statement')}
      </div>
    </SlideFrame>
  ),
});
