import { withoutSectionSlide, type Section } from '@/episodes/components/slide-master/slide';
import { compaction } from '../slides/compaction/slide';
import { contextWindow } from '../slides/context-window/slide';
import { everyPartAndControl } from '../slides/every-part-and-control/slide';
import { replayTheChat } from '../slides/replay-the-chat/slide';
import { theTokenGrid } from '../slides/the-token-grid/slide';
import { windowSizes } from '../slides/window-sizes/slide';

/**
 * The Section "Context window": its section slide kept for the title but not shown, then one Slide per Preset worth showing, each with its readme on
 * the Slide. `gallery-full` (every part and control) comes last, the whole in one.
 */
export const contextWindowSection: Section = withoutSectionSlide([
  contextWindow,
  replayTheChat,
  compaction,
  windowSizes,
  theTokenGrid,
  everyPartAndControl,
]);
