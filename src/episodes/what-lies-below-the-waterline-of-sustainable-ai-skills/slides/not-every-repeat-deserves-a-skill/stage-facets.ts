/*
 * The stage of "Not every repeat deserves a skill", lifted facet by facet from Spec Option 9a (feedback 3, decision
 * 46), in the Spec's 1000 by 600 stage units: the wall, the binder, the index sheet with its clip and the check card
 * with its pin. The shared Console and pilot stand in front of the wall; the Spec's own desk and pilot are left out.
 */

/** A tone of the drawing; `stage-art.module.css` gives each its fill. */
export type ArtTone =
  | 'room-shade'
  | 'room-lit'
  | 'room'
  | 'tab'
  | 'stamp'
  | 'stamp-shade'
  | 'tab-lit'
  | 'binder-lit'
  | 'binder-shade'
  | 'binder'
  | 'paper-lit'
  | 'paper'
  | 'paper-shade'
  | 'paper-edge'
  | 'robot-shade'
  | 'robot-lit'
  | 'robot-dark'
  | 'pin'
  | 'glint';

/** One facet: its tone and its SVG path. */
export type ArtFacet = readonly [tone: ArtTone, d: string];

/** The faceted control-room wall behind the whole stage, lit from the upper left. */
export const WALL: readonly ArtFacet[] = [
  ['room-shade', 'M345 600L503 485L524 600ZM918 149L1000 229L831 235Z'],
  ['room-lit', 'M684 239L559 357L462 278Z'],
  ['room-shade', 'M666 418L559 357L684 239ZM503 485L559 357L666 418Z'],
  ['room-lit', 'M559 357L354 391L462 278Z'],
  ['room-shade', 'M354 391L559 357L503 485Z'],
  ['room', 'M128 447L0 330L104 241ZM236 322L128 447L104 241Z'],
  ['room-lit', 'M0 330L0 264L104 241ZM0 264L0 114L104 241ZM139 0L76 79L0 0Z'],
  ['room', 'M76 79L0 114L0 0ZM0 114L76 79L104 241ZM360 97L366 0L522 0ZM587 72L488 152L522 0Z'],
  ['room-lit', 'M488 152L360 97L522 0ZM488 152L684 239L462 278Z'],
  ['room', 'M488 152L587 72L684 239Z'],
  ['room-lit', 'M354 391L342 247L462 278Z'],
  ['room', 'M342 247L354 391L236 322Z'],
  ['room-lit', 'M342 247L488 152L462 278ZM488 152L342 247L360 97Z'],
  ['room-shade', 'M918 149L1000 92L1000 229Z'],
  ['room', 'M1000 92L894 0L1000 0ZM1000 92L918 149L894 0Z'],
  ['room-lit', 'M630 0L587 72L522 0ZM587 72L716 117L684 239Z'],
  ['room', 'M684 239L716 117L831 235Z'],
  ['room-lit', 'M716 117L630 0L730 0ZM630 0L716 117L587 72Z'],
  ['room', 'M716 117L918 149L831 235ZM716 117L730 0L894 0Z'],
  ['room-lit', 'M918 149L716 117L894 0Z'],
  ['room', 'M773 600L628 600L666 418Z'],
  [
    'room-shade',
    'M503 485L628 600L524 600ZM628 600L503 485L666 418ZM304 514L503 485L345 600ZM304 514L354 391L503 485ZM354 391L304 514L236 322ZM304 514L128 447L236 322Z',
  ],
  ['room', 'M128 447L0 482L0 330ZM193 114L76 79L139 0ZM76 79L193 114L104 241Z'],
  ['room-lit', 'M342 247L193 114L360 97ZM193 114L236 322L104 241Z'],
  ['room', 'M193 114L342 247L236 322Z'],
  ['room-shade', 'M905 504L1000 495L1000 600ZM856 600L905 504L1000 600ZM905 504L856 600L773 600Z'],
  [
    'room',
    'M815 422L773 600L666 418ZM815 422L905 504L773 600ZM815 422L684 239L831 235ZM815 422L666 418L684 239ZM0 482L131 600L0 600ZM131 600L0 482L128 447Z',
  ],
  ['room-lit', 'M277 0L193 114L139 0ZM277 0L366 0L360 97ZM193 114L277 0L360 97Z'],
  ['room', 'M815 422L914 331L905 504Z'],
  ['room-shade', 'M1000 495L914 331L1000 338ZM914 331L1000 495L905 504Z'],
  ['room-lit', 'M914 331L815 422L831 235Z'],
  ['room-shade', 'M914 331L1000 229L1000 338Z'],
  ['room-lit', 'M1000 229L914 331L831 235Z'],
  ['room', 'M246 600L304 514L345 600ZM304 514L246 600L128 447ZM246 600L131 600L128 447Z'],
];

/** The fat ring binder, its thin card tabs sticking out, the never-tested ones stamped red; bottom edge at y 500. */
export const BINDER: readonly ArtFacet[] = [
  ['tab', 'M186 376L191 376L189 354L184 354Z'],
  ['stamp', 'M193 376L198 376L200 340L195 340Z'],
  ['stamp-shade', 'M195 376L198 376L200 340L197 340Z'],
  ['tab', 'M199 376L204 376L206 349L201 349Z'],
  ['tab-lit', 'M206 376L211 376L211 335L206 335Z'],
  ['stamp', 'M212 376L217 376L217 344L212 344Z'],
  ['stamp-shade', 'M215 376L217 376L217 344L215 344Z'],
  ['tab-lit', 'M219 376L224 376L223 353L218 353Z'],
  ['tab', 'M225 376L230 376L228 339L223 339Z'],
  ['stamp', 'M232 376L237 376L234 348L229 348Z'],
  ['stamp-shade', 'M234 376L237 376L234 348L232 348Z'],
  ['tab', 'M238 376L243 376L245 334L240 334Z'],
  ['tab-lit', 'M245 376L250 376L251 343L246 343Z'],
  ['tab', 'M251 376L256 376L257 352L252 352Z'],
  ['stamp', 'M258 376L263 376L263 338L258 338Z'],
  ['stamp-shade', 'M260 376L263 376L263 338L260 338Z'],
  ['tab', 'M264 376L269 376L268 347L263 347Z'],
  ['stamp', 'M271 376L276 376L274 333L269 333Z'],
  ['stamp-shade', 'M273 376L276 376L274 333L271 333Z'],
  ['tab', 'M277 376L282 376L280 342L275 342Z'],
  ['tab-lit', 'M284 376L289 376L291 351L286 351Z'],
  ['binder-lit', 'M218 372L206 398L180 372ZM180 464L180 440L209 436Z'],
  ['binder-shade', 'M296 438L296 475L269 452ZM269 452L211 477L209 436Z'],
  ['binder', 'M211 477L180 464L209 436Z'],
  ['binder-shade', 'M180 464L211 477L180 500Z'],
  ['binder', 'M211 477L226 500L180 500ZM253 500L296 475L296 500Z'],
  ['binder-shade', 'M296 475L253 500L269 452Z'],
  ['binder-lit', 'M253 500L211 477L269 452Z'],
  ['binder', 'M211 477L253 500L226 500Z'],
  ['binder-lit', 'M180 440L180 399L209 436Z'],
  ['binder', 'M180 399L206 398L209 436ZM206 398L180 399L180 372Z'],
  ['binder-lit', 'M271 412L206 398L218 372Z'],
  ['binder', 'M271 412L269 452L209 436ZM206 398L271 412L209 436Z'],
  ['binder-shade', 'M271 412L296 399L296 438ZM271 412L296 438L269 452Z'],
  ['binder-lit', 'M263 372L271 412L218 372Z'],
  ['binder', 'M296 399L263 372L296 372Z'],
  ['binder-lit', 'M271 412L263 372L296 399ZM180 372L187 372L187 500L180 500Z'],
  ['binder-shade', 'M290 372L296 372L296 500L290 500Z'],
  ['stamp', 'M296 396L302 398L302 403L296 402Z'],
  ['tab-lit', 'M296 409L305 411L305 416L296 415Z'],
  ['stamp', 'M296 422L308 424L308 429L296 428Z'],
  ['tab-lit', 'M296 435L302 437L302 442L296 441Z'],
  ['stamp', 'M296 448L305 450L305 455L296 454Z'],
  ['tab-lit', 'M296 461L308 463L308 468L296 467Z'],
  ['paper-lit', 'M201 393L275 393L275 439L201 439Z'],
  ['binder-shade', 'M248 487L245 494L238 497L231 494L228 487L231 480L238 477L245 480Z'],
];

/** The index sheet's paper, x 350 to 676, y 30 to 640. */
export const SHEET: readonly ArtFacet[] = [
  ['paper', 'M676 152L549 30L676 30ZM549 30L676 152L505 107Z'],
  ['paper-shade', 'M427 561L460 640L350 640ZM578 499L460 640L427 561Z'],
  ['paper', 'M350 530L427 561L350 640Z'],
  ['paper-lit', 'M445 30L549 30L505 107ZM445 30L350 145L350 30ZM350 145L445 30L505 107Z'],
  ['paper', 'M676 152L592 201L505 107ZM592 201L610 372L487 324Z'],
  ['paper-lit', 'M610 372L592 201L676 312Z'],
  ['paper-shade', 'M584 640L460 640L578 499Z'],
  ['paper-lit', 'M584 640L676 529L676 640Z'],
  ['paper-shade', 'M676 529L584 640L578 499Z'],
  ['paper', 'M455 206L350 145L505 107Z'],
  ['paper-lit', 'M455 206L592 201L487 324Z'],
  ['paper', 'M592 201L455 206L505 107Z'],
  ['paper-lit', 'M350 530L463 440L427 561ZM463 440L578 499L427 561Z'],
  ['paper', 'M463 440L350 327L487 324ZM610 372L463 440L487 324ZM463 440L610 372L578 499Z'],
  ['paper-shade', 'M676 429L676 529L578 499ZM610 372L676 429L578 499ZM676 429L610 372L676 312Z'],
  ['paper', 'M592 201L676 214L676 312Z'],
  ['paper-shade', 'M676 214L592 201L676 152Z'],
  ['paper', 'M455 206L350 247L350 145Z'],
  ['paper-lit', 'M350 327L350 247L487 324ZM350 247L455 206L487 324ZM463 440L350 418L350 327Z'],
  ['paper', 'M350 418L463 440L350 530Z'],
  ['paper-edge', 'M350 637L676 637L676 640L350 640ZM673 30L676 30L676 640L673 640Z'],
];

/** The clip the index sheet hangs from, over its top edge. */
export const CLIP: readonly ArtFacet[] = [
  ['robot-shade', 'M479 28L547 28L543 50L483 50Z'],
  ['robot-lit', 'M479 28L517 28L505 50L483 50Z'],
  ['robot-dark', 'M491 12L497 12L501 30L495 30ZM529 12L535 12L531 30L525 30ZM491 10L535 10L535 14L491 14Z'],
];

/** The check card's paper, x 706 to 976, y 36 to 560. */
export const CARD: readonly ArtFacet[] = [
  ['paper', 'M976 241L976 356L847 300Z'],
  ['paper-lit', 'M806 36L783 102L706 36ZM806 36L904 107L783 102ZM783 102L706 123L706 36ZM706 254L764 210L847 300Z'],
  ['paper', 'M706 123L764 210L706 254ZM764 210L706 123L783 102ZM976 356L901 410L847 300Z'],
  ['paper-shade', 'M976 115L904 107L976 36Z'],
  ['paper-lit', 'M904 107L903 36L976 36ZM903 36L904 107L806 36Z'],
  ['paper', 'M867 200L976 241L847 300Z'],
  ['paper-lit', 'M764 210L867 200L847 300Z'],
  ['paper', 'M867 200L976 115L976 241Z'],
  ['paper-shade', 'M976 115L867 200L904 107Z'],
  ['paper', 'M904 107L867 200L783 102ZM867 200L764 210L783 102ZM706 353L706 254L847 300ZM706 449L795 456L706 560Z'],
  ['paper-shade', 'M795 456L807 560L706 560Z'],
  ['paper-lit', 'M706 353L795 456L706 449Z'],
  ['paper', 'M901 410L795 456L847 300Z'],
  ['paper-lit', 'M795 456L706 353L847 300Z'],
  ['paper-shade', 'M976 462L901 410L976 356Z'],
  ['paper-lit', 'M898 560L976 462L976 560Z'],
  ['paper-shade', 'M976 462L898 560L901 410ZM795 456L898 560L807 560ZM898 560L795 456L901 410Z'],
  ['paper-edge', 'M706 557L976 557L976 560L706 560ZM973 36L976 36L976 560L973 560Z'],
];

/** The pin holding the check card to the wall. */
export const PIN: readonly ArtFacet[] = [
  ['pin', 'M834 46L841 39L848 46L841 53Z'],
  ['glint', 'M834 46L841 39L841 46Z'],
];
