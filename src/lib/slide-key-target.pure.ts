/*
 * Arrow-key navigation between Slides (the Episode page container's duty): a
 * pure decision, like the drawer's key action. ArrowLeft and ArrowRight step to
 * the previous or next Slide, never wrapping; every other key, any modifier
 * and any focus inside a control that owns the arrows is not ours, so the
 * answer is `null` and the browser keeps the key.
 */

/** The slice of a `KeyboardEvent` the Slide key action reads. */
export interface SlideKeyEvent {
  readonly key: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
}

/**
 * Regions where the arrows belong to something else: text entry, the widgets
 * that roving focus or a value drives, the Context drawer, an open modal and
 * iframes (the talk player).
 */
export const SLIDE_KEY_EXCLUDED_SELECTOR = [
  'input',
  'textarea',
  'select',
  '[contenteditable]:not([contenteditable="false"])',
  'iframe',
  '[role=tablist]',
  '[role=menu]',
  '[role=menubar]',
  '[role=listbox]',
  '[role=slider]',
  '[role=radiogroup]',
  '[data-slot=context]',
  'dialog[open]',
].join(', ');

/** Whether an element (usually the focused one) sits in an excluded region. */
export function inExcludedRegion(element: { closest(selector: string): unknown } | null): boolean {
  return element !== null && element.closest(SLIDE_KEY_EXCLUDED_SELECTOR) !== null;
}

/** Where the reader is: every Slide id in page order, and the active one (`null` until known). */
export interface SlidePlace {
  readonly ids: readonly string[];
  readonly active: string | null;
}

const STEPS: ReadonlyMap<string, number> = new Map([
  ['ArrowRight', 1],
  ['ArrowLeft', -1],
]);

function isBare(event: SlideKeyEvent): boolean {
  return !(event.altKey || event.ctrlKey || event.metaKey || event.shiftKey);
}

/** The Slide id an arrow press goes to, or `null` when the press is not ours or there is nowhere to go. */
export function slideKeyTarget(event: SlideKeyEvent, excluded: boolean, place: SlidePlace): string | null {
  const step = STEPS.get(event.key);
  const at = place.active === null ? -1 : place.ids.indexOf(place.active);
  if (excluded || !isBare(event) || step === undefined || at === -1) return null;
  return place.ids[at + step] ?? null;
}
