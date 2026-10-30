'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { DEFAULT_OS, openCommand, osOf } from './first-skill.pure';

/** The command that opens `url`, for the page's OS pick, which this Slide reads though it shows no OS toggle. */
export function OpenCommand({ url }: { url: string }) {
  const [pick] = usePagePick('os', DEFAULT_OS);
  return <span data-command>{openCommand(osOf(pick), url)}</span>;
}
