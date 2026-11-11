import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { SoftwareEcology } from '@/explorables/software-ecology/software-ecology';
import de from './i18n/de.json';
import en from './i18n/en.json';

const BENDER_TIPPING_POINT = { slug: 'bender-tipping-point', url: 'https://www.youtube.com/watch?v=2n41YjR5QfU' };
const FAROS_PRODUCTIVITY_PARADOX = {
  slug: 'faros-productivity-paradox',
  url: 'https://www.faros.ai/blog/ai-software-engineering',
};
const NOY_ZHANG_PRODUCTIVITY = {
  slug: 'noy-zhang-productivity',
  url: 'https://economics.mit.edu/sites/default/files/inline-files/Noy_Zhang_1.pdf',
};
const ULLOA_PM_DELEGATION = { slug: 'ulloa-pm-delegation', url: 'https://arxiv.org/abs/2510.02504' };
const LABAN_LOST_IN_MULTI_TURN = { slug: 'laban-lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' };
const SALESFORCE_STATE_OF_SALES = {
  slug: 'salesforce-state-of-sales',
  url: 'https://assets.ctfassets.net/f43wltp2j5se/2gHMpCURXzpMW7PJ3SlWZJ/3cad8d7e8496abbd3c0f99d5c7f16ef4/salesforce-state-of-sales-report-6-ed.pdf',
};

/**
 * The Play Section's page Slide: the whole software ecology Explorable (master basic-page, no motion of its own). Its
 * Speaker notes sit on what they explain: the belts, quality assurance's rack and its passing-unread sign, the product
 * manager and analyst, the state row (where the Fix the orders first scenario joins, #543) and the Sales card.
 */
export const factory = slide({
  slug: 'factory',
  messages: { en, de },
  segments: [
    { slug: 'you-know-this-cartoon' },
    { slug: 'the-factory-runs-live' },
    { slug: 'map-your-team' },
    { slug: 'check-the-inspection-before-the-turbo' },
    { slug: 'fix-the-orders-first' },
    { slug: 'what-the-customer-got' },
  ],
  notes: [
    { slug: 'pressure-travels', target: 'belts', sources: [BENDER_TIPPING_POINT] },
    { slug: 'review-load', target: 'qa-rack', sources: [FAROS_PRODUCTIVITY_PARADOX] },
    { slug: 'review-skipped', target: 'qa-unread', sources: [NOY_ZHANG_PRODUCTIVITY] },
    { slug: 'pm-accountability', target: 'pm-and-analyst', sources: [ULLOA_PM_DELEGATION] },
    { slug: 'muddy-instructions', target: 'states', sources: [LABAN_LOST_IN_MULTI_TURN] },
    { slug: 'sales-billing-inference', target: 'sales', sources: [SALESFORCE_STATE_OF_SALES] },
  ],
  content: ({ locale, target, Marker }) => (
    <SlideFrame className="mt-6">
      <SoftwareEcology
        locale={locale}
        targets={{
          belts: target('belts'),
          'qa:rack': target('qa-rack'),
          'qa:unread': target('qa-unread'),
          'pm:card': target('pm-and-analyst'),
          states: target('states'),
          'sales:card': target('sales'),
        }}
        markers={{
          'belt:eng-qa': <Marker note="pressure-travels" placement="beside" />,
          'qa:rack': <Marker note="review-load" placement="beside" />,
          'qa:unread': <Marker note="review-skipped" placement="beside" />,
          'pm:card': <Marker note="pm-accountability" placement="beside" />,
          'ba:card': <Marker note="pm-accountability" placement="beside" />,
          states: <Marker note="muddy-instructions" placement="beside" />,
          'sales:card': <Marker note="sales-billing-inference" placement="beside" />,
        }}
      />
    </SlideFrame>
  ),
});
