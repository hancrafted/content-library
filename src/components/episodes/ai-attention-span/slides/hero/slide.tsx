import { slide } from '@/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/components/slide-master/slide-master';
import { SessionBarPreset } from '@/components/slide-shared/context/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`): the session bar every Section opener shows, here empty, since
 * the audience starts fresh. The bar comes from the shared `session` plan. The shared header renders the h1 and the
 * caption above it. The empty Backdrop is the Title slide's one Backdrop, holding no glow.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ locale }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame className="mt-10">
        <div className="flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-md">
          <SessionBarPreset locale={locale} at={null} />
        </div>
      </SlideFrame>
    </>
  ),
});
