import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';

const STEPS = ['onboard', 'attention', 'management'] as const;

// The section slide that names the seminar's one Section: the three Episodes in the order the Event's Playlist
// presents them, as plain text; the Event page links each.
export const agenda = slide({
  slug: 'agenda',
  messages: { en, de },
  content: ({ t }) => (
    <SlideFrame>
      <ol className="mt-8 list-decimal space-y-3 pl-6 text-body text-foreground">
        {STEPS.map((step) => (
          <li key={step}>{t(`steps.${step}`)}</li>
        ))}
      </ol>
    </SlideFrame>
  ),
});
