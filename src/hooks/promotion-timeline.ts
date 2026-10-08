import { promotionFlight } from '@/lib/promotion-flight.pure';
import gsap from 'gsap';

function focusPromise(root: HTMLElement) {
  if (document.activeElement instanceof HTMLButtonElement && root.contains(document.activeElement)) {
    root.querySelector<HTMLAnchorElement>('[data-hero-primary]')?.focus({ preventScroll: true });
  }
}

function sceneElements(root: HTMLElement) {
  const papers = gsap.utils.toArray<SVGGElement>('[data-task-paper]', root);
  const slots = Array.from(root.querySelectorAll<HTMLElement>('[data-caption-word]'));
  const flyers = Array.from(root.querySelectorAll<HTMLElement>('[data-flying-word]'));
  const envelope = root.querySelector<SVGGElement>('[data-envelope]');
  if (!envelope || slots.length !== flyers.length || slots.length !== 3) {
    throw new Error('Promotion animation requires one envelope and three matching caption words.');
  }
  return {
    root,
    papers,
    slots,
    flyers,
    envelope,
    flap: root.querySelector('[data-envelope-flap]'),
    open: root.querySelector('[data-envelope-open]'),
    seal: root.querySelector('[data-envelope-seal]'),
    tear: root.querySelector('[data-envelope-tear]'),
  };
}

type Scene = ReturnType<typeof sceneElements>;

function prepareScene(scene: Scene) {
  scene.root.dataset.animated = 'building';
  gsap.set([scene.open, scene.tear], { opacity: 0 });
  gsap.set([scene.flap, scene.seal], { opacity: 1 });
  // A slight softening, never hidden words: the whole sentence remains readable.
  gsap.set(scene.slots, { filter: 'blur(0.65px)' });
}

function nudgePile(timeline: gsap.core.Timeline, scene: Scene) {
  timeline.to(
    scene.root.querySelector('[data-task-pile]'),
    {
      x: 1.5,
      rotation: 0.3,
      duration: 0.07,
      repeat: 15,
      yoyo: true,
      transformOrigin: '50% 100%',
    },
    0.1,
  );
}

function pileAndBait(timeline: gsap.core.Timeline, scene: Scene) {
  timeline.fromTo(
    scene.papers,
    { x: 90, y: -24, opacity: 0 },
    { x: 0, y: 0, opacity: 1, duration: 0.4, stagger: 0.14, ease: 'power3.out' },
    0,
  );
  nudgePile(timeline, scene);
  timeline.fromTo(scene.envelope, { y: 65 }, { y: -30, duration: 1.1, ease: 'power2.out' }, 0);
  timeline.to(
    scene.envelope,
    {
      rotation: 1.3,
      x: 1.5,
      transformOrigin: '50% 70%',
      duration: 0.08,
      repeat: 7,
      yoyo: true,
      ease: 'sine.inOut',
    },
    1.2,
  );
  timeline.to(scene.tear, { opacity: 0.8, duration: 0.5 }, 1.4);
}

function openEnvelope(timeline: gsap.core.Timeline, scene: Scene) {
  timeline.addLabel('burst', 2);
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
    const at = 2.2 + index * 0.16;
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
    // GSAP mutates the options with startAt; each word needs its own departure.
    timeline.fromTo(flyer, departure(scene, slot, index), { ...LANDED_WORD }, at);
    timeline.to(slot, { filter: 'blur(0px)', duration: 0.2 }, at + 0.85);
    timeline.set(flyer, { opacity: 0 }, at + 1.05);
  });
}

function drainPile(scene: Scene, settle: () => void) {
  const drain = gsap.timeline({
    paused: true,
    onComplete: settle,
    onStart: () => {
      scene.root.dataset.animated = 'draining';
    },
  });
  drain.to([...scene.papers].reverse(), {
    x: 110,
    y: 60,
    opacity: 0,
    rotation: 9,
    duration: 0.9,
    stagger: 0.42,
    ease: 'power2.in',
  });
  drain.to(scene.envelope, { y: 65, rotation: 0, duration: 2.8, ease: 'power2.inOut' }, 0);
  return drain;
}

function settleScene(root: HTMLElement) {
  focusPromise(root);
  root.removeAttribute('data-animated');
}

export function createPromotionTimeline(root: HTMLElement) {
  const scene = sceneElements(root);
  const settle = () => settleScene(root);
  prepareScene(scene);
  const timeline = gsap.timeline();
  const drain = drainPile(scene, settle);
  pileAndBait(timeline, scene);
  openEnvelope(timeline, scene);
  wordFlights(timeline, scene);
  timeline.call(
    () => {
      drain.play();
    },
    [],
    3.7,
  );
  return {
    drain,
    settle,
    burst: () => {
      if (timeline.time() < 2) timeline.seek('burst', false).play();
    },
    finish: () => {
      timeline.progress(1);
      drain.progress(1);
      settle();
    },
  };
}
