import { copyText } from '@/shared/lib/clipboard';
import { useState } from 'react';

/**
 * A prompt box's copy (`PromptKit.onCopy`) and what its live region says after one: `done` once the clipboard took
 * the text, nothing when it refused. Shared by every surface that hosts a TryPrompt: the human-in-the-loop Explorable
 * and a Guide's troubleshooting box.
 */
export function useCopy(done: string) {
  const [announced, setAnnounced] = useState('');
  const copy = async (text: string): Promise<boolean> => {
    const ok = await copyText(text);
    setAnnounced(ok ? done : '');
    return ok;
  };
  return [announced, copy] as const;
}
