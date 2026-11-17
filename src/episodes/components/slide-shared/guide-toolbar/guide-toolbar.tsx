import { AGENTS, DEFAULT_AGENT, DEFAULT_OS, OPERATING_SYSTEMS } from '../agent-setup-step/picks.pure';
import { ToolbarGroup, type PickName } from './toolbar-group.client';

export interface GuideToolbarProps {
  readonly active: readonly PickName[];
  readonly show?: readonly PickName[];
  readonly labels: Readonly<Record<PickName, string>>;
}

export function GuideToolbar({ active, show = ['os', 'agent'], labels }: GuideToolbarProps) {
  return (
    <div data-guide-toolbar="" className="flex flex-wrap items-center justify-start gap-x-8 gap-y-3">
      {show.includes('os') && (
        <ToolbarGroup
          pick="os"
          label={labels.os}
          options={OPERATING_SYSTEMS}
          fallback={DEFAULT_OS}
          active={active.includes('os')}
        />
      )}
      {show.includes('agent') && (
        <ToolbarGroup
          pick="agent"
          label={labels.agent}
          options={AGENTS}
          fallback={DEFAULT_AGENT}
          active={active.includes('agent')}
        />
      )}
    </div>
  );
}
