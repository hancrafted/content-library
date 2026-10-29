'use client';

import { usePagePick } from '@/episodes/hooks/use-page-pick';
import { cn } from '@/shared/lib/utils';
import { AGENT_NAMES, agentOf, AGENTS, DEFAULT_AGENT, type Agent } from './first-skill.pure';

/** One segment of the toggle: the picked one raised on `card` with the AI agent's `ai` edge, the rest muted. */
function AgentButton({ agent, picked, onPick }: { agent: Agent; picked: boolean; onPick: (agent: Agent) => void }) {
  return (
    <button
      type="button"
      aria-pressed={picked}
      onClick={() => onPick(agent)}
      className={cn(
        'min-h-8 cursor-pointer rounded-full px-4 py-1 outline-none focus-visible:ring-2 focus-visible:ring-ring',
        picked
          ? 'bg-card font-semibold text-foreground shadow-sm ring-1 ring-ai/40'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {AGENT_NAMES[agent]}
    </button>
  );
}

/**
 * The Visual language's toolbar, AI-agent toggle only: this Slide's prompt differs by AI agent, its content not by OS,
 * so the OS toggle stays hidden. The pick is the page's (FE-001 §1, transient), shared with every Slide.
 */
export function AgentToolbar({ label }: { label: string }) {
  const [pick, setPick] = usePagePick('agent', DEFAULT_AGENT);
  const picked = agentOf(pick);
  return (
    <div className="flex flex-wrap items-center gap-3" data-toolbar="agent">
      <span className="text-caption font-medium text-muted-foreground">{label}</span>
      <div
        role="group"
        aria-label={label}
        className="inline-flex flex-wrap rounded-3xl border border-border bg-muted p-1 text-caption"
      >
        {AGENTS.map((agent) => (
          <AgentButton key={agent} agent={agent} picked={agent === picked} onPick={setPick} />
        ))}
      </div>
    </div>
  );
}
