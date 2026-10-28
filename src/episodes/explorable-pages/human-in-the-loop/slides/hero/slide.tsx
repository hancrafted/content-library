import { slide } from '@/episodes/components/slide-master/slide';
import { SlideBackdrop, SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { ExplorableHero } from '@/episodes/components/slide-shared/explorable-hero/explorable-hero';
import { ToolPreview } from '@/episodes/components/slide-shared/explorable-hero/tool-preview';
import { Check } from 'lucide-react';
import de from './i18n/de.json';
import en from './i18n/en.json';

/** How many of the six stages a person has already checked; the next one is the current stage. */
const CHECKED = 2;

/** The six stages, in order; their words are the Slide's own. */
const STAGES = ['interview', 'plan', 'epics', 'tickets', 'execute', 'report'] as const;

/**
 * The Title slide's hero Scene for the Human in the loop page (the record's `title`): its own headline and lede, the
 * Explorable hero over a drift of bubbles in which one stops on a checkpoint, gains an orange check and moves on, and a
 * preview of the six stages and the prompt of the current one.
 */
export const hero = slide({
  slug: 'hero',
  messages: { en, de },
  content: ({ t, locale, slideHref }) => {
    return (
      <ExplorableHero
        layers={{ Backdrop: SlideBackdrop, Frame: SlideFrame }}
        story="human-in-the-loop"
        locale={locale}
        tryIt={{ label: t('tryIt'), href: slideHref('human-in-the-loop') }}
        why={{ label: t('why'), href: slideHref('why-how-what') }}
        share={{
          title: t('share.title'),
          text: t('share.text'),
          labels: { copy: t('share.copy'), copied: t('share.copied') },
        }}
        motion={{ pause: t('motion.pause'), play: t('motion.play'), stilled: t('motion.stilled') }}
        preview={
          <ToolPreview label={t('preview.label')} title={t('preview.title')} tag={t('preview.tag')}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {STAGES.map((stage, index) => (
                <div
                  key={stage}
                  className={`relative rounded-[10px] border bg-card px-3 py-2.5 ${index === CHECKED ? 'border-2 border-primary' : 'border-border'}`}
                >
                  <span
                    className={`absolute top-2 right-2 grid size-[18px] place-items-center rounded-full ${index < CHECKED ? 'bg-human text-primary-foreground' : 'border-2 border-dashed border-muted-foreground'}`}
                  >
                    {index < CHECKED && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <small className="block text-muted-foreground">{index + 1}</small>
                  <b className="block font-semibold">{t(`preview.stages.${stage}.name`)}</b>
                  <small className="block text-muted-foreground">{t(`preview.stages.${stage}.kind`)}</small>
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-2 rounded-[10px] bg-muted px-3 py-2">
              <span className="font-mono">{t('preview.prompt')}</span>
              <em className="font-semibold text-human not-italic">{t('preview.copy')}</em>
            </div>
          </ToolPreview>
        }
      />
    );
  },
});
