// An agent definition file (`<agents dir>/<type>.md`): the pure read of its frontmatter. `agent-definition.ts` finds the file.

/** The first `model:` line of a leading frontmatter block, unquoted. */
function modelLine(text: string): string | undefined {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
  const value = /^model:[ \t]*(.*?)[ \t]*$/m.exec(block)?.[1] ?? '';
  return value.replace(/^(["'])(.*)\1$/, '$2');
}

/** The `model` of a definition's frontmatter; undefined without one, and for `inherit` (the spawner's model). */
export function frontmatterModel(text: string | null): string | undefined {
  const model = modelLine(text ?? '');
  return model === '' || model === 'inherit' ? undefined : model;
}
