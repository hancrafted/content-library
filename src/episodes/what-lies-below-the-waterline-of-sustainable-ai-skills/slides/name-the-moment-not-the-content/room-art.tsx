import { ToneFacets } from '@/episodes/components/slide-shared/iceberg/scenery/facets';
import { cn } from '@/shared/lib/utils';
import styles from './slide.module.css';
import { ART_SCALE, ART_TOP } from './speech.pure';

type Facet = readonly [tone: string, d: string];

const ROOM: readonly Facet[] = [
  ['room', 'M1000 332L924 443L864 279ZM924 443L703 454L864 279ZM608 108L734 195L531 251Z'],
  ['room-shade', 'M1000 483L924 443L1000 332ZM773 584L703 454L924 443ZM371 584L439 431L504 584Z'],
  ['room', 'M1000 224L1000 332L864 279Z'],
  ['room-lit', 'M608 108L755 0L734 195Z'],
  ['room-shade', 'M773 584L621 584L703 454Z'],
  ['room', 'M859 584L773 584L924 443Z'],
  ['room-lit', 'M859 584L1000 483L1000 584Z'],
  ['room-shade', 'M1000 483L859 584L924 443Z'],
  ['room-lit', 'M129 252L0 131L145 118ZM145 118L122 0L231 0Z'],
  ['room', 'M122 0L0 131L0 0Z'],
  ['room-lit', 'M0 131L122 0L145 118ZM359 0L354 85L231 0Z'],
  ['room', 'M483 97L608 108L531 251ZM608 108L483 97L495 0Z'],
  ['room-lit', 'M483 97L359 0L495 0ZM359 0L483 97L354 85Z'],
  ['room-shade', 'M552 378L367 327L531 251Z'],
  ['room', 'M367 327L552 378L439 431ZM0 486L155 584L0 584ZM734 195L663 321L531 251Z'],
  ['room-shade', 'M663 321L552 378L531 251Z'],
  ['room', 'M552 378L663 321L703 454ZM663 321L734 195L864 279ZM703 454L663 321L864 279Z'],
  ['room-shade', 'M439 431L542 506L504 584ZM552 378L542 506L439 431ZM542 506L621 584L504 584Z'],
  ['room', 'M542 506L552 378L703 454Z'],
  ['room-shade', 'M621 584L542 506L703 454ZM300 431L371 584L236 584ZM371 584L300 431L439 431Z'],
  ['room', 'M300 431L367 327L439 431ZM367 327L300 431L238 317ZM627 0L608 108L495 0Z'],
  ['room-lit', 'M627 0L755 0L608 108Z'],
  ['room-shade', 'M1000 146L859 97L1000 0Z'],
  ['room-lit', 'M755 0L859 97L734 195Z'],
  ['room', 'M734 195L859 97L864 279Z'],
  ['room-shade', 'M1000 224L859 97L1000 146ZM859 97L1000 224L864 279Z'],
  ['room-lit', 'M0 226L129 252L0 346Z'],
  ['room', 'M129 252L0 226L0 131Z'],
  ['room-lit', 'M292 191L367 327L238 317ZM129 252L292 191L238 317Z'],
  ['room', 'M292 191L129 252L145 118Z'],
  ['room-lit', 'M292 191L145 118L231 0ZM354 85L292 191L231 0Z'],
  ['room', 'M87 376L0 486L0 346ZM87 376L129 252L238 317Z'],
  ['room-shade', 'M129 252L87 376L0 346Z'],
  ['room', 'M859 97L879 0L1000 0Z'],
  [
    'room-lit',
    'M879 0L859 97L755 0ZM483 97L416 209L354 85ZM416 209L292 191L354 85ZM416 209L483 97L531 251ZM367 327L416 209L531 251ZM292 191L416 209L367 327Z',
  ],
  ['room-shade', 'M0 486L178 454L155 584Z'],
  ['room-lit', 'M87 376L178 454L0 486Z'],
  ['room', 'M155 584L178 454L236 584ZM178 454L300 431L236 584ZM300 431L178 454L238 317ZM178 454L87 376L238 317Z'],
  ['floor', 'M100 584L0 640L0 584ZM551 640L439 640L472 584ZM439 640L378 584L472 584Z'],
  [
    'floor-lit',
    'M181 640L100 584L203 584ZM837 584L817 640L734 584ZM817 640L837 584L891 584ZM100 584L102 640L0 640ZM181 640L102 640L100 584Z',
  ],
  ['floor', 'M293 640L181 640L203 584ZM554 584L551 640L472 584ZM554 584L628 584L551 640Z'],
  ['floor-lit', 'M817 640L710 640L734 584Z'],
  ['floor', 'M926 640L817 640L891 584ZM926 640L891 584L1000 584Z'],
  ['floor-lit', 'M1000 640L926 640L1000 584Z'],
  ['floor', 'M295 584L293 640L203 584Z'],
  ['floor-lit', 'M347 640L378 584L439 640Z'],
  ['floor', 'M347 640L295 584L378 584ZM295 584L347 640L293 640Z'],
  ['floor-lit', 'M655 640L628 584L734 584ZM710 640L655 640L734 584ZM628 584L655 640L551 640Z'],
];

const PAPER: readonly Facet[] = [
  [
    'paper-lit',
    'M728 109L652 34L782 34ZM620 233L728 109L727 273ZM825 178L728 109L782 34ZM728 109L825 178L727 273ZM825 178L815 340L727 273Z',
  ],
  ['paper-shade', 'M815 340L825 178L968 267Z'],
  ['paper-lit', 'M660 397L620 233L727 273Z'],
  ['paper-shade', 'M635 486L660 397L769 486Z'],
  ['paper', 'M660 397L635 486L548 486ZM815 340L660 397L727 273Z'],
  ['paper-shade', 'M660 397L815 340L769 486ZM815 340L870 486L769 486Z'],
  ['paper', 'M870 486L906 409L968 486Z'],
  ['paper-shade', 'M906 409L870 486L815 340Z'],
  ['paper-lit', 'M548 130L652 34L728 109ZM620 233L548 130L728 109Z'],
  ['paper', 'M652 34L548 130L548 34ZM548 130L620 233L548 284Z'],
  ['paper-lit', 'M855 34L825 178L782 34Z'],
  ['paper', 'M620 233L548 354L548 284Z'],
  ['paper-lit', 'M660 397L548 354L620 233Z'],
  ['paper', 'M548 354L660 397L548 486ZM968 354L815 340L968 267Z'],
  ['paper-shade', 'M968 354L906 409L815 340Z'],
  ['paper', 'M906 409L968 354L968 486ZM968 133L855 34L968 34ZM855 34L968 133L825 178Z'],
  ['paper-shade', 'M825 178L968 133L968 267Z'],
  ['paper-edge', 'M548 483L968 483L968 486L548 486ZM965 34L968 34L968 486L965 486Z'],
];

const CLIP: readonly Facet[] = [
  ['clip-shade', 'M724 30L792 30L788 52L728 52Z'],
  ['clip-lit', 'M724 30L762 30L750 52L728 52Z'],
  ['clip-dark', 'M736 14L742 14L746 32L740 32ZM774 14L780 14L776 32L770 32ZM736 12L780 12L780 16L736 16Z'],
];

export function RoomArt() {
  return (
    <g aria-hidden data-room-art className={styles.art} transform={`translate(0 ${ART_TOP}) scale(${ART_SCALE})`}>
      <ToneFacets facets={ROOM} />
    </g>
  );
}

export function SheetPaper() {
  return (
    <svg
      aria-hidden
      viewBox="548 34 420 452"
      preserveAspectRatio="none"
      className={cn(styles.art, 'pointer-events-none absolute inset-0 size-full')}
    >
      <ToneFacets facets={PAPER} />
    </svg>
  );
}

export function SheetClip() {
  return (
    <svg
      aria-hidden
      viewBox="724 12 68 40"
      className={cn(
        styles.art,
        'pointer-events-none absolute top-0 left-1/2 w-[16%] -translate-x-1/2 -translate-y-[55%]',
      )}
    >
      <ToneFacets facets={CLIP} />
    </svg>
  );
}
