import { createSurfaceClock } from '@/shared/lib/surface-clock';
import { describe, expect, it } from 'vitest';
import { publishTitleDeparture } from './title-departure';

function fakeElement(hosts: readonly HTMLElement[] = []) {
  const style = new Map<string, string>();
  const attributes = new Map<string, string>();
  return {
    style: {
      getPropertyValue: (name: string) => style.get(name) ?? '',
      setProperty: (name: string, value: string) => style.set(name, value),
      removeProperty: (name: string) => style.delete(name),
    },
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
    querySelectorAll: () => hosts,
  } as unknown as HTMLElement;
}

const geometry = {
  viewport: 800,
  maximum: 1800,
  samplingLine: 96,
  surfaces: [
    { id: 'title', top: 0, tone: 'normal' as const },
    { id: 'next', top: 2000, tone: 'normal' as const, anchorOffset: 96 },
  ],
};

describe('success cases', () => {
  it('writes the per-frame progress on the ToC host, not on the page root above every Slide', () => {
    // ARRANGE
    const toc = fakeElement();
    const root = fakeElement([toc]);
    const clock = createSurfaceClock();
    clock.setGeometry(geometry, 1500);
    // ACT
    publishTitleDeparture(root, clock, () => ({ start: 0, end: 1 }));
    // ASSERT
    expect(toc.style.getPropertyValue('--title-departure-progress')).toBe('0.5');
    expect(root.style.getPropertyValue('--title-departure-progress')).toBe('');
    expect(root.getAttribute('data-title-departure')).toBe('moving');
  });
});

describe('failure cases', () => {
  it('still marks the departure on the root when the page has no ToC host to move', () => {
    // ARRANGE
    const root = fakeElement();
    const clock = createSurfaceClock();
    clock.setGeometry(geometry, 1500);
    // ACT
    publishTitleDeparture(root, clock, () => ({ start: 0, end: 1 }));
    // ASSERT
    expect(root.getAttribute('data-title-departure')).toBe('moving');
    expect(root.style.getPropertyValue('--title-departure-progress')).toBe('');
  });
});

describe('edge cases', () => {
  it('takes the progress off the ToC host when the publication is disposed', () => {
    // ARRANGE
    const toc = fakeElement();
    const root = fakeElement([toc]);
    const clock = createSurfaceClock();
    clock.setGeometry(geometry, 1500);
    const dispose = publishTitleDeparture(root, clock, () => ({ start: 0, end: 1 }));
    // ACT
    dispose();
    // ASSERT
    expect(toc.style.getPropertyValue('--title-departure-progress')).toBe('');
    expect(root.getAttribute('data-title-departure')).toBeNull();
  });
});
