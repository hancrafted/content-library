export function dropGitEnvironment(
  env: Record<string, string | undefined> = process.env,
  alsoNames: readonly string[] = [],
): void {
  for (const name of Object.keys(env)) if (name.startsWith('GIT_') || alsoNames.includes(name)) delete env[name];
}
