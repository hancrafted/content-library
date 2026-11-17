export type TextClipboard = Pick<Clipboard, 'writeText'>;

function browserClipboard(): TextClipboard | null {
  return globalThis.navigator?.clipboard ?? null;
}

export async function copyText(text: string, clipboard: TextClipboard | null = browserClipboard()): Promise<boolean> {
  if (clipboard === null) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
