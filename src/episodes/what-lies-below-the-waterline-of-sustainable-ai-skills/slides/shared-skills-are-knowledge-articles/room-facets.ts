/*
 * The control room of "Shared skills are knowledge articles", lifted facet by facet from Spec Option 20b (feedback 3,
 * decision 46), in the Spec's 1200 by 560 units, floor line at 486, lit from the upper left: the faceted wall and floor,
 * the porthole onto the Midnight water with its bubbles, the institute's shelf of manuals, and the fleet manual open on
 * its lectern, binder rings and faceted page. The captain, the AIs and their consoles are the shared cast, on top.
 */

/** A tone of the drawing; `room-art.module.css` gives each its fill. */
export type ArtTone =
  | 'room'
  | 'room-lit'
  | 'room-shade'
  | 'floor'
  | 'floor-lit'
  | 'frame-shade'
  | 'sea-midnight'
  | 'sea-midnight-lit'
  | 'bubble'
  | 'glint'
  | 'pane-glint'
  | 'shelf'
  | 'shelf-shade'
  | 'spine-a'
  | 'drop'
  | 'paper-lit'
  | 'book'
  | 'spine-b'
  | 'spine-c'
  | 'book-lit'
  | 'post-shade'
  | 'post-lit'
  | 'book-shade'
  | 'paper'
  | 'paper-shade'
  | 'paper-edge'
  | 'ring-shade'
  | 'ring';

export type ArtFacet = readonly [tone: ArtTone, d: string];

/** The wall, the floor and the porthole, back to front. */
export const ROOM: readonly ArtFacet[] = [
  ['room', 'M754 394L803 173L954 303Z'],
  ['room-lit', 'M792 0L664 121L677 0ZM664 121L792 0L803 173Z'],
  ['room-shade', 'M1107 307L1075 486L954 303ZM1107 307L1082 98L1200 241Z'],
  ['room-lit', 'M0 249L83 183L193 269Z'],
  ['room', 'M126 399L0 249L193 269Z'],
  ['room-shade', 'M330 315L126 399L193 269ZM126 399L330 315L242 486Z'],
  ['room', 'M1093 0L1082 98L946 0ZM1082 98L1200 93L1200 241Z'],
  ['room-shade', 'M1200 93L1093 0L1200 0Z'],
  ['room', 'M1093 0L1200 93L1082 98ZM1082 98L945 151L946 0Z'],
  ['room-lit', 'M945 151L792 0L946 0ZM792 0L945 151L803 173Z'],
  ['room', 'M803 173L945 151L954 303ZM945 151L1107 307L954 303ZM1107 307L945 151L1082 98Z'],
  ['room-lit', 'M664 121L516 0L677 0Z'],
  ['room-shade', 'M1075 486L904 486L954 303Z'],
  ['room', 'M904 486L754 394L954 303Z'],
  ['room-lit', 'M685 283L664 121L803 173Z'],
  ['room-shade', 'M754 394L685 283L803 173Z'],
  ['room', 'M664 121L685 283L538 267ZM662 486L685 283L754 394ZM685 283L662 486L561 486Z'],
  ['room-lit', 'M1075 486L1200 348L1200 486Z'],
  ['room-shade', 'M1107 307L1200 348L1075 486Z'],
  ['room', 'M1200 348L1107 307L1200 241ZM0 145L83 183L0 249Z'],
  ['room-lit', 'M0 382L126 399L0 486Z'],
  ['room', 'M126 399L0 382L0 249Z'],
  ['room-shade', 'M126 399L153 486L0 486ZM153 486L126 399L242 486ZM330 315L373 486L242 486Z'],
  ['room', 'M516 0L474 115L412 0Z'],
  ['room-lit', 'M474 115L664 121L538 267ZM474 115L516 0L664 121Z'],
  ['room', 'M821 486L662 486L754 394ZM904 486L821 486L754 394ZM150 0L0 145L0 0Z'],
  ['room-lit', 'M0 145L150 0L83 183Z'],
  ['room', 'M350 161L330 315L193 269Z'],
  ['room-lit', 'M330 315L350 161L538 267Z'],
  ['room', 'M350 161L474 115L538 267Z'],
  ['room-lit', 'M350 161L250 0L412 0Z'],
  ['room', 'M474 115L350 161L412 0Z'],
  [
    'room-shade',
    'M373 486L491 407L561 486ZM685 283L491 407L538 267ZM491 407L685 283L561 486ZM491 407L330 315L538 267ZM491 407L373 486L330 315Z',
  ],
  [
    'room-lit',
    'M193 102L150 0L250 0ZM150 0L193 102L83 183ZM83 183L193 102L193 269ZM193 102L350 161L193 269ZM350 161L193 102L250 0Z',
  ],
  ['room-shade', 'M0 478L1200 478L1200 486L0 486Z'],
  ['floor', 'M1200 560L1108 486L1200 486Z'],
  [
    'floor-lit',
    'M655 560L560 560L633 486ZM748 486L655 560L633 486ZM655 560L748 486L772 560ZM1108 486L969 560L955 486Z',
  ],
  ['floor', 'M560 560L548 486L633 486ZM459 486L548 486L560 560ZM217 560L194 486L338 486ZM334 560L217 560L338 486Z'],
  ['floor-lit', 'M459 486L411 560L338 486Z'],
  ['floor', 'M411 560L334 560L338 486ZM411 560L459 486L560 560Z'],
  ['floor-lit', 'M969 560L876 486L955 486Z'],
  ['floor', 'M1097 560L1108 486L1200 560ZM1097 560L969 560L1108 486Z'],
  ['floor-lit', 'M106 560L110 486L194 486Z'],
  ['floor', 'M217 560L106 560L194 486Z'],
  ['floor-lit', 'M110 486L106 560L0 486ZM106 560L0 560L0 486ZM848 560L876 486L969 560ZM876 486L848 560L748 486Z'],
  ['floor', 'M748 486L848 560L772 560Z'],
  [
    'frame-shade',
    'M1176 76L1168 104L1148 124L1120 132L1092 124L1072 104L1064 76L1072 48L1092 28L1120 20L1148 28L1168 48Z',
  ],
  [
    'sea-midnight',
    'M1166 76L1160 99L1143 116L1120 122L1097 116L1080 99L1074 76L1080 53L1097 36L1120 30L1143 36L1160 53Z',
  ],
  ['sea-midnight-lit', 'M1080 53L1097 36L1120 30L1120 76Z'],
];

/** The porthole's bubbles and glass glint, and the shelf of manuals over the lectern. */
export const SHELF: readonly ArtFacet[] = [
  ['bubble', 'M1146 96L1144 100L1140 100L1138 96L1140 93L1144 93Z'],
  ['glint', 'M1140 95L1142 93L1142 95Z'],
  ['bubble', 'M1151 76L1150 79L1147 79L1145 76L1147 73L1150 73Z'],
  ['glint', 'M1147 75L1148 74L1148 75Z'],
  ['pane-glint', 'M1074 76L1080 53L1110 63Z'],
  ['shelf', 'M450 150L760 150L760 160L450 160Z'],
  ['shelf-shade', 'M450 160L760 160L754 166L456 166Z'],
  ['spine-a', 'M460 150L482 150L482 64L460 64Z'],
  ['drop', 'M460 64L466 64L466 150L460 150Z'],
  ['paper-lit', 'M465 80L477 80L477 94L465 94Z'],
  ['book', 'M486 150L515 150L515 51L486 51Z'],
  ['drop', 'M486 51L492 51L492 150L486 150Z'],
  ['paper-lit', 'M491 67L510 67L510 81L491 81Z'],
  ['spine-b', 'M519 150L543 150L543 64L519 64Z'],
  ['drop', 'M519 64L525 64L525 150L519 150Z'],
  ['paper-lit', 'M524 80L538 80L538 94L524 94Z'],
  ['spine-c', 'M547 150L578 150L578 51L547 51Z'],
  ['drop', 'M547 51L553 51L553 150L547 150Z'],
  ['paper-lit', 'M552 67L573 67L573 81L552 81Z'],
  ['book-lit', 'M582 150L608 150L608 64L582 64Z'],
  ['drop', 'M582 64L588 64L588 150L582 150Z'],
  ['paper-lit', 'M587 80L603 80L603 94L587 94Z'],
  ['spine-a', 'M612 150L645 150L645 51L612 51Z'],
  ['drop', 'M612 51L618 51L618 150L612 150Z'],
  ['paper-lit', 'M617 67L640 67L640 81L617 81Z'],
  ['spine-c', 'M649 150L677 150L677 64L649 64Z'],
  ['drop', 'M649 64L655 64L655 150L649 150Z'],
  ['paper-lit', 'M654 80L672 80L672 94L654 94Z'],
  ['book', 'M681 150L704 150L704 51L681 51Z'],
  ['drop', 'M681 51L687 51L687 150L681 150Z'],
  ['paper-lit', 'M686 67L699 67L699 81L686 81Z'],
  ['spine-b', 'M708 150L738 150L738 64L708 64Z'],
  ['drop', 'M708 64L714 64L714 150L708 150Z'],
  ['paper-lit', 'M713 80L733 80L733 94L713 94Z'],
];

/** The fleet manual on its lectern: the post, the green covers, the faceted page and the binder rings. */
export const MANUAL: readonly ArtFacet[] = [
  ['post-shade', 'M520 486L560 486L572 400L508 400Z'],
  ['post-lit', 'M520 486L540 486L544 400L508 400Z'],
  ['drop', 'M392 196L776 196L776 438L392 438Z'],
  ['book-shade', 'M593 420L480 347L612 347ZM687 255L760 308L612 347Z'],
  ['book-lit', 'M579 182L687 255L612 347Z'],
  ['book-shade', 'M760 308L687 255L760 182ZM644 420L593 420L612 347Z'],
  ['book-lit', 'M644 420L760 308L760 420Z'],
  ['book-shade', 'M760 308L644 420L612 347Z'],
  ['book', 'M515 254L380 326L380 182ZM380 326L515 254L480 347Z'],
  ['book-lit', 'M515 254L579 182L612 347Z'],
  ['book', 'M480 347L515 254L612 347ZM454 420L480 347L593 420ZM380 326L454 420L380 420ZM454 420L380 326L480 347Z'],
  ['book-lit', 'M687 255L646 182L760 182Z'],
  ['book', 'M646 182L687 255L579 182ZM486 182L515 254L380 182Z'],
  ['book-lit', 'M515 254L486 182L579 182Z'],
  ['book-shade', 'M380 182L410 182L410 420L380 420Z'],
  ['drop', 'M428 206L750 206L750 418L428 418Z'],
  ['paper', 'M631 248L669 336L567 307Z'],
  ['paper-lit', 'M683 196L631 248L602 196ZM491 196L420 277L420 196ZM420 277L491 196L472 290Z'],
  ['paper-shade', 'M669 336L609 406L567 307ZM609 406L562 406L567 307Z'],
  ['paper-lit', 'M420 351L420 277L472 290Z'],
  ['paper', 'M507 354L472 290L567 307Z'],
  ['paper-shade', 'M562 406L507 354L567 307Z'],
  ['paper', 'M507 354L420 351L472 290Z'],
  ['paper-lit', 'M740 268L683 196L740 196Z'],
  ['paper-shade', 'M740 268L740 339L669 336Z'],
  ['paper', 'M631 248L740 268L669 336ZM740 268L631 248L683 196Z'],
  ['paper-lit', 'M528 247L631 248L567 307ZM631 248L528 247L602 196ZM472 290L528 247L567 307ZM491 196L528 247L472 290Z'],
  ['paper', 'M683 406L609 406L669 336ZM683 406L740 339L740 406Z'],
  ['paper-shade', 'M740 339L683 406L669 336Z'],
  ['paper', 'M476 406L507 354L562 406ZM420 351L476 406L420 406Z'],
  ['paper-shade', 'M507 354L476 406L420 351Z'],
  ['paper', 'M528 247L541 196L602 196Z'],
  ['paper-lit', 'M541 196L528 247L491 196Z'],
  ['paper-edge', 'M420 403L740 403L740 406L420 406ZM737 196L740 196L740 406L737 406Z'],
  ['ring-shade', 'M402 223L438 223L442 230L438 237L402 237L398 230Z'],
  ['ring', 'M402 223L438 223L442 230L398 230Z'],
  ['glint', 'M408 225L418 225L412 228Z'],
  ['ring-shade', 'M402 293L438 293L442 300L438 307L402 307L398 300Z'],
  ['ring', 'M402 293L438 293L442 300L398 300Z'],
  ['glint', 'M408 295L418 295L412 298Z'],
  ['ring-shade', 'M402 363L438 363L442 370L438 377L402 377L398 370Z'],
  ['ring', 'M402 363L438 363L442 370L398 370Z'],
  ['glint', 'M408 365L418 365L412 368Z'],
];
