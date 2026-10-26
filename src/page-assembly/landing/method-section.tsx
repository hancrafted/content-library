import { externalHref } from '@/lib/external-link.pure';
import { FRAMEWORK_SLIDES, type FrameworkSlideData } from '@/lib/framework-slides.pure';
import type { Locale } from '@/lib/locale.pure';
import { MethodRailSection } from '@/page-assembly/landing/method-rail-section.client';
import type { MethodCard } from '@/page-assembly/landing/method-slide-item';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

type MethodT = Awaited<ReturnType<typeof getTranslations<'landing.method'>>>;

/** The note's `<link>` target in this locale, plus the screen-reader notice that it opens a new tab (FE-003 §2.2). */
interface NoteLink {
  locale: Locale;
  newTab: string;
}

function cardNote(slide: FrameworkSlideData, t: MethodT, { locale, newTab }: NoteLink): ReactNode {
  if (!slide.note) return undefined;
  const url = slide.note.href?.[locale];
  return t.rich(`cards.${slide.id}.note`, {
    link: (chunks) =>
      url ? (
        <a href={externalHref(url)} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer">
          {chunks}
          <span className="sr-only"> ({newTab})</span>
        </a>
      ) : (
        chunks
      ),
  });
}

/** Resolves the PROOF cards' copy on the server and hands it to the scroll-driven rail. */
export async function MethodSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing.method' });
  const newTab = (await getTranslations({ locale, namespace: 'nav' }))('newTab');
  const cards: MethodCard[] = FRAMEWORK_SLIDES.map((slide) => ({
    id: slide.id,
    step: slide.step,
    letter: slide.letter,
    iconName: slide.iconName,
    title: t(`cards.${slide.id}.title`),
    claim: t(`cards.${slide.id}.claim`),
    note: cardNote(slide, t, { locale, newTab }),
  }));
  return <MethodRailSection cards={cards} title={t('title')} hint={t('hint')} />;
}
