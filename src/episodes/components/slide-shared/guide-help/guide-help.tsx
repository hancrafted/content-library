import { AGENTS, DEFAULT_AGENT, DEFAULT_OS, OPERATING_SYSTEMS, type PickOption } from '../agent-setup-step/picks.pure';
import { HelpPanel, type HelpPicks, type HelpWords } from './help-panel.client';

export type { HelpWords };

export interface GuideHelpProps {
  /** The step the prompt names: "Step 3: Install your AI agent". */
  readonly step: string;
  readonly words: HelpWords;
}

const namesOf = (options: readonly PickOption[]) => Object.fromEntries(options.map(({ id, name }) => [id, name]));

const PICKS: HelpPicks = {
  os: { fallback: DEFAULT_OS, names: namesOf(OPERATING_SYSTEMS) },
  agent: { fallback: DEFAULT_AGENT, names: namesOf(AGENTS) },
};

/**
 * A Slide's Help, the node its `headerAction` returns: the Help button right-aligned in the title row and the panel
 * under the header (Visual language "Help"). One part for every Slide of a Guide; the Slide gives its step and words.
 */
export function GuideHelp({ step, words }: GuideHelpProps) {
  return <HelpPanel step={step} words={words} picks={PICKS} />;
}
