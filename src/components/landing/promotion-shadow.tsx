import { TRAY_OUTLINE } from '@/components/landing/promotion-office';
import { PAPER_PILE_ORIGIN, pileShadowPath } from '@/lib/paper-pile.pure';

function ShadowMaterials() {
  return (
    <defs>
      {/* Fixed user-space extents: a bounding-box region would resize, and flicker, as the shadow grows. */}
      {/* sRGB keeps the blur from tinting a near-transparent black; linearRGB shows colour fringes. */}
      <filter
        id="hero-pile-shadow-blur"
        filterUnits="userSpaceOnUse"
        x="-420"
        y="-80"
        width="940"
        height="540"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <linearGradient id="hero-pile-shadow-fade" gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="400">
        <stop stopColor="#000" stopOpacity=".42" />
        <stop offset="1" stopColor="#000" stopOpacity=".03" />
      </linearGradient>
      {/* The tray's own outlines cut it out, so the shadow meets its edges without a gap. */}
      <mask id="hero-pile-shadow-mask" maskUnits="userSpaceOnUse" x="-1200" y="-1200" width="2400" height="2400">
        <rect x="-1200" y="-1200" width="2400" height="2400" fill="#fff" />
        <path d={TRAY_OUTLINE.back} fill="#000" />
        <path d={TRAY_OUTLINE.wall} fill="#000" />
        <path d={TRAY_OUTLINE.front} fill="#000" />
      </mask>
    </defs>
  );
}

/** One shadow for tray and pile, cast forward by the window light; drawn above the envelope it falls on. */
export function PileShadow() {
  const { x, y } = PAPER_PILE_ORIGIN;
  return (
    <g data-pile-shadow transform={`translate(${x} ${y + 15})`} mask="url(#hero-pile-shadow-mask)">
      <ShadowMaterials />
      <path d={pileShadowPath(0)} fill="url(#hero-pile-shadow-fade)" filter="url(#hero-pile-shadow-blur)" />
    </g>
  );
}
