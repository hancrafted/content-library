import { slideContext, type ReadString, type SlideContextSpec } from '@/components/episode-page/slide-context.pure';
import { sectionAnchor, slideAnchor } from '@/lib/episode.pure';

/*
 * The non-localized facts of the maintaining-markdown-for-ai Episode's Speaker
 * notes and Voice script (FE-010 §6): slugs, targets and time spans.
 * Transcribed from docs/research/maintaining-markdown-for-ai-script.md.
 */
interface SlideContextEntry {
  readonly base: string;
  readonly anchor: string;
  readonly spec: SlideContextSpec;
}

export const MAINTAINING_CONTEXT = {
  'markdown-in-ai-workflows': {
    base: 'markdown-in-ai-workflows',
    anchor: sectionAnchor('markdown-in-ai-workflows'),
    spec: {
      notes: [
        { slug: 'three-contexts', target: 'title' },
        { slug: 'retrieval-cost', target: 'knowledge' },
      ],
      segments: [
        { slug: 'agentic-era', from: 0.0, to: 0.75 },
        { slug: 'three-categories', from: 0.75, to: 1.5, bridge: true },
      ],
    },
  },
  'volume-outruns-review': {
    base: 'volume-outruns-review',
    anchor: sectionAnchor('volume-outruns-review'),
    spec: {
      notes: [
        { slug: 'decay-vs-drift', target: 'title' },
        { slug: 'corpus-compounding', target: 'corpus-chart' },
      ],
      segments: [
        { slug: 'effort-decay', from: 0.0, to: 0.6 },
        { slug: 'corpus-compounding', from: 0.6, to: 1.25, bridge: true },
      ],
    },
  },
  'where-the-effort-goes': {
    base: 'where-the-effort-goes',
    anchor: sectionAnchor('where-the-effort-goes'),
    spec: {
      notes: [
        { slug: 'three-boundaries', target: 'title' },
        { slug: 'division-of-labour', target: 'venn' },
      ],
      segments: [{ slug: 'three-boundaries', from: 0.0, to: 0.75, bridge: true }],
    },
  },
  'what-the-machine-verifies': {
    base: 'where-the-effort-goes.slides.what-the-machine-verifies',
    anchor: slideAnchor('where-the-effort-goes', 'what-the-machine-verifies'),
    spec: {
      notes: [
        { slug: 'deterministic-checks', target: 'title' },
        { slug: 'mechanical-ceiling', target: 'check-result' },
      ],
      segments: [{ slug: 'mechanical-ceiling', from: 0.0, to: 0.75 }],
    },
  },
  'what-ai-accelerates': {
    base: 'where-the-effort-goes.slides.what-ai-accelerates',
    anchor: slideAnchor('where-the-effort-goes', 'what-ai-accelerates'),
    spec: {
      notes: [
        { slug: 'cross-referencing', target: 'title' },
        { slug: 'signals-not-resolutions', target: 'discrepancy-card' },
      ],
      segments: [{ slug: 'signals-and-contradictions', from: 0.0, to: 0.85 }],
    },
  },
  'what-remains-human': {
    base: 'where-the-effort-goes.slides.what-remains-human',
    anchor: slideAnchor('where-the-effort-goes', 'what-remains-human'),
    spec: {
      notes: [
        { slug: 'ground-truth', target: 'title' },
        { slug: 'accountability', target: 'judgment-card' },
      ],
      segments: [{ slug: 'accountability-ground-truth', from: 0.0, to: 0.75 }],
    },
  },
  'google-okf': {
    base: 'google-okf',
    anchor: sectionAnchor('google-okf'),
    spec: {
      notes: [
        { slug: 'open-knowledge-format', target: 'title' },
        { slug: 'lifecycle-fields', target: 'schema-card' },
      ],
      segments: [{ slug: 'shared-vocabulary', from: 0.0, to: 1.08, bridge: true }],
    },
  },
  'steering-the-ai': {
    base: 'steering-the-ai',
    anchor: sectionAnchor('steering-the-ai'),
    spec: {
      notes: [
        { slug: 'raising-the-floor', target: 'title' },
        { slug: 'tool-boundary', target: 'venn' },
      ],
      segments: [{ slug: 'raising-the-floor', from: 0.0, to: 0.85 }],
    },
  },
  'deterministic-core': {
    base: 'steering-the-ai.slides.deterministic-core',
    anchor: slideAnchor('steering-the-ai', 'deterministic-core'),
    spec: {
      notes: [
        { slug: 'three-triggers', target: 'title' },
        { slug: 'predictable-eval', target: 'flow-diagram' },
      ],
      segments: [{ slug: 'three-triggers', from: 0.0, to: 0.85, bridge: true }],
    },
  },
  'live-demo': {
    base: 'steering-the-ai.slides.live-demo',
    anchor: slideAnchor('steering-the-ai', 'live-demo'),
    spec: {
      notes: [
        { slug: 'demo-contrast', target: 'title' },
        { slug: 'holding-slide', target: 'terminal-panel' },
      ],
      segments: [{ slug: 'demo-walkthrough', from: 0.0, to: 3.5 }],
    },
  },
  'feature-roadmap': {
    base: 'steering-the-ai.slides.feature-roadmap',
    anchor: slideAnchor('steering-the-ai', 'feature-roadmap'),
    spec: {
      notes: [
        { slug: 'v0-0-4-scope', target: 'shipped-col' },
        { slug: 'future-checks', target: 'planned-col' },
      ],
    },
  },
  'the-verifying-half-is-yours': {
    base: 'the-verifying-half-is-yours',
    anchor: sectionAnchor('the-verifying-half-is-yours'),
    spec: {
      notes: [
        { slug: 'the-work-moved', target: 'title' },
        { slug: 'closing-thesis', target: 'conclusion-card' },
      ],
      segments: [{ slug: 'closing-thesis', from: 0.0, to: 0.85 }],
    },
  },
} as const satisfies Readonly<Record<string, SlideContextEntry>>;

export type MaintainingSlideKey = keyof typeof MAINTAINING_CONTEXT;

export type SectionsT = (key: string) => string;

export function contextFor(read: ReadString, key: MaintainingSlideKey) {
  const { base, anchor, spec } = MAINTAINING_CONTEXT[key];
  const { notes, voiceScript } = slideContext(read, base, spec);
  return { anchor, notes, voiceScript };
}

export const contextOf = (t: SectionsT, key: MaintainingSlideKey) => contextFor(t as ReadString, key);
