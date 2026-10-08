import type { StoryCardCopy } from '@/components/landing/story-card';
import { StoryMatrix, type MatrixLabels } from '@/components/landing/story-matrix.client';
import type { Locale } from '@/lib/locale.pure';
import { matrixCells, STORY_PLACEMENTS, type StoryId } from '@/lib/story-matrix.pure';
import { getTranslations } from 'next-intl/server';

type AboutT = Awaited<ReturnType<typeof getTranslations<'landing.about'>>>;

/** Which of the two candidate headlines renders — open question 1, pending Han's pick. */
const HEADLINE_KEY = 'headlineStepOut' satisfies 'headlineStepOut' | 'headlineNotPushing';

function storyCopy(t: AboutT, id: StoryId): StoryCardCopy {
  return {
    id,
    title: t(`stories.${id}.title`),
    stat: t(`stories.${id}.stat`),
    statUnit: t(`stories.${id}.statUnit`),
    description: t(`stories.${id}.description`),
    labels: t.raw(`stories.${id}.labels`) as string[],
  };
}

function matrixLabels(t: AboutT): MatrixLabels {
  return { axes: t.raw('axes') as MatrixLabels['axes'] };
}

function IdentityCard({ t }: { t: AboutT }) {
  return (
    <aside className="flex flex-col gap-6 rounded-3xl bg-foreground p-8 text-background lg:sticky lg:top-24 lg:self-start">
      <div className="font-mono text-[0.65rem] uppercase tracking-widest opacity-60">{t('identity.kicker')}</div>
      <div className="space-y-1">
        <h3 className="text-2xl font-bold tracking-tight">{t('identity.name')}</h3>
        <p className="font-mono text-xs opacity-70">{t('identity.practice')}</p>
      </div>
      <p className="text-xl font-semibold leading-snug">{t('identity.positioning')}</p>
      <p className="text-sm leading-relaxed opacity-75">{t('identity.body')}</p>
      <p className="mt-auto border-t border-background/20 pt-4 font-mono text-xs opacity-70">
        {t('identity.languages')}
      </p>
    </aside>
  );
}

function AboutHeader({ t }: { t: AboutT }) {
  return (
    <header className="max-w-3xl space-y-4">
      <p className="text-sm font-medium text-muted-foreground">{t('eyebrow')}</p>
      <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">{t(HEADLINE_KEY)}</h2>
      <p className="text-base leading-relaxed text-muted-foreground">{t('headlineLead')}</p>
    </header>
  );
}

/** About: the identity card beside the story matrix; on narrow screens the card comes first, then the story list. */
export async function AboutSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'landing.about' });
  const stories = Object.fromEntries(STORY_PLACEMENTS.map(({ id }) => [id, storyCopy(t, id)]));
  return (
    <section id="about" data-chapter="04" className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-12">
        <IdentityCard t={t} />
        <div className="flex flex-col gap-10">
          <AboutHeader t={t} />
          <StoryMatrix cells={matrixCells(STORY_PLACEMENTS)} stories={stories} labels={matrixLabels(t)} />
        </div>
      </div>
    </section>
  );
}
