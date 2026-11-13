import { dialGeometry } from './factory-dial.pure';

/** What a dial's setting means: plain, trouble, or turned up by AI. */
export type DialTone = 'foreground' | 'warning' | 'ai';

const ARC: Record<DialTone, string> = {
  foreground: 'stroke-foreground',
  warning: 'stroke-(--warning)',
  ai: 'stroke-ai',
};

/**
 * A dial on the factory line, a half-circle gauge turned to `value` (0 to 1), its arc in the tone of what the setting
 * means, its name under it.
 */
export function FactoryDial({ label, value, tone }: { label: string; value: number; tone: DialTone }) {
  const { arc, needle } = dialGeometry(value);
  return (
    <div data-dial="" className="flex flex-col items-center">
      <svg viewBox="0 0 64 42" className="w-16" aria-hidden="true">
        <path d="M8 36A24 24 0 0 1 56 36" className="fill-none stroke-muted" strokeWidth={6} strokeLinecap="round" />
        <path d={arc} className={`fill-none ${ARC[tone]}`} strokeWidth={6} strokeLinecap="round" />
        <path
          d={`M32 36L${needle.x} ${needle.y}`}
          className="stroke-foreground"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <circle cx="32" cy="36" r="3.5" className="fill-foreground" />
      </svg>
      <span className="text-caption font-semibold text-foreground">{label}</span>
    </div>
  );
}
