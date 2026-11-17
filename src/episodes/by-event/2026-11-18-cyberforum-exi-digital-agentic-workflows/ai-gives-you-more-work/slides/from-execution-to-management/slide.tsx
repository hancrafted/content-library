import { slide } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';

// decision: FE-002 §2.2
export const fromExecutionToManagement = slide({
  slug: 'from-execution-to-management',
  messages: { en, de },
  segments: [{ slug: 'the-question' }, { slug: 'the-reframe' }, { slug: 'the-payoff' }],
  content: () => null,
});
