// `npm run check:sources -- <research.md>...`: GETs every `sources[].resource` of the given research files
// with a browser user agent, following redirects, and prints one line per URL: ok, dead or unverifiable.
// Exits 1 only when a link is dead; a 403 or a timeout may be a bot wall, so it is left to a human.
import { readFileSync } from 'node:fs';
import { classify, resourcesOf, summarize, type Outcome, type Verdict } from './check-sources.pure.ts';

const TIMEOUT_MS = 20_000;
const CONCURRENCY = 8;
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('✖ usage: npm run check:sources -- <research.md>...');
  process.exit(1);
}

async function fetchOutcome(url: string): Promise<Outcome> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8' },
    });
    void response.body?.cancel();
    return { status: response.status };
  } catch (error) {
    const cause = (error as { cause?: { code?: string } }).cause;
    const timedOut = (error as Error).name === 'TimeoutError' || (error as Error).name === 'AbortError';
    return { error: timedOut ? 'timeout' : (cause?.code ?? (error as Error).message) };
  }
}

const jobs = files.flatMap((file) => resourcesOf(readFileSync(file, 'utf8')).map((url) => ({ file, url })));
const results: { file: string; url: string; verdict: Verdict; detail: string }[] = [];
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, jobs.length) }, async () => {
    while (next < jobs.length) {
      const { file, url } = jobs[next++];
      const outcome = await fetchOutcome(url);
      const detail = 'status' in outcome ? String(outcome.status) : outcome.error;
      results.push({ file, url, verdict: classify(outcome), detail });
    }
  }),
);
for (const { file, url, verdict, detail } of results.sort(
  (a, b) => a.file.localeCompare(b.file) || a.url.localeCompare(b.url),
)) {
  console.log(`${verdict.padEnd(13)}${detail.padEnd(11)}${file}  ${url}`);
}
const { ok, dead, unverifiable, failed } = summarize(results.map(({ verdict }) => verdict));
console.log(`${ok} ok, ${dead} dead, ${unverifiable} unverifiable`);
process.exit(failed ? 1 : 0);
