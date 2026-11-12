/*
 * Leaving a state or use case for another one, and Reset to default (feedback 09): every one closes a dashboard and a
 * tour first. Reset then shows the state's own view and compare mode, as picking it does, and restores the state as its
 * use-case file defines it: settings, speed, belt motion and pile-up style.
 */
import type { Bundle, PileStyle, ViewId } from './software-ecology.types';
import { defaultsOf } from './state-defaults.pure.ts';
import type { FactoryView } from './use-factory.ts';

/** The pieces a page hands over: its bundle, the dashboard and tour to close, and the display it resets. */
interface Page {
  readonly B: Bundle;
  readonly dash: { dismiss(): void };
  readonly display: { onBeltMotion(on: boolean): void; onPile(p: PileStyle): void };
}

/** What the page does to show a state. */
interface StateActions {
  readonly f: FactoryView;
  readonly tour: { end(): void };
  /** Show a view. */
  readonly show: (v: ViewId) => void;
  /** The view a state of a bundle opens in. */
  readonly viewOf: (B: Bundle, id: string) => ViewId;
  /** Apply the state's compare mode. */
  readonly apply: (b: Bundle, id: string) => void;
}

/** Closes the dashboard and the tour: the start of every change of state or use case. */
export const dismissOverlays = (page: Pick<Page, 'dash'>, acts: Pick<StateActions, 'tour'>): void => {
  page.dash.dismiss();
  acts.tour.end();
};

/** Back to the active state as its file defines it. */
export const resetToDefault = (page: Page, acts: StateActions) => (): void => {
  const id = acts.f.controls.preset,
    defaults = defaultsOf(page.B, id);
  dismissOverlays(page, acts);
  acts.show(acts.viewOf(page.B, id));
  acts.apply(page.B, id);
  page.display.onBeltMotion(defaults.beltMotion);
  page.display.onPile(defaults.pile);
  acts.f.controls.reset(defaults);
};
