import { slide } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "From execution to management", kept minimal for FE-002 §2.2: the wrapper's section band
// renders its title and caption, and it draws no Scene. Its Voice script opens the Episode, since the Title slide has none.
export const fromExecutionToManagement = slide({
  slug: 'from-execution-to-management',
  messages: { en, de },
  segments: [{ slug: 'the-question' }, { slug: 'the-reframe' }, { slug: 'the-payoff' }],
  content: () => null,
});
