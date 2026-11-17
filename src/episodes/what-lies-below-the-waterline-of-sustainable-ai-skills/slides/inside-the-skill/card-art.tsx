import { cn } from '@/shared/lib/utils';
import styles from './inside.module.css';

export function ScriptArt() {
  return (
    <svg viewBox="480 212 90 80" aria-hidden className={cn(styles.objects, 'h-12 w-auto shrink-0')}>
      <path data-tone="robot" d="M482 224L492 214L568 214L568 290L482 290Z" />
      <path data-tone="robot-lit" d="M482 224L492 214L534 214L508 256L482 267Z" />
      <path data-tone="robot-shade" d="M568 237L568 290L525 290Z" />
      <path data-tone="robot-glint" d="M492 216L508 216L494 230Z" />
      <path
        data-tone="lamp"
        d="M499 282L505 282L505 290L499 290ZM510 282L516 282L516 290L510 290ZM522 282L528 282L528 290L522 290ZM533 282L539 282L539 290L533 290ZM544 282L550 282L550 290L544 290Z"
      />
      <path
        data-tone="robot-dark"
        d="M501 252L520 252L517 248L504 248ZM509 248L513 248L525 228L521 226ZM521 226L525 228L545 233L544 238ZM544 231L554 228L551 235L554 242L544 239Z"
      />
      <path data-tone="paper-lit" d="M495 260L558 260L558 286L495 286Z" />
    </svg>
  );
}

export function TemplateArt() {
  return (
    <svg viewBox="464 573 112 60" aria-hidden className={cn(styles.objects, 'h-12 w-auto shrink-0')}>
      <path data-tone="paper" d="M498 580L572 580L572 630L498 630L480 605Z" />
      <path data-tone="paper-lit" d="M498 580L572 580L531 608L480 605Z" />
      <path data-tone="paper-shade" d="M572 630L498 630L544 611Z" />
      <path data-tone="paper-edge" d="M500 605L497 610L491 610L488 605L491 600L497 600Z" />
      <path data-tone="robot-dark" d="M497 605L495 607L492 607L492 604L495 603Z" />
      <path data-tone="string" d="M493 605L495 605L470 575L467 576Z" />
      <path data-tone="paper-edge" d="M510 611L549 611L549 613L510 613ZM510 620L558 620L558 621L510 621Z" />
    </svg>
  );
}

export function GuideTab() {
  return (
    <svg viewBox="658 280 70 20" aria-hidden className={cn(styles.objects, 'h-5 w-auto')}>
      <path data-tone="guide" d="M664 282L722 282L726 298L660 298Z" />
      <path data-tone="guide-lit" d="M664 282L694 282L678 298L660 298Z" />
      <path data-tone="fish-lit" d="M687 290L693 286L694 290ZM693 286L700 288L694 290Z" />
      <path data-tone="fish-shade" d="M700 288L702 290L694 290ZM702 290L700 292L694 290ZM700 292L693 294L694 290Z" />
      <path data-tone="fish-lit" d="M693 294L687 290L694 290ZM687 290L682 287L684 290Z" />
      <path data-tone="fish-shade" d="M687 290L684 290L682 294Z" />
    </svg>
  );
}

export function SleeveClip() {
  return (
    <svg viewBox="193 24 72 44" aria-hidden className={cn(styles.objects, 'h-10 w-auto')}>
      <path data-tone="robot-shade" d="M195 44L263 44L259 66L199 66Z" />
      <path data-tone="robot-lit" d="M195 44L233 44L221 66L199 66Z" />
      <path
        data-tone="robot-dark"
        d="M207 28L213 28L217 46L211 46ZM245 28L251 28L247 46L241 46ZM207 26L251 26L251 30L207 30Z"
      />
    </svg>
  );
}
