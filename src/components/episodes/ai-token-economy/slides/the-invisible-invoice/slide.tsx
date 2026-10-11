import { slide } from '@/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { InvoiceComparison } from './invoice-comparison';

export const theInvisibleInvoice = slide({
  slug: 'the-invisible-invoice',
  messages: { en, de },
  notes: [{ slug: 'governance-asymmetry', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <InvoiceComparison />
    </SlideFrame>
  ),
});
