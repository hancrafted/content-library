import { parse } from 'yaml';
import { exampleProblems, graphProblems, inputProblems } from './workflow-checks.pure';
import { stageOf, text, trees } from './workflow-read.pure';
import { isTree, mergeWords, parityProblems, type Tree } from './workflow-words.pure';
import type { LoadResult, Stage } from './workflow.types';

/*
 * The loading seam: `loadWorkflow(configYaml, localeYaml)` reads a Workflow pair into a Workflow or into every problem
 * found, one sentence each. It reuses the pipeline graph checks (stage order, ancestors) and validates by hand (no
 * zod, ARCH-001). The build throws the problems; the browser shows them for an upload.
 */

function parseTree(source: string, what: string): { tree: Tree } | { problem: string } {
  try {
    const doc: unknown = parse(source);
    return isTree(doc) ? { tree: doc } : { problem: `The ${what} must be a YAML mapping.` };
  } catch {
    return { problem: `The ${what} is not valid YAML.` };
  }
}

/** The headline words every Workflow needs. */
function headProblems(id: string | undefined, words: Tree): string[] {
  return [
    ...(id ? [] : ['The config has no id.']),
    ...(text(words.title) ? [] : ['The words have no title.']),
    ...(text(words.scenario) ? [] : ['The words have no scenario.']),
  ];
}

function focalProblems(focal: string | undefined, stages: readonly Stage[]): string[] {
  const known = stages.some((stage) => stage.jobs.some((job) => job.id === focal));
  return focal && !known ? [`The focal job "${focal}" is not a job.`] : [];
}

/**
 * Reads a Workflow pair. `configYaml` holds the data and the English `words:`; `localeYaml` holds the `words:` of the
 * locale to show, under the same key paths (for English it is the config itself). `override` is a Slide's words, laid
 * over key by key. Returns the Workflow, or every problem found.
 */
export function loadWorkflow(configYaml: string, localeYaml: string, override?: unknown): LoadResult {
  const config = parseTree(configYaml, 'config');
  const locale = parseTree(localeYaml, 'locale file');
  if ('problem' in config || 'problem' in locale) {
    return { problems: [config, locale].flatMap((read) => ('problem' in read ? [read.problem] : [])) };
  }
  return build(config.tree, locale.tree, override);
}

/** The Workflow of a parsed pair, or all its problems. */
function build(config: Tree, locale: Tree, override: unknown): LoadResult {
  const merged = mergeWords(mergeWords(config.words, locale.words), override);
  const words = isTree(merged) ? merged : {};
  const problems = parityProblems(config.words, locale.words);
  const stages = trees(config.stages).flatMap((stage) => stageOf(stage, words, problems) ?? []);
  const id = text(config.id);
  const focal = text(config.focalJob);
  const graph = graphProblems(stages);
  problems.push(
    ...headProblems(id, words),
    ...(stages.length > 0 ? [] : ['The config lists no stages.']),
    ...focalProblems(focal, stages),
    ...graph.problems,
    ...inputProblems(stages, graph.byId),
    ...exampleProblems(stages),
  );
  if (problems.length > 0) return { problems };
  return {
    workflow: {
      id: id ?? '',
      title: text(words.title) ?? '',
      scenario: text(words.scenario) ?? '',
      setup: text(words.setup),
      focalJobId: focal,
      stages,
    },
  };
}
