import { createPaperPile } from '@/hooks/promotion-pile';
import { promotionFlight } from '@/lib/promotion-flight.pure';
import gsap from 'gsap';

const BURST_AT = 5.3;

function sceneElements(root: HTMLElement) {
  const slots = Array.from(root.querySelectorAll<HTMLElement>('[data-caption-word]'));
  const flyers = Array.from(root.querySelectorAll<HTMLElement>('[data-flying-word]'));
  const envelope = root.querySelector<SVGGElement>('[data-envelope]');
  const caption = root.querySelector<HTMLElement>('[data-hero-caption]');
  if (!envelope || !caption || slots.length !== flyers.length || slots.length !== 3) {
    throw new Error('Promotion animation requires one envelope, a caption and three matching words.');
  }
  return {
    root,
    slots,
    flyers,
    envelope,
    caption,
    flap: root.querySelector('[data-envelope-flap]'),
    open: root.querySelector('[data-envelope-open]'),
    seal: root.querySelector('[data-envelope-seal]'),
    tear: root.querySelector('[data-envelope-tear]'),
  };
}

type Scene = ReturnType<typeof sceneElements>;

function focusPromise(root: HTMLElement) {
  if (document.activeElement instanceof HTMLButtonElement && root.contains(document.activeElement)) {
    root.querySelector<HTMLAnchorElement>('[data-hero-primary]')?.focus({ preventScroll: true });
  }
}

function prepareScene(scene: Scene) {
  scene.root.dataset.animated = 'arriving';
  gsap.set([scene.open, scene.tear], { opacity: 0 });
  gsap.set([scene.flap, scene.seal], { opacity: 1 });
  gsap.set(scene.slots, { opacity: 0 });
}

function arriveAndWait(timeline: gsap.core.Timeline, scene: Scene) {
  timeline.fromTo(
    scene.envelope,
    { x: 520, y: -36, rotation: 8 },
    { x: 0, y: 0, rotation: 0, duration: 0.8, ease: 'power3.out' },
    0.5,
  );
  timeline.call(
    () => {
      scene.root.dataset.animated = 'waiting';
    },
    [],
    1.3,
  );
  timeline.to(
    scene.envelope,
    {
      x: 1.8,
      rotation: 0.5,
      transformOrigin: '50% 80%',
      duration: 0.09,
      repeat: 43,
      yoyo: true,
    },
    1.3,
  );
  timeline.to(scene.tear, { opacity: 0.9, duration: 3.2 }, 1.8);
}

function openEnvelope(timeline: gsap.core.Timeline, scene: Scene) {
  timeline.addLabel('burst', BURST_AT);
  timeline.call(
    () => {
      focusPromise(scene.root);
      scene.root.dataset.animated = 'opening';
    },
    [],
    'burst',
  );
  timeline.to(
    scene.flap,
    {
      scaleY: 0,
      transformOrigin: '50% 0%',
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in',
    },
    'burst',
  );
  timeline.to(scene.seal, { y: 18, rotation: 30, opacity: 0, duration: 0.4 }, 'burst');
  timeline.fromTo(
    scene.open,
    { scaleY: 0, opacity: 0, transformOrigin: '50% 100%' },
    { scaleY: 1, opacity: 1, duration: 0.45, ease: 'power3.out' },
    'burst+=0.12',
  );
  timeline.to(scene.envelope, { x: 0, rotation: 0, duration: 0.3 }, 'burst');
}

function departure(scene: Scene, slot: HTMLElement, index: number) {
  return {
    x: () => promotionFlight(scene.envelope.getBoundingClientRect(), slot.getBoundingClientRect()).x,
    y: () => promotionFlight(scene.envelope.getBoundingClientRect(), slot.getBoundingClientRect()).y,
    rotation: -12 + index * 6,
    scale: 0.8,
    opacity: 0,
    filter: 'blur(3px)',
  };
}

const LANDED_WORD = {
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  opacity: 1,
  filter: 'blur(0px)',
  duration: 1.05,
  ease: 'power3.inOut',
  immediateRender: false,
};

function wordFlights(timeline: gsap.core.Timeline, scene: Scene) {
  scene.flyers.forEach((flyer, index) => {
    const slot = scene.slots[index];
    const at = BURST_AT + 0.2 + index * 0.16;
    timeline.set(
      flyer,
      {
        left: () => slot.getBoundingClientRect().left - scene.root.getBoundingClientRect().left,
        top: () => slot.getBoundingClientRect().top - scene.root.getBoundingClientRect().top,
        fontSize: () => getComputedStyle(slot).fontSize,
        lineHeight: () => getComputedStyle(slot).lineHeight,
      },
      at,
    );
    // GSAP mutates startAt, so each word needs an independent options object.
    timeline.fromTo(flyer, departure(scene, slot, index), { ...LANDED_WORD }, at);
    timeline.set(slot, { opacity: 1 }, at + 1.05);
    timeline.set(flyer, { opacity: 0 }, at + 1.05);
  });
}

function animationControls(scene: Scene, timeline: gsap.core.Timeline, pile: ReturnType<typeof createPaperPile>) {
  const dispose = () => {
    pile.stop();
    scene.root.removeAttribute('data-animated');
    scene.slots.forEach((slot) => slot.removeAttribute('tabindex'));
  };
  return {
    setDraining: pile.setDraining,
    suspend: (suspended: boolean) => {
      timeline.paused(suspended);
      pile.suspend(suspended);
    },
    burst: () => {
      if (timeline.time() < BURST_AT) timeline.seek('burst', false).play();
    },
    finish: () => {
      timeline.progress(1);
      focusPromise(scene.root);
      dispose();
    },
    dispose,
  };
}

export function createPromotionTimeline(root: HTMLElement) {
  const scene = sceneElements(root);
  const pile = createPaperPile(root);
  prepareScene(scene);
  const timeline = gsap.timeline();
  arriveAndWait(timeline, scene);
  openEnvelope(timeline, scene);
  wordFlights(timeline, scene);
  timeline.call(
    () => {
      root.dataset.animated = 'interactive';
      scene.slots.forEach((slot) => {
        slot.tabIndex = 0;
      });
      pile.enable();
    },
    [],
    BURST_AT + 1.6,
  );
  return animationControls(scene, timeline, pile);
}
