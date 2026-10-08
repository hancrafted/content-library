import { PromotionDesk } from '@/components/landing/promotion-desk';
import { PromotionHero } from '@/components/landing/promotion-hero.client';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

type HeroT = Awaited<ReturnType<typeof getTranslations<'landing.hero'>>>;

function heroLabels(t: HeroT) {
  return {
    episodes: t('episodes'),
    contact: t('contact'),
    newTab: t('newTab'),
    open: t('open'),
    skip: t('skip'),
  };
}

function heroScene(t: HeroT) {
  const tasks = [
    t('tasks.bug'),
    t('tasks.ticket'),
    t('tasks.release'),
    t('tasks.tests'),
    t('tasks.spec'),
    t('tasks.review'),
  ];
  return <PromotionDesk promotion={t('promotion')} tasks={tasks} />;
}

export async function HeroSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing.hero' });
  const words = [t('plan'), t('spec'), t('review')];
  return (
    <PromotionHero
      locale={locale}
      headline={t('headline')}
      eyebrow={t('eyebrow')}
      caption={t.rich('caption', {
        plan: (text) => <span data-caption-word>{text}</span>,
        spec: (text) => <span data-caption-word>{text}</span>,
        review: (text) => <span data-caption-word>{text}</span>,
      })}
      scene={heroScene(t)}
      words={words}
      labels={heroLabels(t)}
    />
  );
}
