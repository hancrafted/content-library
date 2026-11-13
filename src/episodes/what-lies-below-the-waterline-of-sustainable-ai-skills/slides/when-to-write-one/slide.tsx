import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { atDepth } from '@/episodes/components/slide-shared/waterline-echo/depth';
import { WaterlineEcho } from '@/episodes/components/slide-shared/waterline-echo/waterline-echo';
import de from './i18n/de.json';
import en from './i18n/en.json';

// The section slide of "When to write one", echoing the Hero motif (picked Title-slide Option 0a). The third card, in sunlight, and the grounding line the borrowed principles of Sections 3 to 8 rest on.
export const whenToWriteOne = slide({
  slug: 'when-to-write-one',
  messages: { en, de },
  presentation: atDepth(2, 'section'),
  segments: [{ slug: 'sunlight' }, { slug: 'borrowed-principles' }, { slug: 'why-a-rule-of-thumb' }],
  content: ({ t, locale }) => (
    <SlideFrame>
      <WaterlineEcho
        zones={(locale === 'de' ? de : en).zones}
        rulerLabel={t('ruler')}
        robotAt="hanging"
        section={2}
        wide
        statement={t('aiStatement')}
        chat={t('analogy')}
        coding={t('agent')}
      >
        <div className="mt-2 flex gap-1">
          <span className="flex-1 rounded-md bg-muted p-1 text-center text-caption opacity-75">{t('steps.first')}</span>
          <span className="flex-1 rounded-md bg-muted p-1 text-center text-caption opacity-75">
            {t('steps.second')}
          </span>
          <span className="flex-1 rounded-md border-2 border-primary bg-muted p-1 text-center text-caption font-semibold">
            {t('steps.third')}
          </span>
        </div>
        <p data-grounding className="mt-2 border-t border-border pt-2 text-caption font-semibold">
          {t('groundingLine')}
          <span className="font-normal text-muted-foreground">{t('groundingNote')}</span>
        </p>
      </WaterlineEcho>
    </SlideFrame>
  ),
});
