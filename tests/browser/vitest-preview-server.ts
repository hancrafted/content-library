import { spawn } from 'node:child_process';

// Temporary: the Vitest browser lane (Context and human-in-the-loop, until tickets 295 and 298 port them) needs the
// export served, and Playwright's `webServer` has stopped by then. Serve it for the run unless something already does.
const PORT = Number(process.env.PREVIEW_PORT ?? 4300);
const URL = `http://localhost:${PORT}/`;

async function isUp() {
  try {
    return (await fetch(URL)).ok;
  } catch {
    return false;
  }
}

export default async function setup() {
  if (await isUp()) return undefined;
  const server = spawn('node', ['skills/visual-check/scripts/preview.ts'], { stdio: 'ignore' });
  while (!(await isUp())) {
    if (server.exitCode !== null) throw new Error('preview server exited: run `npm run build` first');
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return () => {
    server.kill();
  };
}
