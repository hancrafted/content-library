import { expect, type Locator } from '@playwright/test';

/**
 * Waits until React has hydrated an element, so a click on it reaches its handler and is not lost to the static
 * markup: a retrying poll for the `__reactProps` key React 19 puts on every hydrated DOM node, never a sleep. The
 * locator must match one element.
 */
export async function hydrated(locator: Locator): Promise<void> {
  await expect
    .poll(() => locator.evaluate((el) => Object.keys(el).some((key) => key.startsWith('__reactProps'))))
    .toBe(true);
}
