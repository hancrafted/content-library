import { slideContext, type ReadString, type SlideContextSpec } from '@/components/episode/slide-context.pure';
import { sectionAnchor, slideAnchor } from '@/lib/episode.pure';

interface SlideContextEntry {
  readonly base: string;
  readonly anchor: string;
  readonly spec: SlideContextSpec;
}

export const AI_TOKEN_ECONOMY_CONTEXT = {
  motivation: {
    base: 'motivation',
    anchor: sectionAnchor('motivation'),
    spec: {
      notes: [
        { slug: 'freelancer-metaphor', target: 'title' },
        { slug: 'management-opt-in', target: 'freelancer-cards' },
      ],
    },
  },
  'lead-one-upskill-many': {
    base: 'motivation.slides.lead-one-upskill-many',
    anchor: slideAnchor('motivation', 'lead-one-upskill-many'),
    spec: {
      notes: [{ slug: 'upskill-vs-replace', target: 'title' }],
    },
  },
  'the-four-eras-of-ai': {
    base: 'motivation.slides.the-four-eras-of-ai',
    anchor: slideAnchor('motivation', 'the-four-eras-of-ai'),
    spec: {
      notes: [{ slug: 'emerging-disciplines', target: 'title' }],
    },
  },
  'the-invisible-invoice': {
    base: 'motivation.slides.the-invisible-invoice',
    anchor: slideAnchor('motivation', 'the-invisible-invoice'),
    spec: {
      notes: [{ slug: 'governance-asymmetry', target: 'title' }],
    },
  },
  'outcome-per-euro': {
    base: 'motivation.slides.outcome-per-euro',
    anchor: slideAnchor('motivation', 'outcome-per-euro'),
    spec: {
      notes: [{ slug: 'budget-accountability', target: 'title' }],
    },
  },
  'what-is-a-token': {
    base: 'what-is-a-token',
    anchor: sectionAnchor('what-is-a-token'),
    spec: {
      notes: [{ slug: 'probabilistic-units', target: 'title' }],
    },
  },
  'live-context-breakdown': {
    base: 'what-is-a-token.slides.live-context-breakdown',
    anchor: slideAnchor('what-is-a-token', 'live-context-breakdown'),
    spec: {
      notes: [{ slug: 'synthetic-abstractions', target: 'title' }],
    },
  },
  'cli-vs-web-tool-obscurity': {
    base: 'what-is-a-token.slides.cli-vs-web-tool-obscurity',
    anchor: slideAnchor('what-is-a-token', 'cli-vs-web-tool-obscurity'),
    spec: {
      notes: [{ slug: 'the-obscurity-playbook', target: 'title' }],
    },
  },
  'managing-context': {
    base: 'managing-context',
    anchor: sectionAnchor('managing-context'),
    spec: {
      notes: [{ slug: 'cognitive-stamina', target: 'title' }],
    },
  },
  'the-lost-middle': {
    base: 'managing-context.slides.the-lost-middle',
    anchor: slideAnchor('managing-context', 'the-lost-middle'),
    spec: {
      notes: [{ slug: 'attention-valley', target: 'title' }],
    },
  },
  'the-fullness-gauge-and-levers': {
    base: 'managing-context.slides.the-fullness-gauge-and-levers',
    anchor: slideAnchor('managing-context', 'the-fullness-gauge-and-levers'),
    spec: {
      notes: [{ slug: 'smart-zone-discipline', target: 'title' }],
    },
  },
  'cost-of-agentic-ai': {
    base: 'cost-of-agentic-ai',
    anchor: sectionAnchor('cost-of-agentic-ai'),
    spec: {
      notes: [{ slug: 'agentic-compounding', target: 'title' }],
    },
  },
  'the-compounding-cost-curve': {
    base: 'cost-of-agentic-ai.slides.the-compounding-cost-curve',
    anchor: slideAnchor('cost-of-agentic-ai', 'the-compounding-cost-curve'),
    spec: {
      notes: [{ slug: 'the-14x-spread', target: 'title' }],
    },
  },
  'model-tiers': {
    base: 'model-tiers',
    anchor: sectionAnchor('model-tiers'),
    spec: {
      notes: [
        { slug: 'tiered-stack-architecture', target: 'title' },
        { slug: 'zero-marginal-thinking', target: 'routing-flow' },
      ],
    },
  },
  'tools-and-tips': {
    base: 'tools-and-tips',
    anchor: sectionAnchor('tools-and-tips'),
    spec: {
      notes: [
        { slug: 'tooling-and-steering', target: 'title' },
        { slug: 'operational-habits', target: 'tools-grid' },
      ],
    },
  },
} as const satisfies Readonly<Record<string, SlideContextEntry>>;

export type AiTokenSlideKey = keyof typeof AI_TOKEN_ECONOMY_CONTEXT;

export type SectionsT = (key: string) => string;

export function contextFor(read: ReadString, key: AiTokenSlideKey) {
  const { base, anchor, spec } = AI_TOKEN_ECONOMY_CONTEXT[key];
  const { notes, voiceScript } = slideContext(read, base, spec);
  return { anchor, notes, voiceScript };
}

export const contextOf = (t: SectionsT, key: AiTokenSlideKey) => contextFor(t as ReadString, key);
