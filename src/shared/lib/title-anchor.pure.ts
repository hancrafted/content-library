/**
 * The DOM id of the Title slide, and the active-Slide value for "no hash": the
 * top of the page. Reserved, so no Section or Slide slug may be `top`. Domain-free
 * and importing nothing, so the URL state, the Episode page and the content
 * pipeline (run by Node, by its `.ts` path) share it without reaching into an area.
 */
export const TITLE_ANCHOR = 'top';
