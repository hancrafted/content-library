'use client';

import { cn } from '@/shared/lib/utils';
import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Definition } from './brief-or-pay-the-price.types';
import type { RowRead } from './explorable-state.pure';
import type { SceneLabels } from './mirror-card.client';
import { MirrorHeadsView } from './mirror-heads-view';
import { ClosingLine, Row, type MirrorHandlers } from './mirror-row.client';
import styles from './mirror.module.css';
import { prefersReducedMotion } from './reduced-motion';

interface MirrorProps {
  readonly definition: Definition;
  readonly reads: readonly RowRead[];
  readonly wiping: boolean;
  readonly labels: SceneLabels;
  readonly handlers: MirrorHandlers;
}

const FADE_MILLISECONDS = 160;

interface Frozen {
  readonly id: string;
  readonly copy: HTMLElement;
}

function fadeOutCopy(root: HTMLElement, { copy }: Frozen) {
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.setAttribute('data-ghost', '');
  copy.removeAttribute('data-mirror');
  copy.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
  root.append(copy);
  const animation = copy.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MILLISECONDS, fill: 'forwards' });
  animation.onfinish = () => copy.remove();
}

function useFrozenCopy(definitionId: string) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lastRef = useRef<Frozen | null>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const last = lastRef.current;
    if (root && last && last.id !== definitionId && !prefersReducedMotion()) fadeOutCopy(root, last);
  }, [definitionId]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const copy = root.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('[data-ghost]').forEach((ghost) => ghost.remove());
    lastRef.current = { id: definitionId, copy };
  });
  return rootRef;
}

function useCardsFade(definitionId: string) {
  const rootRef = useFrozenCopy(definitionId);
  const [fade, setFade] = useState<'' | 'a' | 'b'>('');
  const [seen, setSeen] = useState(definitionId);
  if (seen !== definitionId) {
    setSeen(definitionId);
    if (!prefersReducedMotion()) setFade(fade === 'a' ? 'b' : 'a');
  }
  return { rootRef, fade };
}

function MirrorBody({ definition, reads, wiping, labels, handlers }: MirrorProps) {
  const { words, rows } = definition;
  return (
    <>
      <div key={definition.id} className={styles.swap}>
        <MirrorHeadsView heads={words.heads} />
      </div>
      <ol className="focus-group focus-group--dim-others flex flex-col gap-3">
        {rows.map((row, index) => (
          <Row key={index} {...{ row, index, handlers, labels }} definitionId={definition.id} read={reads[index]} />
        ))}
      </ol>
      <ClosingLine
        key={`closing-${definition.id}`}
        lead={words.close.lead}
        text={words.close.text}
        wipes={definition.wipe}
        open={wiping}
        handlers={handlers}
      />
    </>
  );
}

const readKey = ({ shown, pass, looping, blank, turned }: RowRead): string =>
  [shown, pass, looping, blank, turned.freelancer, turned.ai].join();

const sameReads = (before: readonly RowRead[], after: readonly RowRead[]): boolean =>
  before.length === after.length && before.every((read, index) => readKey(read) === readKey(after[index] as RowRead));

export function sameMirror(before: MirrorProps, after: MirrorProps): boolean {
  return (
    before.definition === after.definition &&
    before.wiping === after.wiping &&
    before.labels === after.labels &&
    before.handlers === after.handlers &&
    sameReads(before.reads, after.reads)
  );
}

function MirrorView(props: MirrorProps) {
  const { definition } = props;
  const { rootRef, fade } = useCardsFade(definition.id);
  const fading = fade === 'a' ? styles.fadeA : fade === 'b' ? styles.fadeB : undefined;
  return (
    <div ref={rootRef} data-mirror={definition.id} className={cn(styles.root, fading, 'relative flex flex-col gap-8')}>
      <MirrorBody {...props} />
    </div>
  );
}

export const Mirror = memo(MirrorView, sameMirror);
