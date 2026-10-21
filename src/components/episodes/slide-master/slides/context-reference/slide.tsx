import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { Context } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The reference Preset shows every part and every toolbar and head control at once: part chips, Technical, download,
// upload, the 200K | 1M switch, the smart-zone toggle, the usage readout, the per-part Technical toggles and the Attention menu.
export const contextReference = slide({
  slug: 'context-reference',
  messages: { en, de },
  notes: [{ slug: 'controls', target: 'context' }],
  segments: [{ slug: 'walkthrough' }],
  content: ({ locale, target }) => (
    <SlideFrame className="mt-8">
      <div {...target('context')}>
        <Context preset="reference" locale={locale} />
      </div>
    </SlideFrame>
  ),
});
