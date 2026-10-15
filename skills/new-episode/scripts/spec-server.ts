// The Spec review server (design-ADR 0011): serves an Episode's `spec/spec.html` and its `design.css`, and saves the
// review form's POST as the next `feedback/<NN>/feedback.md` round. It lives with the skill's scripts, outside `src/`
// and the static export; `spec.ts` is its command line.

import { load } from 'cheerio';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { nextRound, reviewToFeedback, type Fault, type SpecSlide } from './spec-feedback.pure.ts';

export interface SpecServer {
  port: number;
  close: () => Promise<void>;
}

export interface SpecServerOptions {
  /** The Episode folder, holding `spec/spec.html`. */
  folder: string;
  /** The port to listen on; 0 picks a free one. */
  port: number;
  now: () => Date;
}

/** The review form posts a few kilobytes; anything far larger is not a review. */
const MAX_BODY = 1_000_000;

/** The Spec's Slides in page order, each with the Section it sits in and its Option ids. */
export function specSlides(html: string): SpecSlide[] {
  const $ = load(html);
  return $('article[data-spec="slide"]')
    .toArray()
    .map((slide) => ({
      section: $(slide).closest('section[data-spec="section"]').attr('id') ?? '',
      slug: $(slide).attr('id') ?? '',
      options: $(slide)
        .find('figure[data-spec="option"]')
        .toArray()
        .map((option) => $(option).attr('data-option') ?? ''),
    }));
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function rejectionPage(faults: readonly Fault[]): string {
  const items = faults.map(({ message }) => `<li>${escapeHtml(message)}</li>`).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>Review not saved</title></head>
<body>
<h1>Review not saved</h1>
<p>Nothing was written. Go back, fix these Slides and save again; your ticks and notes are still in the page.</p>
<ul>
${items}
</ul>
<p><a href="/">Back to the Spec</a></p>
</body></html>
`;
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    request.setEncoding('utf8');
    request.on('data', (chunk: string) => {
      body += chunk;
      if (body.length > MAX_BODY) reject(new Error('review too large'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

interface Reply {
  status: number;
  type: string;
  body: string;
}

const TEXT = 'text/plain; charset=utf-8';
const HTML = 'text/html; charset=utf-8';

function send(response: ServerResponse, { status, type, body }: Reply): void {
  response.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  response.end(body);
}

function existingRounds(folder: string): string[] {
  const feedback = path.join(folder, 'feedback');
  return existsSync(feedback) ? readdirSync(feedback) : [];
}

async function save(response: ServerResponse, request: IncomingMessage, options: SpecServerOptions): Promise<void> {
  const fields = [...new URLSearchParams(await readBody(request))];
  const slides = specSlides(readFileSync(path.join(options.folder, 'spec/spec.html'), 'utf8'));
  const round = nextRound(existingRounds(options.folder));
  const result = reviewToFeedback({ fields, slides, round, now: options.now() });
  if (result.kind === 'rejected')
    return send(response, { status: 400, type: HTML, body: rejectionPage(result.faults) });
  const file = path.join(options.folder, result.file);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, result.text, { flag: 'wx' });
  response.writeHead(303, { location: `/?saved=${path.basename(path.dirname(file))}` });
  response.end();
}

/** The files the server serves, by URL path; nothing else under the folder is reachable. */
const FILES: Readonly<Record<string, { file: string; type: string }>> = {
  '/': { file: 'spec/spec.html', type: HTML },
  '/spec.html': { file: 'spec/spec.html', type: HTML },
  '/design.css': { file: 'spec/design.css', type: 'text/css; charset=utf-8' },
};

function serveFile(response: ServerResponse, folder: string, served: { file: string; type: string }): void {
  const file = path.join(folder, served.file);
  if (!existsSync(file)) return send(response, { status: 404, type: TEXT, body: `${served.file} does not exist\n` });
  send(response, { status: 200, type: served.type, body: readFileSync(file, 'utf8') });
}

/** GET serves a file, POST to the page saves the review; anything else is 404. */
async function handle(request: IncomingMessage, response: ServerResponse, options: SpecServerOptions): Promise<void> {
  const served = FILES[new URL(request.url ?? '/', 'http://localhost').pathname];
  if (request.method === 'POST' && served?.type === HTML) return save(response, request, options);
  if (request.method === 'GET' && served !== undefined) return serveFile(response, options.folder, served);
  send(response, { status: 404, type: TEXT, body: 'Not found\n' });
}

/** Starts the server on 127.0.0.1; rejects when the port is taken, so a caller can try the next. */
export function startSpecServer(options: SpecServerOptions): Promise<SpecServer> {
  const server = createServer((request, response) => {
    handle(request, response, options).catch((error: unknown) => {
      if (!response.headersSent) send(response, { status: 500, type: TEXT, body: `${String(error)}\n` });
    });
  });
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address !== null ? address.port : options.port;
      resolve({
        port,
        close: () => new Promise((done) => server.close(() => done())),
      });
    });
  });
}
