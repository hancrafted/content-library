import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import { HumanInTheLoopClient } from './human-in-the-loop.client';
import type { DiagramSlots, HumanInTheLoopData, WorkflowSlideWords } from './human-in-the-loop.types';
import type { ControlMap } from './toolbar-controls.pure';
import { WORKFLOW_IDS, hashFor, uiWords, workflowFor, type WorkflowId, type WorkflowLocale } from './workflow-data';
import type { Level, View } from './workflow-state.pure';

// decision: FE-012 §1
// decision: FE-012 §2
export interface HumanInTheLoopProps {
  readonly workflow: WorkflowId;
  readonly locale: string;
  readonly words?: WorkflowSlideWords;
  readonly level?: Level;
  readonly view?: View;
  readonly readonly?: boolean;
  readonly controls?: ControlMap;
  readonly diagram?: DiagramSlots;
}

const localeOf = (locale: string): WorkflowLocale => (locale === 'de' ? 'de' : 'en');

export function humanInTheLoopData({
  workflow: id,
  locale,
  words,
  level = 'simple',
  view = 'stages',
  readonly = false,
  controls,
  diagram,
}: HumanInTheLoopProps): HumanInTheLoopData {
  const lang = localeOf(locale);
  return {
    workflows: WORKFLOW_IDS.map((each) => workflowFor(each, lang)),
    workflowId: id,
    hashes: Object.fromEntries(WORKFLOW_IDS.map((each) => [each, hashFor(each)])),
    locale: lang,
    words: { ...uiWords(lang), ...words?.ui },
    controls: controls ?? {},
    level,
    view,
    readonly,
    diagram,
  };
}

export function HumanInTheLoop(props: HumanInTheLoopProps) {
  return (
    <>
      <HumanInTheLoopClient {...humanInTheLoopData(props)} />
      <ExploreItLink slug="human-in-the-loop" />
    </>
  );
}
