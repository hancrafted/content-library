import type { AgentView } from '@/shared/lib/agent-view';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';
import styles from './agent-view.module.css';

export type { AgentView } from '@/shared/lib/agent-view';

export interface InViewProps {
  readonly view: AgentView;
  readonly as?: 'p' | 'span' | 'div' | 'li';
  readonly className?: string;
  readonly children: ReactNode;
}

export function InView({ view, as: Tag = 'span', className, children }: InViewProps) {
  return (
    <Tag data-view={view} className={cn(styles.inView, className)}>
      {children}
    </Tag>
  );
}
