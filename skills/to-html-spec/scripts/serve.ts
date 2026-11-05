import { randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { createReviewHandler, MAX_FEEDBACK_BYTES } from './review-server.ts';

function options() {
  const { values } = parseArgs({
    options: {
      html: { type: 'string' },
      feedback: { type: 'string' },
      'spec-id': { type: 'string' },
      revision: { type: 'string' },
      port: { type: 'string', default: '0' },
    },
  });
  if (!values.html || !values.feedback || !values['spec-id'] || !values.revision)
    throw new Error(
      'usage: node serve.ts --html <file> --feedback <file> --spec-id <id> --revision <revision> [--port <n>]',
    );
  return {
    htmlFile: path.resolve(values.html),
    destination: path.resolve(values.feedback),
    specId: values['spec-id'],
    revision: values.revision,
    port: portNumber(values.port ?? '0'),
  };
}

function portNumber(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || (port !== 0 && (port < 1024 || port > 65535)))
    throw new Error('Port must be 0 (automatic) or an unprivileged port from 1024 to 65535.');
  return port;
}

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const bytes = Buffer.from(chunk);
    size += bytes.length;
    if (size > MAX_FEEDBACK_BYTES) throw new RangeError('Feedback exceeds the 1 MB limit.');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function requestHeaders(request: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [name, value] of Object.entries(request.headers))
    if (value !== undefined) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
  return headers;
}

async function webRequest(request: IncomingMessage, origin: string): Promise<Request> {
  const method = request.method ?? 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : await readBody(request);
  return new Request(new URL(request.url ?? '/', origin), { method, headers: requestHeaders(request), body });
}

interface ReviewSession {
  origin: string;
  handle: ReturnType<typeof createReviewHandler>;
}

async function dispatch(request: IncomingMessage, response: ServerResponse, session: ReviewSession): Promise<void> {
  response.setHeader('cache-control', 'no-store');
  response.setHeader('x-content-type-options', 'nosniff');
  response.setHeader('content-security-policy', "frame-ancestors 'none'");
  try {
    if (request.headers.host !== new URL(session.origin).host) {
      response.writeHead(403).end('Unexpected host.');
      return;
    }
    const result = await session.handle(await webRequest(request, session.origin));
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(await result.text());
  } catch (error) {
    response.writeHead(error instanceof RangeError ? 413 : 500);
    response.end('Review unavailable. Keep your inputs and use Copy prompt or Save As.');
  }
}

async function main() {
  const config = options();
  const token = randomUUID();
  let session: ReviewSession;
  const server = createServer((request, response) => void dispatch(request, response, session));
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(config.port, '127.0.0.1', resolve);
  });
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('No local server address.');
    const origin = `http://127.0.0.1:${address.port}`;
    session = { origin, handle: createReviewHandler({ ...config, token, origin }) };
  } catch (error) {
    server.close();
    throw error;
  }
  console.log(`Review: ${session.origin}/\nSave overwrites: ${config.destination}\nRevision: ${config.revision}`);
  for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => server.close());
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
