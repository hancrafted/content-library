import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const MAX_FEEDBACK_BYTES = 1_000_000;

interface ReviewServerOptions {
  htmlFile: string;
  destination: string;
  specId: string;
  revision: string;
  token: string;
  origin: string;
}

interface Feedback {
  specId: string;
  revision: string;
  destination: string;
  prompt: string;
}

function failure(status: number, error: string): Response {
  return Response.json({ error }, { status });
}

function fingerprint(file: string): string {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

function readFeedback(text: string): Feedback | null {
  try {
    const body = JSON.parse(text) as Feedback | null;
    return typeof body?.prompt === 'string' && body.prompt.trim() ? body : null;
  } catch {
    return null;
  }
}

function matchesAssignment(body: Feedback, options: ReviewServerOptions): boolean {
  return (
    body.specId === options.specId && body.revision === options.revision && body.destination === options.destination
  );
}

function replaceFeedback(options: ReviewServerOptions, prompt: string): void {
  const parent = path.dirname(options.destination);
  const stagingFile = path.join(parent, `.${path.basename(options.destination)}.${options.token}.tmp`);
  let staged = false;
  try {
    mkdirSync(parent, { recursive: true });
    writeFileSync(stagingFile, prompt, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
    staged = true;
    renameSync(stagingFile, options.destination);
    staged = false;
  } finally {
    if (staged) unlinkSync(stagingFile);
  }
}

function isSaveSession(request: Request, options: ReviewServerOptions): boolean {
  return request.headers.get('origin') === options.origin && request.headers.get('x-html-spec-token') === options.token;
}

async function save(request: Request, options: ReviewServerOptions, reviewedHash: string): Promise<Response> {
  if (!isSaveSession(request, options)) return failure(403, 'Save is only available to this review session.');
  if (request.headers.get('content-type') !== 'application/json') return failure(415, 'Expected JSON feedback.');
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_FEEDBACK_BYTES) return failure(413, 'Feedback exceeds the 1 MB limit.');
  const body = readFeedback(text);
  if (!body || !matchesAssignment(body, options))
    return failure(400, 'Feedback does not match the assigned Spec, revision and destination.');
  if (fingerprint(options.htmlFile) !== reviewedHash)
    return failure(409, 'The HTML changed. Restart the helper with its new revision and feedback file.');
  replaceFeedback(options, body.prompt);
  return Response.json({ saved: options.destination, specId: options.specId, revision: options.revision });
}

function get(pathname: string, options: ReviewServerOptions, reviewedHash: string): Response {
  if (fingerprint(options.htmlFile) !== reviewedHash)
    return failure(409, 'The HTML changed. Restart the helper with its new revision and feedback file.');
  if (pathname === '/')
    return new Response(readFileSync(options.htmlFile, 'utf8'), {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
    });
  if (pathname === '/__html-spec/config')
    return Response.json(
      { specId: options.specId, revision: options.revision, destination: options.destination, token: options.token },
      { headers: { 'cache-control': 'no-store' } },
    );
  return failure(404, 'Not found.');
}

async function route(request: Request, options: ReviewServerOptions, reviewedHash: string): Promise<Response> {
  const url = new URL(request.url);
  const requestOrigin = request.headers.get('origin');
  if (url.origin !== options.origin || (requestOrigin !== null && requestOrigin !== options.origin))
    return failure(403, 'This origin cannot access the review.');
  if (request.method === 'GET') return get(url.pathname, options, reviewedHash);
  if (request.method === 'POST' && url.pathname === '/__html-spec/feedback')
    return save(request, options, reviewedHash);
  return failure(404, 'Not found.');
}

export function createReviewHandler(options: ReviewServerOptions) {
  if (
    !path.isAbsolute(options.htmlFile) ||
    !path.isAbsolute(options.destination) ||
    options.htmlFile === options.destination
  )
    throw new Error('Review and feedback need distinct absolute paths.');
  const reviewedHash = fingerprint(options.htmlFile);
  return async (request: Request): Promise<Response> => {
    try {
      return await route(request, options, reviewedHash);
    } catch {
      return failure(500, 'Feedback could not be saved. Inputs remain available; use Copy prompt or Save As.');
    }
  };
}
