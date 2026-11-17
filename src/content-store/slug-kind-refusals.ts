import type { ParsedContent } from './content-shapes';
import { explorablePageRefusals } from './explorable-page-refusals';
import { guideRefusals } from './guide-refusals';
import { templateRefusals } from './template-refusals';

export function slugKindRefusals(content: ParsedContent): string[] {
  return [
    ...templateRefusals(content.templates, content.templateCompositions),
    ...explorablePageRefusals(content.explorablePages, content.explorablePageCompositions, content.explorables),
    ...guideRefusals(content.guides, content.guideCompositions),
  ];
}
