import { slide } from '@/components/slide-master/slide';
import { SlideFrame } from '@/components/slide-master/slide-master';
import { Context } from '@/components/slide-shared/context/context';
import { BudgetFigure, BudgetStrip } from './budget-strip';
import de from './i18n/de.json';
import en from './i18n/en.json';

const RULER = { slug: 'hsieh-ruler', url: 'https://arxiv.org/abs/2404.06654' };
const DU = { slug: 'du-context-length-alone-hurts', url: 'https://arxiv.org/abs/2510.05381' };
const ANTHROPIC = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};
const CHROMA = { slug: 'hong-context-rot', url: 'https://www.trychroma.com/research/context-rot' };

/**
 * "What happens when the bar fills up" (Spec Option 4a): the live cornerstone in its Slide 4 Preset (the Attention
 * view at step 21, the panel open), its caption naming "context rot" with a Context marker to its explanation, the budget-against-plan strip below. Keeps
 * `basic-page` and `motion: local`: the cornerstone's attention fade, end state shown.
 */
export const whatHappensWhenTheBarFillsUp = slide({
  slug: 'what-happens-when-the-bar-fills-up',
  messages: { en, de },
  captionNote: 'what-is-context-rot',
  notes: [
    { slug: 'what-is-context-rot', target: 'caption', sources: [RULER, DU, CHROMA, ANTHROPIC] },
    { slug: 'quality-falls-before-the-limit', target: 'caption', sources: [RULER] },
    { slug: 'length-alone-hurts', target: 'caption', sources: [DU] },
    { slug: 'extra-material-makes-it-worse', target: 'reason', sources: [CHROMA] },
    { slug: 'what-the-studies-measure', target: 'first', sources: [DU, CHROMA] },
    { slug: 'mostly-synthetic-tests', target: 'reason', sources: [DU] },
  ],
  segments: [
    { slug: 'the-start-helps-but-is-no-guarantee' },
    { slug: 'the-newest-stays-sharp' },
    { slug: 'the-middle-blurs' },
    { slug: 'a-standout-survives' },
    { slug: 'answers-get-worse' },
    { slug: 'the-budget-is-forgotten' },
    { slug: 'filling-the-gap' },
  ],
  content: ({ t, locale, marker }) => (
    <SlideFrame className="mt-8 gap-10">
      <Context preset="slide-4" locale={locale} />
      <BudgetStrip
        firstKicker={t('strip.firstKicker')}
        first={t.rich('strip.first', { figure: (chunks) => <BudgetFigure>{chunks}</BudgetFigure> })}
        planKicker={t('strip.planKicker')}
        plan={t.rich('strip.plan', { figure: (chunks) => <BudgetFigure>{chunks}</BudgetFigure> })}
        mayFill={t.rich('strip.mayFill', { marker: marker('what-the-studies-measure') })}
        forgotten={t('strip.forgotten')}
        reason={t.rich('strip.reason', { marker: marker('extra-material-makes-it-worse') })}
        caveat={t.rich('strip.caveat', { marker: marker('mostly-synthetic-tests') })}
      />
    </SlideFrame>
  ),
});
