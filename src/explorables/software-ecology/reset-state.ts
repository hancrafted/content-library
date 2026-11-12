/*
 * Reset to default (feedback 09): the active state as its use-case file defines it: settings, speed, belt motion and
 * pile-up style. It closes a dashboard and a tour first, shows the state's view and compare mode, as picking it does.
 */
import type { Bundle, PileStyle, ViewId } from './software-ecology.types';
import { defaultsOf } from './state-defaults.pure.ts';
import type { FactoryView } from './use-factory.ts';

interface Page {
  readonly B: Bundle;
  readonly dash: { dismiss(): void };
  readonly display: { onBeltMotion(on: boolean): void; onPile(p: PileStyle): void };
}

interface Acts {
  readonly f: FactoryView;
  readonly tour: { end(): void };
  /** The state's own view. */
  readonly show: (v: ViewId) => void;
  readonly viewOf: (B: Bundle, id: string) => ViewId;
  readonly apply: (b: Bundle, id: string) => void;
}

export const resetter = (x: Page, y: Acts) => () => {
  const id = y.f.controls.preset,
    d = defaultsOf(x.B, id);
  x.dash.dismiss();
  y.tour.end();
  y.show(y.viewOf(x.B, id));
  y.apply(x.B, id);
  x.display.onBeltMotion(d.beltMotion);
  x.display.onPile(d.pile);
  y.f.controls.reset(d);
};
