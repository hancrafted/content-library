import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Context } from '@/explorable-explanations/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The context window whole, in its `gallery-full` Preset: the summer party of the AI attention span Episode just past
 * its compaction, every part shown and every toolbar and head control on. The browser lane runs against this Slide.
 */
export const everyPartAndControl = slide({
  slug: 'every-part-and-control',
  messages: { en, de },
  notes: [{ slug: 'preset', target: 'cornerstone' }],
  content: ({ locale, target }) => (
    <SlideFrame className="mt-8">
      <div {...target('cornerstone')}>
        <Context preset="gallery-full" locale={locale} />
      </div>
    </SlideFrame>
  ),
});
