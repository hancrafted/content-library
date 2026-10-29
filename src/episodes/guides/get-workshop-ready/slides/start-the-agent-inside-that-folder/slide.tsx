import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { externalHref } from '@/shared/lib/external-link.pure';
import { ByAgent, ByOs } from './by-pick.client';
import { MacMenu, WindowsMenu } from './folder-menu';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { ExternalIcon, InfoIcon, MoveText, TrustBox } from './move-parts';
import { PickGroup } from './pick-toolbar.client';
import { fallbackCommand, FOLDER, startCommand, terminalPrompt } from './start.pure';
import { StepRail } from './step-rail';
import { StuckBox } from './stuck-box.client';
import { AI_AGENTS, OPERATING_SYSTEMS, type AiAgent } from './stuck-prompt.pure';
import { PromptLine, TerminalWindow } from './terminal-window';

/*
 * Each AI agent's official start page. Not yet confirmed against each vendor's current docs (the Spec's build notes):
 * Claude Code's quickstart, OpenAI's Codex CLI page, GitHub's Copilot CLI page the Spec's research cites, and
 * Antigravity's docs home.
 */
const START_PAGES: Readonly<Record<AiAgent, string>> = {
  'claude-code': 'https://code.claude.com/docs/en/quickstart',
  antigravity: 'https://antigravity.google/docs',
  codex: 'https://developers.openai.com/codex/cli',
  copilot: 'https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli',
};

/** Where the trust question shows the folder, as the AI agent sees it on each OS. */
const TRUST_PATH = {
  mac: '~/Downloads/starter-folder',
  windows: 'C:\\Users\\han\\Downloads\\starter-folder',
  linux: '~/Downloads/starter-folder',
} as const;

// Step 6, Option 6a: the terminal opens from the folder's own right-click menu, so a first-timer types no path, then
// the AI agent starts in that window; each move beside the state the viewer matches on their own screen, a quiet `cd`
// line as fallback. Both toolbars show. Hover dims the other move (`focus-group--dim-others`). Motion: none.
export const startTheAgentInsideThatFolder = slide({
  slug: 'start-the-agent-inside-that-folder',
  messages: { en, de },
  segments: [{ slug: 'go-in-then-start' }, { slug: 'same-folder-every-time' }, { slug: 'chain-so-far' }],
  content: ({ t, template }) => {
    const osNames = {
      mac: t('toolbar.names.mac'),
      windows: t('toolbar.names.windows'),
      linux: t('toolbar.names.linux'),
    };
    const agentNames = {
      'claude-code': t('agents.claude-code'),
      antigravity: t('agents.antigravity'),
      codex: t('agents.codex'),
      copilot: t('agents.copilot'),
    };
    const terminalTitle = `${t('terminal')} · ${FOLDER}`;
    const byOs = <T,>(of: (os: (typeof OPERATING_SYSTEMS)[number]) => T) =>
      ({ mac: of('mac'), windows: of('windows'), linux: of('linux') }) as const;
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
          <StepRail step={6} pill={t('step')} />
          <div className="flex flex-wrap items-center gap-3">
            <PickGroup
              name="os"
              fallback="mac"
              label={t('toolbar.os')}
              options={OPERATING_SYSTEMS.map((os) => ({ value: os, label: osNames[os] }))}
            />
            <PickGroup
              name="agent"
              fallback="claude-code"
              label={t('toolbar.agent')}
              ai
              options={AI_AGENTS.map((agent) => ({ value: agent, label: agentNames[agent] }))}
            />
          </div>
          <ol className="focus-group focus-group--dim-others flex flex-col gap-8 rounded-3xl border border-border bg-card p-5 md:p-8">
            <li className="focus-group__item grid grid-cols-1 items-start gap-6 md:grid-cols-12">
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
                <p>{t.rich('moves.open.worked')}</p>
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
                          label={t('moves.open.menuLabel')}
                          folder={FOLDER}
                          before={[
                            t('moves.open.menu.windows.newTab'),
                            t('moves.open.menu.windows.newWindow'),
                            t('moves.open.menu.windows.pin'),
                            t('moves.open.menu.windows.compress'),
                            t('moves.open.menu.windows.copyPath'),
                            t('moves.open.menu.windows.properties'),
                          ]}
                          pick={t('moves.open.menu.windows.terminal')}
                          after={t('moves.open.menu.windows.more')}
                        />
                        <p className="flex items-start gap-2 text-caption text-muted-foreground">
                          <InfoIcon />
                          <span>{t.rich('moves.open.note.windows')}</span>
                        </p>
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
              </div>
            </li>
            <li className="focus-group__item grid grid-cols-1 items-start gap-6 md:grid-cols-12">
              <MoveText n={2} title={t('moves.start.title')}>
                <p>
                  <ByAgent
                    variants={byAgent((agent) =>
                      startCommand(agent) === null ? t('moves.start.antigravity') : t.rich('moves.start.detail'),
                    )}
                  />
                </p>
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
            <li className="border-t border-border pt-5 text-caption text-muted-foreground">
              {t.rich('fallback.text', {
                command: () => (
                  <code className="rounded-md bg-muted px-1.5 font-mono text-foreground">
                    <ByOs variants={byOs(fallbackCommand)} />
                  </code>
                ),
              })}
            </li>
          </ol>
          <StuckBox
            names={{ os: osNames, agent: agentNames }}
            words={{
              title: t('stuck.title'),
              hint: t('stuck.hint'),
              label: t('stuck.label'),
              placeholder: t('stuck.placeholder'),
              adds: t('stuck.adds'),
              step: t('stuck.step'),
              copy: t('stuck.copy'),
              copied: t('stuck.copied'),
              noError: t('stuck.noError'),
              template: template('stuck.template'),
            }}
          />
        </div>
      </SlideFrame>
    );
  },
});
