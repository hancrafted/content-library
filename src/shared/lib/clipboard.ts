/**
 * Copies text to the clipboard; `true` when the clipboard took it, `false` when the browser refused or has none. The
 * one copy behind every prompt box's Copy button (`PromptKit.onCopy`), so a button confirms only a real copy.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
