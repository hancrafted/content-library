export type TextClipboard = Pick<Clipboard, 'writeText'>;

function browserClipboard(): TextClipboard | null {
  return globalThis.navigator?.clipboard ?? null;
}

/**
 * Copies text to the clipboard; `true` when the clipboard took it, `false` when the browser refused or has none. The
 * one copy behind every prompt box's Copy button (`PromptKit.onCopy`), so a button confirms only a real copy.
 */
export async function copyText(text: string, clipboard: TextClipboard | null = browserClipboard()): Promise<boolean> {
  if (clipboard === null) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
