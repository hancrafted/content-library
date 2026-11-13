import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { StepDone } from '@/episodes/components/slide-shared/guide-step/step-done.client';
import { AgentReady, TermLine, TitleTerminal } from '@/episodes/components/slide-shared/title-terminal/title-terminal';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Your AI agent", Title-slide Option 0b's theme: the command that starts it and its ready line, the window edged in the `ai` colour.
export const yourAiAgent = slide({
  slug: 'your-ai-agent',
  messages: { en, de },
  segments: [{ slug: 'terminal-done' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
            {t('steps')}
          </p>
          <StepDone label={t('stepDone')} />
        </div>
        <TitleTerminal title={t('window')} size="section" ai>
          <TermLine prompt={t('prompt')} command="claude" />
          <AgentReady ready={t('ready')} hint={t('hint')} />
        </TitleTerminal>
      </div>
    </SlideFrame>
  ),
});
