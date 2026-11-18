import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BriefOrPayThePrice } from '@/explorables/brief-or-pay-the-price/brief-or-pay-the-price';
import { Context } from '@/explorables/context-window/context';
import { HumanInTheLoop } from '@/explorables/human-in-the-loop/human-in-the-loop';
import de from './i18n/de.json';
import en from './i18n/en.json';

export const mirror = slide({
  slug: 'mirror',
  messages: { en, de },
  content: ({ locale }) => (
    <SlideFrame className="mt-6 gap-6">
      <BriefOrPayThePrice
        preset="play"
        locale={locale}
        habits={<Context preset="slide-9-before" locale={locale} />}
        tryIt={<HumanInTheLoop workflow="source-to-quiz" locale={locale} />}
      />
    </SlideFrame>
  ),
});
