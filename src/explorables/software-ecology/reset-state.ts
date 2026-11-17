import type { Bundle, PileStyle } from './software-ecology.types';
import { defaultsOf } from './state-defaults.pure.ts';
import type { FactoryView } from './use-factory.ts';

interface Page {
  readonly B: Bundle;
  readonly dash: { dismiss(): void };
  readonly display: { onBeltMotion(on: boolean): void; onPile(p: PileStyle): void };
}

interface StateActions {
  readonly f: FactoryView;
  readonly tour: { end(): void };
  readonly enter: (b: Bundle, id: string) => void;
}

export const dismissOverlays = (page: Pick<Page, 'dash'>, acts: Pick<StateActions, 'tour'>): void => {
  page.dash.dismiss();
  acts.tour.end();
};

export const resetToDefault = (page: Page, acts: StateActions) => (): void => {
  const id = acts.f.controls.preset,
    defaults = defaultsOf(page.B, id);
  dismissOverlays(page, acts);
  acts.enter(page.B, id);
  page.display.onBeltMotion(defaults.beltMotion);
  page.display.onPile(defaults.pile);
  acts.f.controls.reset(defaults);
};
