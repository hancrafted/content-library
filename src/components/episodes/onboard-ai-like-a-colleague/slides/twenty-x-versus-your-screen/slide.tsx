import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { PromptExchange } from './prompt-exchange';

/*
 * A Scene on the basic-page parts: the claim as the title, a caption, and
 * below them a plain prompt with its flat answer beside a hanging question
 * mark. Promise versus reality, the question left open, no answer on the
 * Slide. Built without motion (Han's decision for this Episode).
 */
export const twentyXVersusYourScreen = slide({
  slug: 'twenty-x-versus-your-screen',
  messages: { en, de },
  notes: [
    {
      slug: 'measured-gains-small',
      target: 'title',
      sources: [
        { slug: 'three-field-experiments', url: 'https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566' },
      ],
    },
    {
      slug: 'slowdown-out-of-date',
      target: 'title',
      sources: [{ slug: 'metr-uplift-update', url: 'https://metr.org/blog/2026-02-24-uplift-update/' }],
    },
    {
      slug: 'we-misjudge-our-gains',
      target: 'prompt-exchange',
      sources: [{ slug: 'metr-early-2025-study', url: 'https://arxiv.org/abs/2507.09089' }],
    },
  ],
  segments: [{ slug: 'the-promise' }, { slug: 'your-own-attempt' }, { slug: 'leave-it-open' }],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <div className="mt-auto flex items-start gap-8 pt-10">
        <PromptExchange
          {...target('prompt-exchange')}
          promptLabel={t('exchange.promptLabel')}
          prompt={t('exchange.prompt')}
          answerLabel={t('exchange.answerLabel')}
          answer={t('exchange.answer')}
        />
        <span aria-hidden="true" className="-translate-y-1/2 text-heading font-normal text-muted-foreground">
          {t('question')}
        </span>
      </div>
    </SlideFrame>
  ),
});
