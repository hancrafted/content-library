import type { Page } from '@playwright/test';
import axe from 'axe-core';

/*
 * Dimmed on purpose, and so left out of the contrast rule only: the back badges of the onboard-ai-every-time hero (marked `data-a11y-decorative`),
 * faded echoes of earlier "Day 1" badges whose fade is the picture. Every other rule still checks them.
 */
export const DIMMED = ['[data-a11y-decorative]'];

/** Every WCAG A and AA violation on the page, as `impact rule: target` lines. */
export async function violations(page: Page): Promise<string[]> {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axe.source });
  return page.evaluate(async (dimmed) => {
    const run = (window as unknown as { axe: typeof axe }).axe.run;
    const tags = { type: 'tag' as const, values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] };
    const rest = await run(document, { runOnly: tags, rules: { 'color-contrast': { enabled: false } } });
    const contrast = await run({ exclude: dimmed.map((d) => [d]) }, { runOnly: ['color-contrast'] });
    return [...rest.violations, ...contrast.violations].flatMap((v) =>
      v.nodes.map((n) => {
        const data = n.any[0]?.data as { contrastRatio?: number; fgColor?: string; bgColor?: string } | undefined;
        const ratio = data?.contrastRatio ? ` [${data.fgColor} on ${data.bgColor} = ${data.contrastRatio}]` : '';
        return `${v.impact} ${v.id}: ${n.target.join(' ')}${ratio}`;
      }),
    );
  }, DIMMED);
}
