import styles from './mirror.module.css';
import { Check, Label, Person, SceneSvg, Who, beat, inkOf, paperOf, textOf, type SceneProps } from './scene-parts';

const WIDTH = 96;
const QUESTION_ROWS = [0, 1, 2];
const PLAN_ROWS = [10, 32, 54];
const DRAFT_LINES = [16, 24, 32, 40, 48, 56];
const TICK_ROWS = [45, 52, 59];
const PARALLEL_ROWS = [18, 50];

export function GrillScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <Person x={12} y={40} />
      <Who ai={ai} x={84} y={40} />
      {QUESTION_ROWS.map((index) => (
        <g key={index} className={styles.pop} style={beat({ d: 0.2 + index * 0.3, fx: 0 })}>
          <Label x={66 - index * 13} y={18 + (index % 2) * 6} size={12} className={`${textOf(ai)} font-semibold`}>
            ?
          </Label>
        </g>
      ))}
      <g className={styles.pop} style={beat({ d: 1.1, fx: 0 })}>
        <rect x="38" y="38" width="22" height="28" rx="2" className="fill-card stroke-foreground" strokeWidth="1.3" />
      </g>
      {TICK_ROWS.map((y, index) => (
        <path
          key={y}
          className={`${styles.draw} fill-none stroke-foreground`}
          style={beat({ d: 1.4 + index * 0.2, t: 0.2 })}
          pathLength={1}
          strokeDasharray="1"
          d={`M42 ${y}l2.5 2.5 4.5 -5`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ))}
    </SceneSvg>
  );
}

export function PlanScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <g className={styles.out} style={beat({ d: 0.9 })}>
        <rect x="6" y="18" width="26" height="34" rx="2" className="fill-card stroke-foreground" strokeWidth="1.4" />
        <path d="M11 27h16M11 34h16M11 41h10" className="fill-none stroke-foreground" strokeWidth="1" />
      </g>
      {PLAN_ROWS.map((y, index) => (
        <g key={y}>
          <path
            className={`${styles.draw} ${inkOf(ai)}`}
            style={beat({ d: 0.4 + index * 0.12, t: 0.35 })}
            pathLength={1}
            strokeDasharray="1"
            d={`M34 35C46 35 46 ${y + 6} 58 ${y + 6}`}
            strokeWidth="1.3"
          />
          <g className={styles.pop} style={beat({ d: 0.8 + index * 0.15, fx: 0 })}>
            <rect x="60" y={y} width="24" height="12" rx="2" className={paperOf(ai)} strokeWidth="1.3" />
          </g>
          <g className={styles.pop} style={beat({ d: 1.2 + index * 0.15, fx: 0 })}>
            <circle cx="90" cy={y + 6} r="2.5" className={ai ? 'fill-ai' : 'fill-foreground'} />
          </g>
        </g>
      ))}
    </SceneSvg>
  );
}

export function ParallelScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      {PARALLEL_ROWS.map((y, index) => (
        <g key={y}>
          <Who ai={ai} x={10} y={y} />
          <path d={`M24 ${y}H84`} className="fill-none stroke-foreground" strokeWidth="1" strokeDasharray="2 3" />
          <path
            className={`${styles.draw} ${inkOf(ai)}`}
            style={beat({ d: 0.3, t: 1.1 })}
            pathLength={1}
            strokeDasharray="1"
            d={`M24 ${y}H80`}
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Check x={88} y={y} d={1.5 + index * 0.05} />
        </g>
      ))}
    </SceneSvg>
  );
}

export function CheckScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <Who ai={ai} x={12} y={38} />
      <rect
        x="50"
        y="20"
        width="34"
        height="34"
        rx="3"
        className="fill-none stroke-foreground"
        strokeWidth="1.4"
        strokeDasharray="3 2"
      />
      <g className={styles.slide} style={beat({ d: 0.3, fx: -30 })}>
        <rect x="54" y="24" width="26" height="26" rx="2" className="fill-ai/10 stroke-ai" strokeWidth="1.3" />
      </g>
      <Check x={67} y={64} d={1} />
    </SceneSvg>
  );
}

const SHIELD = 'M70 22l12 4.5v10c0 9-6 13.5-12 16.5-6-3-12-7.5-12-16.5v-10Z';

export function HardenScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <g transform="translate(16 36)">
        <g className={styles.fly} style={beat({ d: 0.5, tx: 52 })}>
          <rect
            x="-8"
            y="-10"
            width="16"
            height="20"
            rx="2"
            className="fill-card stroke-foreground"
            strokeWidth="1.3"
          />
          <path d="M-4 -4h8M-4 1h8" className="fill-none stroke-foreground" strokeWidth="1" />
        </g>
      </g>
      <path d={SHIELD} className={inkOf(ai)} strokeWidth="1.3" />
      <g className={styles.pop} style={beat({ d: 1.3, fx: 0 })}>
        <path d={SHIELD} className="fill-none stroke-ai" strokeWidth="3.6" />
      </g>
      <Check x={70} y={38} d={1.6} />
    </SceneSvg>
  );
}

export function DraftScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <rect x="28" y="6" width="40" height="60" rx="3" className="fill-card stroke-foreground" strokeWidth="1.4" />
      {DRAFT_LINES.map((y, index) => (
        <path
          key={y}
          className={`${styles.draw} ${inkOf(ai)}`}
          style={beat({ d: 0.2 + index * 0.22, t: 0.2 })}
          pathLength={1}
          strokeDasharray="1"
          d={`M34 ${y}h${index % 3 === 2 ? 18 : 28}`}
          strokeWidth="2"
        />
      ))}
    </SceneSvg>
  );
}
