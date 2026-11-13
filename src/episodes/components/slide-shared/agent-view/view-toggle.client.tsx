'use client';

import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';
import styles from './agent-view.module.css';
import type { AgentView } from './in-view';

export interface ViewToggleLabels {
  /** The pair's name for assistive tech: `View`. */
  readonly label: string;
  readonly chat: string;
  readonly coding: string;
}

const ATTRIBUTE = 'data-agent-view';

/** Writes the view onto `<html>` for the page's CSS, and takes it off when the switch leaves the page. */
function usePageView(view: AgentView) {
  useEffect(() => {
    const root = document.documentElement;
    if (view === 'coding') root.setAttribute(ATTRIBUTE, view);
    else root.removeAttribute(ATTRIBUTE);
    return () => root.removeAttribute(ATTRIBUTE);
  }, [view]);
}

/**
 * The switch's client leaf. The view is transient state held in memory (FE-001 §1.3; Han chose it over a URL form),
 * so a reload and a shared link open in Chat app. It writes the view onto `<html>` for the page's CSS, and takes it
 * back off when the page goes, so another page never inherits it.
 */
export function ViewToggleButtons({
  labels,
  className,
}: {
  readonly labels: ViewToggleLabels;
  readonly className?: string;
}) {
  const [view, setView] = useState<AgentView>('chat');
  usePageView(view);
  const option = (own: AgentView, name: string) => (
    <button
      type="button"
      aria-pressed={view === own}
      onClick={() => setView(own)}
      className={cn(styles.option, 'text-caption font-semibold')}
    >
      {name}
    </button>
  );
  return (
    <div data-view-toggle role="group" aria-label={labels.label} className={cn(styles.toggle, className)}>
      {option('chat', labels.chat)}
      {option('coding', labels.coding)}
    </div>
  );
}
