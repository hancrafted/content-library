import { cn } from '@/shared/lib/utils';
import { InView } from './in-view';

export interface ViewWords {
  readonly chat: string;
  readonly coding: string;
}

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
