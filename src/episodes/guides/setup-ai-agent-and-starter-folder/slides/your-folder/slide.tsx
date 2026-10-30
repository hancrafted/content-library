import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { TermLine, TitleTerminal } from '@/episodes/components/slide-shared/title-terminal/title-terminal';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The starter folder's files the Scene shows; file names, not words. */
const FILES = ['AGENTS.md', 'GLOSSARY.md', 'skills/'] as const;

// The section slide of "Your folder", Title-slide Option 0b's theme: the prompt inside the starter folder and what the folder holds. The folder is opened from the folder, so there is no `cd`.
export const yourFolder = slide({
  slug: 'your-folder',
  messages: { en, de },
  segments: [{ slug: 'the-place-to-work' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-xl flex-col gap-6">
        <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
          {t('steps')}
        </p>
        <TitleTerminal title={t('window')} size="section">
          <TermLine prompt={t('prompt')} />
          <ul className="flex flex-wrap gap-1" aria-label={t('filesLabel')}>
            {FILES.map((file) => (
              <li
                key={file}
                className="rounded-md border border-border bg-background px-1.5 py-0.5 text-caption text-muted-foreground"
              >
                {file}
              </li>
            ))}
          </ul>
        </TitleTerminal>
      </div>
    </SlideFrame>
  ),
});
