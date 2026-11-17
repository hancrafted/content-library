import { Pin } from '@/episodes/components/slide-shared/pin/pin';
import type { ReactNode } from 'react';

export interface Tip {
  readonly slug: string;
  readonly pin: 1 | 2 | 3;
  readonly text: ReactNode;
}

export function TipLegend({ tips }: { tips: readonly Tip[] }) {
  return (
    <ol className="grid grid-cols-1 gap-4 text-body @4xl:grid-cols-3 @4xl:gap-6">
      {tips.map((tip) => (
        <li key={tip.slug} data-tip={tip.slug} className="flex items-start gap-3 [&_b]:font-semibold">
          <Pin n={tip.pin} />
          <span>{tip.text}</span>
        </li>
      ))}
    </ol>
  );
}
