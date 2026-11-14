/*
 * The skill scope matrix's four pictures, lifted from the approved Spec Option 18a (follow-up 3b item 3): flat facets
 * in the picture's own 380 by 145 space, each a path and a tone, one file per picture. The tones are
 * `skill-scope-matrix.module.css`'s, mixed from global tokens; the ships are the shared `Ship`, which
 * `square-picture.tsx` places between `back` and `front`.
 */
import { BINDER } from './binder-facets';
import { FLEET } from './fleet-facets';
import { NOTEBOOK } from './notebook-facets';
import { TOOLKIT } from './toolkit-facets';

export const SQUARE_FACETS = { notebook: NOTEBOOK, toolkit: TOOLKIT, binder: BINDER, fleet: FLEET } as const;
