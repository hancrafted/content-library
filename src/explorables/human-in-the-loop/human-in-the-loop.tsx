import { ExploreItLink } from '@/shared/components/core-components/explorable-home/explorable-home.client';
import { HumanInTheLoopClient } from './human-in-the-loop.client';
import type { DiagramSlots, HumanInTheLoopData, WorkflowSlideWords } from './human-in-the-loop.types';
import type { ControlMap } from './toolbar-controls.pure';
import { WORKFLOW_IDS, hashFor, uiWords, workflowFor, type WorkflowId, type WorkflowLocale } from './workflow-data';
import type { Level, View } from './workflow-state.pure';

/*
 * The human-in-the-loop workflow, an Explorable explanation. A Slide names a Workflow by id and its own words; the Workflow, the
 * prompts and the labels come from the YAML pairs of this folder at build time (FE-012), and a Slide may override any
 * word key by key. The interactive parent is the one client leaf.
 */

export interface HumanInTheLoopProps {
  /** The Workflow the Slide shows first. */
  readonly workflow: WorkflowId;
  /** The URL locale; the German words for `de`, the English ones otherwise. */
  readonly locale: string;
  /** Words a Slide says differently from the visual's own. */
  readonly words?: WorkflowSlideWords;
  readonly level?: Level;
  /** The view the diagram opens in; hide the view control through `controls` to keep it. */
  readonly view?: View;
  /** Hides every "Try it" button and the Technical toggle, so the Slide shows the diagram alone. */
  readonly readonly?: boolean;
  /** The Preset's overrides of the toolbar's control registry, e.g. `{ picker: { show: false } }`. */
  readonly controls?: ControlMap;
  /** The Slide's own markers, notes, popovers and words on the diagram */
  readonly diagram?: DiagramSlots;
}

const localeOf = (locale: string): WorkflowLocale => (locale === 'de' ? 'de' : 'en');

/** The data the client parent renders from: plain and serializable. */
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
