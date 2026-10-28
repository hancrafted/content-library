import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ExplorableHero } from '@/episodes/components/slide-shared/explorable-hero/explorable-hero';
import { ToolPreview } from '@/episodes/components/slide-shared/explorable-hero/tool-preview';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** The four Levels, in time order; their words are the Slide's own. */
const DISCIPLINES = ['prompting', 'agents', 'workflows', 'factory'] as const;

/**
 * The Title slide's hero Scene for the AI capability page (the record's `title`): its own headline and lede, the
 * Explorable hero over a drift of bubbles in which one climbs four tiers and gains a chip at each, and a preview of the
 * four Levels wired down to one language model.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale, slideHref }) => {
    return (
      <ExplorableHero
        layers={{ Backdrop: SlideBackdrop, Frame: SlideFrame }}
        story="ai-capability"
        locale={locale}
        tryIt={{ label: t('tryIt'), href: slideHref('timeline') }}
        why={{ label: t('why'), href: slideHref('why-how-what') }}
        share={{
          title: t('share.title'),
          text: t('share.text'),
          labels: { copy: t('share.copy'), copied: t('share.copied') },
        }}
        motion={{ pause: t('motion.pause'), play: t('motion.play'), stilled: t('motion.stilled') }}
        preview={
          <ToolPreview label={t('preview.label')} title={t('preview.title')} tag={t('preview.tag')}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DISCIPLINES.map((discipline) => (
                <div key={discipline}>
                  <div className="rounded-[10px] border border-border px-2.5 py-2">
                    <small className="block text-muted-foreground">{t(`preview.cards.${discipline}.year`)}</small>
                    <b className="block font-semibold">{t(`preview.cards.${discipline}.name`)}</b>
                    <small className="block text-muted-foreground">{t(`preview.cards.${discipline}.like`)}</small>
                  </div>
                  <div className="mx-auto hidden h-7 w-0.5 bg-border sm:block" />
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 rounded-[10px] bg-primary px-3 py-2 text-primary-foreground">
              <b className="font-semibold">{t('preview.model')}</b>
              <span>{t('preview.predicts')}</span>
            </div>
          </ToolPreview>
        }
      />
    );
  },
});
