import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ValueChain } from '@/episodes/components/slide-shared/value-chain/value-chain';
import { BOOKING_URL } from '@/shared/lib/contact';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The stages oldest first, each with the year it began; their words are in `i18n/`. AI enablement, last, leads. */
const STAGES = [
  { slug: 'sales', year: '2012' },
  { slug: 'build', year: '2018' },
  { slug: 'ux', year: '2023' },
  { slug: 'lead', year: '2025' },
  { slug: 'ai', year: '2026' },
] as const;

/**
 * About me for a mixed crowd: trust through accomplishments, told as the value chain Han has worked, AI enablement
 * last and first in view. Hovering a stage brings in its two proofs. The facts come from his CV, LinkedIn profile and
 * the landing page's About cases; the note says so.
 */
export const aboutMe = slide({
  slug: 'about-me',
  messages: { en, de },
  notes: [{ slug: 'sources', target: 'chain' }],
  content: ({ t, target }) => (
    <SlideFrame className="justify-center">
      <div {...target('chain')}>
        <ValueChain
          name={t('name')}
          role={t('role')}
          portrait={{ src: '/images/profile/han-che.webp', alt: t('portraitAlt') }}
          statement={t('statement')}
          statementAccent={t('statementAccent')}
          rail={t('rail')}
          proofLabel={t('proofLabel')}
          booking={{ label: t('bookingLabel'), href: BOOKING_URL, newTabHint: t('newTabHint') }}
          stages={STAGES.map(({ slug, year }) => ({
            slug,
            year,
            label: t(`stages.${slug}.label`),
            where: t(`stages.${slug}.where`),
            proofs: [
              { metric: t(`stages.${slug}.p1.metric`), text: t(`stages.${slug}.p1.text`) },
              { metric: t(`stages.${slug}.p2.metric`), text: t(`stages.${slug}.p2.text`) },
            ],
          }))}
        />
      </div>
    </SlideFrame>
  ),
});
