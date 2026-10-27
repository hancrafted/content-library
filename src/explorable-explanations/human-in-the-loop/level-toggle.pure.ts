import type { Level } from './workflow-state.pure';

/**
 * The `</>` toggle's press: off is Chat (`simple`, the default), on is CLI (`technical`). The stored values stay
 * `simple` and `technical`; this is the one place that maps the toggle to them.
 */
// tech-debt: the visual labels simple/technical as Chat/CLI here instead of renaming the values to promptFor chat | cli, https://github.com/hancrafted/content-library/issues/375
export const toggledLevel = (level: Level): Level => (level === 'simple' ? 'technical' : 'simple');
