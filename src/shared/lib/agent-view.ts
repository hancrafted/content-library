export type AgentView = 'chat' | 'coding';

/** One page-wide selection, shared by the desktop and mobile navigation menus. */
export interface AgentViewControl {
  readonly value: AgentView;
  readonly choose: (view: AgentView) => void;
}
