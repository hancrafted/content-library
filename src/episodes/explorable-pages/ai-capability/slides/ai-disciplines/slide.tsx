import { slide } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "AI capability": the Slide header names the Section; no Scene of its own. Its slug keeps
// the published anchor #ai-disciplines from before the rename (FE-002 §5.2).
export const aiCapabilityPresets = slide({
  slug: 'ai-disciplines',
  messages: { en, de },
  content: () => null,
});
