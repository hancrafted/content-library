import { MarkIcon } from '@/episodes/components/slide-shared/party-board/sticky-note';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

export interface ContractTerms {
  readonly receives: string;
  readonly delivers: string;
  readonly checkedBy: string;
}

interface ContractCardBase {
  readonly heading: string;
}

interface ContractLines {
  readonly terms: ContractTerms;
  readonly receives?: ReactNode;
  readonly delivers: ReactNode;
  readonly checkedBy: ReactNode;
  readonly how?: ReactNode;
  readonly termMarkers?: Partial<Record<keyof ContractTerms, ReactNode>>;
}

export interface ContractTermsProps extends ContractCardBase, ContractLines {
  readonly size?: 'full' | 'compact';
  readonly tag?: string;
}

export interface ContractNoteProps extends ContractLines {
  readonly size: 'note';
  readonly heading?: string;
  readonly filled?: boolean;
}

export interface ContractCheck {
  readonly label: string;
  readonly passed: boolean;
}

export interface ContractChecksProps extends ContractCardBase {
  readonly checks: readonly ContractCheck[];
  readonly marks: { readonly passed: string; readonly failed: string };
}

export type ContractCardProps = ContractTermsProps | ContractNoteProps | ContractChecksProps;

const TERM_KEYS = ['receives', 'delivers', 'checkedBy'] as const;

const keysOf = (lines: ContractLines) => TERM_KEYS.filter((key) => lines[key] !== undefined);

function FullTerms(props: ContractTermsProps) {
  return (
    <dl className="flex flex-col divide-y divide-border px-5">
      {keysOf(props).map((key) => (
        <div key={key} className="grid grid-cols-4 gap-4 py-3">
          <dt
            data-contract-term
            className="flex flex-wrap items-center gap-1 text-caption text-muted-foreground uppercase"
          >
            {props.terms[key]}
            {props.termMarkers?.[key]}
          </dt>
          <dd className={cn('col-span-3 text-body [&_b]:font-semibold', key === 'delivers' && 'font-semibold')}>
            {props[key]}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CompactTerms(props: ContractTermsProps) {
  return (
    <dl className="grid grid-cols-3 gap-x-3 gap-y-1.5 text-caption">
      {keysOf(props).map((key) => (
        <div key={key} className="contents">
          <dt data-contract-term className="font-semibold">
            {props.terms[key]}
            {props.termMarkers?.[key]}
          </dt>
          <dd className="col-span-2 text-muted-foreground [&_b]:font-semibold [&_b]:text-foreground">{props[key]}</dd>
        </div>
      ))}
    </dl>
  );
}

function CompactCard(props: ContractTermsProps) {
  return (
    <div
      data-contract
      className="card-hover card-hover--raise flex flex-col gap-2 rounded-lg border-2 border-primary bg-card p-4 shadow-md"
    >
      <p data-contract-label className="text-caption font-semibold text-primary uppercase">
        {props.heading}
      </p>
      <CompactTerms {...props} />
    </div>
  );
}

function Strip({ heading, tag }: Pick<ContractTermsProps, 'heading' | 'tag'>) {
  return (
    <div
      data-contract-strip
      className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-primary px-5 py-3 text-primary-foreground"
    >
      <span data-contract-label className="text-body font-semibold">
        {heading}
      </span>
      {tag !== undefined && (
        <span data-contract-tag className="shrink-0 text-caption uppercase">
          {tag}
        </span>
      )}
    </div>
  );
}

function FullCard(props: ContractTermsProps) {
  return (
    <div
      data-contract
      className="card-hover card-hover--raise flex flex-col overflow-hidden rounded-lg bg-card shadow-md"
    >
      <Strip heading={props.heading} tag={props.tag} />
      <FullTerms {...props} />
      {props.how !== undefined && (
        <p
          data-contract-how
          className="border-t border-dashed border-border px-5 py-3 text-caption text-muted-foreground"
        >
          {props.how}
        </p>
      )}
    </div>
  );
}

const noteLookOf = (filled: boolean) =>
  filled
    ? { card: 'bg-primary text-primary-foreground shadow-md', muted: 'text-primary-foreground' }
    : { card: 'border border-border bg-card', muted: 'text-muted-foreground' };

function NoteCard(props: ContractNoteProps) {
  const look = noteLookOf(props.filled === true);
  return (
    <div data-contract className={cn('flex flex-col gap-0.5 rounded-md p-2 text-caption', look.card)}>
      {props.heading !== undefined && (
        <p data-contract-label className="font-semibold">
          {props.heading}
        </p>
      )}
      <dl className="flex flex-col gap-0.5">
        {keysOf(props).map((key) => (
          <div key={key} className={cn(key === 'checkedBy' && look.muted)}>
            <dt data-contract-term className="inline font-semibold">
              {props.terms[key]}
              {props.termMarkers?.[key]}
            </dt>{' '}
            <dd className="inline">{props[key]}</dd>
          </div>
        ))}
      </dl>
      {props.how !== undefined && (
        <p data-contract-how className={look.muted}>
          {props.how}
        </p>
      )}
    </div>
  );
}

function ChecksCard({ heading, checks, marks }: ContractChecksProps) {
  return (
    <div data-contract className="flex flex-1 flex-col overflow-hidden rounded-lg bg-card shadow-md">
      <p data-contract-label className="border-b border-border px-5 py-3 text-body font-semibold">
        {heading}
      </p>
      <ul className="flex flex-col divide-y divide-border px-5">
        {checks.map(({ label, passed }) => (
          <li
            key={label}
            data-contract-check
            data-passed={passed}
            className="flex items-center justify-between gap-4 py-3 text-body"
          >
            <span data-check-label>{label}</span>
            <MarkIcon mark={passed ? 'passed' : 'failed'} label={passed ? marks.passed : marks.failed} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ContractCard(props: ContractCardProps) {
  if ('checks' in props) return <ChecksCard {...props} />;
  if (props.size === 'note') return <NoteCard {...props} />;
  return props.size === 'compact' ? <CompactCard {...props} /> : <FullCard {...props} />;
}
