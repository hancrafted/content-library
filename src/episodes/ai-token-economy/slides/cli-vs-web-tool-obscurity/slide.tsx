import { slide } from '@/episodes/components/slide-master/slide';
import { SlideCaption, SlideFrame, SlideProse } from '@/episodes/components/slide-master/slide-master';
import Image from 'next/image';
import type { ReactElement } from 'react';
import de from './i18n/de.json';
import en from './i18n/en.json';

function ObscurityCards(): ReactElement {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-border bg-muted p-5 shadow-xs">
        <h4 className="text-lg font-bold">
          <span className="font-mono text-sm text-(--success)">01</span> The initiation
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Unlimited on the house. The intelligence feels like magic and the bill is invisible — so you build the habit.
        </p>
      </div>
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 shadow-xs">
        <h4 className="text-lg font-bold">
          <span className="font-mono text-sm text-destructive">02</span> The hook
        </h4>
        <p className="mt-2 text-sm text-muted-foreground">
          Now you are fluent — and the meter is gone. Out of credits? Just top up. The real rate never shows.
        </p>
      </div>
    </div>
  );
}

function ObscurityFigure(): ReactElement {
  return (
    <figure className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border shadow-lg">
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
  messages: { en, de },
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
