import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createReviewHandler } from './review-server.ts';

const origin = 'http://127.0.0.1:49152';
const token = 'test-session-token';
let folder: string;
let htmlFile: string;
let destination: string;

beforeEach(() => {
  folder = mkdtempSync(path.join(tmpdir(), 'html-spec-save-'));
  htmlFile = path.join(folder, 'review.html');
  destination = path.join(folder, 'feedback-01.md');
  writeFileSync(htmlFile, '<!doctype html><title>Review revision 1</title>');
});

afterEach(() => rmSync(folder, { recursive: true, force: true }));

function handler() {
  return createReviewHandler({ htmlFile, destination, specId: 'review', revision: 'r1', token, origin });
}

function saveRequest(prompt: string, overrides: Record<string, unknown> = {}) {
  return new Request(`${origin}/__html-spec/feedback`, {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json', 'x-html-spec-token': token },
    body: JSON.stringify({ specId: 'review', revision: 'r1', destination, prompt, ...overrides }),
  });
}

describe('success cases', () => {
  it('serves only the assigned HTML and its save configuration', async () => {
    // ARRANGE
    const handle = handler();
    const expectedHtml = readFileSync(htmlFile, 'utf8');
    const expectedConfig = { specId: 'review', revision: 'r1', destination, token };
    const notFound = 404;
    // ACT
    const html = await handle(new Request(origin));
    const config = await handle(new Request(`${origin}/__html-spec/config`));
    const other = await handle(new Request(`${origin}/feedback-01.md`));
    // ASSERT
    expect(await html.text()).toBe(expectedHtml);
    expect(await config.json()).toEqual(expectedConfig);
    expect(other.status).toBe(notFound);
  });

  it('saves the complete prompt verbatim and returns its absolute destination', async () => {
    // ARRANGE
    const handle = handler();
    const prompt = 'Save this prompt 1:1.\n\n"Quoted" feedback: Grüße\n<markup>\n';
    const expected = { saved: destination, specId: 'review', revision: 'r1' };
    const success = 200;
    // ACT
    const response = await handle(saveRequest(prompt));
    const payload = await response.json();
    const saved = readFileSync(destination, 'utf8');
    // ASSERT
    expect(response.status).toBe(success);
    expect(payload).toEqual(expected);
    expect(saved).toBe(prompt);
  });
});

describe('failure cases', () => {
  it('refuses a stale page after its HTML changes, preserving saved feedback', async () => {
    // ARRANGE
    const handle = handler();
    const previous = 'Earlier review';
    const conflict = 409;
    writeFileSync(destination, previous);
    writeFileSync(htmlFile, '<!doctype html><title>Changed review</title>');
    // ACT
    const response = await handle(saveRequest('Stale replacement'));
    const config = await handle(new Request(`${origin}/__html-spec/config`));
    // ASSERT
    expect(response.status).toBe(conflict);
    expect(config.status).toBe(conflict);
    expect(readFileSync(destination, 'utf8')).toBe(previous);
  });

  it('reports a write failure without damaging the existing destination', async () => {
    // ARRANGE
    const handle = handler();
    mkdirSync(destination);
    const sentinel = path.join(destination, 'keep.md');
    const previous = 'Do not remove this directory.';
    writeFileSync(sentinel, previous);
    const baseline = readdirSync(folder);
    const serverError = 500;
    // ACT
    const response = await handle(saveRequest('Cannot replace a directory'));
    // ASSERT
    expect(response.status).toBe(serverError);
    expect(readFileSync(sentinel, 'utf8')).toBe(previous);
    expect(readdirSync(folder)).toEqual(baseline);
  });

  it('returns a useful failure for malformed JSON', async () => {
    // ARRANGE
    const handle = handler();
    const valid = saveRequest('Feedback');
    const request = new Request(valid.url, { method: 'POST', headers: valid.headers, body: '{broken' });
    const badRequest = 400;
    // ACT
    const response = await handle(request);
    // ASSERT
    expect(response.status).toBe(badRequest);
  });

  it.each([
    { name: 'another destination', body: { destination: '/outside/feedback.md' } },
    { name: 'another Spec', body: { specId: 'other-review' } },
    { name: 'another revision', body: { revision: 'r2' } },
    { name: 'an empty prompt', body: { prompt: '' } },
    { name: 'another session token', header: ['x-html-spec-token', 'wrong-token'] },
    { name: 'a foreign origin', header: ['origin', 'https://example.org'] },
    { name: 'a form submission', header: ['content-type', 'text/plain'] },
  ])('refuses $name without touching the assigned file', async ({ body, header }) => {
    // ARRANGE
    const handle = handler();
    const previous = 'Existing feedback must survive rejected requests.';
    writeFileSync(destination, previous);
    const request = saveRequest('Replacement', body);
    if (header) request.headers.set(header[0], header[1]);
    const minimumFailure = 400;
    // ACT
    const response = await handle(request);
    const saved = readFileSync(destination, 'utf8');
    // ASSERT
    expect(response.status).toBeGreaterThanOrEqual(minimumFailure);
    expect(saved).toBe(previous);
  });
});

describe('edge cases', () => {
  it('overwrites only the assigned revision file and leaves no staging file', async () => {
    // ARRANGE
    const handle = handler();
    const earlier = path.join(folder, 'feedback-00.md');
    const oldPrompt = 'Previous revision feedback';
    const latest = 'Latest feedback for revision 1';
    writeFileSync(earlier, oldPrompt);
    await handle(saveRequest('First save'));
    const baseline = readdirSync(folder);
    const success = 200;
    // ACT
    const response = await handle(saveRequest(latest));
    // ASSERT
    expect(response.status).toBe(success);
    expect(readFileSync(destination, 'utf8')).toBe(latest);
    expect(readFileSync(earlier, 'utf8')).toBe(oldPrompt);
    expect(readdirSync(folder)).toEqual(baseline);
  });

  it('rejects oversized feedback without replacing the existing file', async () => {
    // ARRANGE
    const handle = handler();
    const previous = 'Saved feedback';
    writeFileSync(destination, previous);
    const baseline = readdirSync(folder);
    const prompt = 'x'.repeat(1_000_001);
    const tooLarge = 413;
    // ACT
    const response = await handle(saveRequest(prompt));
    // ASSERT
    expect(response.status).toBe(tooLarge);
    expect(readFileSync(destination, 'utf8')).toBe(previous);
    expect(readdirSync(folder)).toEqual(baseline);
  });
});
