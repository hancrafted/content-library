import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame } from '@/components/slide-master/slide-master';
import { FirstDayDesk } from './first-day-desk';
import de from './i18n/de.json';
import en from './i18n/en.json';

/*
 * A Scene on the basic-page parts: the title and caption, then the new
 * colleague at an empty desk beside your own first sentences to them, in
 * spoken order, unlabelled. No speaker colours: colour-coding would map the
 * experiment the viewer should discover. Built without motion (Han's decision
 * for this Episode).
 */
export const whatYouWouldSayFirst = slide({
  slug: 'what-you-would-say-first',
  messages: { en, de },
  notes: [
    {
      slug: 'colleague-test',
      target: 'desk',
      sources: [
        {
          slug: 'anthropic-be-clear-and-direct',
          url: 'https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct',
        },
      ],
    },
    {
      slug: 'facts-you-hold',
      target: 'line-know',
      sources: [{ slug: 'lost-in-the-middle', url: 'https://arxiv.org/pdf/2307.03172' }],
    },
    {
      slug: 'unstated-requirements',
      target: 'line-back',
      sources: [{ slug: 'what-prompts-dont-say', url: 'https://arxiv.org/abs/2505.13360' }],
    },
    {
      slug: 'all-at-once',
      target: 'lines',
      sources: [{ slug: 'lost-in-multi-turn', url: 'https://arxiv.org/abs/2505.06120' }],
    },
  ],
  segments: [
    { slug: 'where-do-i-start' },
    { slug: 'what-they-need-to-know' },
    { slug: 'what-they-can-touch' },
    { slug: 'what-i-want-back' },
    { slug: 'before-they-run' },
  ],
  content: ({ t, target, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption data-target="caption">{t('caption')}</SlideCaption>
      <FirstDayDesk
        {...target('lines')}
        desk={target('desk')}
        quote={{ open: t('quote.open'), close: t('quote.close') }}
        lines={[
          { slug: 'story', text: t('lines.story') },
          { slug: 'know', text: t('lines.know'), target: target('line-know') },
          { slug: 'doors', text: t('lines.doors') },
          { slug: 'back', text: t('lines.back'), target: target('line-back') },
        ]}
      />
    </SlideFrame>
  ),
});
