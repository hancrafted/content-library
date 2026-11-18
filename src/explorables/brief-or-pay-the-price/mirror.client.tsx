'use client';

import { cn } from '@/shared/lib/utils';
import type { Definition } from './brief-or-pay-the-price.types';
import type { RowRead } from './explorable-state.pure';
import type { SceneLabels } from './mirror-card.client';
import { MirrorHeadsView } from './mirror-heads-view';
import { ClosingLine, Row, type MirrorHandlers } from './mirror-row.client';
import styles from './mirror.module.css';

interface MirrorProps {
  readonly definition: Definition;
  readonly reads: readonly RowRead[];
  readonly wiping: boolean;
  readonly labels: SceneLabels;
  readonly handlers: MirrorHandlers;
}

export function Mirror({ definition, reads, wiping, labels, handlers }: MirrorProps) {
  const { words, rows } = definition;
  return (
    <div data-mirror={definition.id} className={cn(styles.root, 'flex flex-col gap-8')}>
      <MirrorHeadsView heads={words.heads} />
      <ol className="focus-group focus-group--dim-others flex flex-col gap-3">
        {rows.map((row, index) => (
          <Row key={row.id} row={row} index={index} read={reads[index]} handlers={handlers} labels={labels} />
        ))}
      </ol>
      <ClosingLine lead={words.close.lead} text={words.close.text} open={wiping} handlers={handlers} />
    </div>
  );
}
