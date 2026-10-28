import { describe, expect, it } from 'vitest';
import type { ResourceKind } from './resource-index.pure';
import {
  matchingResources,
  NO_SELECTION,
  resourceKindChoices,
  resourceTagChoices,
  type FilterableResource,
} from './resources-overview.pure';

/*
 * The Resources overview's filter (design-ADR 0019): a search over title, description and Tag names, any chosen
 * Tag, any chosen kind; the groups combine with AND. Words are written out by hand, in one locale.
 */

interface Words {
  readonly title: string;
  readonly description: string;
  readonly tags: readonly (readonly [string, string])[];
}
const resource = (slug: string, kind: string, { title, description, tags }: Words) => ({
  slug,
  kind,
  title,
  description,
  tags: tags.map(([id, label]) => ({ id, label })),
});

const CONTEXT = resource('context-window', 'master-slide', {
  title: 'Context window',
  description: 'How a model reads',
  tags: [['agentic-ai', 'Agentic AI']],
});
const HITL = resource('human-in-the-loop', 'master-slide', {
  title: 'Human in the loop',
  description: 'Where people step in',
  tags: [
    ['agentic-ai', 'Agentic AI'],
    ['workflow', 'Workflow'],
  ],
});
const TEMPLATE = resource('episode-template', 'episode-template', {
  title: 'Episode template',
  description: 'Start an Episode here',
  tags: [['workflow', 'Workflow']],
});
const ALL: readonly FilterableResource[] = [CONTEXT, HITL, TEMPLATE];

const NAMES: Record<ResourceKind, string> = {
  episode: 'Episodes',
  event: 'Events',
  'explorable-page': 'Explorables',
  'episode-template': 'Templates',
  'master-slide': 'Masters',
};
const slugs = (set: ReadonlySet<string>) => [...set];

describe('success cases', () => {
  it('keeps every Resource when nothing is chosen', () => {
    // ARRANGE
    const expected = ['context-window', 'human-in-the-loop', 'episode-template'];
    // ACT
    const kept = matchingResources(ALL, NO_SELECTION);
    // ASSERT
    expect(slugs(kept)).toEqual(expected);
  });

  it('searches the title, the description and the Tag names, ignoring case and surrounding space', () => {
    // ARRANGE
    const byTitle = { ...NO_SELECTION, query: '  CONTEXT ' };
    const byDescription = { ...NO_SELECTION, query: 'people step' };
    const byTag = { ...NO_SELECTION, query: 'workflow' };
    // ACT
    const kept = [byTitle, byDescription, byTag].map((selection) => slugs(matchingResources(ALL, selection)));
    // ASSERT
    expect(kept).toEqual([['context-window'], ['human-in-the-loop'], ['human-in-the-loop', 'episode-template']]);
  });

  it('keeps a Resource that carries any chosen Tag', () => {
    // ARRANGE
    const selection = { ...NO_SELECTION, tags: ['agentic-ai', 'sales'] };
    // ACT
    const kept = matchingResources(ALL, selection);
    // ASSERT
    expect(slugs(kept)).toEqual(['context-window', 'human-in-the-loop']);
  });

  it('keeps a Resource of any chosen kind', () => {
    // ARRANGE
    const selection = { ...NO_SELECTION, kinds: ['episode-template'] };
    // ACT
    const kept = matchingResources(ALL, selection);
    // ASSERT
    expect(slugs(kept)).toEqual(['episode-template']);
  });

  it('combines the search, the Tags and the kinds with AND', () => {
    // ARRANGE
    const selection = { query: 'loop', tags: ['workflow'], kinds: ['master-slide'] };
    const excluded = { ...selection, kinds: ['episode-template'] };
    // ACT
    const kept = [matchingResources(ALL, selection), matchingResources(ALL, excluded)].map(slugs);
    // ASSERT
    expect(kept).toEqual([['human-in-the-loop'], []]);
  });

  it('offers a chip for each Tag a Resource carries, in the vocabulary order, with its count', () => {
    // ARRANGE
    const vocabulary = ['workflow', 'sales', 'agentic-ai'] as const;
    const carriedByTwo = 2;
    const expected = [
      { id: 'workflow', label: 'Workflow', count: carriedByTwo },
      { id: 'agentic-ai', label: 'Agentic AI', count: carriedByTwo },
    ];
    // ACT
    const chips = resourceTagChoices(ALL, vocabulary);
    // ASSERT
    expect(chips).toEqual(expected);
  });

  it('offers a chip for each kind a Resource has, in the closed order, named by the words given', () => {
    // ARRANGE
    const kinds = ['episode-template', 'master-slide'] as const;
    const expected = [
      { id: 'episode-template', label: 'Templates', count: 1 },
      { id: 'master-slide', label: 'Masters', count: 2 },
    ];
    // ACT
    const chips = resourceKindChoices(ALL, kinds, NAMES);
    // ASSERT
    expect(chips).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('keeps nothing when the search matches no Resource', () => {
    // ARRANGE
    const selection = { ...NO_SELECTION, query: 'zebra' };
    // ACT
    const kept = matchingResources(ALL, selection);
    // ASSERT
    expect(slugs(kept)).toEqual([]);
  });

  it('offers no chips for no Resources', () => {
    // ARRANGE
    const none: readonly FilterableResource[] = [];
    // ACT
    const chips = [resourceTagChoices(none, ['workflow']), resourceKindChoices(none, ['master-slide'], NAMES)];
    // ASSERT
    expect(chips).toEqual([[], []]);
  });
});

describe('edge cases', () => {
  it('keeps a Resource whose search is only whitespace, as with no search', () => {
    // ARRANGE
    const selection = { ...NO_SELECTION, query: '   ' };
    // ACT
    const kept = matchingResources(ALL, selection);
    // ASSERT
    expect(kept.size).toBe(ALL.length);
  });
});
