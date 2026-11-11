import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { GuideHelp } from '@/episodes/components/slide-shared/guide-help/guide-help';
import { DoneStrip, MoreHelp } from '@/episodes/components/slide-shared/guide-step/guide-step';
import { GuideToolbar } from '@/episodes/components/slide-shared/guide-toolbar/guide-toolbar';
import { externalHref } from '@/shared/lib/external-link.pure';
import { ByAgent, ByOs } from './by-pick.client';
import { MacMenu, WindowsMenu } from './folder-menu';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ExternalIcon, InfoIcon, MoveText, TrustBox } from './move-parts';
import { notes } from './notes';
import { type AiAgent, type Os } from './picks.pure';
import { fallbackCommand, FOLDER, startCommand, terminalPrompt, TRUST_PATH } from './start.pure';
import { PromptLine, TerminalWindow } from './terminal-window';
import { WindowsFallback } from './windows-fallback';

const START_PAGES: Readonly<Record<AiAgent, string>> = {
  'claude-code': 'https://code.claude.com/docs/en/quickstart',
  antigravity: 'https://antigravity.google/docs',
  codex: 'https://developers.openai.com/codex/cli',
  copilot: 'https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli',
};

// The menu is an example, not a promise about every Windows configuration; the alternative stays in closed help.
export const startTheAgentInsideThatFolder = slide({
  slug: 'start-the-agent-inside-that-folder',
  messages: { en, de },
  notes,
  segments: [{ slug: 'go-in-then-start' }, { slug: 'same-folder-every-time' }, { slug: 'chain-so-far' }],
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
    const terminalTitle = `${t('terminal')} · ${FOLDER}`;
    const byOs = <T,>(of: (os: Os) => T) => ({ mac: of('mac'), windows: of('windows'), linux: of('linux') }) as const;
    const byAgent = <T,>(of: (agent: AiAgent) => T) =>
      ({
        'claude-code': of('claude-code'),
        antigravity: of('antigravity'),
        codex: of('codex'),
        copilot: of('copilot'),
      }) as const;
    const promptLine = (highlight: boolean) => (
      <ByOs
        variants={byOs((os) => (
          <PromptLine prompt={terminalPrompt(os)} highlight={highlight} />
        ))}
      />
    );
    return (
      <SlideFrame>
        <div className="flex flex-col gap-8">
          <GuideToolbar active={['os', 'agent']} labels={{ os: t('toolbar.os'), agent: t('toolbar.agent') }} />
          <ol
            className="focus-group focus-group--dim-others flex flex-col gap-8 rounded-3xl border border-border bg-card p-5 md:p-8"
            {...target('folder')}
          >
            <li className="focus-group__item grid grid-cols-1 items-start gap-6 md:grid-cols-12" data-move="open">
              <MoveText n={1} title={t('moves.open.title')}>
                <p>
                  <ByOs
                    variants={{
                      mac: t.rich('moves.open.detail.mac'),
                      windows: t.rich('moves.open.detail.windows'),
                      linux: t.rich('moves.open.detail.linux'),
                    }}
                  />
                </p>
                <DoneStrip label={t('doneLabel')}>{t.rich('moves.open.worked')}</DoneStrip>
              </MoveText>
              <div className="flex min-w-0 flex-col gap-4 md:col-span-8">
                <ByOs
                  variants={{
                    mac: (
                      <>
                        <MacMenu
                          label={t('moves.open.menuLabel')}
                          folder={FOLDER}
                          items={[
                            t('moves.open.menu.mac.open'),
                            t('moves.open.menu.mac.getInfo'),
                            t('moves.open.menu.mac.rename'),
                            t('moves.open.menu.mac.compress', { folder: FOLDER }),
                          ]}
                          services={t('moves.open.menu.mac.services')}
                          pick={t('moves.open.menu.mac.newTerminal')}
                          other={t('moves.open.menu.mac.newTab')}
                        />
                        <p className="flex items-start gap-2 text-caption text-muted-foreground">
                          <InfoIcon />
                          <span>{t.rich('moves.open.note.mac')}</span>
                        </p>
                      </>
                    ),
                    windows: (
                      <>
                        <WindowsMenu
                          label={t('windows.menuLabel')}
                          folder={FOLDER}
                          before={[
                            t('windows.menu.open'),
                            t('moves.open.menu.windows.newWindow'),
                            t('moves.open.menu.windows.copyPath'),
                          ]}
                          pick={t('moves.open.menu.windows.terminal')}
                          after={t('moves.open.menu.windows.properties')}
                        />
                        <ByAgent
                          variants={byAgent((agent) =>
                            agent === 'copilot' ? (
                              <p className="text-caption text-muted-foreground">{t.rich('windows.copilot')}</p>
                            ) : null,
                          )}
                        />
                      </>
                    ),
                    linux: null,
                  }}
                />
                <TerminalWindow title={terminalTitle}>
                  <p className="flex flex-wrap items-center gap-x-2">
                    {promptLine(true)}
                    <span aria-hidden="true" className="h-5 w-2.5 bg-foreground" />
                  </p>
                </TerminalWindow>
                <ByOs
                  variants={{
                    mac: null,
                    linux: null,
                    windows: (
                      <WindowsFallback
                        shell={<ByAgent variants={byAgent((agent) => (agent === 'copilot' ? 'pwsh' : 'powershell'))} />}
                        copyWords={{ copy: t('copy'), copied: t('copied') }}
                        words={{
                          title: t('windows.helpTitle'),
                          open: t.rich('windows.open'),
                          addressBar: t('windows.addressBar'),
                          shellHint: t('windows.shellHint'),
                          check: t('windows.check'),
                          location: t('windows.location'),
                          file: t.rich('windows.file'),
                          fallback: t.rich('windows.fallback'),
                          alternate: t.rich('moves.open.note.windows'),
                        }}
                      />
                    ),
                  }}
                />
              </div>
            </li>
            <li className="focus-group__item grid grid-cols-1 items-start gap-6 md:grid-cols-12" data-agent-start="">
              <MoveText n={2} title={t('moves.start.title')}>
                <p>{t.rich('moves.start.detail')}</p>
                <ByAgent
                  variants={byAgent((agent) => (
                    <a
                      href={externalHref(START_PAGES[agent])}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-hover card-hover--raise inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-caption font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {t(`moves.start.link.${agent}`)}
                      <ExternalIcon />
                      <span className="sr-only">{t('moves.start.opensNewTab')}</span>
                    </a>
                  ))}
                />
                <DoneStrip label={t('doneLabel')}>{t('moves.start.worked')}</DoneStrip>
                <MoreHelp title={t('notFound.title')}>
                  <p data-not-found="">{t('notFound.fix')}</p>
                </MoreHelp>
              </MoveText>
              <div className="md:col-span-8">
                <TerminalWindow title={terminalTitle} ai>
                  <p>
                    {promptLine(false)}{' '}
                    <ByAgent
                      variants={byAgent((agent) => (
                        <span className="font-semibold text-primary">{startCommand(agent)}</span>
                      ))}
                    />
                  </p>
                  <ByAgent
                    variants={byAgent((agent) =>
                      agent === 'claude-code' ? (
                        <TrustBox
                          question={t('trust.question')}
                          path={<ByOs variants={TRUST_PATH} />}
                          yes={t('trust.yes')}
                          no={t('trust.no')}
                        />
                      ) : null,
                    )}
                  />
                </TerminalWindow>
              </div>
            </li>
            <ByOs
              variants={{
                windows: null,
                mac: (
                  <li>
                    <MoreHelp title={t('moreTitle')}>
                      {t.rich('fallback.text', { command: () => <code>{fallbackCommand('mac')}</code> })}
                    </MoreHelp>
                  </li>
                ),
                linux: (
                  <li>
                    <MoreHelp title={t('moreTitle')}>
                      {t.rich('fallback.text', { command: () => <code>{fallbackCommand('linux')}</code> })}
                    </MoreHelp>
                  </li>
                ),
              }}
            />
          </ol>
        </div>
      </SlideFrame>
    );
  },
});
