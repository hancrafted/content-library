import { describe, expect, it } from 'vitest';
import {
  isGlob,
  outputLabel,
  outputSegments,
  previewHref,
  previewPort,
  readOutput,
  writtenOutputs,
} from './dashboard-outputs.pure';
import { createMemoryFolder } from './episode-folder.pure';

/*
 * A Job's output path read against the Episode folder the dashboard was given, `docs/episodes/<slug>`, and a Build
 * Job's dev-server port as the link the dashboard shows.
 */

const FOLDER = 'never-too-early';

describe('success cases', () => {
  it("finds which of the jobs' outputs are written in the chosen folder, once a file appears", async () => {
    // ARRANGE
    const folder = createMemoryFolder(FOLDER, { 'brief.md': '# Brief' });
    const jobs = [
      { outputs: ['docs/episodes/never-too-early/brief.md'] },
      { outputs: ['docs/episodes/never-too-early/spec/spec.md', 'docs/episodes/never-too-early/brief.md'] },
    ];
    const expectedBefore = ['docs/episodes/never-too-early/brief.md'];
    const expectedAfter = ['docs/episodes/never-too-early/brief.md', 'docs/episodes/never-too-early/spec/spec.md'];
    // ACT
    const before = await writtenOutputs(folder, jobs);
    folder.write('spec/spec.md', '# Spec');
    const after = await writtenOutputs(folder, jobs);
    // ASSERT
    expect([...before]).toEqual(expectedBefore);
    expect([...after]).toEqual(expectedAfter);
  });

  it('reads a written output as text', async () => {
    // ARRANGE
    const folder = createMemoryFolder(FOLDER, { 'research/AIE-0001__recall/research.md': '# Recall' });
    const expected = '# Recall';
    // ACT
    const text = await readOutput(folder, 'docs/episodes/never-too-early/research/AIE-0001__recall/research.md');
    // ASSERT
    expect(text).toBe(expected);
  });

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
    const outputs = ['docs/episodes/never-too-early/spec/spec.md', 'src/episodes/x/page.tsx'];
    const expected = ['spec/spec.md', 'src/episodes/x/page.tsx'];
    // ACT
    const labels = outputs.map(outputLabel);
    // ASSERT
    expect(labels).toEqual(expected);
  });

  it("shows a running Section Job's preview, and the integration Job's from its start on, finished too", () => {
    // ARRANGE
    const jobs = [
      { id: 'implement-section-why', port: 4001, state: 'running' as const },
      { id: 'implement-episode-init', port: 4000, state: 'running' as const },
      { id: 'implement-episode-init', port: 4000, state: 'ok' as const },
    ];
    const expected = [4001, 4000, 4000];
    // ACT
    const ports = jobs.map(previewPort);
    // ASSERT
    expect(ports).toEqual(expected);
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
  it('reads no text for an output that is gone, outside the folder or a glob', async () => {
    // ARRANGE
    const folder = createMemoryFolder(FOLDER, { 'brief.md': '# Brief' });
    const outputs = [
      'docs/episodes/never-too-early/spec/spec.md',
      'docs/episodes/other/brief.md',
      'docs/episodes/never-too-early/*.md',
    ];
    const expected = [null, null, null];
    // ACT
    const texts = await Promise.all(outputs.map((output) => readOutput(folder, output)));
    // ASSERT
    expect(texts).toEqual(expected);
  });

  it("hides a Section Job's preview before it starts and once it has ended, and the integration Job's before it starts", () => {
    // ARRANGE
    const jobs = [
      { id: 'implement-section-why', port: 4001, state: 'waiting' as const },
      { id: 'implement-section-why', port: 4001, state: 'ok' as const },
      { id: 'implement-section-why', port: 4001, state: 'reused' as const },
      { id: 'implement-section-why', port: 4001, state: 'error' as const },
      { id: 'implement-episode-init', port: 4000, state: 'waiting' as const },
    ];
    const expected = [undefined, undefined, undefined, undefined, undefined];
    // ACT
    const ports = jobs.map(previewPort);
    // ASSERT
    expect(ports).toEqual(expected);
  });

  it("answers null for an output outside the chosen folder or another Episode's", () => {
    // ARRANGE
    const outputs = ['src/episodes/x/page.tsx', 'docs/episodes/other/brief.md', 'docs/episodes/brief.md'];
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
  it('counts no output outside the chosen folder or naming a glob as written, even when a file matches', async () => {
    // ARRANGE
    const folder = createMemoryFolder(FOLDER, { 'brief.md': '# Brief', '*.md': 'literal' });
    const jobs = [{ outputs: ['docs/episodes/other/brief.md', 'docs/episodes/never-too-early/*.md'] }];
    // ACT
    const written = await writtenOutputs(folder, jobs);
    // ASSERT
    expect([...written]).toEqual([]);
  });

  it('tells a glob output from a file', () => {
    // ARRANGE
    const outputs = ['docs/episodes/x/research/*/research.md', 'docs/episodes/x/brief.md'];
    const expected = [true, false];
    // ACT
    const globs = outputs.map(isGlob);
    // ASSERT
    expect(globs).toEqual(expected);
  });

  it('shows no preview for a Job without a port', () => {
    // ARRANGE
    const job = { id: 'implement-section-why', state: 'running' as const };
    // ACT
    const port = previewPort(job);
    // ASSERT
    expect(port).toBeUndefined();
  });

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
