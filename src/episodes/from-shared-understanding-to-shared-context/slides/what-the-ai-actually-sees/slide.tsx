import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Context } from '@/explorables/context-window/context';
import de from './i18n/de.json';
import en from './i18n/en.json';

const ANTHROPIC = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};

/**
 * "What the AI actually sees" (Spec Option 7a): the Context window Explorable in its `slide-4` Preset, the one the
 * viewer met in the context window Episode, called back as is. Keeps `basic-page` and `motion: local`: the motion is
 * the Explorable's own. The Explorable owns no marker, so the Slide puts the window's Context marker in a small label
 * row above it, right-aligned.
 */
export const whatTheAiActuallySees = slide({
  slug: 'what-the-ai-actually-sees',
  messages: { en, de },
  notes: [{ slug: 'the-window-has-an-attention-budget', target: 'window', sources: [ANTHROPIC] }],
  segments: [{ slug: 'callback' }, { slug: 'not-your-mind' }],
  content: ({ t, locale, target, Marker }) => (
    <SlideFrame className="mt-8 gap-3">
      <p className="flex items-center justify-end gap-1 text-caption font-semibold text-muted-foreground">
        {t('window')}
        <Marker note="the-window-has-an-attention-budget" placement="beside" />
      </p>
      <div {...target('window')}>
        <Context preset="slide-4" locale={locale} />
      </div>
    </SlideFrame>
  ),
});
