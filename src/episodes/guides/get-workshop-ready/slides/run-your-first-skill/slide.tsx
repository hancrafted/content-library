import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import type { ReactNode } from 'react';
import { AgentToolbar } from './agent-toolbar.client';
import { AgentView } from './agent-view.client';
import { BrowserWindow, Homepage } from './browser-window';
import { AGENT_NAMES, type Agent } from './first-skill.pure';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { OpenCommand } from './open-command.client';
import { Approval, Choices, PermissionPrompt } from './permission-prompt';
import { StepProgress } from './step-progress';
import { StuckBox } from './stuck-box.client';

/* The homepage the skill opens; the Slide draws it, it links nowhere. */
const HOMEPAGE = 'https://hancrafted.net';

const CLAUDE_CODE_PERMISSIONS = { slug: 'claude-code-permissions', url: 'https://code.claude.com/docs/en/permissions' };

/** A numbered half heading: "1 Say yes to the command", "2 Your browser opens hancrafted". */
function HalfLabel({ index, children }: { index: number; children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-body font-semibold">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-caption text-background">
        {index}
      </span>
      {children}
    </p>
  );
}

/** The one arrow from the prompt to the homepage, pointing down while the halves stack. */
function Arrow() {
  return (
    <div className="flex justify-center @3xl:col-span-1 @3xl:pt-48" aria-hidden>
      <svg viewBox="0 0 60 40" className="w-12 rotate-90 @3xl:w-full @3xl:rotate-0">
        <path d="M4 20 H 48" className="fill-none stroke-primary" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M40 10 L 54 20 L 40 30"
          className="fill-none stroke-primary"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/** The done line under the homepage: a filled check and the Slide's closing words. */
function Done({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-(--success)/40 bg-(--success)/10 p-4">
      <svg viewBox="0 0 20 20" className="mt-1 size-5 shrink-0" aria-hidden>
        <circle cx="10" cy="10" r="9" className="fill-(--success)" />
        <path
          d="M6 10.5 L 9 13 L 14 7.5"
          className="fill-none stroke-(--success-foreground)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-body">{children}</p>
    </div>
  );
}

/*
 * "Run your first skill" (Spec Option 7a, master grid-1x2, motion local): two halves in reading order, the AI agent's
 * permission prompt then the hancrafted homepage, joined by one arrow, "Yes" the single focal point. Pointing at one
 * half dims the other (`focus-group--dim-others`); no entrance, the wrapper plays it. The AI-agent pick swaps only the
 * prompt: Claude Code's dialog is drawn in its documented words (note "Claude Code's prompt"); the other AI agents'
 * wording is not verified, so their box says they ask in their own words instead of inventing it.
 */
export const runYourFirstSkill = slide({
  slug: 'run-your-first-skill',
  messages: { en, de },
  notes: [
    {
      slug: 'the-prompt-is-a-safeguard',
      target: 'prompt',
      sources: [
        { slug: 'owasp-prompt-injection', url: 'https://genai.owasp.org/llmrisk/llm01-prompt-injection/' },
        { slug: 'owasp-excessive-agency', url: 'https://genai.owasp.org/llmrisk/llm062025-excessive-agency/' },
        { slug: 'codex-approvals', url: 'https://learn.chatgpt.com/docs/agent-approvals-security' },
        { slug: 'gemini-cli-policy-engine', url: 'https://geminicli.com/docs/reference/policy-engine/' },
        {
          slug: 'copilot-cli',
          url: 'https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli',
        },
        { slug: 'antigravity-permissions', url: 'https://antigravity.google/docs/permissions/' },
        CLAUDE_CODE_PERMISSIONS,
      ],
    },
    { slug: 'claude-codes-prompt', target: 'prompt', sources: [CLAUDE_CODE_PERMISSIONS] },
    {
      slug: 'why-approvals-are-kept',
      target: 'approve-hint',
      sources: [
        { slug: 'claude-code-sandboxing', url: 'https://www.anthropic.com/engineering/claude-code-sandboxing' },
      ],
    },
  ],
  segments: [{ slug: 'type-the-skill' }, { slug: 'say-yes' }, { slug: 'the-proof' }],
  content: ({ t, template, marker, Marker, target }) => {
    const corner = <Marker note="the-prompt-is-a-safeguard" placement="beside" />;
    const command = <OpenCommand url={HOMEPAGE} />;
    const prompt = (agent: Agent, dialog: ReactNode) => (
      <PermissionPrompt
        title={t('prompt.window', { agent: AGENT_NAMES[agent] })}
        typed={t(`prompt.${agent}.typed`)}
        lookup={t('prompt.lookup')}
      >
        {dialog}
      </PermissionPrompt>
    );
    const asks = (agent: Exclude<Agent, 'claude-code'>) =>
      prompt(
        agent,
        <Approval corner={corner} command={command} reason={t('prompt.reason')}>
          <p className="mt-2 font-sans text-foreground">{t(`prompt.${agent}.asks`)}</p>
        </Approval>,
      );
    const views: Record<Agent, ReactNode> = {
      'claude-code': prompt(
        'claude-code',
        <Approval
          heading={t('prompt.claude-code.heading')}
          corner={corner}
          command={command}
          reason={t('prompt.reason')}
        >
          <Choices
            question={t('prompt.claude-code.question')}
            marker={<Marker note="claude-codes-prompt" placement="beside" />}
            choices={[
              t('prompt.claude-code.choices.yes'),
              t('prompt.claude-code.choices.always'),
              t('prompt.claude-code.choices.no'),
            ]}
          />
        </Approval>,
      ),
      antigravity: asks('antigravity'),
      codex: asks('codex'),
      copilot: asks('copilot'),
    };
    return (
      <SlideFrame>
        <div className="@container flex flex-col gap-8">
          <StepProgress label={t('step')} />
          <AgentToolbar label={t('toolbar.agent')} />
          <div className="rounded-2xl border border-border bg-card p-4 @3xl:p-8">
            <div className="focus-group focus-group--dim-others grid grid-cols-1 items-start gap-4 @3xl:grid-cols-12">
              <div className="focus-group__item flex min-w-0 flex-col gap-4 @3xl:col-span-6">
                <HalfLabel index={1}>{t('approve.label')}</HalfLabel>
                <div {...target('prompt')}>
                  <AgentView views={views} />
                </div>
                <p {...target('approve-hint')} className="text-caption text-muted-foreground">
                  {t.rich('approve.hint', { marker: marker('why-approvals-are-kept') })}
                </p>
              </div>
              <Arrow />
              <div className="focus-group__item flex min-w-0 flex-col gap-4 @3xl:col-span-5">
                <HalfLabel index={2}>{t('result.label')}</HalfLabel>
                <BrowserWindow address={t('result.address')}>
                  <Homepage
                    nav={[t('result.nav.episodes'), t('result.nav.learn'), t('result.nav.events')]}
                    eyebrow={t('result.hero.eyebrow')}
                    headline={t.rich('result.hero.headline', {
                      accent: (chunks) => <span className="text-brand-accent">{chunks}</span>,
                    })}
                    caption={t('result.hero.caption')}
                    cta={t('result.hero.cta')}
                  />
                </BrowserWindow>
                <Done>{t.rich('result.done')}</Done>
              </div>
            </div>
            <p className="mt-6 border-t border-border pt-4 text-caption text-muted-foreground">
              {t.rich('fallback', {
                url: (chunks) => <span className="font-mono break-all text-foreground">{chunks}</span>,
              })}
            </p>
          </div>
          <StuckBox
            words={{
              title: t('stuck.title'),
              step: t('stuck.step'),
              field: t('stuck.field'),
              placeholder: t('stuck.placeholder'),
              copy: t('stuck.copy'),
              copied: t('stuck.copied'),
              hint: t('stuck.hint'),
              empty: t('stuck.empty'),
              prompt: template('stuck.prompt'),
            }}
          />
        </div>
      </SlideFrame>
    );
  },
});
