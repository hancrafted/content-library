import { BINDER } from './binder-facets';
import { FLEET } from './fleet-facets';
import { NOTEBOOK } from './notebook-facets';
import { TOOLKIT } from './toolkit-facets';

export const SQUARE_FACETS = { notebook: NOTEBOOK, toolkit: TOOLKIT, binder: BINDER, fleet: FLEET } as const;
