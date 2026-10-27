import { Document, isMap, isScalar, parse, Scalar } from 'yaml';
import { isEntry, isRecord, isText, type ProgressEntry } from './progress.pure';

/*
 * The YAML half of hands-on progress: the file a viewer downloads to keep a run and uploads to resume it. The stored
 * entry, its key and its hash verdict stay in `progress.pure.ts`.
 */

const FILE_TYPE = 'application/x-yaml';

/** Block-literal style for every result, so a pasted Markdown result reads as it is. */
function blockResults(doc: Document): Document {
  const results = doc.get('results', true);
  if (!isMap(results)) return doc;
  for (const { value } of results.items) {
    if (isScalar(value) && typeof value.value === 'string') value.type = Scalar.BLOCK_LITERAL;
  }
  return doc;
}

/** The file a viewer downloads to keep a run: the Workflow, its hash, the demo flag and the results, as YAML. */
export function progressFile(workflowId: string, entry: ProgressEntry): { name: string; text: string; type: string } {
  const slug = workflowId.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'workflow';
  const doc = new Document({
    workflow: workflowId,
    hash: entry.hash,
    demo: entry.demo,
    results: entry.results,
  });
  return { name: `${slug}-progress.yml`, text: blockResults(doc).toString(), type: FILE_TYPE };
}

/** Why an uploaded progress file is not taken: it is no progress file, it is of another Workflow, or of an edited one. */
export type Refusal = 'unreadable' | 'other-workflow' | 'changed';

function parseYaml(text: string): unknown {
  try {
    return parse(text);
  } catch {
    return undefined;
  }
}

/** What an uploaded file holds for the Workflow shown now: its run, or the reason it is refused. */
export function readProgressFile(
  text: string,
  shown: { readonly workflow: string; readonly hash: string },
): { readonly entry: ProgressEntry } | { readonly refusal: Refusal } {
  const value = parseYaml(text);
  if (!isRecord(value) || !isText(value.workflow) || !isEntry(value)) return { refusal: 'unreadable' };
  if (value.workflow !== shown.workflow) return { refusal: 'other-workflow' };
  if (value.hash !== shown.hash) return { refusal: 'changed' };
  return { entry: { hash: value.hash, demo: value.demo, results: value.results } };
}
