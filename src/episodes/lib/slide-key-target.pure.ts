export interface SlideKeyEvent {
  readonly key: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
}

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

export function inExcludedRegion(element: { closest(selector: string): unknown } | null): boolean {
  return element !== null && element.closest(SLIDE_KEY_EXCLUDED_SELECTOR) !== null;
}

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

export function slideKeyTarget(event: SlideKeyEvent, excluded: boolean, place: SlidePlace): string | null {
  const step = STEPS.get(event.key);
  const at = place.active === null ? -1 : place.ids.indexOf(place.active);
  if (excluded || !isBare(event) || step === undefined || at === -1) return null;
  return place.ids[at + step] ?? null;
}
