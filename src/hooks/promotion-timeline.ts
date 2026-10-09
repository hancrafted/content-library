import { animateEnvelope, burstEnvelope, ENVELOPE_BURST_AT, skipIndignation } from '@/hooks/promotion-envelope';
import { createPaperPile } from '@/hooks/promotion-pile';
import { promotionArc, promotionFlight } from '@/lib/promotion-flight.pure';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const WORD_STAGGER = 0.035;
const BUTTON_STAGGER = 0.14;
const INTERACTIVE_AFTER_BURST = 2.3;

function sceneElements(root: HTMLElement) {
  const envelope = root.querySelector<SVGGElement>('[data-envelope]');
  const caption = root.querySelector<HTMLElement>('[data-hero-caption]');
  const actions = root.querySelector<HTMLElement>('[data-hero-actions]');
  const buttons = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-hero-actions] a'));
  if (!envelope || !caption || !actions || buttons.length !== 1) {
    throw new Error('Promotion animation requires an envelope, a caption and one action.');
  }
  // Each caption word flies on its own; the split is reverted once the animation is over.
  const split = SplitText.create(caption, { type: 'words' });
  const words = split.words.filter((word): word is HTMLElement => word instanceof HTMLElement);
  return { root, envelope, caption, actions, buttons, words, split, restoreFocus: false };
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

function launchTime(scene: Scene, target: HTMLElement) {
  const index = [...scene.words, ...scene.buttons].indexOf(target);
  const buttonIndex = index - scene.words.length;
  if (buttonIndex < 0) return ENVELOPE_BURST_AT + 0.08 + index * WORD_STAGGER;
  return ENVELOPE_BURST_AT + 0.18 + scene.words.length * WORD_STAGGER + buttonIndex * BUTTON_STAGGER;
}

/** Each piece explodes out of the envelope along its own bowed arc straight to its resting place. */
function contentFlight(timeline: gsap.core.Timeline, scene: Scene, target: HTMLElement) {
  const at = launchTime(scene, target);
  const destination = target.getBoundingClientRect();
  let arc = promotionArc({ x: 0, y: 0 }, () => 0.5);
  let offset = { x: 0, y: 0 };
  timeline.call(
    () => {
      offset = promotionFlight(scene.envelope.getBoundingClientRect(), destination);
      arc = promotionArc(offset, Math.random);
    },
    [],
    at,
  );
  const apex = { x: () => arc.apex.x, y: () => arc.apex.y, rotation: () => arc.spin * -0.4 };
  timeline.fromTo(
    target,
    { x: () => offset.x, y: () => offset.y, scale: 0.15, opacity: 0, rotation: () => arc.spin },
    {
      keyframes: [
        { ...apex, scale: 0.85, opacity: 1, ease: 'power2.out' },
        { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, ease: 'power1.inOut' },
      ],
      duration: 1.2,
      ease: 'none',
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
  [...scene.words, ...scene.buttons].forEach((target) => contentFlight(timeline, scene, target));
}

type Pile = ReturnType<typeof createPaperPile>;

function disposer(scene: Scene, timeline: gsap.core.Timeline, pile: Pile) {
  let stopped = false;
  const dispose = () => {
    stopped = true;
    timeline.kill();
    pile.stop();
    if (scene.split.isSplit) scene.split.revert();
    scene.actions.inert = false;
    scene.root.removeAttribute('data-animated');
  };
  return { dispose, isStopped: () => stopped };
}

function animationControls(scene: Scene, timeline: gsap.core.Timeline, pile: Pile) {
  const { dispose, isStopped } = disposer(scene, timeline, pile);
  return {
    setDraining: pile.setDraining,
    setProximity: pile.setProximity,
    suspend: (suspended: boolean) => {
      if (!isStopped()) {
        timeline.paused(suspended);
        pile.suspend(suspended);
      }
    },
    burst: () => {
      if (isStopped() || timeline.time() >= ENVELOPE_BURST_AT) return;
      skipIndignation(timeline, scene.root);
      timeline.seek('burst', false).play();
    },
    finish: () => {
      if (isStopped()) return;
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
  gsap.set([...scene.words, ...scene.buttons], { opacity: 0 });
  animateEnvelope(timeline, root);
  timeline.call(
    () => {
      root.dataset.animated = 'interactive';
      scene.actions.inert = false;
      focusPromise(scene);
      pile.enable();
      scene.split.revert();
    },
    [],
    ENVELOPE_BURST_AT + INTERACTIVE_AFTER_BURST,
  );
  return animationControls(scene, timeline, pile);
}
