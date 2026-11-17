export type AgentView = 'chat' | 'coding';

export interface AgentViewControl {
  readonly value: AgentView;
  readonly choose: (view: AgentView) => void;
}
