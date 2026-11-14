import { Character } from '@/episodes/components/slide-shared/character/character';
import { pilot } from '@/episodes/components/slide-shared/deep-sea-expedition/cast';
import { Console } from '@/episodes/components/slide-shared/deep-sea-expedition/console';
import { consoleLayout } from '@/episodes/components/slide-shared/deep-sea-expedition/console.pure';
import { Robot } from '@/episodes/components/slide-shared/deep-sea-expedition/robot';
import { useId } from 'react';
import styles from './retire.module.css';

/** Low in the wall between the sheets, where the cards leave it in view. */
const PORTHOLE = { x: 600, y: 735, r: 50 } as const;
const CONSOLE_WIDTH = 120;
const SEAT = consoleLayout({ width: CONSOLE_WIDTH }).seat;

/** The night wall's facets, lit from the upper left, with the porthole cut out of them. */
const WALL: readonly { readonly tone: 'wall' | 'wall-lit'; readonly points: string }[] = [
  { tone: 'wall-lit', points: '0,0 520,0 300,380 0,300' },
  { tone: 'wall', points: '520,0 1200,0 1200,260 760,420 300,380' },
  { tone: 'wall', points: '0,300 300,380 220,800 0,800' },
  { tone: 'wall-lit', points: '300,380 760,420 700,800 220,800' },
  { tone: 'wall', points: '760,420 1200,260 1200,800 700,800' },
];

/**
 * The control room at night (Option 25b): the wall with a porthole onto the Abyss, where the robot hangs on its cable
 * with its lamp on, and the pilot at the console. The Abyss behind is `ZoneScene`'s; the figures are the shared cast
 * (design-ADR 0025); the wall and porthole are this Slide's own scenery.
 */
export function NightRoom() {
  const mask = useId();
  return (
    <g>
      <mask id={mask}>
        <rect width={1200} height={800} className={styles.maskOpen} />
        <circle cx={PORTHOLE.x} cy={PORTHOLE.y} r={PORTHOLE.r} className={styles.maskHole} />
      </mask>
      <line x1={PORTHOLE.x} y1={0} x2={PORTHOLE.x} y2={PORTHOLE.y - 20} className={styles.cable} />
      <g transform={`translate(${PORTHOLE.x} ${PORTHOLE.y - 25}) scale(0.8)`}>
        <Robot aim="down" />
      </g>
      <g mask={`url(#${mask})`} className={styles.wall}>
        {WALL.map(({ tone, points }) => (
          <polygon key={points} data-tone={tone} points={points} />
        ))}
      </g>
      <circle cx={PORTHOLE.x} cy={PORTHOLE.y} r={PORTHOLE.r + 7} className={styles.rim} />
      <g transform="translate(900 800) scale(1.6)">
        <g transform="translate(0 -70)">
          <Console width={CONSOLE_WIDTH} />
          <g transform={`translate(${SEAT.x} ${SEAT.y})`}>
            <Character preset={pilot} pose="sit" />
          </g>
        </g>
      </g>
    </g>
  );
}
