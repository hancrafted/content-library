// `npm run slides:pool`: the pool listing, one line per page Slide of every Episode and the Slide pool (design-ADR
// 0016, Pipeline and evidence rule 12), which the slide-retrieval job reads to write the Slide plan.

import { listSlides, writeListing } from './slide-pool.pure.ts';
import { repo } from './slide-repo.ts';

console.log(writeListing(listSlides(repo)));
