import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { docsHref, installCommand } from '@/episodes/components/slide-shared/agent-setup-step/agent-commands.pure';
import { CopyLine } from '@/episodes/components/slide-shared/agent-setup-step/copy-line.client';
import { OfficialLink } from '@/episodes/components/slide-shared/agent-setup-step/official-link';
import { PickSwitch } from '@/episodes/components/slide-shared/agent-setup-step/pick-switch.client';
import {
  AGENTS,
  casesOf,
  DEFAULT_AGENT,
  DEFAULT_OS,
  OPERATING_SYSTEMS,
} from '@/episodes/components/slide-shared/agent-setup-step/picks.pure';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { DoneStrip, MoreHelp } from '@/episodes/components/slide-shared/guide-step/guide-step';
import { GuideToolbar } from '@/episodes/components/slide-shared/guide-toolbar/guide-toolbar';
import type { ReactNode } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * Step 2, first Slide: the first command a first-timer types is the install command of their AI agent. The exact
 * line for the picked system and AI agent sits in a command box with a big Copy button; the vendor's official docs
 * are one button away regardless, because some install pages need scrolling with no anchor. Under it, per AI agent,
 * what might happen, each pointing to Help (in the header). Only the vendor's bare minimum: nothing that goes stale.
 */
export const installYourAiAgent = slide({
  slug: 'install-your-ai-agent',
  messages: { en, de },
  segments: [
    { slug: 'your-first-command' },
    { slug: 'official-docs-always' },
    { slug: 'what-you-will-see' },
    { slug: 'what-might-happen' },
  ],
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
  content: ({ t }) => {
    const words = { copy: t('copy'), copied: t('copied') };
    const code = (chunks: ReactNode) => <code className="font-mono text-foreground">{chunks}</code>;
    const key = (chunks: ReactNode) => (
      <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-foreground">{chunks}</kbd>
    );
    // Needs human: Windows installer output and Antigravity's final output are unverified, so they say nothing specific.
    const end = {
      'claude-code': [t.rich('end.claude-code.one', { code, key }), t.rich('end.claude-code.two', { code, key })],
      codex: [t.rich('end.codex.one', { code, key }), t.rich('end.codex.two', { code, key })],
      copilot: [t.rich('end.copilot.one', { code, key }), t.rich('end.copilot.two', { code, key })],
    } as const;
    const happen = {
      'claude-code': [t.rich('happen.claude-code.one', { code }), t.rich('happen.claude-code.two', { code })],
      antigravity: [t.rich('happen.antigravity.one', { code }), t.rich('happen.antigravity.two', { code })],
      codex: [t.rich('happen.codex.one', { code }), t.rich('happen.codex.two', { code })],
      copilot: [t.rich('happen.copilot.one', { code }), t.rich('happen.copilot.two', { code })],
    } as const;
    return (
      <SlideFrame>
        <div className="flex flex-col gap-8">
          <GuideToolbar active={['os', 'agent']} labels={{ os: t('toolbar.os'), agent: t('toolbar.agent') }} />

          <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <p className="text-caption font-semibold uppercase text-primary">{t('firstCommand')}</p>
              <p className="text-body">{t('paste')}</p>
            </div>

            <PickSwitch
              name="agent"
              fallback={DEFAULT_AGENT}
              cases={casesOf(AGENTS, (agent) => (
                <PickSwitch
                  name="os"
                  fallback={DEFAULT_OS}
                  cases={casesOf(OPERATING_SYSTEMS, (os) => {
                    const command = installCommand(agent.id, os.id);
                    return (
                      <div className="flex flex-col gap-3">
                        <CopyLine text={command.text} where="shell" focal big words={words} />
                        {command.shell === 'powershell' ? (
                          <p className="text-caption text-muted-foreground">{t.rich('powershellHint', { code })}</p>
                        ) : null}
                        {command.commandPrompt === undefined ? null : (
                          <details className="text-caption" data-command-prompt="">
                            <summary className="cursor-pointer font-semibold text-primary">
                              {t('commandPromptSummary')}
                            </summary>
                            <div className="mt-3 flex flex-col gap-3">
                              <p className="text-muted-foreground">{t.rich('commandPromptHint', { code })}</p>
                              <CopyLine text={command.commandPrompt} where="shell" words={words} />
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                />
              ))}
            />

            <DoneStrip label={t('doneLabel')}>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 " data-end="">
                  <PickSwitch
                    name="agent"
                    fallback={DEFAULT_AGENT}
                    cases={casesOf(AGENTS, (agent) => {
                      const lines = end[agent.id as keyof typeof end];
                      return lines === undefined ? (
                        <p className="text-body">{t('end.generic')}</p>
                      ) : (
                        <ul className="flex list-disc flex-col gap-2 pl-5 text-body">
                          {lines.map((line, index) => (
                            <li key={index}>{line}</li>
                          ))}
                        </ul>
                      );
                    })}
                  />
                </div>

                <p className="text-body font-semibold">{t('worked')}</p>
              </div>
            </DoneStrip>

            <MoreHelp title={t('moreTitle')}>
              <div className="flex flex-wrap items-center gap-4">
                <PickSwitch
                  name="agent"
                  fallback={DEFAULT_AGENT}
                  cases={casesOf(AGENTS, (agent) => (
                    <OfficialLink
                      variant="outlined"
                      url={docsHref(agent.id)}
                      label={t('officialDocs', { agent: agent.name })}
                      newTab={t('newTab')}
                    />
                  ))}
                />
                <p className="min-w-0 flex-1 text-caption text-muted-foreground">{t('docsWhy')}</p>
              </div>

              <div className="flex flex-col gap-3 " data-happen="">
                <p className="text-caption font-semibold uppercase text-muted-foreground">{t('happenTitle')}</p>
                <PickSwitch
                  name="agent"
                  fallback={DEFAULT_AGENT}
                  cases={casesOf(AGENTS, (agent) => (
                    <ul className="flex list-disc flex-col gap-2 pl-5 text-body">
                      {happen[agent.id as keyof typeof happen].map((line, index) => (
                        <li key={index}>{line}</li>
                      ))}
                    </ul>
                  ))}
                />
                <p className="text-body font-semibold">{t('helpLine')}</p>
              </div>
            </MoreHelp>
          </div>
        </div>
      </SlideFrame>
    );
  },
});
