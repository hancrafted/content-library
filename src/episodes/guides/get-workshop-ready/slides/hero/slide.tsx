import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { RouteChain } from '@/episodes/components/slide-shared/route-chain/route-chain';
import de from './i18n/de.json';
import en from './i18n/en.json';

/**
 * The Title slide's hero Scene (the record's `title`), the Hero motif: the route as one chain of four pieces, a
 * terminal, an AI agent, a folder and a skill, with the homepage at its end as the proof. Nothing is finished yet, so
 * the terminal is outlined as the place to start. Each section slide echoes the chain with its own piece in focus.
 * The empty Backdrop is the Title slide's one Backdrop, holding no glow: the Studio style stays quiet.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t }) => (
    <>
      <SlideBackdrop mobile />
      <SlideFrame>
        <div className="flex flex-col gap-6">
          <p className="self-start rounded-full border border-border bg-card px-3 py-1 text-caption text-muted-foreground">
            {t('meta')}
          </p>
          <RouteChain
            size="hero"
            done={0}
            current="terminal"
            label={t('chain.label')}
            start={t('chain.start')}
            pieces={{
              terminal: { title: t('chain.terminal.title'), sub: t('chain.terminal.sub') },
              agent: { title: t('chain.agent.title'), sub: t('chain.agent.sub') },
              folder: { title: t('chain.folder.title'), sub: t('chain.folder.sub') },
              skill: { title: t('chain.skill.title'), sub: t('chain.skill.sub') },
            }}
            proof={{ title: t('chain.proof.title'), site: t('chain.proof.site'), name: t('chain.proof.name') }}
          />
          <p className="text-caption text-muted-foreground">{t('chainNote')}</p>
        </div>
      </SlideFrame>
    </>
  ),
});
