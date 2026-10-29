import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { DoneMark } from '@/episodes/components/slide-shared/agent-setup-step/done-mark';
import { OfficialLink } from '@/episodes/components/slide-shared/agent-setup-step/official-link';
import { PickSwitch } from '@/episodes/components/slide-shared/agent-setup-step/pick-switch.client';
import { PickToolbar } from '@/episodes/components/slide-shared/agent-setup-step/pick-toolbar.client';
import {
  AGENTS,
  casesOf,
  DEFAULT_AGENT,
  DEFAULT_OS,
  OPERATING_SYSTEMS,
  type StartScreen,
} from '@/episodes/components/slide-shared/agent-setup-step/picks.pure';
import { StepProgress } from '@/episodes/components/slide-shared/agent-setup-step/step-progress';
import { StuckBox } from '@/episodes/components/slide-shared/agent-setup-step/stuck-box.client';
import { TerminalWindow } from '@/episodes/components/slide-shared/agent-setup-step/terminal-window';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The agent's name, set bold wherever its banner title names it, as the mock sets "Welcome to **Claude Code**!". */
function BannerTitle({ title, name }: { title: string; name: string }) {
  const at = title.indexOf(name);
  if (at < 0) return <b className="font-semibold">{title}</b>;
  return (
    <>
      {title.slice(0, at)}
      <b className="font-semibold">{name}</b>
      {title.slice(at + name.length)}
    </>
  );
}

/**
 * The AI agent's start screen, the vendor's own words in the language the agent shows them: its banner (mark and
 * title) in the `ai` edge, then its lines muted. An agent whose vendor quotes no start screen shows its banner only.
 */
function StartScreenBox({ name, screen }: { name: string; screen: StartScreen }) {
  return (
    <div className="rounded-md border border-ai/50 px-4 py-3" lang="en" data-start-screen="">
      <p>
        {screen.mark === '' ? null : (
          <span className="text-ai" aria-hidden="true">
            {screen.mark}{' '}
          </span>
        )}
        <BannerTitle title={screen.title} name={name} />
      </p>
      {screen.lines.map((line) => (
        <p key={line} className="mt-2 text-muted-foreground">
          {line}
        </p>
      ))}
    </div>
  );
}

/*
 * Step 3, Option 3a: one step card split into "do this" (the official install page of the picked AI agent, and which
 * steps to follow there for the picked system) and "it worked when you see this" (the agent's start screen in the
 * terminal). Both toolbars show, because both picks change the card. No commands, no versions: the vendor's page is
 * the source.
 */
export const installYourAiAgent = slide({
  slug: 'install-your-ai-agent',
  messages: { en, de },
  segments: [
    { slug: 'official-page-only' },
    { slug: 'claude-code-preferred' },
    { slug: 'it-tells-you-when-it-worked' },
  ],
  content: ({ t, template }) => (
    <SlideFrame>
      <div className="flex flex-col gap-8">
        <StepProgress step={3} total={8} label={t('progress')} />
        <PickToolbar show={['os', 'agent']} labels={{ os: t('toolbar.os'), agent: t('toolbar.agent') }} />

        <div className="grid gap-8 rounded-xl border border-border bg-card p-6 md:grid-cols-12 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:col-span-6">
            <div className="flex flex-col gap-4">
              <p className="text-caption font-semibold uppercase text-primary">{t('doThis')}</p>
              <PickSwitch
                name="agent"
                fallback={DEFAULT_AGENT}
                cases={casesOf(AGENTS, (agent) => (
                  <OfficialLink
                    variant="filled"
                    url={agent.installHref}
                    label={t('openInstall', { agent: agent.name })}
                    newTab={t('newTab')}
                  />
                ))}
              />
              <p className="text-body">
                <PickSwitch
                  name="os"
                  fallback={DEFAULT_OS}
                  cases={casesOf(OPERATING_SYSTEMS, (os) => t.rich('osLine', { os: os.pageLabel }))}
                />
              </p>
            </div>
            <p className="border-t border-border pt-4 text-caption text-muted-foreground">{t('preferred')}</p>
          </div>

          <div className="flex flex-col gap-3 md:col-span-6">
            <TerminalWindow
              agent
              title={
                <PickSwitch name="os" fallback={DEFAULT_OS} cases={casesOf(OPERATING_SYSTEMS, (os) => os.shell)} />
              }
            >
              <PickSwitch
                name="agent"
                fallback={DEFAULT_AGENT}
                cases={casesOf(AGENTS, (agent) => (
                  <StartScreenBox name={agent.name} screen={agent.startScreen} />
                ))}
              />
              <p className="text-muted-foreground">
                {t('prompt')} <span className="inline-block h-4 w-2 bg-primary align-middle" aria-hidden="true" />
              </p>
            </TerminalWindow>
            <p className="inline-flex items-center gap-2 text-body font-semibold">
              <DoneMark />
              {t('worked')}
            </p>
          </div>
        </div>

        <StuckBox
          step={t('stuck.step')}
          words={{
            title: t('stuck.title'),
            hint: t('stuck.hint'),
            pasteLabel: t('stuck.pasteLabel'),
            placeholder: t('stuck.placeholder'),
            copy: t('stuck.copy'),
            copied: t('stuck.copied'),
            adds: t('stuck.adds'),
            prompt: template('stuck.prompt'),
            noError: t('stuck.noError'),
          }}
        />
      </div>
    </SlideFrame>
  ),
});
