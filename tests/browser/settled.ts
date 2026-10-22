import { expect, type Locator } from '@playwright/test';

/**
 * Waits until an animating element of a Shared visual reports `data-motion="settled"` (ARCH-003 §5): a retrying
 * `expect` on the page itself, never a sleep. The element reports `running` from the render in which the state that
 * sets its motion off changes (not from the browser's first `transitionrun`), counts its own CSS transitions and
 * keyframe animations, and settles on its own a couple of animation frames later when none starts (reduced motion),
 * so this never waits on a motion that will not come. The locator must match one element.
 */
export async function settled(locator: Locator): Promise<void> {
  await expect(locator).toHaveAttribute('data-motion', 'settled');
}
