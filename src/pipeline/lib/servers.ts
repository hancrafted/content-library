import { execFileSync, spawn } from 'node:child_process';
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { draftPipeline, pickPorts, portsOf, type RunWhere } from './servers.pure.ts';

export interface ServerHost {
  isFree: (port: number) => boolean;
  start: (root: string, slug: string, ports: { dev: number; spec: number }) => void;
  stop: (root: string) => void;
}

export const pidFile = (root: string, slug: string, port: number): string =>
  path.join(root, '.scratch', slug, 'servers', `${port}.pid`);

function killGroup(pid: number): void {
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    // already stopped
  }
}

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
  pidPath,
  port,
  command,
  root,
}: {
  pidPath: string;
  port: number;
  command: readonly string[];
  root: string;
}): void {
  if (listening(port)) return;
  mkdirSync(path.dirname(pidPath), { recursive: true });
  const log = openSync(pidPath.replace(/\.pid$/, '.log'), 'a');
  const [program = '', ...args] = command;
  const child = spawn(program, args, { cwd: root, detached: true, stdio: ['ignore', log, log] });
  child.unref();
  closeSync(log);
  writeFileSync(pidPath, `${child.pid}\n`);
}

export const realServers: ServerHost = {
  isFree: (port) => !listening(port),
  start: (root, slug, { dev, spec }) => {
    detach({ pidPath: pidFile(root, slug, dev), port: dev, command: ['npx', 'next', 'dev', '-p', String(dev)], root });
    detach({
      pidPath: pidFile(root, slug, spec),
      port: spec,
      command: ['node', 'skills/new-episode/scripts/spec.ts', slug, '--port', String(spec), '--watch'],
      root,
    });
  },
  stop: (root) => void stopServers(root),
};

export function startRunServers(host: ServerHost, { root, slug, sha }: RunWhere) {
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

export function serversNote(host: ServerHost | undefined, where: RunWhere): string {
  const ports = host && startRunServers(host, where);
  return ports ? `; dashboard on :${ports.dev}, Spec on :${ports.spec}` : '';
}
