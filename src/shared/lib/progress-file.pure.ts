import { Document, isMap, isScalar, parse, Scalar } from 'yaml';
import { isEntry, isRecord, isText, normalizedEntry, type ProgressEntry } from './progress.pure';

/*
 * The YAML half of hands-on progress: the file a viewer downloads to keep a run and uploads to resume it. The stored
 * entry, its key and its hash verdict stay in `progress.pure.ts`.
 */

const FILE_TYPE = 'application/x-yaml';

/** Block-literal style for every result and prompt edit, so a pasted Markdown result reads as it is. */
function blockTexts(doc: Document, field: 'results' | 'prompts'): void {
  const texts = doc.get(field, true);
  if (!isMap(texts)) return;
  for (const { value } of texts.items) {
    if (isScalar(value) && typeof value.value === 'string') value.type = Scalar.BLOCK_LITERAL;
  }
}

function withBlockLiterals(doc: Document): Document {
  blockTexts(doc, 'results');
  blockTexts(doc, 'prompts');
  return doc;
}

export function progressFile(workflowId: string, entry: ProgressEntry): { name: string; text: string; type: string } {
  const slug = workflowId.replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '') || 'workflow';
  const { prompts } = normalizedEntry(entry);
  const doc = new Document({
    workflow: workflowId,
    hash: entry.hash,
    demo: entry.demo,
    results: entry.results,
    ...(prompts && { prompts }),
  });
  return { name: `${slug}-progress.yml`, text: withBlockLiterals(doc).toString(), type: FILE_TYPE };
}

export type Refusal = 'unreadable' | 'other-workflow' | 'changed';

function parseYaml(text: string): unknown {
  try {
    return parse(text);
  } catch {
    return undefined;
  }
}

export function readProgressFile(
  text: string,
  shown: { readonly workflow: string; readonly hash: string },
): { readonly entry: ProgressEntry } | { readonly refusal: Refusal } {
  const value = parseYaml(text);
  if (!isRecord(value) || !isText(value.workflow) || !isEntry(value)) return { refusal: 'unreadable' };
  if (value.workflow !== shown.workflow) return { refusal: 'other-workflow' };
  if (value.hash !== shown.hash) return { refusal: 'changed' };
  return {
    entry: normalizedEntry({ hash: value.hash, demo: value.demo, results: value.results, prompts: value.prompts }),
  };
}
