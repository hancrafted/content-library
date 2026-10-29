import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { RouteChain } from '@/episodes/components/slide-shared/route-chain/route-chain';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Your first skill", echoing the Title slide's chain: the AI agent's permission prompt with Yes chosen; the terminal, the AI agent and the folder are finished. The chain below fills up to this
// Section's piece.
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
        <div className="rounded-lg border border-border bg-card px-3 py-2 font-mono text-caption shadow-sm">
          <p className="text-muted-foreground">{t('question')}</p>
          <p className="mt-1 flex gap-3">
            <span className="rounded bg-primary px-1.5 font-semibold text-primary-foreground">› {t('yes')}</span>
            <span className="text-muted-foreground">{t('no')}</span>
          </p>
        </div>
        <RouteChain
          size="mini"
          done={3}
          current="skill"
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
