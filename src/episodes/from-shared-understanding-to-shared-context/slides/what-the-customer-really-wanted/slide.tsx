import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { SoftwareEcology } from '@/explorables/software-ecology/software-ecology';
import de from './i18n/de.json';
import en from './i18n/en.json';

const DORA_2025 = { slug: 'dora-2025-overview', url: 'https://dora.dev/research/2025/dora-report/' };
const OUT_OF_BALANCE = 'why-the-line-gets-out-of-balance';

/**
 * What the customer really wanted: the software ecology Explorable, which opens on the tire swing cartoon and plays
 * the factory line live. The Speaker note on why the line gets out of balance sits on its belts.
 */
export const whatTheCustomerReallyWanted = slide({
  slug: 'what-the-customer-really-wanted',
  messages: { en, de },
  notes: [{ slug: OUT_OF_BALANCE, target: 'belts', sources: [DORA_2025] }],
  segments: [{ slug: 'the-hook' }, { slug: 'cartoon-to-balanced-line' }, { slug: 'reality' }],
  content: ({ locale, target, Marker }) => (
    <SlideFrame className="mt-6">
      <SoftwareEcology
        locale={locale}
        targets={{ belts: target('belts') }}
        markers={{ 'belt:eng-qa': <Marker note={OUT_OF_BALANCE} placement="beside" /> }}
      />
    </SlideFrame>
  ),
});
