import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { PermissionAsk, TitleTerminal } from '@/episodes/components/slide-shared/title-terminal/title-terminal';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Your first skill", Title-slide Option 0b's theme: the skill typed in the AI agent and its permission question with Yes chosen.
export const yourFirstSkill = slide({
  slug: 'your-first-skill',
  messages: { en, de },
  segments: [{ slug: 'everything-in-place' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-xl flex-col gap-6">
        <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
          {t('steps')}
        </p>
        <TitleTerminal title={t('window')} size="section" ai>
          <span className="block text-primary">&gt; check-workshop-readiness</span>
          <PermissionAsk question={t('question')} yes={t('yes')} />
        </TitleTerminal>
      </div>
    </SlideFrame>
  ),
});
