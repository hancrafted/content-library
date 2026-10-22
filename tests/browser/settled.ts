import { expect, type Locator } from '@playwright/test';

/**
 * Waits until an animating element of a Shared visual reports `data-motion="settled"` (ARCH-003 §5): a retrying
 * `expect` on the page itself, never a sleep. The locator must match one element.
 */
export async function settled(locator: Locator): Promise<void> {
  await expect(locator).toHaveAttribute('data-motion', 'settled');
}
