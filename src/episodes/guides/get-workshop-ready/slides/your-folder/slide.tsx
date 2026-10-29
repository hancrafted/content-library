import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { RouteChain } from '@/episodes/components/slide-shared/route-chain/route-chain';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The starter folder's files the Scene shows; file names, not words, so they stay out of the Translation files. */
const FILES = ['AGENTS.md', 'GLOSSARY.md', 'skills/'] as const;

// The section slide of "Your folder", echoing the Title slide's chain: the workshop-starter folder and what it holds; the terminal and the AI agent are finished. The chain below fills up to this
// Section's piece.
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
        <div className="rounded-lg border-2 border-primary bg-card px-3 py-2 shadow-sm">
          <p className="flex items-center gap-2 text-caption font-semibold text-primary">
            <svg
              viewBox="0 0 24 24"
              className="size-4 fill-none stroke-current"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.5h7a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
            </svg>
            {t('folder')}
          </p>
          <ul className="mt-2 flex flex-wrap gap-1" aria-label={t('filesLabel')}>
            {FILES.map((file) => (
              <li
                key={file}
                className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-caption text-muted-foreground"
              >
                {file}
              </li>
            ))}
          </ul>
        </div>
        <RouteChain
          size="mini"
          done={2}
          current="folder"
          label={t('chain.label')}
          pieces={{
            terminal: { title: t('chain.terminal.title') },
            agent: { title: t('chain.agent.title') },
            folder: { title: t('chain.folder.title') },
            skill: { title: t('chain.skill.title') },
          }}
          proof={{ title: t('chain.proof.title'), site: t('chain.proof.site'), name: t('chain.proof.name') }}
        />
      </div>
    </SlideFrame>
  ),
});
