import styles from './mirror.module.css';
import { Check, SceneSvg, Who, beat, inkOf, paperOf, type SceneProps } from './scene-parts';

const WIDTH = 96;

function Flag() {
  return (
    <g className={styles.pop} style={beat({ d: 0.2, fx: 0 })}>
      <path d="M84 54V18" className="fill-none stroke-foreground" strokeWidth="1.6" />
      <path d="M84 18h10l-3 5 3 5H84Z" className="fill-ai" />
    </g>
  );
}

export function BackwardsScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <Flag />
      {[62, 38, 14].map((x, index) => (
        <g key={x} className={styles.slide} style={beat({ d: 0.5 + index * 0.25, fx: 10 })}>
          <Who ai={ai} x={x} y={36} />
        </g>
      ))}
      <path
        className={`${styles.draw} fill-none stroke-ai`}
        style={beat({ d: 1.3, t: 0.6 })}
        pathLength={1}
        strokeDasharray="1"
        d="M88 64H8m4 -4 -4 4 4 4"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SceneSvg>
  );
}

export function ResolveDependenciesScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <g transform="translate(12 36)">
        <path d="M0 -9 9 0 0 9 -9 0Z" className="fill-card stroke-foreground" strokeWidth="1.4" />
      </g>
      <Check x={12} y={36} d={0.4} />
      <g transform="translate(44 36)">
        <g className={styles.fly} style={beat({ d: 0.9, tx: 20, ty: -20 })}>
          <Who ai={ai} x={0} y={0} />
        </g>
      </g>
      <g transform="translate(70 36)">
        <g className={styles.fly} style={beat({ d: 0.9, tx: -6, ty: 20 })}>
          <Who ai={ai} x={0} y={0} />
        </g>
      </g>
      <path
        className={`${styles.out} fill-none stroke-foreground`}
        style={beat({ d: 0.8 })}
        d="M54 36h8"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
    </SceneSvg>
  );
}

export function AutonomyScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <Who ai={ai} x={12} y={38} />
      <g className={styles.pop} style={beat({ d: 0.2, fx: 0 })}>
        <circle cx="84" cy="36" r="9" className="fill-none stroke-ai" strokeWidth="1.6" />
        <circle cx="84" cy="36" r="4" className="fill-ai" />
      </g>
      <path
        className={`${styles.draw} ${inkOf(ai)}`}
        style={beat({ d: 0.8, t: 1 })}
        pathLength={1}
        strokeDasharray="1"
        d="M24 36C34 6 44 66 56 30S70 42 74 36"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </SceneSvg>
  );
}

export function ContractsScene({ ai }: SceneProps) {
  return (
    <SceneSvg width={WIDTH}>
      <Who ai={ai} x={10} y={38} />
      <Who ai={ai} x={86} y={38} />
      <path className="fill-none stroke-foreground" d="M22 36H74" strokeWidth="1.2" />
      <g className={styles.pop} style={beat({ d: 0.3, fx: 0 })}>
        <path
          d="M64 26h8v6h-3v8h3v6h-8"
          className="fill-none stroke-foreground"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </g>
      <g transform="translate(26 0)">
        <g className={styles.fly} style={beat({ d: 0.7, tx: 28, ty: 0, s: 1 })}>
          <path d="M2 28h10v6h3v4h-3v6H2Z" className={paperOf(ai)} strokeWidth="1.4" strokeLinejoin="round" />
        </g>
      </g>
      <Check x={68} y={16} d={1.5} />
    </SceneSvg>
  );
}

export function EngineerTrustScene({ ai }: SceneProps) {
  const shield = 'M12 34l8 3v7c0 6-4 9-8 11-4-2-8-5-8-11v-7Z';
  return (
    <SceneSvg width={WIDTH}>
      <g className={styles.pop} style={beat({ d: 0.2, fx: 0 })}>
        <rect x="24" y="30" width="12" height="12" rx="2" className={paperOf(true)} strokeWidth="1.2" />
      </g>
      <Who ai={ai} x={62} y={38} />
      <Check x={30} y={22} d={0.7} />
      <path
        className={`${styles.draw} ${inkOf(ai)}`}
        style={beat({ d: 1, t: 0.6 })}
        pathLength={1}
        strokeDasharray="1"
        d="M62 24C62 4 12 4 12 26m-4 -4 4 4 4 -4"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d={shield} className="fill-none stroke-foreground" strokeWidth="1.2" />
      <g className={styles.pop} style={beat({ d: 1.6, fx: 0 })}>
        <path d={shield} className="fill-none stroke-ai" strokeWidth="3" />
      </g>
    </SceneSvg>
  );
}
