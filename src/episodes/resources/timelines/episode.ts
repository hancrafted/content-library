import { episode } from '@/episodes/components/slide-master/slide';
import de from './i18n/de.json';
import en from './i18n/en.json';
import { horizontalGantt } from './slides/horizontal-gantt/slide';
import { horizontalRail } from './slides/horizontal-rail/slide';
import { horizontalScrollSnap } from './slides/horizontal-scroll-snap/slide';
import { metroMap } from './slides/metro-map/slide';
import { radialCycle } from './slides/radial-cycle/slide';
import { timelines as timelinesSection } from './slides/timelines/slide';
import { verticalCenterSpine } from './slides/vertical-center-spine/slide';
import { verticalStepper } from './slides/vertical-stepper/slide';
import { verticalStickyYears } from './slides/vertical-sticky-years/slide';

/*
 * The Timelines Master slide, a Resource (design-ADR 0019): a Title slide, then one Section of reusable Slide
 * layouts. Each Slide is one folder under `slides/` holding its Scene, widgets, CSS module and own Translation files;
 * the Resource's title, caption and description sit in `i18n/`. Copy a Slide to start from it (design guide, Slide library).
 */
export const timelines = episode({
  slug: 'timelines',
  messages: { en, de },
  sections: [
    [
      timelinesSection,
      horizontalRail,
      horizontalScrollSnap,
      horizontalGantt,
      verticalCenterSpine,
      verticalStickyYears,
      verticalStepper,
      radialCycle,
      metroMap,
    ],
  ],
});
