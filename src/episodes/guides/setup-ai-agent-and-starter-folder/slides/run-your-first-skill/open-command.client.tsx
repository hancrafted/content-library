'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { DEFAULT_OS, openCommand, osOf } from './first-skill.pure';

export function OpenCommand({ url }: { url: string }) {
  const [pick] = usePagePick('os', DEFAULT_OS);
  return <span data-command>{openCommand(osOf(pick), url)}</span>;
}
