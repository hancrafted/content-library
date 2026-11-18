'use client';

import { Button } from '@/shared/components/ui/button';
import type { Definition, MatrixWords } from './brief-or-pay-the-price.types';
import type { CellKey, RowRead } from './explorable-state.pure';
import { fill } from './matrix-data.pure';
import type { SceneLabels } from './mirror-card.client';
import { Row, type MirrorHandlers } from './mirror-row.client';

export interface CellViewProps {
  readonly words: MatrixWords;
  readonly agent: string;
  readonly cell: CellKey;
  readonly position: { readonly at: number; readonly of: number };
  readonly trait: Definition['rows'][number];
  readonly move: Definition['rows'][number];
  readonly reads: readonly [RowRead, RowRead];
  readonly evidence: { readonly text: string; readonly source: string };
  readonly labels: SceneLabels;
  readonly handlers: MirrorHandlers;
  readonly onBack: () => void;
  readonly onStep: (delta: 1 | -1) => void;
}

function StepButton({
  delta,
  label,
  onStep,
}: {
  readonly delta: 1 | -1;
  readonly label: string;
  readonly onStep: CellViewProps['onStep'];
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      data-cell-step={delta}
      aria-label={label}
      onClick={() => onStep(delta)}
    >
      {delta === 1 ? '›' : '‹'}
    </Button>
  );
}

function CellTop({ words, agent, trait, move, position, onBack, onStep }: CellViewProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <Button type="button" size="sm" variant="outline" data-cell-back onClick={onBack}>
        {words.back}
      </Button>
      <nav aria-label={words.where} className="flex items-center gap-1 text-caption text-muted-foreground">
        <span>{agent}</span>
        <span aria-hidden="true">›</span>
        <b translate="no" className="font-semibold text-foreground">
          {move.letter} × {trait.letter}
        </b>
      </nav>
      <span className="ml-auto flex items-center gap-2 text-caption text-muted-foreground">
        <StepButton delta={-1} label={words.previous} onStep={onStep} />
        <span>
          {position.at + 1} / {position.of}
        </span>
        <StepButton delta={1} label={words.next} onStep={onStep} />
      </span>
    </div>
  );
}

function Label({ children }: { readonly children: string }) {
  return (
    <p className="text-center text-caption font-semibold tracking-wide text-muted-foreground uppercase">{children}</p>
  );
}

function CounterLink({ template, names }: { readonly template: string; readonly names: Parameters<typeof fill>[1] }) {
  return (
    <p data-cell-link className="text-center text-body text-ai">
      <span aria-hidden="true">↓</span>{' '}
      {fill(template, names).map((part, index) =>
        typeof part === 'string' ? (
          part
        ) : (
          <b key={index} translate="no" className="font-semibold">
            {part.bold}
          </b>
        ),
      )}
    </p>
  );
}

function Evidence({ label, text, source }: { readonly label: string; readonly text: string; readonly source: string }) {
  return (
    <p data-cell-evidence className="border-l-4 border-ai py-1 pl-3 text-body">
      <b className="block text-caption font-semibold tracking-wide text-muted-foreground uppercase">{label}</b>
      {text}
      <cite className="mt-1 block text-caption text-muted-foreground not-italic">{source}</cite>
    </p>
  );
}

export function CellView(props: CellViewProps) {
  const { words, trait, move, reads, labels, handlers, evidence } = props;
  const names = { move: move.words.name, trait: trait.words.name };
  return (
    <div data-cell-view data-cell={`${props.cell.move}|${props.cell.trait}`} className="flex flex-col gap-4">
      <CellTop {...props} />
      <Label>{words.problem}</Label>
      <ol>
        <Row definitionId="price" row={trait} index={0} read={reads[0]} handlers={handlers} labels={labels} />
      </ol>
      <CounterLink template={words.counterLink} names={names} />
      <Label>{words.fix}</Label>
      <ol>
        <Row definitionId="brief" row={move} index={1} read={reads[1]} handlers={handlers} labels={labels} />
      </ol>
      <Evidence label={words.evidence} text={evidence.text} source={evidence.source} />
    </div>
  );
}
