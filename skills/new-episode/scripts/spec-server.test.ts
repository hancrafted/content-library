import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { startSpecServer, type SpecServer } from './spec-server.ts';

// A real loopback socket on port 0, against ARCH-003 §1.1: the spec (#211) asks for the POST → file round trip end to end.
/*
 * The Spec server against a real temp Episode folder on port 0: it serves the Spec, saves a valid review as the next
 * feedback round and redirects back, and answers an invalid one with 400 and writes nothing.
 */

const NOW = new Date('2026-10-15T10:40:05Z');
const SPEC = `<!doctype html>
<html lang="en"><head><title>Spec · Budget</title><link rel="stylesheet" href="design.css" /></head>
<body>
  <section data-spec="section" id="why">
    <article data-spec="slide" id="spent" data-number="1">
      <figure data-spec="option" data-option="1a" data-recommended></figure>
      <figure data-spec="option" data-option="1b"></figure>
    </article>
    <article data-spec="slide" id="quiet" data-number="2">
      <figure data-spec="option" data-option="2a" data-recommended></figure>
      <figure data-spec="option" data-option="2b"></figure>
    </article>
  </section>
  <form id="spec-review" method="post"><button type="submit">Save review</button></form>
</body></html>
`;
const ROUND_ONE = '---\ntype: feedback\nround: 1\nvia: app\n---\n\n# Feedback round 1\n';

const folders: string[] = [];
const servers: SpecServer[] = [];
afterEach(async () => {
  for (const server of servers.splice(0)) await server.close();
  for (const folder of folders.splice(0)) rmSync(folder, { recursive: true, force: true });
});

/** An Episode folder holding the Spec and feedback round 1, served on a free port. */
async function serve(): Promise<{ folder: string; base: string }> {
  const folder = mkdtempSync(path.join(os.tmpdir(), 'spec-server-'));
  folders.push(folder);
  mkdirSync(path.join(folder, 'spec'));
  writeFileSync(path.join(folder, 'spec/spec.html'), SPEC);
  mkdirSync(path.join(folder, 'feedback/01'), { recursive: true });
  writeFileSync(path.join(folder, 'feedback/01/feedback.md'), ROUND_ONE);
  const server = await startSpecServer({ folder, port: 0, now: () => NOW });
  servers.push(server);
  return { folder, base: `http://127.0.0.1:${server.port}` };
}

function post(base: string, fields: [string, string][]): Promise<Response> {
  return fetch(`${base}/`, { method: 'POST', body: new URLSearchParams(fields), redirect: 'manual' });
}

const feedbackFolders = (folder: string) => readdirSync(path.join(folder, 'feedback')).sort();

describe('success cases', () => {
  it('serves the Spec page at the root', async () => {
    // ARRANGE
    const { base } = await serve();
    const expectedType = 'text/html; charset=utf-8';
    // ACT
    const response = await fetch(`${base}/`);
    const body = await response.text();
    // ASSERT
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(expectedType);
    expect(body).toBe(SPEC);
  });

  it('saves a valid review as the next feedback round and redirects back naming it', async () => {
    // ARRANGE
    const { folder, base } = await serve();
    const fields: [string, string][] = [
      ['pick:spent', '1a'],
      ['note:spent', ''],
      ['note:quiet', 'None fit: try a heat strip.'],
      ['note:visual-language', ''],
    ];
    const expectedLocation = '/?saved=02';
    const expectedText = [
      '---',
      'type: feedback',
      'title: Feedback round 2',
      'generated:',
      '  by: human:han',
      '  at: 2026-10-15T10:40:05Z',
      'round: 2',
      'via: spec',
      '---',
      '',
      '# Feedback round 2',
      '',
      '- `why--spent` · design — picked: 1a',
      '- `why--quiet` · design — picked: none — None fit: try a heat strip.',
      '',
    ].join('\n');
    // ACT
    const response = await post(base, fields);
    const saved = readFileSync(path.join(folder, 'feedback/02/feedback.md'), 'utf8');
    // ASSERT
    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(expectedLocation);
    expect(saved).toBe(expectedText);
  });
});

describe('failure cases', () => {
  it('answers a review with a Slide lacking pick and note with 400 naming it, and writes nothing', async () => {
    // ARRANGE
    const { folder, base } = await serve();
    const before = feedbackFolders(folder);
    const fields: [string, string][] = [
      ['pick:spent', '1b'],
      ['note:quiet', ''],
    ];
    const expectedStatus = 400;
    const expectedFault = 'Slide 2 "quiet" has no pick and no note';
    // ACT
    const response = await post(base, fields);
    const body = await response.text();
    const after = feedbackFolders(folder);
    // ASSERT
    expect(response.status).toBe(expectedStatus);
    expect(body).toContain(expectedFault);
    expect(after).toEqual(before);
  });
});

describe('edge cases', () => {
  it('serves nothing but the Spec and its CSS', async () => {
    // ARRANGE
    const { base } = await serve();
    const expectedStatus = 404;
    // ACT
    const response = await fetch(`${base}/../feedback/01/feedback.md`);
    await response.text();
    // ASSERT
    expect(response.status).toBe(expectedStatus);
  });
});
