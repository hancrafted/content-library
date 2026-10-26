import { describe, expect, it } from 'vitest';
import { cropName, keepsCrop, pageImage, renderReference, type ReferenceInput } from './convert-reference.pure.ts';

/*
 * `npm run convert-reference`: how marker's paginated Markdown becomes a design-reference.md, one
 * `## Page <n>` per page with its whole-page image, and which of marker's cut-out images stay.
 * Running marker, pdftoppm and ImageMagick is the script's job; their output here is hand-written.
 */

const MARKER = `

{0}------------------------------------------------

**Why it's never too early to
start with sales**

{1}------------------------------------------------

# Goals

1. 1 Why watching over your cashflow is mission critical
2. 2 Why Sales is more than just selling

![](_page_1_Picture_4.jpeg)

{2}------------------------------------------------

# Watch your cashflow

## Gain Market Insight

### **Relevant:**

- • Prioritize how to spend time
- • Network

![](_page_2_Picture_7.jpeg)

![]()
`;

const INPUT: ReferenceInput = {
  markdown: MARKER,
  title: 'Never too early to sell deck',
  generatedBy: 'marker/2.0.0',
  generatedAt: '2026-10-14T12:00:00Z',
  source: { resource: '.scratch/never-too-early-sales/never-too-early-sell-deck.pdf', title: 'Workshop (1).pdf' },
  pageCount: 3,
  crops: { '_page_1_Picture_4.jpeg': 'page-02-picture-4.jpg', '_page_2_Picture_7.jpeg': null },
};

const EXPECTED = `---
type: episode-design-reference
title: Never too early to sell deck
generated:
  by: marker/2.0.0
  at: 2026-10-14T12:00:00Z
sources:
  - id: 1
    resource: .scratch/never-too-early-sales/never-too-early-sell-deck.pdf
    title: Workshop (1).pdf
---

# Never too early to sell deck

## Page 1

![Page 1](pages/page-01.jpg)

**Why it's never too early to
start with sales**

## Page 2

![Page 2](pages/page-02.jpg)

### Goals

1. Why watching over your cashflow is mission critical
2. Why Sales is more than just selling

![Page 2, picture 4](crops/page-02-picture-4.jpg)

## Page 3

![Page 3](pages/page-03.jpg)

### Watch your cashflow

#### Gain Market Insight

##### Relevant:

- Prioritize how to spend time
- Network
`;
describe('success cases', () => {
  it('writes one page heading per page with its image, the deck headings two levels down', () => {
    // ARRANGE
    const input = INPUT;
    // ACT
    const reference = renderReference(input);
    // ASSERT
    expect(reference).toBe(EXPECTED);
  });

  it('names a cut-out by its 1-based page, kind and number', () => {
    // ARRANGE
    const marker = '_page_15_Diagram_3.jpeg';
    const expected = 'page-16-diagram-3.jpg';
    // ACT
    const name = cropName(marker, 16);
    // ASSERT
    expect(name).toBe(expected);
  });

  it('keeps a cut-out whose longer edge reaches the minimum', () => {
    // ARRANGE
    const sizes = [
      { width: 10334, height: 3930 },
      { width: 235, height: 3785 },
    ];
    // ACT
    const kept = sizes.map(keepsCrop);
    // ASSERT
    expect(kept).toEqual([true, true]);
  });
});

describe('failure cases', () => {
  it('drops a cut-out smaller than the minimum on its longer edge', () => {
    // ARRANGE
    const icon = { width: 774, height: 221 };
    // ACT
    const kept = keepsCrop(icon);
    // ASSERT
    expect(kept).toBe(false);
  });

  it('names no cut-out for a file that is not marker’s', () => {
    // ARRANGE
    const names = ['deck.md', 'deck_meta.json', 'page_3.jpeg'];
    // ACT
    const crops = names.map((name) => cropName(name, 16));
    // ASSERT
    expect(crops).toEqual([null, null, null]);
  });

  it('drops an image marker linked that the crops map does not keep', () => {
    // ARRANGE
    const input = { ...INPUT, markdown: '{0}----------\n\n![](_page_0_Picture_1.jpeg)\n', pageCount: 1, crops: {} };
    const expected = '## Page 1\n\n![Page 1](pages/page-01.jpg)\n';
    // ACT
    const body = renderReference(input).split('# Never too early to sell deck\n\n')[1];
    // ASSERT
    expect(body).toBe(expected);
  });
});

describe('edge cases', () => {
  it('pads page numbers to the digits of the page count, at least two', () => {
    // ARRANGE
    const pages = [
      [3, 12],
      [7, 120],
    ] as const;
    const expected = ['pages/page-03.jpg', 'pages/page-007.jpg'];
    // ACT
    const images = pages.map(([page, count]) => pageImage(page, count));
    // ASSERT
    expect(images).toEqual(expected);
  });

  it('caps a demoted heading at h6', () => {
    // ARRANGE
    const input = { ...INPUT, markdown: '{0}----------\n\n##### Deep\n\n###### Deeper\n', pageCount: 1 };
    const expected = '## Page 1\n\n![Page 1](pages/page-01.jpg)\n\n###### Deep\n\n###### Deeper\n';
    // ACT
    const body = renderReference(input).split('# Never too early to sell deck\n\n')[1];
    // ASSERT
    expect(body).toBe(expected);
  });

  it('writes a page with no text as its heading and image only', () => {
    // ARRANGE
    const input = { ...INPUT, markdown: '{0}----------\n\n{1}----------\n\nText\n', pageCount: 2 };
    const expected = '## Page 1\n\n![Page 1](pages/page-01.jpg)\n\n## Page 2\n\n![Page 2](pages/page-02.jpg)\n\nText\n';
    // ACT
    const body = renderReference(input).split('# Never too early to sell deck\n\n')[1];
    // ASSERT
    expect(body).toBe(expected);
  });
});
