import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { BriefRail, type MoveSlug } from './brief-rail';
import de from './i18n/de.json';
import en from './i18n/en.json';

const ANTHROPIC = {
  slug: 'anthropic-effective-context-engineering',
  url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
};

const MOVES: readonly MoveSlug[] = ['break', 'requirements', 'interview', 'evaluate', 'fresh'];

const TODAY = ['requirements', 'interview', 'fresh'] as const;
type TodaySlug = (typeof TODAY)[number];

const isToday = (slug: MoveSlug): slug is TodaySlug => (TODAY as readonly MoveSlug[]).includes(slug);

export const brief = slide({
  slug: 'brief',
  messages: { en, de },
  notes: [{ slug: 'why-a-fresh-chat', target: 'fresh', sources: [ANTHROPIC] }],
  segments: [{ slug: 'callback' }, { slug: 'map-to-today' }, { slug: 'close' }],
  content: ({ t, target, Marker }) => (
    <SlideFrame className="@container mt-8">
      <BriefRail
        callback={{ chip: t('callback.chip'), episode: t('callback.episode') }}
        label={t('movesLabel')}
        moves={MOVES.map((slug) => ({
          slug,
          letter: t(`moves.${slug}.letter`),
          move: t(`moves.${slug}.move`),
          today: isToday(slug) ? (
            <>
              <b className="font-semibold text-foreground">{t('todayLabel')}</b> {t(`moves.${slug}.today`)}
            </>
          ) : (
            t('notToday')
          ),
          isToday: isToday(slug),
          focus: slug === 'fresh',
          ...(slug === 'fresh' && {
            marker: <Marker note="why-a-fresh-chat" placement="beside" />,
            target: target('fresh'),
          }),
        }))}
      />
    </SlideFrame>
  ),
});
