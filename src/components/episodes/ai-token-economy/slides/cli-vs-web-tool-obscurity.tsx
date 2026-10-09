import { slidesFor } from '@/components/slide-master/episode-record';
import { SlideCaption, SlideFrame, SlideProse } from '@/components/slide-master/slide-master';
import Image from 'next/image';
import type { ReactElement } from 'react';

const slide = slidesFor('ai-token-economy');

function ObscurityCards(): ReactElement {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card border border-base-content/10 bg-base-200 p-5 shadow-xs">
        <h4 className="font-display text-lg font-bold">
          <span className="font-mono text-sm text-success">01</span> The initiation
        </h4>
        <p className="mt-2 text-sm text-base-content/70">
          Unlimited on the house. The intelligence feels like magic and the bill is invisible — so you build the habit.
        </p>
      </div>
      <div className="card border border-error/30 bg-error/5 p-5 shadow-xs">
        <h4 className="font-display text-lg font-bold">
          <span className="font-mono text-sm text-error">02</span> The hook
        </h4>
        <p className="mt-2 text-sm text-base-content/70">
          Now you are fluent — and the meter is gone. Out of credits? Just top up. The real rate never shows.
        </p>
      </div>
    </div>
  );
}

function ObscurityFigure(): ReactElement {
  return (
    <figure className="mx-auto max-w-3xl overflow-hidden rounded-box border border-base-300 shadow-lg">
      <Image
        src="/images/episodes/ai-token-economy/token-addiction.webp"
        alt="Two-panel illustration: The Initiation vs The Hook"
        width={800}
        height={450}
        className="w-full h-auto object-cover"
      />
    </figure>
  );
}

export const cliVsWebToolObscurity = slide({
  slug: 'cli-vs-web-tool-obscurity',
  minutes: { en: 2, de: 2 },
  notes: [{ slug: 'the-obscurity-playbook', target: 'title' }],
  content: ({ t, Title }) => (
    <SlideFrame>
      <Title>{t('title')}</Title>
      <SlideCaption>{t('caption')}</SlideCaption>
      <SlideProse>{t('prose')}</SlideProse>
      <div className="mt-8 space-y-6">
        <ObscurityFigure />
        <ObscurityCards />
      </div>
    </SlideFrame>
  ),
});
