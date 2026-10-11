import { selfContainedEpisode } from '@/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { grid1x1 } from './slides/grid-1x1/slide';
import { grid1x2 } from './slides/grid-1x2/slide';
import { grid1x3 } from './slides/grid-1x3/slide';
import { grid2x1 } from './slides/grid-2x1/slide';
import { grid2x2 } from './slides/grid-2x2/slide';
import { grid2x3 } from './slides/grid-2x3/slide';
import { grid3x1 } from './slides/grid-3x1/slide';
import { grid3x2 } from './slides/grid-3x2/slide';
import { grid3x3 } from './slides/grid-3x3/slide';
import { gridBento } from './slides/grid-bento/slide';
import { grids } from './slides/grids/slide';
import { horizontalGantt } from './slides/horizontal-gantt/slide';
import { horizontalRail } from './slides/horizontal-rail/slide';
import { horizontalScrollSnap } from './slides/horizontal-scroll-snap/slide';
import { metroMap } from './slides/metro-map/slide';
import { radialCycle } from './slides/radial-cycle/slide';
import { timelines } from './slides/timelines/slide';
import { verticalCenterSpine } from './slides/vertical-center-spine/slide';
import { verticalStepper } from './slides/vertical-stepper/slide';
import { verticalStickyYears } from './slides/vertical-sticky-years/slide';

/*
 * A catalog of reusable Slide layouts (FE-002): Timelines, then Grids. Each Slide
 * is one folder under `slides/` holding its Scene, widgets, CSS module and own
 * Translation files; the Episode's title, caption and description sit in `i18n/`.
 * Note the name clash: the Episode slug is `slide-master`, while the Slide
 * master proper is the shared frame in `src/components/slide-master/`.
 */
export const slideMaster = selfContainedEpisode({
  slug: 'slide-master',
  messages: { en, de },
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
