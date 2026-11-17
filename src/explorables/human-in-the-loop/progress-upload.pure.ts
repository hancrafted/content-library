import { readProgressFile, type Refusal } from '@/shared/lib/progress-file.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import type { UiWords } from './human-in-the-loop.types';
import type { WorkflowEvent } from './workflow-state.pure';

const REFUSALS: Record<Refusal, 'refuseUnreadable' | 'refuseOtherWorkflow' | 'refuseChanged'> = {
  unreadable: 'refuseUnreadable',
  'other-workflow': 'refuseOtherWorkflow',
  changed: 'refuseChanged',
};

export function progressUploadEvent(
  text: string,
  shown: { readonly id: string; readonly hash: string; readonly title: string },
  words: UiWords,
): WorkflowEvent {
  const read = readProgressFile(text, { workflow: shown.id, hash: shown.hash });
  if ('entry' in read) {
    const { results, demo, prompts } = read.entry;
    return { type: 'restore', results, demo, prompts };
  }
  return { type: 'upload-failed', problems: [fillTemplate(words[REFUSALS[read.refusal]], { workflow: shown.title })] };
}
