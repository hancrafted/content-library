import { AGENTS, DEFAULT_AGENT, DEFAULT_OS, OPERATING_SYSTEMS } from '../agent-setup-step/picks.pure';
import { ToolbarGroup, type PickName } from './toolbar-group.client';

export interface GuideToolbarProps {
  /** The picks this Slide's content differs by; the other group still shows, dimmed, in the same place. */
  readonly active: readonly PickName[];
  /** The two groups' names, in the Slide's locale. */
  readonly labels: Readonly<Record<PickName, string>>;
}

/**
 * The Guide's one toolbar (Visual language "The toolbar"): the operating system and the AI agent in one line,
 * left-aligned, the first thing under the Slide header on every Slide that shows it. Both groups always show, so the
 * toolbar never moves between Slides; a pick here sets it for the whole page. Option names are product names, the same
 * in every locale.
 */
export function GuideToolbar({ active, labels }: GuideToolbarProps) {
  return (
    <div data-guide-toolbar="" className="flex flex-wrap items-center justify-start gap-x-8 gap-y-3">
      <ToolbarGroup
        pick="os"
        label={labels.os}
        options={OPERATING_SYSTEMS}
        fallback={DEFAULT_OS}
        active={active.includes('os')}
      />
      <ToolbarGroup
        pick="agent"
        label={labels.agent}
        options={AGENTS}
        fallback={DEFAULT_AGENT}
        active={active.includes('agent')}
      />
    </div>
  );
}
