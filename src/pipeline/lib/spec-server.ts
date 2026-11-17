// decision: docs/decision-records/0011-episode-design-is-reviewed-as-a-static-html-spec.md
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { readSpec, SPEC_FILE, specBriefKeys, specTitleSlideOptions } from './episode-spec-page.pure.ts';
import { nextRound, reviewToFeedback, type Fault } from './spec-feedback.pure.ts';

export interface SpecServer {
  port: number;
  close: () => Promise<void>;
}

export interface SpecServerOptions {
  folder: string;
  port: number;
  now: () => Date;
}

const FEEDBACK_FIELD = 'feedback';

const MAX_BODY = 1_000_000;

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
  const lines = new URLSearchParams(await readBody(request)).get(FEEDBACK_FIELD) ?? '';
  const spec = readSpec({ [SPEC_FILE]: readFileSync(path.join(options.folder, SPEC_FILE), 'utf8') });
  const round = nextRound(existingRounds(options.folder));
  const result = reviewToFeedback({
    lines,
    slides: spec.slides,
    brief: specBriefKeys(spec),
    titleSlide: specTitleSlideOptions(spec),
    round,
    now: options.now(),
  });
  if (result.kind === 'rejected')
    return send(response, { status: 400, type: HTML, body: rejectionPage(result.faults) });
  const file = path.join(options.folder, result.file);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, result.text, { flag: 'wx' });
  response.writeHead(303, { location: `/?saved=${path.basename(path.dirname(file))}` });
  response.end();
}

interface Served {
  file: string;
  type: string;
}

const FILES: Readonly<Record<string, Served>> = {
  '/': { file: SPEC_FILE, type: HTML },
  '/spec.html': { file: SPEC_FILE, type: HTML },
  '/design.css': { file: 'spec/design.css', type: 'text/css; charset=utf-8' },
};

const VERSION_PATH = '/__spec-version';

const RELOAD_SCRIPT = `<script>
(function () {
  var seen = null;
  var edited = false;
  var noticed = false;
  // A reload would drop unsaved picks and notes: hold it and say so instead.
  document.addEventListener('input', function () { edited = true; });
  document.addEventListener('change', function () { edited = true; });
  function notice() {
    if (noticed) return;
    noticed = true;
    var bar = document.createElement('p');
    bar.textContent = 'The Spec changed. Save your feedback, then reload to see it.';
    bar.style = 'position:fixed;inset:auto 0 0 0;margin:0;padding:12px;text-align:center;background:canvas;border-top:1px solid;z-index:9999';
    document.body.append(bar);
  }
  function poll() {
    fetch('${VERSION_PATH}', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (version) {
        if (seen !== null && version !== seen) {
          if (!edited) return location.reload();
          notice();
        }
        seen = version;
      })
      .catch(function () {})
      .then(function () { setTimeout(poll, 1000); });
  }
  poll();
})();
</script>
`;

function version(folder: string): string {
  return [SPEC_FILE, 'spec/design.css']
    .map((name) => {
      const file = path.join(folder, name);
      return existsSync(file) ? String(statSync(file).mtimeMs) : '-';
    })
    .join(':');
}

function withReload(html: string): string {
  return html.includes('</body>') ? html.replace('</body>', `${RELOAD_SCRIPT}</body>`) : html + RELOAD_SCRIPT;
}

function serveFile(response: ServerResponse, folder: string, served: Served): void {
  const file = path.join(folder, served.file);
  if (!existsSync(file)) return send(response, { status: 404, type: TEXT, body: `${served.file} does not exist\n` });
  const text = readFileSync(file, 'utf8');
  send(response, { status: 200, type: served.type, body: served.type === HTML ? withReload(text) : text });
}

function get(response: ServerResponse, folder: string, pathname: string): void {
  const served = FILES[pathname];
  if (pathname === VERSION_PATH) return send(response, { status: 200, type: TEXT, body: version(folder) });
  if (served !== undefined) return serveFile(response, folder, served);
  send(response, { status: 404, type: TEXT, body: 'Not found\n' });
}

async function handle(request: IncomingMessage, response: ServerResponse, options: SpecServerOptions): Promise<void> {
  const { pathname } = new URL(request.url ?? '/', 'http://localhost');
  const served = FILES[pathname];
  if (request.method === 'POST' && served?.type === HTML) return save(response, request, options);
  if (request.method === 'GET') return get(response, options.folder, pathname);
  send(response, { status: 404, type: TEXT, body: 'Not found\n' });
}

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
