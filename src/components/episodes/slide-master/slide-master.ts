import { episode } from '@/components/slide-master/episode-record';
import { grid1x1 } from './slides/grid-1x1';
import { grid1x2 } from './slides/grid-1x2';
import { grid1x3 } from './slides/grid-1x3';
import { grid2x1 } from './slides/grid-2x1';
import { grid2x2 } from './slides/grid-2x2';
import { grid2x3 } from './slides/grid-2x3';
import { grid3x1 } from './slides/grid-3x1';
import { grid3x2 } from './slides/grid-3x2';
import { grid3x3 } from './slides/grid-3x3';
import { gridBento } from './slides/grid-bento';
import { grids } from './slides/grids';
import { horizontalGantt } from './slides/horizontal-gantt';
import { horizontalRail } from './slides/horizontal-rail';
import { horizontalScrollSnap } from './slides/horizontal-scroll-snap';
import { metroMap } from './slides/metro-map';
import { radialCycle } from './slides/radial-cycle';
import { timelines } from './slides/timelines';
import { verticalCenterSpine } from './slides/vertical-center-spine';
import { verticalStepper } from './slides/vertical-stepper';
import { verticalStickyYears } from './slides/vertical-sticky-years';

/*
 * A catalog of reusable Slide layouts (FE-002): Timelines, then Grids. Each Slide
 * owns its Scene in `slides/`; interactive ones keep their widget in `client/`.
 * Note the name clash: the Episode slug is `slide-master`, while the Slide
 * master proper is the shared frame in `src/components/slide-master/`.
 */
export const slideMaster = episode({
  slug: 'slide-master',
  sections: [
    [
      timelines,
      horizontalRail,
      horizontalScrollSnap,
      horizontalGantt,
      verticalCenterSpine,
      verticalStickyYears,
      verticalStepper,
      radialCycle,
      metroMap,
    ],
    [grids, grid1x1, grid1x2, grid1x3, grid2x1, grid2x2, grid2x3, grid3x1, grid3x2, grid3x3, gridBento],
  ],
});
