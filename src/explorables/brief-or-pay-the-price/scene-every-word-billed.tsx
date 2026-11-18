import { cn } from '@/shared/lib/utils';
import styles from './mirror.module.css';
import { SceneSvg, beat, Label, type SceneProps } from './scene-parts';

const ARRIVALS = [0.2, 1.24, 2.71, 4.62, 6.96];

const CROSSINGS = 15;

const STEPS = [
  styles.v0,
  styles.v1,
  styles.v2,
  styles.v3,
  styles.v4,
  styles.v5,
  styles.v6,
  styles.v7,
  styles.v8,
  styles.v9,
  styles.v10,
  styles.v11,
  styles.v12,
  styles.v13,
  styles.v14,
  styles.v15,
];

function itemBox(ai: boolean, index: number): { x: number; y: number; width: number } {
  if (ai) return { x: index % 2 === 0 ? 12 : 36, y: 56 - 13 * index, width: 46 };
  return { x: 10, y: 56 - 13 * index, width: 70 };
}

function Stack({ ai, x }: SceneProps & { x: number }) {
  const item = ai ? 'fill-ai/20 stroke-ai' : 'fill-card stroke-foreground';
  return (
    <g transform={`translate(${x} 0)`}>
      {ai && <rect x="6" y="2" width="88" height="68" rx="6" className="fill-card stroke-ai" strokeWidth="1.5" />}
      {ARRIVALS.map((arrives, index) => (
        <rect
          key={arrives}
          className={`${styles.drop} ${item}`}
          {...itemBox(ai, index)}
          height="9"
          rx={ai ? 3 : 1}
          strokeWidth="1.1"
          style={beat({ d: arrives })}
        />
      ))}
      <rect
        className={`${styles.scan} ${ai ? 'fill-ai' : 'fill-primary'}`}
        x="6"
        y="0"
        width={ai ? 86 : 78}
        height="2"
        rx="1"
      />
    </g>
  );
}

function Count({ ai, unit, x }: SceneProps & { unit: string; x: number }) {
  const ink = ai ? 'fill-ai' : 'fill-foreground';
  return (
    <>
      {STEPS.map((step, count) => (
        <g key={step} className={cn(step, count === CROSSINGS && styles.vLast)}>
          <Label x={x} y={40} size={22} className={cn(ink, 'font-semibold')}>
            {count === 0 ? '0' : ai ? `${count}k` : `€${count}`}
          </Label>
        </g>
      ))}
      <Label x={x} y={56} size={9} className="fill-muted-foreground">
        {unit}
      </Label>
    </>
  );
}

export function EveryWordBilledScene({ ai, unit }: SceneProps & { unit: string }) {
  return ai ? (
    <SceneSvg width={148}>
      <Stack ai x={0} />
      <Count ai unit={unit} x={124} />
    </SceneSvg>
  ) : (
    <SceneSvg width={140}>
      <Count ai={false} unit={unit} x={26} />
      <Stack ai={false} x={56} />
    </SceneSvg>
  );
}
