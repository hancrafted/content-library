import { cn } from '@/shared/lib/utils';
import { BackSvg, beat, Label, type BackProps } from './back-parts';
import styles from './trait-flip.module.css';

/** When each of the five items lands, in seconds: one per pass of the scan line (its schedule in the CSS module). */
const ARRIVALS = [0.2, 1.24, 2.71, 4.62, 6.96];

/** The count after each item the line crosses: 0, then one more for each of its fifteen crossings (1 + 2 + 3 + 4 + 5). */
const CROSSINGS = 15;

/** The count's step classes, one per value; the last is the end state. */
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

/** An item's box, bottom first: the freelancer's own pages, or the chat's prompts (left) and its answers (indented right). */
function itemBox(ai: boolean, index: number): { x: number; y: number; width: number } {
  if (ai) return { x: index % 2 === 0 ? 12 : 36, y: 56 - 13 * index, width: 46 };
  return { x: 10, y: 56 - 13 * index, width: 70 };
}

/** The stack: five items landing one per pass, and the scan line sweeping over them; shifted right by `x`. */
function Stack({ ai, x }: BackProps & { x: number }) {
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

/** The bill (€) or the token count, one value per crossing, centred on `x`; only the last shows at rest. */
function Count({ ai, unit, x }: BackProps & { unit: string; x: number }) {
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

/**
 * Every word billed: a line sweeps up and down a stack that gains an item each pass; every item it passes
 * raises the bill (€) or the token count. The freelancer's stack is their own pages; the AI's is the chat, prompts
 * left, its own answers indented right. Read from the chip outwards: the stack, then the count.
 */
export function EveryWordBilledBack({ ai, unit }: BackProps & { unit: string }) {
  return ai ? (
    <BackSvg width={148}>
      <Stack ai x={0} />
      <Count ai unit={unit} x={124} />
    </BackSvg>
  ) : (
    <BackSvg width={140}>
      <Count ai={false} unit={unit} x={26} />
      <Stack ai={false} x={56} />
    </BackSvg>
  );
}
