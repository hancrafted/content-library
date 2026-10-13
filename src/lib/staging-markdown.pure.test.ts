import { describe, expect, it } from 'vitest';
import {
  blocksOf,
  bodyLines,
  frontmatterField,
  h4s,
  headingsOf,
  orderedList,
  slideAnchors,
} from './staging-markdown.pure';

const DOSSIER = `---
type: dossier
title: 'Han''s budget'
quote: "a \\"spent\\" window"
generated:
  by: claude-code/opus-5.5
  at: 2026-10-12T00:00:00Z
after: top
---

# Budget {#budget}

## Why it forgets {#why}

### Spent attention {#spent}

#### Visual

master: basic-page · motion: liquid-ink-transition

### Lost middle {#middle}

## Unslugged section

### Orphan {#orphan}
`;

describe('success cases', () => {
  it('reads each heading with its level, slug and line, and the spine entry its block belongs to', () => {
    // ARRANGE
    const lines = bodyLines(DOSSIER);
    const expectedFirst = { level: 1, text: 'Budget {#budget}', slug: 'budget', line: 1 };
    const expectedOwners = ['budget', 'why', 'spent', 'spent', 'middle', 'middle', 'orphan'];
    const expectedVisual = ['', 'master: basic-page · motion: liquid-ink-transition', ''];
    // ACT
    const headings = headingsOf(lines);
    const blocks = blocksOf(lines);
    const visual = h4s(blocks, 'Visual');
    // ASSERT
    expect(headings[0]).toEqual(expectedFirst);
    expect(blocks.map(({ owner }) => owner)).toEqual(expectedOwners);
    expect(visual.map(({ body }) => body)).toEqual([expectedVisual]);
  });

  it('names every page slide by its section and slide slug', () => {
    // ARRANGE
    const blocks = blocksOf(bodyLines(DOSSIER));
    const expected = ['why--spent', 'why--middle'];
    // ACT
    const anchors = slideAnchors(blocks);
    // ASSERT
    expect(anchors).toEqual(expected);
  });

  it('reads an ordered list with its nested lines', () => {
    // ARRANGE
    const body = ['1. **Window** — it fills [1]', '   - sources: [1] Paper — https://a.example', '2. Second'];
    const expected = {
      items: [
        { text: '**Window** — it fills [1]', nested: ['sources: [1] Paper — https://a.example'] },
        { text: 'Second', nested: [] },
      ],
      strays: [],
    };
    // ACT
    const list = orderedList(body);
    // ASSERT
    expect(list).toEqual(expected);
  });

  it('reads a frontmatter field as YAML does, plain, single-quoted or double-quoted', () => {
    // ARRANGE
    const expected = ['dossier', "Han's budget", 'a "spent" window'];
    // ACT
    const values = ['type', 'title', 'quote'].map((key) => frontmatterField(DOSSIER, key));
    // ASSERT
    expect(values).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads a nested mapping in flow form, as OKF writes it', () => {
    // ARRANGE
    const flow = '---\ngenerated: { by: claude-code/opus-5.5, at: 2026-10-12T00:00:00Z }\n---\n';
    const expected = ['claude-code/opus-5.5', '2026-10-12T00:00:00Z'];
    // ACT
    const values = ['generated.by', 'generated.at'].map((key) => frontmatterField(flow, key));
    // ASSERT
    expect(values).toEqual(expected);
  });

  it('keeps a comment line inside a nested block from ending it', () => {
    // ARRANGE
    const commented = '---\ngenerated:\n  by: human:han\n# who wrote it\n  at: 2026-10-12T00:00:00Z\n---\n';
    const expected = '2026-10-12T00:00:00Z';
    // ACT
    const value = frontmatterField(commented, 'generated.at');
    // ASSERT
    expect(value).toBe(expected);
  });

  it('reads a key at any depth and a number as its text', () => {
    // ARRANGE
    const deep = '---\na:\n  b:\n    c: 7\n---\n';
    const expected = '7';
    // ACT
    const value = frontmatterField(deep, 'a.b.c');
    // ASSERT
    expect(value).toBe(expected);
  });

  it('reads a dotted key one level into a nested mapping and stops at the next top-level key', () => {
    // ARRANGE
    const expected = ['claude-code/opus-5.5', '2026-10-12T00:00:00Z', null];
    // ACT
    const values = ['generated.by', 'generated.at', 'generated.after'].map((key) => frontmatterField(DOSSIER, key));
    // ASSERT
    expect(values).toEqual(expected);
  });

  it('keeps every line outside the ordered list as a stray, a nested line before any item among them', () => {
    // ARRANGE
    const body = ['  - nested before any item', '1. Item', 'A loose sentence.'];
    const expected = ['  - nested before any item', 'A loose sentence.'];
    // ACT
    const { strays } = orderedList(body);
    // ASSERT
    expect(strays).toEqual(expected);
  });

  it('answers null for a field the frontmatter lacks, and for a file with no frontmatter', () => {
    // ARRANGE
    const bare = '# Budget\n\ntype: dossier\n';
    // ACT
    const missing = frontmatterField(DOSSIER, 'status');
    const throughScalar = frontmatterField(DOSSIER, 'type.x');
    const mapping = frontmatterField(DOSSIER, 'generated');
    const unfronted = frontmatterField(bare, 'type');
    // ASSERT
    expect(missing).toBeNull();
    expect(throughScalar).toBeNull();
    expect(mapping).toBeNull();
    expect(unfronted).toBeNull();
  });
});

describe('edge cases', () => {
  it('reads no heading inside a backtick or tilde fence', () => {
    // ARRANGE
    const lines = ['## Real {#real}', '```md', '## Fenced {#fenced}', '```', '~~~', '# Tilde', '~~~', '### After'];
    const expected = ['Real {#real}', 'After'];
    // ACT
    const headings = headingsOf(lines);
    // ASSERT
    expect(headings.map(({ text }) => text)).toEqual(expected);
  });

  it('gives a heading whose slug is malformed no slug, and an h3 with no slugged section no anchor', () => {
    // ARRANGE
    const lines = ['## Section {#Bad_Slug}', '### Slide {#slide}'];
    const expectedSlug = null;
    const expectedAnchors: string[] = [];
    // ACT
    const [section] = headingsOf(lines);
    const anchors = slideAnchors(blocksOf(lines));
    // ASSERT
    expect(section.slug).toBe(expectedSlug);
    expect(anchors).toEqual(expectedAnchors);
  });
});
