import { cn } from '@/shared/lib/utils';
import { InView } from './in-view';

/** The same thing said once per view: words in the Chat app view, a path or code line in the Coding agent view. */
export interface ViewWords {
  readonly chat: string;
  readonly coding: string;
}

/**
 * Renders both views' words. The Coding agent's are code, so monospace unless `mono` is false, and a long path may
 * break anywhere, so it never sets a width wider than its box.
 */
export function Words({ words, mono = true }: { readonly words: ViewWords; readonly mono?: boolean }) {
  return (
    <>
      <InView view="chat">{words.chat}</InView>
      <InView view="coding" className={cn(mono && 'font-mono', 'wrap-anywhere')}>
        {words.coding}
      </InView>
    </>
  );
}
