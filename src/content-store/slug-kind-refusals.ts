import type { ParsedContent } from './content-shapes';
import { explorablePageRefusals } from './explorable-page-refusals';
import { guideRefusals } from './guide-refusals';
import { templateRefusals } from './template-refusals';

/** The refusals of the kinds served by slug, each checked against its composition folder: Templates, Explorable pages, Guides. */
export function slugKindRefusals(content: ParsedContent): string[] {
  return [
    ...templateRefusals(content.templates, content.templateCompositions),
    ...explorablePageRefusals(content.explorablePages, content.explorablePageCompositions, content.explorables),
    ...guideRefusals(content.guides, content.guideCompositions),
  ];
}
