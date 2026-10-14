import { describe, expect, it } from 'vitest';
import { outputLabel, outputSegments, previewHref } from './dashboard-outputs.pure';

/*
 * A Job's output path read against the Episode folder the dashboard was given, `docs/episodes/<slug>`, and a Build
 * Job's dev-server port as the link the dashboard shows.
 */

const FOLDER = 'never-too-early';

describe('success cases', () => {
  it('maps an output in the chosen folder to its path inside it, one segment per sub-folder', () => {
    // ARRANGE
    const outputs = [
      'docs/episodes/never-too-early/brief.md',
      'docs/episodes/never-too-early/research/AIE-0001__recall/research.md',
    ];
    const expected = [['brief.md'], ['research', 'AIE-0001__recall', 'research.md']];
    // ACT
    const segments = outputs.map((output) => outputSegments(output, FOLDER));
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it("labels an output by its path inside its Episode's staging folder", () => {
    // ARRANGE
    const outputs = ['docs/episodes/never-too-early/spec/spec.md', 'src/components/episodes/x/page.tsx'];
    const expected = ['spec/spec.md', 'src/components/episodes/x/page.tsx'];
    // ACT
    const labels = outputs.map(outputLabel);
    // ASSERT
    expect(labels).toEqual(expected);
  });

  it('links a port on localhost', () => {
    // ARRANGE
    const port = 4001;
    const expected = 'http://localhost:4001';
    // ACT
    const href = previewHref(port);
    // ASSERT
    expect(href).toBe(expected);
  });
});

describe('failure cases', () => {
  it("answers null for an output outside the chosen folder or another Episode's", () => {
    // ARRANGE
    const outputs = ['src/components/episodes/x/page.tsx', 'docs/episodes/other/brief.md', 'docs/episodes/brief.md'];
    const expected = [null, null, null];
    // ACT
    const segments = outputs.map((output) => outputSegments(output, FOLDER));
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('answers null for a glob or a path that climbs out of the folder', () => {
    // ARRANGE
    const outputs = [
      'docs/episodes/never-too-early/research/*/research.md',
      'docs/episodes/never-too-early/../other/brief.md',
      'docs/episodes/never-too-early/spec//spec.md',
    ];
    const expected = [null, null, null];
    // ACT
    const segments = outputs.map((output) => outputSegments(output, FOLDER));
    // ASSERT
    expect(segments).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('answers null for the folder itself, which names no file', () => {
    // ARRANGE
    const outputs = ['docs/episodes/never-too-early/', 'docs/episodes/never-too-early'];
    const expected = [null, null];
    // ACT
    const segments = outputs.map((output) => outputSegments(output, FOLDER));
    // ASSERT
    expect(segments).toEqual(expected);
  });

  it('reads a folder name holding regex characters literally', () => {
    // ARRANGE
    const folder = 'demo.(copy)';
    const outputs = ['docs/episodes/demo.(copy)/brief.md', 'docs/episodes/demoX(copy)/brief.md'];
    const expected = [['brief.md'], null];
    // ACT
    const segments = outputs.map((output) => outputSegments(output, folder));
    // ASSERT
    expect(segments).toEqual(expected);
  });
});
