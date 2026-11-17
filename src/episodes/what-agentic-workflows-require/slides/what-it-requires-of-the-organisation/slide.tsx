import { slide } from '@/episodes/components/slide-master/slide';
import { SlideFrame } from '@/episodes/components/slide-master/slide-master';
import { Arrow, Board } from '@/episodes/components/slide-shared/party-board/board';
import { Note } from '@/episodes/components/slide-shared/party-board/note';
import de from './i18n/de.json';
import en from './i18n/en.json';

const TEAMS = [
  { key: 'venue', x: 8 },
  { key: 'food', x: 186 },
] as const;
const TEAM_WIDTH = 166;

const CHAIN = [
  { key: 'activities', x: 4, width: 78, tilt: 1 },
  { key: 'travel', x: 90, width: 62, tilt: -1 },
  { key: 'venue', x: 160, width: 70, tilt: 1 },
  { key: 'food', x: 238, width: 70, tilt: -1 },
] as const;
const GOAL = { x: 316, y: 96, width: 40, height: 52 };

export const whatItRequiresOfTheOrganisation = slide({
  slug: 'what-it-requires-of-the-organisation',
  messages: { en, de },
  segments: [{ slug: 'from-people-to-the-company' }],
  content: ({ t }) => (
    <SlideFrame>
      <Board label={t('board')}>
        {TEAMS.map(({ key, x }) => (
          <g key={key}>
            <rect
              x={x}
              y={10}
              width={TEAM_WIDTH}
              height={44}
              rx={6}
              className="fill-none stroke-muted-foreground"
              strokeWidth={1.5}
              strokeDasharray="5 4"
            />
            <text
              data-team
              x={x + TEAM_WIDTH / 2}
              y={37}
              textAnchor="middle"
              className="fill-muted-foreground text-caption font-medium"
            >
              {t(`teams.${key}`)}
            </text>
          </g>
        ))}
        <text x={180} y={80} textAnchor="middle" className="fill-foreground text-caption font-semibold">
          {t('follow')}
        </text>
        {CHAIN.map(({ key, x, width, tilt }) => (
          <g key={key}>
            <Note
              box={{ x, y: 100, width, height: 44 }}
              tilt={tilt}
              lines={t(`cards.${key}`).split('\n')}
              data={{ 'data-chain-card': true }}
            />
            <Arrow from={x + width + 1} to={x + width + 7} y={122} tone="primary" />
          </g>
        ))}
        <Note box={GOAL} tilt={1} look="goal" lines={[t('cards.goal')]} data={{ 'data-chain-card': true }} />
      </Board>
    </SlideFrame>
  ),
});
