import { slideContext, type ReadString, type SlideContextSpec } from '@/components/episode/slide-context.pure';
import { slideAnchor } from '@/lib/episode.pure';
import { SOURCE } from './sources';

/*
 * The non-localized facts of the amnesiac-freelancer Episode's Speaker notes
 * and Voice script (FE-010 §6): slugs, targets, sources and time spans. The
 * words live in the Translation files. Transcribed from
 * docs/research/amnesiac-freelancer-script.md.
 */
interface SlideContextEntry {
  /** The Slide's Translation file path under the Episode's `sections` namespace. */
  readonly base: string;
  readonly spec: SlideContextSpec;
}

export const AMNESIAC_CONTEXT = {
  'blank-every-time': {
    base: 'blank-slate.slides.blank-every-time',
    spec: {
      notes: [
        {
          slug: 'stateless-by-design',
          target: 'stateless-by-design',
          sources: [SOURCE.openaiConversationState, SOURCE.claudeContextWindows],
        },
        {
          slug: 'fresh-window-per-session',
          target: 'prose',
          sources: [SOURCE.claudeCodeMemory],
        },
        {
          slug: 'shift-workers-per-anthropic',
          target: 'prose',
          sources: [SOURCE.anthropicLongRunningHarnesses],
        },
        { slug: 'our-word-not-theirs', target: 'caption' },
      ],
      segments: [
        { slug: 'blank-slate', from: 0.0, to: 0.75 },
        { slug: 'new-session-new-window', from: 0.75, to: 1.75 },
        { slug: 'shifts', from: 1.75, to: 2.75, bridge: true },
      ],
    },
  },
  'where-knowledge-lives': {
    base: 'blank-slate.slides.where-knowledge-lives',
    spec: {
      notes: [
        {
          slug: 'training',
          target: 'training',
          sources: [SOURCE.claudeCodeMemory, SOURCE.codexMemories],
        },
        {
          slug: 'the-session',
          target: 'session',
          sources: [SOURCE.chromaContextRot, SOURCE.lostInTheMiddle, SOURCE.anthropicContextEngineering],
        },
        {
          slug: 'files',
          target: 'files',
          sources: [SOURCE.claudeCodeHowItWorks, SOURCE.claudeCodeMemory],
        },
        {
          slug: 'compaction-is-lossy',
          target: 'session',
          sources: [SOURCE.anthropicContextEngineering],
        },
      ],
      segments: [
        { slug: 'training', from: 0.0, to: 1.0 },
        { slug: 'the-session', from: 1.0, to: 2.5 },
        { slug: 'files', from: 2.5, to: 3.5, bridge: true },
      ],
    },
  },
  'brief-and-rules': {
    base: 'onboarding.slides.brief-and-rules',
    spec: {
      notes: [
        {
          slug: 'the-brief',
          target: 'brief',
          sources: [SOURCE.claudeBeClearAndDirect],
        },
        {
          slug: 'house-rules',
          target: 'house-rules',
          sources: [SOURCE.claudeCodeBestPractices, SOURCE.agentsMd],
        },
        {
          slug: 'definition-of-done',
          target: 'definition-of-done',
          sources: [SOURCE.claudeCodeBestPractices, SOURCE.githubCopilotRepositoryInstructions],
        },
        {
          slug: 'colleague-test',
          target: 'brief',
          sources: [SOURCE.claudeBeClearAndDirect],
        },
      ],
      segments: [
        { slug: 'the-brief', from: 0.0, to: 1.0 },
        { slug: 'house-rules', from: 1.0, to: 2.5 },
        { slug: 'definition-of-done', from: 2.5, to: 4.0, bridge: true },
      ],
    },
  },
  'keep-it-short': {
    base: 'onboarding.slides.keep-it-short',
    spec: {
      notes: [
        {
          slug: 'bloat-gets-ignored',
          target: 'bloat-gets-ignored',
          sources: [SOURCE.claudeCodeBestPractices],
        },
        {
          slug: 'numbers-to-cite',
          target: 'prose',
          sources: [SOURCE.claudeCodeMemory, SOURCE.githubCopilotRepositoryInstructions],
        },
        {
          slug: 'minimal-is-not-short',
          target: 'caption',
          sources: [SOURCE.anthropicContextEngineering, SOURCE.claudeCodeMemory],
        },
      ],
      segments: [
        { slug: 'more-is-worse', from: 0.0, to: 1.0 },
        { slug: 'prune', from: 1.0, to: 2.0 },
        { slug: 'minimal-is-not-short', from: 2.0, to: 3.0, bridge: true },
      ],
    },
  },
  'decisions-in-writing': {
    base: 'onboarding.slides.decisions-in-writing',
    spec: {
      notes: [
        {
          slug: 'a-conversation-with-a-future-developer',
          target: 'caption',
          sources: [SOURCE.nygardArchitectureDecisions],
        },
        {
          slug: 'superseded-not-deleted',
          target: 'superseded-not-deleted',
          sources: [SOURCE.nygardArchitectureDecisions],
        },
        {
          slug: 'the-newcomers-two-bad-options',
          target: 'prose',
          sources: [SOURCE.nygardArchitectureDecisions],
        },
        { slug: 'mapping-not-a-sourced-claim', target: 'prose' },
      ],
      segments: [
        { slug: 'why-it-was-done', from: 0.0, to: 1.0 },
        { slug: 'superseded', from: 1.0, to: 2.0 },
        { slug: 'our-agent-arrives-later-every-time', from: 2.0, to: 3.0, bridge: true },
      ],
    },
  },
  'metaphor-breaks': {
    base: 'where-it-breaks.slides.metaphor-breaks',
    spec: {
      notes: [
        {
          slug: 'no-learning',
          target: 'no-learning',
          sources: [SOURCE.claudeCodeMemory],
        },
        {
          slug: 'context-not-enforcement',
          target: 'not-enforced',
          sources: [SOURCE.claudeCodeMemory],
        },
        {
          slug: 'reading-costs',
          target: 'reading-costs',
          sources: [SOURCE.claudeCodeBestPractices],
        },
        {
          slug: 'beyond-the-sources',
          target: 'not-enforced',
          sources: [SOURCE.agentsMd, SOURCE.codexAgentsMd],
        },
      ],
      segments: [
        { slug: 'no-learning', from: 0.0, to: 1.25 },
        { slug: 'not-enforced', from: 1.25, to: 2.75 },
        { slug: 'reading-costs', from: 2.75, to: 4.0, bridge: true },
      ],
    },
  },
  'enforce-and-verify': {
    base: 'where-it-breaks.slides.enforce-and-verify',
    spec: {
      notes: [
        {
          slug: 'verification-you-can-run',
          target: 'prose',
          sources: [SOURCE.claudeCodeBestPractices],
        },
        {
          slug: 'a-different-grader',
          target: 'caption',
          sources: [SOURCE.claudeCodeBestPractices],
        },
        { slug: 'independent-of-prose', target: 'prose' },
        { slug: 'close', target: 'title' },
      ],
      segments: [
        { slug: 'prove-it', from: 0.0, to: 1.0 },
        { slug: 'another-pair-of-eyes', from: 1.0, to: 2.0 },
        { slug: 'wrap-up', from: 2.0, to: 3.0, bridge: true },
      ],
    },
  },
} as const satisfies Readonly<Record<string, SlideContextEntry>>;

export type SlideSlug = keyof typeof AMNESIAC_CONTEXT;

/**
 * A Slide's anchor, notes and voice script. `read` is the Episode's `sections`
 * translator seen as a plain key-to-string function: the Episode file casts it
 * once, because these keys are built at run time and tsc cannot check them.
 * The unit key-shape test and the post-build raw-key test do (FE-010 §6).
 */
export function contextFor(read: ReadString, slug: SlideSlug) {
  const { base, spec } = AMNESIAC_CONTEXT[slug];
  const { notes, voiceScript } = slideContext(read, base, spec);
  return { anchor: slideAnchor(base.split('.')[0], slug), notes, voiceScript };
}
