import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
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
  <section data-spec="brief-card"><textarea name="note:brief--style"></textarea></section>
  <article data-spec="title-slide" id="top">
    <figure data-spec="option" data-option="0a" data-recommended></figure>
    <figure data-spec="option" data-option="0b"></figure>
    <figure data-spec="option" data-option="0c"></figure>
  </article>
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
  it('saves a Brief card note as a brief-- item of the round', async () => {
    // ARRANGE
    const { folder, base } = await serve();
    const fields: [string, string][] = [
      ['pick:top', '0a'],
      ['pick:spent', '1a'],
      ['pick:quiet', '2a'],
      ['note:brief--style', 'Sober, please.'],
    ];
    // ACT
    await post(base, fields);
    const saved = readFileSync(path.join(folder, 'feedback/02/feedback.md'), 'utf8');
    // ASSERT
    expect(saved).toContain('- `brief--style` · design — Sober, please.\n');
  });

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
    expect(body).toContain('<title>Spec · Budget</title>');
  });

  it('injects a reload script into the served Spec that polls the version endpoint', async () => {
    // ARRANGE
    const { base } = await serve();
    // ACT
    const body = await (await fetch(`${base}/`)).text();
    // ASSERT
    expect(body).toContain('/__spec-version');
    expect(body.indexOf('/__spec-version')).toBeLessThan(body.indexOf('</body>'));
  });

  it('holds the reload and shows a notice while the user has unsaved picks or notes', async () => {
    // ARRANGE
    const { base } = await serve();
    const body = await (await fetch(`${base}/`)).text();
    const script = /<script>([\s\S]*?__spec-version[\s\S]*?)<\/script>/.exec(body)?.[1] ?? '';
    const versions = ['a', 'b', 'b'];
    let reloads = 0;
    const notices: string[] = [];
    let onEdit: (() => void) | undefined;
    const pending: (() => void)[] = [];
    const asksToSave = /save/i;
    const page = {
      fetch: () => Promise.resolve({ text: () => Promise.resolve(versions.shift() ?? 'b') }),
      location: { reload: () => (reloads += 1) },
      setTimeout: (next: () => void) => pending.push(next),
      document: {
        addEventListener: (type: string, handler: () => void) => {
          if (type === 'input') onEdit = handler;
        },
        createElement: () => ({
          set textContent(text: string) {
            notices.push(text);
          },
        }),
        body: { append: (bar: unknown) => bar },
      },
    };
    const tick = async (): Promise<void> => {
      await new Promise((resolve) => setImmediate(resolve));
      pending.shift()?.();
    };
    // ACT
    new Function(...Object.keys(page), script)(...Object.values(page));
    await tick(); // sees version a
    onEdit?.(); // the user ticks a pick
    await tick(); // version b arrives
    // ASSERT
    expect(reloads).toBe(0);
    expect(notices.join(' ')).toMatch(asksToSave);
  });

  it('reports a new version after the Spec is re-assembled', async () => {
    // ARRANGE
    const { folder, base } = await serve();
    const before = await (await fetch(`${base}/__spec-version`)).text();
    const later = new Date(Date.now() + 5000);
    // ACT
    writeFileSync(path.join(folder, 'spec/spec.html'), `${SPEC}<!-- again -->`);
    utimesSync(path.join(folder, 'spec/spec.html'), later, later);
    const after = await (await fetch(`${base}/__spec-version`)).text();
    // ASSERT
    expect(before).not.toBe('');
    expect(after).not.toBe(before);
  });

  it('saves a valid review as the next feedback round and redirects back naming it', async () => {
    // ARRANGE
    const { folder, base } = await serve();
    const fields: [string, string][] = [
      ['pick:top', '0a'],
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
      '- `top` · design — picked: 0a',
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
      ['pick:top', '0b'],
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
