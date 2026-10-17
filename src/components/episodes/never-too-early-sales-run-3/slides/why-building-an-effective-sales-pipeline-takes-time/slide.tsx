import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Why building an effective sales pipeline takes time": the Slide header names the Section; the
// Scene stays empty.
export const whyBuildingAnEffectiveSalesPipelineTakesTime = slide({
  slug: 'why-building-an-effective-sales-pipeline-takes-time',
  messages: { en, de },
  segments: [{ slug: 'the-obvious-objection' }, { slug: 'the-claim' }],
  content: () => null,
});
