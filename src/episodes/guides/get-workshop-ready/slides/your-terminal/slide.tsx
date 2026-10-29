import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { RouteChain } from '@/episodes/components/slide-shared/route-chain/route-chain';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Your terminal", echoing the Title slide's chain: an empty terminal window with a still cursor; nothing is finished, the terminal is the piece in focus. The chain below fills up to this
// Section's piece.
export const yourTerminal = slide({
  slug: 'your-terminal',
  messages: { en, de },
  segments: [{ slug: 'hook' }, { slug: 'why-this-page' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-xl flex-col gap-6">
        <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
          {t('steps')}
        </p>
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="flex items-center gap-1 border-b border-border px-3 py-1.5" aria-hidden="true">
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
            <span className="size-2 rounded-full bg-border" />
          </div>
          <p className="px-3 py-2 font-mono text-caption text-muted-foreground">
            {t('prompt')} <span className="inline-block h-4 w-2 bg-primary align-middle" aria-hidden="true" />
          </p>
        </div>
        <RouteChain
          size="mini"
          done={0}
          current="terminal"
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
