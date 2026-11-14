import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './agent-view.module.css';

/** The two views of the Brief: Chat app, the default, and Coding agent (Claude Code, Codex). */
export type AgentView = 'chat' | 'coding';

export interface InViewProps {
  readonly view: AgentView;
  /** The element to render; a `span` unless given. */
  readonly as?: 'p' | 'span' | 'div' | 'li';
  readonly className?: string;
  readonly children: ReactNode;
}

/**
 * Words that belong to one view only: the page-level switch shows them in their view and hides them in the other.
 * Both views stay in the static page, so print and find-in-page reach them; CSS alone hides the other view.
 */
export function InView({ view, as: Tag = 'span', className, children }: InViewProps) {
  return (
    <Tag data-view={view} className={cn(styles.inView, className)}>
      {children}
    </Tag>
  );
}
