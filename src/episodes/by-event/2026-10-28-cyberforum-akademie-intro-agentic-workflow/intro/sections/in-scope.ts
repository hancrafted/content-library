import type { Section } from '@/episodes/components/slide-master/slide';
import { inScope } from '../slides/in-scope/slide';
import { outOfScope } from '../slides/out-of-scope/slide';

/** Placement marker of the Section "In scope": what the session covers, then what it leaves out. */
export const inScopeSection: Section = [inScope, outOfScope];
