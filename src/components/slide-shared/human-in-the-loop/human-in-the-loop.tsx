import { HumanInTheLoopClient } from './human-in-the-loop.client';
import type { DiagramSlots, HumanInTheLoopData, ToolbarControls, WorkflowSlideWords } from './human-in-the-loop.types';
import { WORKFLOW_IDS, outputWords, uiWords, workflowFor, type WorkflowId, type WorkflowLocale } from './workflow-data';
import type { Level, Mode } from './workflow-state.pure';

/*
 * The human-in-the-loop workflow, a Shared visual. A Slide names a Workflow by id and its own words; the Workflow, the
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
  readonly mode?: Mode;
  readonly level?: Level;
  readonly controls?: Partial<ToolbarControls>;
  /** The Slide's own markers, notes, popovers and words on the diagram; its initials show for English only. */
  readonly diagram?: DiagramSlots;
}

const localeOf = (locale: string): WorkflowLocale => (locale === 'de' ? 'de' : 'en');

/** The data the client parent renders from: plain and serializable. */
export function humanInTheLoopData({
  workflow: id,
  locale,
  words,
  mode = 'watch',
  level = 'simple',
  controls,
  diagram,
}: HumanInTheLoopProps): HumanInTheLoopData {
  const lang = localeOf(locale);
  return {
    workflows: WORKFLOW_IDS.map((each) => workflowFor(each, lang, each === id ? words?.workflow : undefined)),
    workflowId: id,
    locale: lang,
    words: { ...uiWords(lang), ...words?.ui },
    outputWords: outputWords(lang),
    controls: { picker: true, download: true, upload: true, ...controls },
    mode,
    level,
    diagram: diagram && { ...diagram, initials: diagram.initials === true && lang === 'en' },
  };
}

export function HumanInTheLoop(props: HumanInTheLoopProps) {
  return <HumanInTheLoopClient {...humanInTheLoopData(props)} />;
}
