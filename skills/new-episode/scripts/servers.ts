// The Run's servers on the real machine: the dashboard dev server on `dev_port` and the Spec server on `spec_port`,
// both detached, each with its pid in `.scratch/<slug>/servers/<port>.pid` of the Run's worktree. Stopping reads only
// those pid files, so a process the Run did not start is never touched. `npm run dev-stop -- <port>` is the command line.
import { execFileSync, spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { draftPipeline, pickPorts, portsOf } from './servers.pure.ts';

/** What begin-run and end-run need from the machine; each defaults to the real thing, a test passes its own. */
export interface ServerHost {
  isFree: (port: number) => boolean;
  start: (root: string, slug: string, ports: { dev: number; spec: number }) => void;
  stop: (root: string) => void;
}

export const pidFile = (root: string, slug: string, port: number): string =>
  path.join(root, '.scratch', slug, 'servers', `${port}.pid`);

/** Kills a server's whole process group; a server already gone is no error. */
function killGroup(pid: number): void {
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    // already stopped
  }
}

/** The pid files under one slug's scratch folder: [port, file] pairs, none when the folder is missing. */
function pidFilesIn(folder: string): [number, string][] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder)
    .filter((name) => /^\d+\.pid$/.test(name))
    .map((name) => [Number.parseInt(name, 10), path.join(folder, name)]);
}

function stopOne(file: string, kill: (pid: number) => void): void {
  const pid = Number.parseInt(readFileSync(file, 'utf8'), 10);
  if (Number.isInteger(pid) && pid > 1) kill(pid);
  rmSync(file, { force: true });
}

/**
 * Stops the servers whose pid files sit under `root`'s `.scratch` (only `port`'s when named), removes the files,
 * and returns the ports stopped.
 */
export function stopServers(
  root: string,
  { port, kill = killGroup }: { port?: number; kill?: (pid: number) => void } = {},
): number[] {
  const scratch = path.join(root, '.scratch');
  if (!existsSync(scratch)) return [];
  const found = readdirSync(scratch).flatMap((slug) => pidFilesIn(path.join(scratch, slug, 'servers')));
  const chosen = found.filter(([filePort]) => port === undefined || port === filePort);
  for (const [, file] of chosen) stopOne(file, kill);
  return chosen.map(([filePort]) => filePort);
}

function listening(port: number): boolean {
  try {
    return (
      execFileSync('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN'], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }).trim() !== ''
    );
  } catch {
    return false;
  }
}

function detach({
  pid,
  port,
  command,
  root,
}: {
  pid: string;
  port: number;
  command: readonly string[];
  root: string;
}): void {
  if (listening(port)) return;
  mkdirSync(path.dirname(pid), { recursive: true });
  const log = openSync(pid.replace(/\.pid$/, '.log'), 'a');
  const [program = '', ...args] = command;
  const child = spawn(program, args, { cwd: root, detached: true, stdio: ['ignore', log, log] });
  child.unref();
  closeSync(log);
  writeFileSync(pid, `${child.pid}\n`);
}

export const realServers: ServerHost = {
  isFree: (port) => !listening(port),
  start: (root, slug, { dev, spec }) => {
    detach({ pid: pidFile(root, slug, dev), port: dev, command: ['npx', 'next', 'dev', '-p', String(dev)], root });
    detach({
      pid: pidFile(root, slug, spec),
      port: spec,
      command: ['node', 'skills/new-episode/scripts/spec.ts', slug, '--port', String(spec), '--watch'],
      root,
    });
  },
  stop: (root) => void stopServers(root),
};

/**
 * Writes the Run's draft pipeline.yml when the Episode has none, then starts the dashboard and Spec servers on the
 * ports it names. A pipeline that exists keeps its ports (a second begin-run after a crash).
 */
export function startRunServers(host: ServerHost, { root, slug, sha }: { root: string; slug: string; sha: string }) {
  const file = path.join(root, 'docs/episodes', slug, 'pipeline.yml');
  const template = path.join(root, 'skills/new-episode/assets/pipeline.yml');
  let ports = existsSync(file) ? portsOf(readFileSync(file, 'utf8')) : null;
  if (!existsSync(file) && existsSync(template)) {
    ports = pickPorts(host.isFree);
    writeFileSync(file, draftPipeline(readFileSync(template, 'utf8'), { slug, sha: sha.slice(0, 7), ...ports }));
  }
  if (ports !== null) host.start(root, slug, ports);
  return ports;
}
