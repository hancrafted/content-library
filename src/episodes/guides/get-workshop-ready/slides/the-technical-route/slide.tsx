import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { TermLine, TitleTerminal } from '@/episodes/components/slide-shared/title-terminal/title-terminal';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The technical route", Title-slide Option 0b's theme: the command that installs the skills by hand. A bonus, not a step.
export const theTechnicalRoute = slide({
  slug: 'the-technical-route',
  messages: { en, de },
  segments: [{ slug: 'for-people-who-build' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-xl flex-col gap-6">
        <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
          {t('steps')}
        </p>
        <TitleTerminal title={t('window')} size="section">
          <TermLine prompt={t('prompt')} command={t('command')} />
        </TitleTerminal>
      </div>
    </SlideFrame>
  ),
});
