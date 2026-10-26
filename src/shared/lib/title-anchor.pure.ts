/**
 * The DOM id of the anchor that opens a page, and the URL state's active value when
 * the URL carries no hash: the top of the page. Reserved, so no other anchor on the
 * page may take `top`. Imports nothing, so the URL state and any code that names
 * anchors share it, Node code too, by its `.ts` path.
 */
export const TITLE_ANCHOR = 'top';
