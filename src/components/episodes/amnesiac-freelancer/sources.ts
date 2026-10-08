import type { SourceSpec } from '@/components/episode/slide-context.pure';

/*
 * The sources the amnesiac-freelancer Episode cites, one entry each (FE-010 §3).
 * A note lists them in citation order; each title is a catalog leaf under the
 * note, so the same page can be titled per locale.
 */
export const SOURCE = {
  openaiConversationState: {
    slug: 'openai-conversation-state',
    url: 'https://platform.openai.com/docs/guides/conversation-state',
  },
  claudeContextWindows: {
    slug: 'claude-context-windows',
    url: 'https://platform.claude.com/docs/en/build-with-claude/context-windows',
  },
  claudeCodeMemory: { slug: 'claude-code-memory', url: 'https://code.claude.com/docs/en/memory' },
  anthropicLongRunningHarnesses: {
    slug: 'anthropic-long-running-harnesses',
    url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents',
  },
  codexMemories: { slug: 'codex-memories', url: 'https://developers.openai.com/codex/memories' },
  chromaContextRot: { slug: 'chroma-context-rot', url: 'https://research.trychroma.com/context-rot' },
  lostInTheMiddle: { slug: 'lost-in-the-middle', url: 'https://arxiv.org/abs/2307.03172' },
  anthropicContextEngineering: {
    slug: 'anthropic-context-engineering',
    url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
  },
  claudeCodeHowItWorks: {
    slug: 'claude-code-how-it-works',
    url: 'https://code.claude.com/docs/en/how-claude-code-works',
  },
  claudeBeClearAndDirect: {
    slug: 'claude-be-clear-and-direct',
    url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct',
  },
  claudeCodeBestPractices: {
    slug: 'claude-code-best-practices',
    url: 'https://code.claude.com/docs/en/best-practices',
  },
  agentsMd: { slug: 'agents-md', url: 'https://agents.md' },
  githubCopilotRepositoryInstructions: {
    slug: 'github-copilot-repository-instructions',
    url: 'https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions',
  },
  nygardArchitectureDecisions: {
    slug: 'nygard-architecture-decisions',
    url: 'https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions',
  },
  codexAgentsMd: { slug: 'codex-agents-md', url: 'https://developers.openai.com/codex/guides/agents-md' },
} as const satisfies Readonly<Record<string, SourceSpec>>;
