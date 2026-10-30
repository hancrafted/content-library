import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import {
  AgentReady,
  LineTag,
  PermissionAsk,
  TermLine,
  TitleTerminal,
} from '@/episodes/components/slide-shared/title-terminal/title-terminal';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`), Option 0b: one terminal window previewing what the Guide ends
 * in. The terminal opens, the AI agent starts in the folder and a skill runs once it is approved. A calm hero: the
 * Slide header holds the title and the Hook, the Scene one pill and one window. The empty Backdrop is the Title
 * slide's one Backdrop, holding no glow: the Studio style stays quiet.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />

      <SlideFrame>
        <div className="flex max-w-2xl flex-col gap-6">
          <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
            {t('meta')}
          </p>
          <TitleTerminal title={t('window')}>
            <ol className="focus-group focus-group--dim-others flex flex-col gap-4" aria-label={t('preview')}>
              <li className="focus-group__item flex items-start justify-between gap-4">
                <span className="w-full">
                  <TermLine prompt={t('prompt')} command="claude" />
                  <span className="mt-2 block">
                    <AgentReady ready={t('ready')} hint={t('hint')} />
                  </span>
                </span>
                <LineTag ai>{t('tags.agent')}</LineTag>
              </li>
              <li className="focus-group__item flex items-start justify-between gap-4">
                <span>
                  <span className="block text-primary">&gt; check-workshop-readiness</span>
                  <span className="mt-2 block">
                    <PermissionAsk question={t('question')} yes={t('yes')} />
                  </span>
                </span>
                <LineTag>{t('tags.skill')}</LineTag>
              </li>
            </ol>
          </TitleTerminal>
        </div>
      </SlideFrame>
    </>
  ),
});
