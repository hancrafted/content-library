import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { launchCommand } from '@/episodes/components/slide-shared/agent-setup-step/agent-commands.pure';
import { CopyLine } from '@/episodes/components/slide-shared/agent-setup-step/copy-line.client';
import { DoneMark } from '@/episodes/components/slide-shared/agent-setup-step/done-mark';
import { OfficialLink } from '@/episodes/components/slide-shared/agent-setup-step/official-link';
import { PickSwitch } from '@/episodes/components/slide-shared/agent-setup-step/pick-switch.client';
import { AGENTS, casesOf, DEFAULT_AGENT } from '@/episodes/components/slide-shared/agent-setup-step/picks.pure';
import { TerminalWindow } from '@/episodes/components/slide-shared/agent-setup-step/terminal-window';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { DoneStrip, MoreHelp } from '@/episodes/components/slide-shared/guide-step/guide-step';
import { GuideToolbar } from '@/episodes/components/slide-shared/guide-toolbar/guide-toolbar';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { notes } from './notes';
import { PickOptions } from './pick-options';
import { RoundTrip } from './round-trip';
import { SignInCard } from './sign-in-card';

/*
 * Step 3, last Slide: the AI agent already runs inside the starter folder (the Slide before started it there), and
 * asks the first-timer to sign in. The login as a round trip, terminal to browser and back; GitHub Copilot's /login is
 * the only line to copy. The official login link is outlined.
 */
export const logIn = slide({
  slug: 'log-in',
  messages: { en, de },
  notes,
  segments: [{ slug: 'sign-in' }, { slug: 'which-option' }],
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
  content: ({ t, target }) => {
    const words = { copy: t('copy'), copied: t('copied') };
    const code = (chunks: ReactNode) => <code className="font-mono text-foreground">{chunks}</code>;
    const key = (chunks: ReactNode) => (
      <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-foreground">{chunks}</kbd>
    );
    const after = {
      'claude-code': [
        t.rich('pick.after.claude-code.one', { code, key }),
        t.rich('pick.after.claude-code.two', { code, key }),
      ],
      antigravity: [
        t.rich('pick.after.antigravity.one', { code, key }),
        t.rich('pick.after.antigravity.two', { code, key }),
      ],
      codex: [t.rich('pick.after.codex.one', { code, key }), t.rich('pick.after.codex.two', { code, key })],
      copilot: [t.rich('pick.after.copilot.one', { code, key }), t.rich('pick.after.copilot.two', { code, key })],
    } as const;
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

          <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 md:p-8" {...target('login')}>
            <div className="flex flex-col gap-3">
              <p className="text-body">{t('ownAccount')}</p>
              <p className="text-body">{t('signIn')}</p>
              <PickSwitch
                name="agent"
                fallback={DEFAULT_AGENT}
                cases={casesOf(AGENTS, (agent) => {
                  const inside = launchCommand(agent.id).inside;
                  return inside === undefined ? null : (
                    <div className="flex flex-col gap-3">
                      <p className="text-body">{t('insideTitle', { agent: agent.name })}</p>
                      <CopyLine text={inside} where="agent" big words={words} />
                    </div>
                  );
                })}
              />
              <p className="text-body" data-flow="">
                <PickSwitch name="agent" fallback={DEFAULT_AGENT} cases={flow} />
              </p>
            </div>

            <DoneStrip label={t('doneLabel')}>
              <p className="text-body font-semibold">{t('trip.loggedIn')}</p>
              <p className="text-caption text-muted-foreground">{t('once')}</p>
            </DoneStrip>

            <MoreHelp title={t('moreTitle')}>
              <RoundTrip
                labels={{ terminal: t('trip.terminal'), browser: t('trip.browser'), back: t('trip.back') }}
                arrows={{ out: t('trip.toLogin'), back: t('trip.toTerminal') }}
                terminal={
                  <TerminalWindow
                    agent
                    title={
                      <PickSwitch
                        name="agent"
                        fallback={DEFAULT_AGENT}
                        cases={casesOf(AGENTS, (agent) => agent.name)}
                      />
                    }
                  >
                    <p>
                      <span className="text-ai" aria-hidden="true">
                        ✻
                      </span>{' '}
                      <PickSwitch
                        name="agent"
                        fallback={DEFAULT_AGENT}
                        cases={casesOf(AGENTS, (agent) => agent.name)}
                      />
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

              <PickOptions
                title={t('pick.title')}
                badge={t('pick.recommended')}
                describe={(agent, option) => t(`pick.options.${agent}.${option}` as never)}
                after={after}
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
              </div>
            </MoreHelp>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
