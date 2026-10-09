import gsap from 'gsap';

const REST_AT = 1.5;
export const ENVELOPE_BURST_AT = REST_AT + 10;

function envelopeParts(root: HTMLElement) {
  const envelope = root.querySelector<SVGGElement>('[data-envelope]');
  const trigger = root.querySelector<HTMLButtonElement>('[data-testid="hero-open"]');
  if (!envelope || !trigger) throw new Error('The promotion envelope requires its opening control.');
  return { envelope, trigger };
}

function alignTrigger(parts: ReturnType<typeof envelopeParts>) {
  const bounds = parts.envelope.getBoundingClientRect();
  const parent = parts.trigger.parentElement;
  if (!parent) throw new Error('The envelope control requires a positioned scene.');
  const scene = parent.getBoundingClientRect();
  gsap.set(parts.trigger, {
    left: bounds.left - scene.left,
    top: bounds.top - scene.top,
    width: bounds.width,
    height: bounds.height,
  });
}

function agitation(timeline: gsap.core.Timeline, envelope: SVGGElement) {
  for (let step = 0; step < 60; step++) {
    const elapsed = step * 0.1;
    const strength = 1 + elapsed * 1.2;
    const jump = elapsed < 3 ? 0 : -Math.abs(Math.sin(step * 1.7)) * (elapsed - 3) * 7;
    timeline.to(
      envelope,
      {
        rotation: 12 + gsap.utils.random(-strength, strength),
        x: gsap.utils.random(-strength / 3, strength / 3),
        y: jump,
        duration: 0.1,
        ease: 'sine.inOut',
      },
      REST_AT + elapsed,
    );
  }
}

function indignation(timeline: gsap.core.Timeline, root: HTMLElement) {
  const envelope = root.querySelector('[data-envelope]');
  timeline.to(
    envelope,
    { scaleY: 1, skewX: 0, rotation: 0, y: -35, x: 0, duration: 1, ease: 'power2.inOut' },
    REST_AT + 6,
  );
  timeline.to(root.querySelectorAll('[data-envelope-red]'), { opacity: 1, duration: 2.5 }, REST_AT + 6);
  timeline.to(root.querySelector('[data-envelope-face]'), { opacity: 1, duration: 0.7 }, REST_AT + 6.5);
  timeline.to(envelope, { rotation: 4, x: 4, y: -43, duration: 0.07, repeat: 39, yoyo: true }, REST_AT + 7.1);
}

export function animateEnvelope(timeline: gsap.core.Timeline, root: HTMLElement) {
  const parts = envelopeParts(root);
  gsap.set(parts.envelope, { transformOrigin: '50% 100%', scaleY: 0.62, skewX: -16 });
  gsap.set(root.querySelectorAll('[data-envelope-open], [data-envelope-tear]'), { opacity: 0 });
  gsap.set(root.querySelectorAll('[data-envelope-flap], [data-envelope-seal]'), { opacity: 1 });
  timeline.fromTo(
    parts.envelope,
    { x: 1050, rotation: -18 },
    { x: 0, rotation: 12, duration: 1.2, ease: 'power3.out' },
    0.3,
  );
  timeline.call(
    () => {
      root.dataset.animated = 'waiting';
      alignTrigger(parts);
    },
    [],
    REST_AT,
  );
  timeline.eventCallback('onUpdate', () => {
    if (timeline.time() >= REST_AT && timeline.time() < ENVELOPE_BURST_AT) alignTrigger(parts);
  });
  agitation(timeline, parts.envelope);
  indignation(timeline, root);
}

function breakSeal(timeline: gsap.core.Timeline, root: HTMLElement) {
  timeline.to(
    root.querySelector('[data-envelope-flap]'),
    { scaleY: -1, transformOrigin: '50% 0%', opacity: 0, duration: 0.3 },
    'burst',
  );
  timeline.to(
    root.querySelector('[data-envelope-seal]'),
    { x: 130, y: -100, rotation: 180, opacity: 0, duration: 0.55 },
    'burst',
  );
  timeline.to(
    root.querySelectorAll('[data-envelope-face], [data-envelope-red]'),
    { opacity: 0, duration: 0.3 },
    'burst',
  );
}

export function burstEnvelope(timeline: gsap.core.Timeline, root: HTMLElement) {
  const envelope = root.querySelector('[data-envelope]');
  breakSeal(timeline, root);
  timeline.fromTo(
    root.querySelector('[data-envelope-open]'),
    { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
    { scaleY: 1, opacity: 1, duration: 0.45 },
    'burst+=0.1',
  );
  timeline.to(root.querySelector('[data-envelope-tear]'), { opacity: 1, duration: 0.2 }, 'burst');
  timeline.to(envelope, { scaleX: 1.1, scaleY: 1.1, x: 0, y: -50, rotation: -4, duration: 0.15 }, 'burst');
  timeline.to(
    envelope,
    { scaleX: 1, scaleY: 0.62, skewX: -16, y: 0, rotation: 12, duration: 0.65, ease: 'power2.out' },
    'burst+=0.15',
  );
}
