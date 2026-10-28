import { episode } from '@/episodes/components/slide-master/slide';
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
import { grids as gridsSection } from './slides/grids/slide';

/*
 * The Grids Master slide, a Template (design-ADR 0019): a Title slide, then one Section of reusable Slide layouts,
 * 1x1 through 3x3 and a bento. Each Slide is one folder under `slides/`; the Template's title, caption and description
 * sit in `i18n/`. The frame layouts they compose are in `src/episodes/components/slide-master/`.
 */
export const grids = episode({
  slug: 'grids',
  messages: { en, de },
  sections: [
    [gridsSection, grid1x1, grid1x2, grid1x3, grid2x1, grid2x2, grid2x3, grid3x1, grid3x2, grid3x3, gridBento],
  ],
});
