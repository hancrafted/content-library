import type { AgentView, AgentViewControl } from '@/shared/lib/agent-view';
import { useEffect, useState } from 'react';

const ATTRIBUTE = 'data-agent-view';

/** Transient page state: Slide unmounts keep it; a reload or another page starts in Chat app. */
export function useAgentView(enabled: boolean): AgentViewControl {
  const [value, choose] = useState<AgentView>('chat');
  useEffect(() => {
    if (!enabled) return;
    const root = document.documentElement;
    if (value === 'coding') root.setAttribute(ATTRIBUTE, value);
    else root.removeAttribute(ATTRIBUTE);
    return () => root.removeAttribute(ATTRIBUTE);
  }, [enabled, value]);
  return { value, choose };
}
