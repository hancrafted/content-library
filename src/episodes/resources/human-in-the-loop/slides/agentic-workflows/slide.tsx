import { slide } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "Agentic workflows": the Slide header names the Section; no Scene of its own.
export const agenticWorkflows = slide({
  slug: 'agentic-workflows',
  messages: { en, de },
  content: () => null,
});
