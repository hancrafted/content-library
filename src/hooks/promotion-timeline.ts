import { animateEnvelope, burstEnvelope, ENVELOPE_BURST_AT } from '@/hooks/promotion-envelope';
import { createPaperPile } from '@/hooks/promotion-pile';
import { promotionFlight } from '@/lib/promotion-flight.pure';
import gsap from 'gsap';

function sceneElements(root: HTMLElement) {
  const envelope = root.querySelector<SVGGElement>('[data-envelope]');
  const caption = root.querySelector<HTMLElement>('[data-hero-caption]');
  const actions = root.querySelector<HTMLElement>('[data-hero-actions]');
  const buttons = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-hero-actions] a'));
  if (!envelope || !caption || !actions || buttons.length !== 2) {
    throw new Error('Promotion animation requires an envelope, a caption and two actions.');
  }
  return { root, envelope, caption, actions, buttons, restoreFocus: false };
}

type Scene = ReturnType<typeof sceneElements>;

function focusPromise(scene: Scene) {
  const active = document.activeElement;
  const controlFocused = active instanceof HTMLButtonElement && scene.root.contains(active);
  if (controlFocused || (scene.restoreFocus && active === document.body)) {
    scene.buttons[0].focus({ preventScroll: true });
  }
  scene.restoreFocus = false;
}

function contentFlight(timeline: gsap.core.Timeline, scene: Scene, target: HTMLElement) {
  const index = [scene.caption, ...scene.buttons].indexOf(target);
  const at = ENVELOPE_BURST_AT + 0.08 + index * 0.16;
  const destination = target.getBoundingClientRect();
  let offset = { x: 0, y: 0 };
  timeline.call(
    () => {
      offset = promotionFlight(scene.envelope.getBoundingClientRect(), destination);
    },
    [],
    at,
  );
  timeline.fromTo(
    target,
    { x: () => offset.x, y: () => offset.y, scale: 0.12, opacity: 0, rotation: -12 },
    {
      keyframes: [
        { x: () => offset.x * 0.55, y: () => offset.y * 0.55 - 140 - index * 35, scale: 0.7, opacity: 1, rotation: 9 },
        { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 },
      ],
      duration: 1.2,
      ease: 'none',
      defaults: { ease: 'power2.inOut' },
      immediateRender: false,
    },
    at,
  );
}

function releaseContents(timeline: gsap.core.Timeline, scene: Scene) {
  timeline.addLabel('burst', ENVELOPE_BURST_AT);
  timeline.call(
    () => {
      scene.restoreFocus = document.activeElement?.getAttribute('data-testid') === 'hero-open';
      scene.root.dataset.animated = 'opening';
    },
    [],
    'burst',
  );
  burstEnvelope(timeline, scene.root);
  [scene.caption, ...scene.buttons].forEach((target) => contentFlight(timeline, scene, target));
}

function animationControls(scene: Scene, timeline: gsap.core.Timeline, pile: ReturnType<typeof createPaperPile>) {
  let stopped = false;
  const dispose = () => {
    stopped = true;
    timeline.kill();
    pile.stop();
    scene.actions.inert = false;
    scene.root.removeAttribute('data-animated');
  };
  return {
    setDraining: pile.setDraining,
    suspend: (suspended: boolean) => {
      if (!stopped) {
        timeline.paused(suspended);
        pile.suspend(suspended);
      }
    },
    burst: () => {
      if (!stopped && timeline.time() < ENVELOPE_BURST_AT) timeline.seek('burst', false).play();
    },
    finish: () => {
      if (stopped) return;
      timeline.progress(1);
      scene.actions.inert = false;
      focusPromise(scene);
      dispose();
    },
    dispose,
  };
}

export function createPromotionTimeline(root: HTMLElement) {
  const scene = sceneElements(root);
  const pile = createPaperPile(root);
  root.dataset.animated = 'arriving';
  scene.actions.inert = true;
  const timeline = gsap.timeline();
  // Measure destinations before applying the entrance transforms.
  releaseContents(timeline, scene);
  gsap.set([scene.caption, ...scene.buttons], { opacity: 0 });
  animateEnvelope(timeline, root);
  timeline.call(
    () => {
      root.dataset.animated = 'interactive';
      scene.actions.inert = false;
      focusPromise(scene);
      pile.enable();
    },
    [],
    ENVELOPE_BURST_AT + 1.65,
  );
  return animationControls(scene, timeline, pile);
}
