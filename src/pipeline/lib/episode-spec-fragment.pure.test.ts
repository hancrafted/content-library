import { describe, expect, it } from 'vitest';
import { checkFragment } from './episode-spec-fragment.pure.ts';

/*
 * The contract's findings on a designer's fragment. The pick checkbox is added by assembly, ticked on the recommended
 * Option as the assembler ticks it, so a fragment is judged as the page it becomes. Fragments are hand-written here.
 */

function option(id: string, mark: string): string {
  return `<figure data-spec="option" data-option="${id}"${mark}>
  <div data-spec="mock" class="bg-card text-foreground"><div class="h-4 w-1/2 bg-accent"></div></div>
  <figcaption><b>${id}</b> A reason. Scene.</figcaption>
  <div data-spec="build-notes">Keeps basic-page, motion none.</div>
</figure>`;
}

const fragment = (mark: string) => `<!-- slide: spent -->\n${option('1a', mark)}\n${option('1b', '')}`;

describe('success cases', () => {
  it.each([
    ['a bare data-recommended', ' data-recommended'],
    ['an empty data-recommended', ' data-recommended=""'],
    ['data-recommended="true"', ' data-recommended="true"'],
  ])('finds nothing in a fragment whose recommended Option carries %s', (_name, mark) => {
    // ARRANGE
    const expected: string[] = [];
    // ACT
    const findings = checkFragment(fragment(mark));
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('names a fragment whose only Option is marked data-recommended="false" as having no recommendation', () => {
    // ARRANGE
    const expected = ['The Slide {#spent} marks 0 Options recommended: mark exactly one with data-recommended.'];
    // ACT
    const findings = checkFragment(fragment(' data-recommended="false"'));
    // ASSERT
    expect(findings).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('asks for a slide marker when the fragment has none', () => {
    // ARRANGE
    const expected = ['The fragment has no <!-- slide: <slug> --> marker: start each Slide with one.'];
    // ACT
    const findings = checkFragment(option('1a', ' data-recommended'));
    // ASSERT
    expect(findings).toEqual(expected);
  });
});
