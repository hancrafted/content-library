import { copyText } from '@/shared/lib/clipboard';
import { useState } from 'react';

export function useCopy(done: string) {
  const [announced, setAnnounced] = useState('');
  const copy = async (text: string): Promise<boolean> => {
    const ok = await copyText(text);
    setAnnounced(ok ? done : '');
    return ok;
  };
  return [announced, copy] as const;
}
