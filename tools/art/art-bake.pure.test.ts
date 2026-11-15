import { describe, expect, it } from 'vitest';
import { bakeArt } from './art-bake.pure.ts';
import { cssRules } from './css-rules.pure.ts';

/** A page as the art build renders it: the figure's host inline, its drawing inside `<g data-art-source>`. */
const page = (drawing: string, host = 'robot-module__figure') =>
  `<div><div data-zone="near"><svg viewBox="0 0 10 10"><g class="${host}">` +
  `<g data-art-source="robot/hull">${drawing}</g></g></svg></div></div>`;

const ROBOT_CSS = `
.robot-module__figure { --robot-lit: red; }
.dark .robot-module__figure { --robot-lit: blue; }
.robot-module__facet { stroke-width: 0.6; }
.robot-module__lit { fill: var(--robot-lit); stroke: var(--robot-lit); }
`;

describe('success cases', () => {
  it('writes a class rule onto the drawing as presentation attributes and strips the class and hooks', () => {
    // ARRANGE
    const drawing = '<polygon data-part="dome" points="0,0 1,1" class="robot-module__facet robot-module__lit"/>';
    const expected = [
      {
        name: 'robot/hull',
        body: '<polygon points="0,0 1,1" stroke-width="0.6" fill="var(--robot-lit)" stroke="var(--robot-lit)"/>',
      },
    ];
    // ACT
    const pieces = bakeArt(page(drawing), cssRules(ROBOT_CSS));
    // ASSERT
    expect(pieces).toEqual(expected);
  });

  it('lets the more specific rule win, then the later one', () => {
    // ARRANGE
    const css = `
      .clouds-module__clouds [data-tone='lit'] { fill: var(--lit); }
      [data-tone] { fill: black; }
      .clouds-module__clouds [data-tone] { stroke: var(--a); }
      .clouds-module__clouds [data-tone] { stroke: var(--b); }`;
    const markup = page('<path d="M0 0" data-tone="lit"/>', 'clouds-module__clouds');
    const expected = '<path d="M0 0" fill="var(--lit)" stroke="var(--b)"/>';
    // ACT
    const [piece] = bakeArt(markup, cssRules(css));
    // ASSERT
    expect(piece?.body).toBe(expected);
  });
});

describe('failure cases', () => {
  it('refuses paint that holds only under page state, which a <use> clone cannot see', () => {
    // ARRANGE
    const css = `${ROBOT_CSS}\n.dark .robot-module__figure .robot-module__lit { fill: white; }`;
    const markup = page('<polygon points="0,0" class="robot-module__lit"/>');
    const expected = /dark mode or on the active Slide/;
    // ACT
    const bake = () => bakeArt(markup, cssRules(css));
    // ASSERT
    expect(bake).toThrow(expected);
  });

  it('refuses motion inside a drawing', () => {
    // ARRANGE
    const css = `[data-zone='active'] .robot-module__beam { animation: beam 1s both; }`;
    const markup = page('<g class="robot-module__beam"><polygon points="0,0"/></g>');
    const expected = /nothing animates inside an asset/;
    // ACT
    const bake = () => bakeArt(markup, cssRules(css));
    // ASSERT
    expect(bake).toThrow(expected);
  });

  it('refuses a clip path inside a drawing, which an external file cannot reference', () => {
    // ARRANGE
    const markup = page('<g clip-path="url(#feed)"><path d="M0 0"/></g>');
    const expected = /references by id/;
    // ACT
    const bake = () => bakeArt(markup, []);
    // ASSERT
    expect(bake).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('refuses a page-wide class inside a drawing, whose paint the bake cannot read', () => {
    // ARRANGE
    const markup = page('<line x1="0" y1="0" x2="1" y2="1" class="stroke-muted-foreground"/>');
    const expected = /stroke-muted-foreground/;
    // ACT
    const bake = () => bakeArt(markup, cssRules(ROBOT_CSS));
    // ASSERT
    expect(bake).toThrow(expected);
  });

  it('leaves rules on the host to the page: custom properties and motion there are inherited, not baked', () => {
    // ARRANGE
    const css = `${ROBOT_CSS}\n[data-zone='near'] .robot-module__figure { animation: rock 4s infinite; }`;
    const markup = page('<polygon points="0,0"/>');
    const expected = '<polygon points="0,0"/>';
    // ACT
    const [piece] = bakeArt(markup, cssRules(css));
    // ASSERT
    expect(piece?.body).toBe(expected);
  });

  it('drops stroke geometry that reaches an unstroked drawing, so a stray Slide rule does not split one picture in two', () => {
    // ARRANGE
    const css = `.slide-module__art [data-tone] { stroke-width: 0.6; stroke-linejoin: round; }`;
    const markup = page('<path d="M0 0" data-tone="lit"/>', 'slide-module__art');
    const expected = '<path d="M0 0"/>';
    // ACT
    const [piece] = bakeArt(markup, cssRules(css));
    // ASSERT
    expect(piece?.body).toBe(expected);
  });

  it('keeps stroke geometry where the host strokes the drawing, which the <use> inherits', () => {
    // ARRANGE
    const css = `.robot-module__figure { stroke: var(--edge); }\n.robot-module__facet { stroke-width: 0.6; }`;
    const markup = page('<path d="M0 0" class="robot-module__facet"/>');
    const expected = '<path d="M0 0" stroke-width="0.6"/>';
    // ACT
    const [piece] = bakeArt(markup, cssRules(css));
    // ASSERT
    expect(piece?.body).toBe(expected);
  });

  it('reads a stroke that falls back to none as no stroke where no host sets its property', () => {
    // ARRANGE
    const css = `.ship-module__ship [data-tone='house-shade'] { stroke: var(--edge, none); }
      .slide-module__art [data-tone] { stroke-width: 0.6; }`;
    const markup = page('<path d="M0 0" data-tone="house-shade"/>', 'slide-module__art ship-module__ship');
    const expected = '<path d="M0 0" stroke="var(--edge, none)"/>';
    // ACT
    const [piece] = bakeArt(markup, cssRules(css));
    // ASSERT
    expect(piece?.body).toBe(expected);
  });

  it('ignores a rule whose ancestor is another figure, which never wraps this drawing', () => {
    // ARRANGE
    const css = `.zone-scene-module__water [data-tone] { fill: var(--water); }`;
    const markup = page('<path d="M0 0" data-tone="lit"/>', 'clouds-module__clouds');
    const expected = '<path d="M0 0"/>';
    // ACT
    const [piece] = bakeArt(markup, cssRules(css));
    // ASSERT
    expect(piece?.body).toBe(expected);
  });
});
