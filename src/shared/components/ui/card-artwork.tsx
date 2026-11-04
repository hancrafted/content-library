import type { ReactNode } from 'react';

const ARTWORK = {
  'handoff-chain': (
    <>
      <circle cx="170" cy="106" r="85" fill="currentColor" stroke="none" opacity="0.1" />
      <circle cx="170" cy="45" r="19" />
      <circle cx="170" cy="106" r="23" />
      <circle cx="170" cy="167" r="19" />
      <path d="M170 64v19m-8-9 8 9 8-9M170 129v19m-8-9 8 9 8-9M147 106H83m11-8-11 8 11 8M193 106h64m-11-8 11 8-11 8" />
      <circle cx="75" cy="106" r="8" />
      <circle cx="265" cy="106" r="8" />
      <circle cx="170" cy="106" r="7" fill="currentColor" stroke="none" />
    </>
  ),
  'context-boundary': (
    <>
      <circle cx="170" cy="106" r="85" fill="currentColor" stroke="none" opacity="0.1" />
      <rect x="119" y="47" width="102" height="118" rx="10" />
      <rect x="134" y="65" width="72" height="82" rx="6" />
      <path d="M67 78h52m-10-10 10 10-10 10M67 134h52m-10-10 10 10-10 10M221 106h52m-10-10 10 10-10 10" />
      <circle cx="170" cy="106" r="10" fill="currentColor" stroke="none" />
      <circle cx="67" cy="78" r="7" />
      <circle cx="67" cy="134" r="7" />
      <circle cx="280" cy="106" r="7" />
    </>
  ),
  'document-stack': (
    <>
      <path d="M85 20h155v175H85z" fill="currentColor" stroke="none" opacity="0.1" />
      <path d="M106 18h130v165H106zM88 32h130v165H88zM113 112h80m-80 15h61m-61 15h80m-80 15h43" />
      <path d="M116 87V58l16 18 16-18v29m18-29v29m-8-8 8 8 8-8" strokeWidth="3" />
      <circle cx="236" cy="181" r="11" fill="currentColor" stroke="none" />
      <path d="M248 181h39m-11-11 11 11-11 11" />
    </>
  ),
  'budget-gauge': (
    <>
      <circle cx="170" cy="106" r="85" fill="currentColor" stroke="none" opacity="0.1" />
      <circle cx="170" cy="106" r="62" />
      <path d="M119 142a62 62 0 0 1 95-79" strokeWidth="6" />
      <circle cx="170" cy="106" r="14" />
      <path d="m170 106 36-38" strokeWidth="3" />
      <path d="M170 44v10M108 106h10M222 106h10M126 150l7-7M207 143l7 7M154 144h32" />
      <circle cx="170" cy="106" r="5" fill="currentColor" stroke="none" />
    </>
  ),
  'customer-path': (
    <>
      <circle cx="170" cy="106" r="85" fill="currentColor" stroke="none" opacity="0.1" />
      <path d="M107 39h126l-24 35h-78zM131 88h78l-17 30h-44z" />
      <rect x="148" y="132" width="44" height="28" rx="6" />
      <path d="M170 74v14m-7-8 7 8 7-8M170 118v14m-7-8 7 8 7-8M170 160v19" />
      <circle cx="170" cy="186" r="7" fill="currentColor" stroke="none" />
    </>
  ),
  'process-loop': (
    <>
      <path d="M64 58h212v96H64z" fill="currentColor" stroke="none" opacity="0.1" />
      <rect x="53" y="82" width="54" height="48" rx="8" />
      <rect x="143" y="82" width="54" height="48" rx="8" />
      <rect x="233" y="82" width="54" height="48" rx="8" />
      <path d="M107 106h36m-10-10 10 10-10 10M197 106h36m-10-10 10 10-10 10M260 130v38H80v-38m-8 9 8-9 8 9" />
      <circle cx="170" cy="106" r="8" fill="currentColor" stroke="none" />
    </>
  ),
} satisfies Record<string, ReactNode>;

/** Named, domain-free signal diagrams. The caller supplies the Tag's accent through currentColor. */
export function CardArtwork({ name }: { name: keyof typeof ARTWORK }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 340 212"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      data-card-artwork={name}
    >
      {ARTWORK[name]}
    </svg>
  );
}
