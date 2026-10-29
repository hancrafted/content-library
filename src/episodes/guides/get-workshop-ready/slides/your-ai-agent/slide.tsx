import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { RouteChain } from '@/episodes/components/slide-shared/route-chain/route-chain';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Your AI agent", echoing the Title slide's chain: the AI agent's ready line, its window edged in the `ai` colour; the terminal is finished. The chain below fills up to this
// Section's piece.
export const yourAiAgent = slide({
  slug: 'your-ai-agent',
  messages: { en, de },
  segments: [{ slug: 'terminal-done' }],
  content: ({ t }) => (
    <SlideFrame>
      <div className="flex max-w-xl flex-col gap-6">
        <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
          {t('steps')}
        </p>
        <div className="rounded-lg border border-ai/40 bg-card px-3 py-2 font-mono text-caption shadow-sm ring-4 ring-ai/15">
          <p className="text-ai">{t('ready')}</p>
          <p className="mt-1 text-muted-foreground">
            {t('prompt')} <span className="inline-block h-4 w-2 bg-primary align-middle" aria-hidden="true" />
          </p>
        </div>
        <RouteChain
          size="mini"
          done={1}
          current="agent"
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
