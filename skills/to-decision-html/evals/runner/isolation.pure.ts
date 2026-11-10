// The isolation grader: an eval run may touch only its own workspace. It reads the paths file tools name and the
// path-like tokens in shell commands; anything resolving outside the workspace is a problem. Shell parsing is a
// token heuristic, so every problem names the token for a person to judge.
import path from 'node:path';
import type { ToolCall } from './transcript.pure.ts';

/** Installed software a run may use without seeing anyone's files: devices, system tools and applications. */
const SYSTEM = [
  '/dev/null',
  '/dev/stdout',
  '/dev/stderr',
  '/usr/',
  '/bin/',
  '/sbin/',
  '/opt/homebrew/',
  '/Applications/',
];

/** Playwright's installed browsers, under the home folder on macOS and Linux. */
const BROWSERS = /(^|\/)(\.cache|Library\/Caches)\/ms-playwright(\/|$)/;

/**
 * The top-level folders a path outside the workspace starts at. A shell token such as `</script>` or a sed
 * expression `s/a/out/` starts with a slash too, but at no real root, so it is text, not a path.
 */
const ROOTS = /^\/(Users|home|root|private|var|tmp|etc|Volumes|opt|Library|System|Applications|mnt|srv|nix)(\/|$)/;

/** The input fields of file tools that hold a path. */
const PATH_FIELDS = ['file_path', 'notebook_path', 'path'];

/** A heredoc's body is file content, not paths the command touches; its opening line stays. */
const HEREDOC = /<<-?\s*(['"]?)(\w+)\1([^\n]*)\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g;

/** A path a tool touched: the token as written and the folder it resolves from. */
interface Touch {
  readonly token: string;
  readonly from: string;
}

const isPathToken = (token: string): boolean => /^(~|\.\.(\/|$))/.test(token) || ROOTS.test(token);

/** Path tokens in order, each resolved from the folder the command's `cd`s have reached by then. */
function commandTouches(command: string, start: string): Touch[] {
  const tokens = command.replace(HEREDOC, '$3').split(/[\s'"=<>|;&()`]+/);
  const touches: Touch[] = [];
  let from = start;
  tokens.forEach((token, index) => {
    if (isPathToken(token)) touches.push({ token, from });
    if (tokens[index - 1] === 'cd' && !token.startsWith('~')) from = path.posix.resolve(from, token);
  });
  return touches;
}

function touchesOf({ name, input }: ToolCall, start: string): Touch[] {
  if (name === 'Bash') return typeof input.command === 'string' ? commandTouches(input.command, start) : [];
  const fields = PATH_FIELDS.map((field) => input[field]);
  if (name === 'Glob') fields.push(input.pattern);
  return fields
    .filter((value): value is string => typeof value === 'string' && /^(~|\/|\.\.)/.test(value))
    .map((token) => ({ token, from: start }));
}

const within = (target: string, root: string): boolean => target === root || target.startsWith(`${root}/`);

/** `roots` are the workspace's spellings (the folder and its resolved real path). */
function isOutside({ token, from }: Touch, roots: readonly string[]): boolean {
  if (BROWSERS.test(token)) return false;
  if (token.startsWith('~')) return true;
  const target = path.posix.resolve(from, token);
  if (SYSTEM.some((prefix) => within(target, prefix.replace(/\/$/, '')))) return false;
  return !roots.some((root) => within(target, root));
}

/** The first root is where relative paths start, as it was the agent's working folder. */
export function isolationProblems(tools: readonly ToolCall[], roots: readonly string[]): string[] {
  return tools.flatMap((tool) =>
    touchesOf(tool, roots[0])
      .filter((touch) => isOutside(touch, roots))
      .map(({ token }) => `${tool.name} touches ${token}, outside the run workspace`),
  );
}
