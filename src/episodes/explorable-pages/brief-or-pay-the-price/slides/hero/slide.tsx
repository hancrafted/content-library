import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ExplorableHero } from '@/episodes/components/slide-shared/explorable-hero/explorable-hero';
import { HeroMotion } from '@/episodes/components/slide-shared/explorable-hero/hero-motion.client';
import { ToolPreview } from '@/episodes/components/slide-shared/explorable-hero/tool-preview';
import { explorableData } from '@/explorables/brief-or-pay-the-price/brief-or-pay-the-price-data';
import de from './i18n/de.json';
import en from './i18n/en.json';

const LETTERS = explorableData('en').definitions.price.rows.map((row) => row.letter);

export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  presentation: {
    tone: 'inverse',
    style: { '--slide-space-after': '320px' },
    leave: { effect: 'liquid', style: { '--slide-transition-start-offset': '-160px' } },
    rear: (
      <>
        <div className="hero-glow absolute inset-0 text-brand-accent opacity-60" />
        <div className="hero-glow hero-glow--accent absolute inset-0 text-brand-accent opacity-60" />
      </>
    ),
    rearMobile: true,
    Provider: HeroMotion,
  },
  content: ({ t, locale, slideHref }) => (
    <ExplorableHero
      layers={{ Frame: SlideFrame }}
      locale={locale}
      tryIt={{ label: t('tryIt'), href: slideHref('mirror') }}
      why={{ label: t('why'), href: slideHref('mirror') }}
      share={{
        title: t('share.title'),
        text: t('share.text'),
        labels: { copy: t('share.copy'), copied: t('share.copied') },
      }}
      motion={{ pause: t('motion.pause'), play: t('motion.play'), stilled: t('motion.stilled') }}
      preview={
        <ToolPreview label={t('preview.label')} title={t('preview.title')} tag={t('preview.tag')}>
          <div className="flex flex-col gap-1.5">
            {LETTERS.map((letter) => (
              <div key={letter} className="flex items-center gap-2">
                <span className="flex-1 rounded-full border border-border bg-muted px-3 py-1">
                  {t('preview.freelancer')}
                </span>
                <b className="grid size-7 place-items-center rounded-full bg-primary font-semibold text-primary-foreground">
                  {letter}
                </b>
                <span className="flex-1 rounded-full border border-ai/50 bg-ai/10 px-3 py-1 text-ai">
                  {t('preview.ai')}
                </span>
              </div>
            ))}
          </div>
        </ToolPreview>
      }
    />
  ),
});
