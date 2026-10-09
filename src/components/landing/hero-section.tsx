import { PromotionDesk } from '@/components/landing/promotion-desk';
import { PromotionHero } from '@/components/landing/promotion-hero.client';
import styles from '@/components/landing/promotion-hero.module.css';
import type { Locale } from '@/lib/locale.pure';
import { getTranslations } from 'next-intl/server';

type HeroT = Awaited<ReturnType<typeof getTranslations<'landing.hero'>>>;

function heroLabels(t: HeroT) {
  return {
    episodes: t('episodes'),
    open: t('open'),
    skip: t('skip'),
    motionHint: t('motionHint'),
  };
}

function heroHeadline(t: HeroT) {
  return t.rich('headline', {
    accent: (text) => <em className={styles.accent}>{text}</em>,
    br: () => <br className={styles.lineBreak} />,
  });
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
  return (
    <PromotionHero
      locale={locale}
      headline={heroHeadline(t)}
      eyebrow={t('eyebrow')}
      offers={[t('offers.consulting'), t('offers.coaching'), t('offers.leadership')]}
      caption={t.rich('caption', {
        plan: (text) => (
          <span data-caption-word data-testid="hero-plan">
            {text}
          </span>
        ),
        spec: (text) => (
          <span data-caption-word data-testid="hero-spec">
            {text}
          </span>
        ),
        review: (text) => (
          <span data-caption-word data-testid="hero-review">
            {text}
          </span>
        ),
      })}
      scene={heroScene(t)}
      labels={heroLabels(t)}
    />
  );
}
