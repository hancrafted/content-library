import styles from './mirror.module.css';
import { Check, DrawnArrow, Mark, Person, SceneSvg, Who, beat, inkOf, paperOf, type SceneProps } from './scene-parts';

const WIDTH = 96;

function Circle({ x, y, ai, d }: SceneProps & { x: number; y: number; d: number }) {
  return (
    <g className={styles.pop} style={beat({ d, fx: 0 })}>
      <circle cx={x} cy={y} r="9" className={inkOf(ai)} strokeWidth="2.4" />
    </g>
  );
}

export function BreakItDownScene({ ai }: SceneProps) {
  const pieces = [
    { x: 62, y: 14 },
    { x: 79, y: 14 },
    { x: 62, y: 40 },
    { x: 79, y: 40 },
  ];
  return (
    <SceneSvg width={WIDTH}>
      <g className={styles.out} style={beat({ d: 0.7 })}>
        <rect x="6" y="16" width="36" height="40" rx="3" className={paperOf(ai)} strokeWidth="1.6" />
        <path d="M12 26h24M12 34h24M12 42h18" className="fill-none stroke-muted-foreground" strokeWidth="1" />
      </g>
      <DrawnArrow ai={ai} x1={44} x2={58} y={36} d={0.4} />
      {pieces.map((piece, index) => (
        <g key={piece.x + piece.y} className={styles.pop} style={beat({ d: 0.8 + index * 0.15, fx: 0 })}>
          <rect x={piece.x} y={piece.y} width="14" height="18" rx="2" className={paperOf(ai)} strokeWidth="1.4" />
        </g>
      ))}
    </SceneSvg>
  );
}

export function RequirementsFirstScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <rect x="6" y="20" width="20" height="32" rx="2" className="fill-card stroke-foreground" strokeWidth="1.4" />
      {[28, 36, 44].map((y, index) => (
        <path
          key={y}
          className={`${styles.draw} fill-none stroke-foreground`}
          style={beat({ d: 0.2 + index * 0.2, t: 0.25 })}
          pathLength={1}
          strokeDasharray="1"
          d={`M10 ${y}l2.5 2.5 4.5 -5`}
          strokeWidth="2"
          strokeLinecap="round"
        />
      ))}
      <DrawnArrow ai={ai} x1={30} x2={58} y={14} d={1} />
      <DrawnArrow ai={ai} x1={30} x2={58} y={58} d={1} />
      <Circle ai={ai} x={74} y={14} d={1.4} />
      <Circle ai={ai} x={74} y={58} d={1.4} />
    </SceneSvg>
  );
}

export function InterviewYourselfScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <Who ai={ai} x={14} y={40} />
      <Person x={82} y={40} />
      {[0, 1, 2].map((index) => (
        <Mark key={index} ai={ai} x={34 + index * 14} y={index === 1 ? 14 : 20} size={12} d={0.3 + index * 0.25}>
          ?
        </Mark>
      ))}
      <g className={styles.slide} style={beat({ d: 1.3, fx: 24 })}>
        <rect x="30" y="44" width="16" height="20" rx="2" className="fill-card stroke-foreground" strokeWidth="1.3" />
        <path d="M33 50h10M33 55h10M33 60h6" className="fill-none stroke-foreground" strokeWidth="1" />
      </g>
    </SceneSvg>
  );
}

export function EvaluateEachStepScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <DrawnArrow ai={ai} x1={8} x2={90} y={44} d={0.1} t={0.8} />
      {[18, 48, 78].map((x, index) => (
        <g key={x} className={styles.pop} style={beat({ d: 0.3 + index * 0.35, fx: 0 })}>
          <circle cx={x} cy="44" r="6" className={paperOf(ai)} strokeWidth="1.6" />
        </g>
      ))}
      <Check x={18} y={26} d={0.6} />
      <g className={styles.pop} style={beat({ d: 0.95, fx: 0 })}>
        <g className={styles.out} style={beat({ d: 1.35 })}>
          <path
            d="M44 21l8 8M52 21l-8 8"
            className="fill-none stroke-destructive"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </g>
      </g>
      <Check x={48} y={26} d={1.5} />
    </SceneSvg>
  );
}

export function FreshStartScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <g className={styles.out} style={beat({ d: 1.15 })}>
        {[0, 1, 2, 3].map((index) => (
          <g key={index} className={styles.pop} style={beat({ d: 0.15 + index * 0.15, fx: 0 })}>
            <rect
              x={index % 2 ? 18 : 6}
              y={6 + index * 15}
              width="30"
              height="11"
              rx="5"
              className={index % 2 ? 'fill-ai/10 stroke-ai' : 'fill-card stroke-foreground'}
              strokeWidth="1.2"
            />
          </g>
        ))}
      </g>
      <DrawnArrow ai={ai} x1={46} x2={58} y={36} d={1.2} />
      <g className={styles.pop} style={beat({ d: 1.45, fx: 0 })}>
        <rect x="62" y="28" width="30" height="16" rx="6" className={paperOf(ai)} strokeWidth="1.6" />
      </g>
    </SceneSvg>
  );
}
