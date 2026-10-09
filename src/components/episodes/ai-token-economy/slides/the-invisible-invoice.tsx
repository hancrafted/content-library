import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import { InvoiceComparison } from '../invoice-comparison';

const slide = slidesFor('ai-token-economy');

export const theInvisibleInvoice = slide({
  slug: 'the-invisible-invoice',
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
