'use client';

import { cn } from '@/shared/lib/utils';
import { type FocusEvent, type ReactNode, useId, useState } from 'react';
import styles from './value-chain.module.css';

export interface ValueChainProof {
  readonly metric: string;
  readonly text: string;
}

export interface ValueChainStage {
  readonly slug: string;
  readonly year: string;
  readonly label: string;
  readonly where: string;
  readonly proofs: readonly [ValueChainProof, ValueChainProof];
}

export interface ValueChainBoardProps {
  readonly stages: readonly ValueChainStage[];
  readonly rail: string;
  readonly proofLabel: string;
  readonly intro: ReactNode;
  readonly action: ReactNode;
}

interface StageProps {
  readonly stage: ValueChainStage;
  readonly primary: boolean;
  readonly active: boolean;
}

function StageDot({ primary, active }: Omit<StageProps, 'stage'>) {
  return (
    <span className="flex justify-center" aria-hidden="true">
      <span
        className={cn(
          'relative rounded-full border-4 border-muted motion-safe:transition-[scale,box-shadow] motion-safe:duration-300 motion-safe:ease-out',
          primary ? 'size-7 bg-brand-accent ring-4 ring-brand-accent/25' : 'size-5 bg-foreground ring-foreground/15',
          active && cn('scale-125 ring-8', styles.pulse),
        )}
      />
    </span>
  );
}

function StageText({ stage, primary }: Omit<StageProps, 'active'>) {
  return (
    <span>
      <span className="block font-mono text-caption uppercase tracking-widest text-muted-foreground">
        {stage.year}
        {primary ? <span aria-hidden="true"> →</span> : null}
      </span>
      <span
        className={cn('block font-semibold leading-tight', primary ? 'text-subheading text-brand-accent' : 'text-body')}
      >
        {stage.label}
      </span>
      <span className="block text-caption text-muted-foreground">{stage.where}</span>
    </span>
  );
}

function StageButton({
  stage,
  primary,
  active,
  dimmed,
  proofsId,
  onActivate,
}: StageProps & { dimmed: boolean; proofsId: string; onActivate: (slug: string) => void }) {
  const activate = () => onActivate(stage.slug);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-controls={proofsId}
      onPointerEnter={activate}
      onFocus={activate}
      onClick={activate}
      className={cn(
        'grid w-full grid-cols-[2.5rem_1fr] items-center gap-4 rounded-lg text-left motion-safe:transition-opacity motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        primary ? 'py-4' : 'py-2',
        dimmed && 'opacity-55',
      )}
    >
      <StageDot primary={primary} active={active} />
      <StageText stage={stage} primary={primary} />
    </button>
  );
}

function ProofCard({ proof, primary, active }: { proof: ValueChainProof; primary: boolean; active: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-t-4 border-border bg-card p-5',
        primary ? 'border-t-brand-accent' : 'border-t-foreground',
        active && styles.proof,
      )}
    >
      <p className={cn('text-heading font-semibold leading-none', primary && 'text-brand-accent')}>{proof.metric}</p>
      <p className="mt-2 text-body font-medium">{proof.text}</p>
    </div>
  );
}

function StageProofs({ stage, primary, active, proofLabel }: StageProps & { proofLabel: string }) {
  return (
    <div
      aria-hidden={!active}
      className={cn('col-start-1 row-start-1 grid gap-4 sm:grid-cols-2', !active && 'invisible')}
    >
      <p className="font-mono text-caption uppercase tracking-widest text-muted-foreground sm:col-span-2">
        {proofLabel} ·{' '}
        <span className={cn('font-semibold', primary ? 'text-brand-accent' : 'text-foreground')}>{stage.label}</span>
      </p>
      {stage.proofs.map((proof) => (
        <ProofCard key={proof.metric} proof={proof} primary={primary} active={active} />
      ))}
    </div>
  );
}

function Proofs({
  id,
  stages,
  primarySlug,
  activeSlug,
  proofLabel,
}: Pick<ChainProps, 'stages' | 'primarySlug' | 'activeSlug'> & { id: string; proofLabel: string }) {
  return (
    <div id={id} aria-live="polite" className="grid">
      {stages.map((stage) => (
        <StageProofs
          key={stage.slug}
          stage={stage}
          primary={stage.slug === primarySlug}
          active={stage.slug === activeSlug}
          proofLabel={proofLabel}
        />
      ))}
    </div>
  );
}

interface ChainProps {
  readonly stages: readonly ValueChainStage[];
  readonly primarySlug: string;
  readonly activeSlug: string;
  readonly engaged: boolean;
  readonly proofsId: string;
  readonly onActivate: (slug: string) => void;
  readonly onRelease: () => void;
}

function Chain({ stages, primarySlug, activeSlug, engaged, proofsId, onActivate, onRelease }: ChainProps) {
  const releaseOnFocusLeave = (event: FocusEvent<HTMLOListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) onRelease();
  };
  return (
    <ol
      className="relative flex flex-col gap-1 before:absolute before:inset-y-6 before:left-5 before:w-0.5 before:-translate-x-1/2 before:bg-linear-to-b before:from-brand-accent before:to-border"
      onPointerLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement)) onRelease();
      }}
      onBlur={releaseOnFocusLeave}
    >
      {[...stages].reverse().map((stage) => (
        <li key={stage.slug}>
          <StageButton
            stage={stage}
            primary={stage.slug === primarySlug}
            active={stage.slug === activeSlug}
            dimmed={engaged && stage.slug !== activeSlug}
            proofsId={proofsId}
            onActivate={onActivate}
          />
        </li>
      ))}
    </ol>
  );
}

// decision: FE-001 §1
export function ValueChainBoard({ stages, rail, proofLabel, intro, action }: ValueChainBoardProps) {
  const primary = stages[stages.length - 1];
  const [active, setActive] = useState<{ slug: string; engaged: boolean }>({ slug: primary.slug, engaged: false });
  const proofsId = useId();
  const activeStage = stages.find(({ slug }) => slug === active.slug) ?? primary;
  const shown = { stages, primarySlug: primary.slug, activeSlug: activeStage.slug };
  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-12">
      <div className="flex flex-col justify-center rounded-2xl bg-muted p-6 md:p-8">
        <Chain
          {...shown}
          engaged={active.engaged}
          proofsId={proofsId}
          onActivate={(slug) => setActive({ slug, engaged: true })}
          onRelease={() => setActive({ slug: primary.slug, engaged: false })}
        />
        <p className="mt-4 pl-14 text-caption text-muted-foreground">{rail}</p>
      </div>
      <div className="flex flex-col justify-between gap-8">
        {intro}
        <Proofs id={proofsId} proofLabel={proofLabel} {...shown} />
        {action}
      </div>
    </div>
  );
}
