import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { launchCommand } from '@/episodes/components/slide-shared/agent-setup-step/agent-commands.pure';
import { CopyLine } from '@/episodes/components/slide-shared/agent-setup-step/copy-line.client';
import { DoneMark } from '@/episodes/components/slide-shared/agent-setup-step/done-mark';
import { OfficialLink } from '@/episodes/components/slide-shared/agent-setup-step/official-link';
import { PickSwitch } from '@/episodes/components/slide-shared/agent-setup-step/pick-switch.client';
import {
  AGENTS,
  casesOf,
  DEFAULT_AGENT,
  DEFAULT_OS,
} from '@/episodes/components/slide-shared/agent-setup-step/picks.pure';
import { TerminalWindow } from '@/episodes/components/slide-shared/agent-setup-step/terminal-window';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { GuideToolbar } from '@/episodes/components/slide-shared/guide-toolbar/guide-toolbar';
import { localizePath, stripLocale } from '@/shared/lib/locale.pure';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { RoundTrip } from './round-trip';

/** The drawn sign-in card in the browser window: a picture of the step, not a screenshot of the vendor's page. */
function SignInCard({ page, title, button, own }: { page: string; title: ReactNode; button: string; own: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-md">
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2" aria-hidden="true">
        <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/30" />
        <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/30" />
        <span className="ml-3 min-w-0 flex-1 truncate rounded-full bg-card px-3 py-0.5 text-caption text-muted-foreground">
          {page}
        </span>
      </div>
      <div className="flex flex-col items-center gap-3 p-5 text-center">
        <span
          className="flex size-9 items-center justify-center rounded-full bg-ai/15 text-ai ring-1 ring-ai/40"
          aria-hidden="true"
        >
          ✻
        </span>
        <p className="text-body font-semibold">{title}</p>
        <span className="w-full rounded-full bg-primary py-2 text-caption font-semibold text-primary-foreground">
          {button}
        </span>
        <p className="text-caption text-muted-foreground">{own}</p>
      </div>
    </div>
  );
}

/*
 * Step 2, second Slide: the second command a first-timer types starts the AI agent and signs them in. First it says to
 * open a NEW terminal window, because the install may not be on the old window's PATH (Claude Code's docs say so;
 * Antigravity's say to restart the terminal on Windows), with the failure ("command not found") and its fix, per
 * system. Then the login as a round trip, terminal to browser and back. The official login link is outlined.
 */
export const logIn = slide({
  slug: 'log-in',
  messages: { en, de },
  segments: [{ slug: 'open-a-new-window' }, { slug: 'second-command' }],
  headerAction: ({ t, template }) => (
    <GuideHelp
      step={t('help.step')}
      words={{
        button: t('help.button'),
        label: t('help.label'),
        placeholder: t('help.placeholder'),
        copy: t('help.copy'),
        copied: t('help.copied'),
        copyTip: t('help.copyTip'),
        prompt: template('help.prompt'),
        noError: t('help.noError'),
        chats: {
          openAIChats: t('help.chats.openAIChats'),
          openAIChatTip: template('help.chats.openAIChatTip'),
          newTab: t('help.chats.newTab'),
        },
      }}
    />
  ),
  content: ({ t, locale, slideHref }) => {
    const [backPath = '', backAnchor] = slideHref('open-your-terminal').split('#');
    const back = { path: backPath, anchor: backAnchor };
    const words = { copy: t('copy'), copied: t('copied') };
    const code = (chunks: ReactNode) => <code className="font-mono text-foreground">{chunks}</code>;
    const flow = {
      'claude-code': t.rich('flow.claude-code', { code }),
      antigravity: t.rich('flow.antigravity', { code }),
      codex: t.rich('flow.codex', { code }),
      copilot: t.rich('flow.copilot', { code }),
    };
    return (
      <SlideFrame>
        <div className="flex flex-col gap-8">
          <GuideToolbar active={['os', 'agent']} labels={{ os: t('toolbar.os'), agent: t('toolbar.agent') }} />

          <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-2 rounded-lg border-2 border-primary p-4" data-new-window="">
              <p className="text-body font-semibold">{t('newWindowTitle')}</p>
              <p className="text-body">{t('newWindow')}</p>
              <p className="text-caption text-muted-foreground">
                <PickSwitch
                  name="os"
                  fallback={DEFAULT_OS}
                  cases={{
                    mac: t('newWindowHow.mac'),
                    windows: t('newWindowHow.windows'),
                    linux: t('newWindowHow.linux'),
                  }}
                />{' '}
                <a
                  href={localizePath(stripLocale(back.path), locale, back.anchor)}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  {t('backToStep1')}
                </a>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-caption font-semibold uppercase text-primary">{t('secondCommand')}</p>
              <p className="text-body">{t('type')}</p>
              <PickSwitch
                name="agent"
                fallback={DEFAULT_AGENT}
                cases={casesOf(AGENTS, (agent) => {
                  const launch = launchCommand(agent.id);
                  return (
                    <div className="flex flex-col gap-3">
                      <CopyLine text={launch.text} where="shell" focal big words={words} />
                      {launch.inside === undefined ? null : (
                        <>
                          <p className="text-body">{t('insideTitle', { agent: agent.name })}</p>
                          <CopyLine text={launch.inside} where="agent" big words={words} />
                        </>
                      )}
                    </div>
                  );
                })}
              />
              <p className="text-body" data-flow="">
                <PickSwitch name="agent" fallback={DEFAULT_AGENT} cases={flow} />
              </p>
              <div className="rounded-lg border border-border bg-background p-4" data-not-found="">
                <p className="text-body font-semibold">{t('failTitle')}</p>
                <p className="mt-1 text-body">{t('failFix')}</p>
              </div>
            </div>

            <RoundTrip
              labels={{ terminal: t('trip.terminal'), browser: t('trip.browser'), back: t('trip.back') }}
              arrows={{ out: t('trip.toLogin'), back: t('trip.toTerminal') }}
              terminal={
                <TerminalWindow
                  agent
                  title={
                    <PickSwitch name="agent" fallback={DEFAULT_AGENT} cases={casesOf(AGENTS, (agent) => agent.name)} />
                  }
                >
                  <p>
                    <span className="text-ai" aria-hidden="true">
                      ✻
                    </span>{' '}
                    <PickSwitch name="agent" fallback={DEFAULT_AGENT} cases={casesOf(AGENTS, (agent) => agent.name)} />
                  </p>
                  <p className="text-muted-foreground">
                    <PickSwitch
                      name="agent"
                      fallback={DEFAULT_AGENT}
                      cases={{
                        'claude-code': t('trip.lines.claude-code'),
                        antigravity: t('trip.lines.antigravity'),
                        codex: t('trip.lines.codex'),
                        copilot: t('trip.lines.copilot'),
                      }}
                    />
                  </p>
                </TerminalWindow>
              }
              browser={
                <SignInCard
                  page={t('trip.page')}
                  title={
                    <PickSwitch
                      name="agent"
                      fallback={DEFAULT_AGENT}
                      cases={casesOf(AGENTS, (agent) => t('trip.signInTitle', { agent: agent.name }))}
                    />
                  }
                  button={t('trip.signIn')}
                  own={t('trip.useOwn')}
                />
              }
              back={
                <div className="flex flex-col gap-2 rounded-xl border border-border bg-background p-5">
                  <p className="inline-flex items-center gap-2 text-body font-semibold">
                    <DoneMark />
                    {t('trip.loggedIn')}
                  </p>
                  <p className="text-caption text-muted-foreground">{t('once')}</p>
                </div>
              }
            />

            <div className="flex flex-wrap items-center gap-4 border-t border-border pt-6">
              <PickSwitch
                name="agent"
                fallback={DEFAULT_AGENT}
                cases={casesOf(AGENTS, (agent) => (
                  <OfficialLink
                    variant="outlined"
                    url={agent.loginHref}
                    label={t('openLogin', { agent: agent.name })}
                    newTab={t('newTab')}
                  />
                ))}
              />
              <p className="text-caption text-muted-foreground">{t('ownAccount')}</p>
            </div>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
