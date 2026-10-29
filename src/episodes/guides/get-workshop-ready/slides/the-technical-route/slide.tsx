import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { RouteChain } from '@/episodes/components/slide-shared/route-chain/route-chain';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "The technical route", echoing the Title slide's chain: the command that installs the skills by hand; the folder piece is dashed, since this route builds it by hand. The chain below fills up to this
// Section's piece.
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
        <div className="rounded-lg border border-border bg-card px-3 py-2 font-mono text-caption shadow-sm">
          <p className="break-all text-primary">
            <span className="text-muted-foreground">$ </span>
            {t('command')}
          </p>
        </div>
        <RouteChain
          size="mini"
          done={2}
          current="folder"
          byHand
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
