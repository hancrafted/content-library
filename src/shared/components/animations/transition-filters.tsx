export type TransitionStyle = 'liquid' | 'paper' | 'glitch' | 'goo' | 'dither' | 'wave' | 'bubbles';

function LiquidFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.015 0.02" numOctaves={3} seed={7} result="noise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={220}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      <feGaussianBlur in="displaced" stdDeviation={1.8} result="presmooth" />
      <feComponentTransfer in="presmooth" result="cut">
        <feFuncA type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1" />
      </feComponentTransfer>
      <feGaussianBlur in="cut" stdDeviation={0.4} />
    </filter>
  );
}

function PaperFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04 0.008" numOctaves={5} seed={12} result="noise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={75}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      <feGaussianBlur in="displaced" stdDeviation={0.8} result="presmooth" />
      <feComponentTransfer in="presmooth" result="cut">
        <feFuncA type="discrete" tableValues="0 0 0 0 0 1 1 1 1 1" />
      </feComponentTransfer>
      <feDropShadow dx={0} dy={-2} stdDeviation={1.5} floodOpacity={0.25} style={{ floodColor: 'var(--overlay)' }} />
    </filter>
  );
}

function GlitchFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="turbulence" baseFrequency="0.001 0.35" numOctaves={2} seed={42} result="noise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={160}
        xChannelSelector="R"
        yChannelSelector="B"
        result="displaced"
      />
      <feMorphology in="displaced" operator="dilate" radius="3 0" result="dilated" />
      <feComponentTransfer in="dilated">
        <feFuncA type="discrete" tableValues="0 0 0 0 1 1 1 1" />
      </feComponentTransfer>
    </filter>
  );
}

function GooFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves={1} seed={3} result="noise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={180}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      <feGaussianBlur in="displaced" stdDeviation={14} result="blurred" />
      <feColorMatrix in="blurred" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" />
    </filter>
  );
}

function DitherFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85 0.85" numOctaves={2} seed={9} result="noise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={65}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      <feComponentTransfer in="displaced">
        <feFuncA type="discrete" tableValues="0 0 0.15 0.35 0.65 1 1" />
      </feComponentTransfer>
    </filter>
  );
}

function WaveFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06 0.0001" numOctaves={3} seed={5} result="noise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={140}
        xChannelSelector="R"
        yChannelSelector="R"
        result="displaced"
      />
      <feGaussianBlur in="displaced" stdDeviation={1.0} result="presmooth" />
      <feComponentTransfer in="presmooth">
        <feFuncA type="discrete" tableValues="0 0 0 0 1 1 1 1" />
      </feComponentTransfer>
    </filter>
  );
}

/**
 * The `bubbles` water line: a long, low swell only, so the incoming surface rises as calm water rather than a wavy
 * ink edge. The bubbles themselves are separate round shapes (`BubbleRise`), rising above this line.
 */
function BubblesFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.002" numOctaves={1} seed={17} result="noise" />
      <feDisplacementMap
        in="SourceGraphic"
        in2="noise"
        scale={28}
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      <feGaussianBlur in="displaced" stdDeviation={0.8} result="presmooth" />
      <feComponentTransfer in="presmooth">
        <feFuncA type="discrete" tableValues="0 0 0 0 1 1 1 1" />
      </feComponentTransfer>
    </filter>
  );
}

const FILTERS = {
  liquid: LiquidFilter,
  paper: PaperFilter,
  glitch: GlitchFilter,
  goo: GooFilter,
  dither: DitherFilter,
  wave: WaveFilter,
  bubbles: BubblesFilter,
};

export function InkFilterDefinition({ style, id = `ink-edge-${style}` }: { style: TransitionStyle; id?: string }) {
  const Filter = FILTERS[style];
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <Filter id={id} />
      </defs>
    </svg>
  );
}
