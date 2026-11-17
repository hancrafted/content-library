import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';

type Facet = readonly [tone: string, d: string];

export const ART_TOP = 200;
export const ART_STRETCH = 1.2;

const ROOM: readonly Facet[] = [
  ['room', 'M1061 335L1200 259L1200 432ZM951 432L784 432L825 324Z'],
  ['room-shade', 'M784 432L669 432L825 324ZM749 204L669 432L543 303ZM669 432L749 204L825 324Z'],
  ['room-lit', 'M826 0L749 204L641 0Z'],
  ['room-shade', 'M749 204L932 198L825 324Z'],
  ['room-lit', 'M932 198L826 0L956 0ZM826 0L932 198L749 204Z'],
  ['room', 'M932 198L951 432L825 324ZM951 432L932 198L1061 335ZM166 137L0 310L0 164Z'],
  ['room-lit', 'M0 310L166 137L214 316ZM578 85L749 204L543 303ZM749 204L578 85L641 0Z'],
  ['room-shade', 'M1080 432L1061 335L1200 432ZM1080 432L951 432L1061 335Z'],
  ['room-lit', 'M1078 144L932 198L956 0Z'],
  ['room', 'M1078 144L1200 259L1061 335ZM932 198L1078 144L1061 335ZM102 0L0 164L0 0Z'],
  ['room-lit', 'M102 0L166 137L0 164ZM166 137L102 0L290 0ZM349 102L166 137L290 0Z'],
  ['room', 'M349 102L578 85L543 303Z'],
  ['room-lit', 'M578 85L502 0L641 0ZM349 102L502 0L578 85Z'],
  ['room-shade', 'M669 432L520 432L543 303ZM520 432L416 432L543 303Z'],
  ['room', 'M1086 0L1078 144L956 0ZM1078 144L1200 130L1200 259Z'],
  ['room-shade', 'M1200 130L1086 0L1200 0ZM1086 0L1200 130L1078 144Z'],
  ['room', 'M166 137L360 279L214 316ZM349 102L360 279L166 137ZM284 432L360 279L416 432Z'],
  ['room-shade', 'M360 279L284 432L214 316Z'],
  ['room', 'M416 432L360 279L543 303ZM360 279L349 102L543 303Z'],
  ['room-lit', 'M379 0L349 102L290 0ZM379 0L502 0L349 102Z'],
  ['room-shade', 'M284 432L128 432L214 316Z'],
  ['room', 'M0 310L128 432L0 432ZM128 432L0 310L214 316Z'],
  ['room-shade', 'M0 424L1200 424L1200 432L0 432Z'],
  [
    'floor',
    'M84 432L0 500L0 432ZM783 432L925 432L878 500ZM925 432L997 500L878 500ZM1080 500L1108 432L1200 500ZM1200 500L1108 432L1200 432ZM997 500L983 432L1080 500ZM983 432L1108 432L1080 500ZM983 432L997 500L925 432ZM691 500L581 500L588 432Z',
  ],
  [
    'floor-lit',
    'M715 432L691 500L588 432ZM777 500L783 432L878 500ZM777 500L715 432L783 432ZM715 432L777 500L691 500ZM405 432L483 432L479 500ZM483 432L581 500L479 500ZM581 500L483 432L588 432ZM208 500L199 432L282 432ZM84 432L85 500L0 500Z',
  ],
  ['floor', 'M199 432L85 500L84 432Z'],
  ['floor-lit', 'M85 500L199 432L208 500ZM405 432L319 500L282 432ZM319 500L208 500L282 432Z'],
  ['floor', 'M382 500L405 432L479 500ZM382 500L319 500L405 432Z'],
];

const BOARD: readonly Facet[] = [
  ['bulk-lit', 'M470 44L858 44L470 288Z'],
  ['bulk', 'M858 44L858 288L470 288Z'],
  ['bulk-shade', 'M818 288L858 254L858 288Z'],
];

const CARD: readonly Facet[] = [
  ['paper-lit', 'M488 62L660 62L488 108Z'],
  ['paper', 'M660 62L660 108L488 108Z'],
  ['paper-shade', 'M642 108L660 96L660 108Z'],
];

const WALL: readonly Facet[] = [
  ['paper-lit', 'M868 46L1150 46L868 352Z'],
  ['paper', 'M1150 46L1150 352L868 352Z'],
  ['paper-shade', 'M1124 352L1150 330L1150 352Z'],
];

const PIN: readonly Facet[] = [
  ['pin', 'M1002 42L1016 42L1014 54L1004 54Z'],
  ['glint', 'M1002 42L1009 42L1004 54Z'],
];

function Backdrop({ viewBox, facets }: { readonly viewBox: string; readonly facets: readonly Facet[] }) {
  return (
    <svg
      aria-hidden
      viewBox={viewBox}
      preserveAspectRatio="none"
      className={cn(styles.art, 'pointer-events-none absolute inset-0 size-full')}
    >
      <ToneFacets facets={facets} />
    </svg>
  );
}

export function RoomArt() {
  return (
    <g aria-hidden data-room-art className={styles.art} transform={`translate(0 ${ART_TOP}) scale(1 ${ART_STRETCH})`}>
      <ToneFacets facets={ROOM} />
    </g>
  );
}

export function BoardFrame() {
  return <Backdrop viewBox="470 44 388 244" facets={BOARD} />;
}

export function CardPaper() {
  return <Backdrop viewBox="488 62 172 46" facets={CARD} />;
}

export function WallPaper() {
  return <Backdrop viewBox="868 46 282 306" facets={WALL} />;
}

export function WallPin() {
  return (
    <svg
      aria-hidden
      viewBox="1002 42 14 12"
      className={cn(styles.art, 'pointer-events-none absolute top-0 left-1/2 w-[5%] -translate-x-1/2 -translate-y-1/3')}
    >
      <ToneFacets facets={PIN} />
    </svg>
  );
}
