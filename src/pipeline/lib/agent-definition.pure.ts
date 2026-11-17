function modelLine(text: string): string | undefined {
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? '';
  const value = /^model:[ \t]*(.*?)[ \t]*$/m.exec(block)?.[1] ?? '';
  return value.replace(/^(["'])(.*)\1$/, '$2');
}

export function frontmatterModel(text: string | null): string | undefined {
  const model = modelLine(text ?? '');
  return model === '' || model === 'inherit' ? undefined : model;
}
