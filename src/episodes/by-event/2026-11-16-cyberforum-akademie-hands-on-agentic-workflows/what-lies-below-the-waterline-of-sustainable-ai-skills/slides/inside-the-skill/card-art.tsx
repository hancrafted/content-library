import { cn } from '@/shared/lib/utils';
import styles from './inside.module.css';

export function ScriptArt() {
  return (
    <svg viewBox="480 212 90 80" aria-hidden className={cn(styles.objects, 'h-12 w-auto shrink-0')}>
      <path data-tone="robot" d="M482 224L492 214L568 214L568 290L482 290Z" />
      <path data-tone="robot-lit" d="M482 224L492 214L533.6 214L507.8 255.8L482 267.2Z" />
      <path data-tone="robot-shade" d="M568 236.8L568 290L525 290Z" />
      <path data-tone="robot-glint" d="M492 216L508 216L494 230Z" />
      <path
        data-tone="lamp"
        d="M499.2 282L505.2 282L505.2 290L499.2 290ZM510.4 282L516.4 282L516.4 290L510.4 290ZM521.6 282L527.6 282L527.6 290L521.6 290ZM532.7 282L538.8 282L538.8 290L532.7 290ZM543.9 282L549.9 282L549.9 290L543.9 290Z"
      />
      <path
        data-tone="robot-dark"
        d="M500.9 252L519.6 252L516.7 247.7L503.8 247.7ZM508.8 247.7L513.1 247.7L525.3 227.6L521 226.2ZM521 226.2L525.3 227.6L545.4 233.4L543.9 237.7ZM543.9 230.5L554 227.6L551.1 234.8L554 242L543.9 239.1Z"
      />
      <path data-tone="paper-lit" d="M494.9 259.6L557.7 259.6L557.7 285.6L494.9 285.6Z" />
    </svg>
  );
}

export function TemplateArt() {
  return (
    <svg viewBox="464 573 112 60" aria-hidden className={cn(styles.objects, 'h-12 w-auto shrink-0')}>
      <path data-tone="paper" d="M498 580L572 580L572 630L498 630L480 605Z" />
      <path data-tone="paper-lit" d="M498 580L572 580L530.6 607.5L480 605Z" />
      <path data-tone="paper-shade" d="M572 630L498 630L544.4 611Z" />
      <path data-tone="paper-edge" d="M500 605L497 610.2L491 610.2L488 605L491 599.8L497 599.8Z" />
      <path data-tone="robot-dark" d="M496.5 605L494.8 607.4L492 606.5L492 603.5L494.8 602.6Z" />
      <path data-tone="string" d="M493 605L495 605L470 575L467 576Z" />
      <path
        data-tone="paper-edge"
        d="M510 611L548.7 611L548.7 612.6L510 612.6ZM510 619.5L558 619.5L558 621.1L510 621.1Z"
      />
    </svg>
  );
}

export function GuideTab() {
  return (
    <svg viewBox="658 280 70 20" aria-hidden className={cn(styles.objects, 'h-5 w-auto')}>
      <path data-tone="guide" d="M664 282L722 282L726 298L660 298Z" />
      <path data-tone="guide-lit" d="M664 282L694 282L678 298L660 298Z" />
      <path data-tone="fish-lit" d="M687 290L692.6 286.1L694 290ZM692.6 286.1L700.3 288.2L694 290Z" />
      <path
        data-tone="fish-shade"
        d="M700.3 288.2L702.4 290L694 290ZM702.4 290L700.3 292.1L694 290ZM700.3 292.1L692.6 293.5L694 290Z"
      />
      <path data-tone="fish-lit" d="M692.6 293.5L687 290L694 290ZM687 290L682.1 286.5L683.5 290Z" />
      <path data-tone="fish-shade" d="M687 290L683.5 290L682.1 293.5Z" />
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
