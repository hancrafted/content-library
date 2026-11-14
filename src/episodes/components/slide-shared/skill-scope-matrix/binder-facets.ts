/*
 * The faceted sky with its cloud over the Surface sea and the lit waterline; the green project binder with its
 * tabbed sheets and label in front of the ship.
 * Lifted from the approved Spec Option 18a, in the picture's own 380 by 145 space.
 */
import type { SquareFacets } from './square-facet';

export const BINDER: SquareFacets = {
  back: [
    { tone: 'sky-1', d: 'M312.1 -2L268 22.4L222.2 -2ZM77.2 -2L139.9 -2L88 33.2Z' },
    { tone: 'sky-2', d: 'M178 29.9L139.9 -2L222.2 -2Z' },
    { tone: 'sky-1', d: 'M268 22.4L178 29.9L222.2 -2Z' },
    { tone: 'sky-2', d: 'M139.9 -2L178 29.9L88 33.2Z' },
    { tone: 'sky-1', d: 'M358 14L268 22.4L312.1 -2Z' },
    { tone: 'sky-2', d: 'M358 14L312.1 -2L382 -2ZM382 13.7L358 14L382 -2Z' },
    { tone: 'sky-1', d: 'M77.2 -2L46.6 15.9L-2 -2ZM46.6 15.9L-2 31.5L-2 -2Z' },
    { tone: 'sky-2', d: 'M-2 31.5L46.6 15.9L88 33.2ZM46.6 15.9L77.2 -2L88 33.2Z' },
    { tone: 'sky-3', d: 'M88 43.3L-2 50.8L-2 31.5Z' },
    { tone: 'sky-2', d: 'M382 22.6L358 14L382 13.7Z' },
    { tone: 'sky-3', d: 'M178 29.9L268 28.7L178 39.8ZM268 28.7L178 29.9L268 22.4Z' },
    { tone: 'sky-2', d: 'M88 43.3L88 33.2L178 39.8Z' },
    { tone: 'sky-3', d: 'M88 33.2L178 29.9L178 39.8Z' },
    { tone: 'sky-2', d: 'M88 33.2L88 43.3L-2 31.5ZM358 24.1L358 14L382 22.6ZM358 14L358 24.1L268 22.4Z' },
    { tone: 'sky-3', d: 'M358 24.1L268 28.7L268 22.4Z' },
    { tone: 'sky-4', d: 'M178 39.8L261 56.6L182.7 60.2ZM88 43.3L178 39.8L182.7 60.2Z' },
    {
      tone: 'sky-3',
      d: 'M147 76.4L88 43.3L182.7 60.2ZM268 28.7L261 56.6L178 39.8ZM268 28.7L338.3 59.4L261 56.6ZM261 56.6L222.3 76.4L182.7 60.2ZM222.3 76.4L147 76.4L182.7 60.2ZM70.6 76.4L88 43.3L147 76.4ZM70.6 76.4L-2 76.4L-2 50.8ZM88 43.3L70.6 76.4L-2 50.8Z',
    },
    {
      tone: 'sky-4',
      d: 'M338.3 59.4L382 47L382 76.4ZM298.1 76.4L338.3 59.4L382 76.4ZM338.3 59.4L298.1 76.4L261 56.6ZM298.1 76.4L222.3 76.4L261 56.6Z',
    },
    { tone: 'sky-3', d: 'M268 28.7L358 24.1L338.3 59.4Z' },
    { tone: 'sky-4', d: 'M358 24.1L382 47L338.3 59.4ZM382 47L358 24.1L382 22.6Z' },
    { tone: 'cloud-lit', d: 'M300.9 -17.9L284.7 8.8L290.1 -19.5Z' },
    { tone: 'cloud-shade', d: 'M342.8 28.5L330.8 29.9L342.2 23.1Z' },
    {
      tone: 'cloud-lit',
      d: 'M250 -10.7L257.8 3.3L242.3 -6.8ZM250 -10.7L259 -13L257.8 3.3ZM268.9 -12.3L284.7 8.8L257.8 3.3ZM259 -13L268.9 -12.3L257.8 3.3Z',
    },
    { tone: 'cloud-shade', d: 'M251.9 22.7L284.7 8.8L273.6 36.4Z' },
    { tone: 'cloud-lit', d: 'M284.7 8.8L251.9 22.7L257.8 3.3Z' },
    { tone: 'cloud-shade', d: 'M330.8 29.9L337.7 18.5L342.2 23.1Z' },
    {
      tone: 'cloud-lit',
      d: 'M337 12.6L337.7 18.5L333.1 7.4ZM284.7 8.8L278.8 -17L290.1 -19.5ZM268.9 -12.3L278.8 -17L284.7 8.8Z',
    },
    {
      tone: 'cloud-shade',
      d: 'M337.7 18.5L323 30.7L333.1 7.4ZM323 30.7L337.7 18.5L330.8 29.9ZM306 6L323 30.7L312.9 31.9Z',
    },
    { tone: 'cloud-lit', d: 'M309 -12.4L306 6L300.9 -17.9ZM306 6L284.7 8.8L300.9 -17.9Z' },
    {
      tone: 'cloud-shade',
      d: 'M306 6L312.9 31.9L303 33.1ZM265.2 36.4L251.9 22.7L273.6 36.4ZM265.2 36.4L255.9 36.4L251.9 22.7Z',
    },
    { tone: 'cloud-lit', d: 'M251.9 22.7L245.9 36.4L238.5 36.4Z' },
    { tone: 'cloud-shade', d: 'M255.9 36.4L245.9 36.4L251.9 22.7Z' },
    { tone: 'cloud-lit', d: 'M227.8 36.4L218.6 36.4L219.4 34.3ZM209.4 23.9L213.2 31.9L204.4 28.5Z' },
    {
      tone: 'cloud-shade',
      d: 'M306 6L294.7 34L284.7 8.8ZM294.7 34L306 6L303 33.1ZM294.7 34L281.6 35.5L284.7 8.8ZM306 6L318.8 0.6L323 30.7Z',
    },
    { tone: 'cloud-lit', d: 'M213.2 31.9L212.3 19.2L219.4 34.3ZM209.4 23.9L212.3 19.2L213.2 31.9Z' },
    { tone: 'cloud-shade', d: 'M284.7 8.8L274.5 36.4L273.6 36.4ZM281.6 35.5L274.5 36.4L284.7 8.8Z' },
    { tone: 'cloud-lit', d: 'M314.3 -5.4L306 6L309 -12.4ZM314.3 -5.4L318.8 0.6L306 6Z' },
    { tone: 'cloud-shade', d: 'M323 30.7L327.1 3.2L333.1 7.4Z' },
    {
      tone: 'cloud-lit',
      d: 'M318.8 0.6L327.1 3.2L323 30.7ZM223.7 12.1L227.8 36.4L219.4 34.3ZM212.3 19.2L216.7 15L219.4 34.3ZM216.7 15L223.7 12.1L219.4 34.3ZM227.8 36.4L232.6 10.9L238.5 36.4ZM223.7 12.1L232.6 10.9L227.8 36.4ZM232.6 10.9L251.9 22.7L238.5 36.4ZM251.9 22.7L232.6 10.9L257.8 3.3ZM257.8 3.3L236.9 -1.3L242.3 -6.8ZM232.6 10.9L233.6 4.7L257.8 3.3ZM233.6 4.7L236.9 -1.3L257.8 3.3Z',
    },
    {
      tone: 'sea-surface-lit',
      d: 'M178 75.4L238 74.5L208.7 100.9ZM238 74.5L272.5 111.8L208.7 100.9ZM272.5 111.8L240.8 147L208.7 100.9Z',
    },
    { tone: 'sea-surface', d: 'M29 104.3L-2 112.9L-2 78.6Z' },
    {
      tone: 'sea-surface-lit',
      d: 'M-2 112.9L29 104.3L-2 147ZM298 74.3L332.1 113.9L272.5 111.8ZM238 74.5L298 74.3L272.5 111.8Z',
    },
    { tone: 'sea-surface', d: 'M332.1 113.9L279.3 147L272.5 111.8ZM279.3 147L240.8 147L272.5 111.8Z' },
    { tone: 'sea-surface-lit', d: 'M29 104.3L46.6 147L-2 147ZM46.6 147L29 104.3L77.3 111.2Z' },
    { tone: 'sea-surface', d: 'M118 77.6L148 147L77.3 111.2Z' },
    { tone: 'sea-surface-lit', d: 'M58 78L118 77.6L77.3 111.2ZM29 104.3L58 78L77.3 111.2Z' },
    { tone: 'sea-surface', d: 'M58 78L29 104.3L-2 78.6Z' },
    { tone: 'sea-surface-lit', d: 'M298 74.3L358 72.4L332.1 113.9Z' },
    {
      tone: 'sea-surface',
      d: 'M382 111.6L358 72.4L382 72.5ZM358 72.4L382 111.6L332.1 113.9ZM342.4 147L279.3 147L332.1 113.9ZM342.4 147L382 111.6L382 147ZM382 111.6L342.4 147L332.1 113.9Z',
    },
    { tone: 'sea-surface-lit', d: 'M240.8 147L181.2 147L208.7 100.9Z' },
    {
      tone: 'sea-surface',
      d: 'M83 147L46.6 147L77.3 111.2ZM148 147L83 147L77.3 111.2ZM164.8 114.5L178 75.4L208.7 100.9ZM181.2 147L164.8 114.5L208.7 100.9ZM164.8 114.5L181.2 147L148 147Z',
    },
    { tone: 'sea-surface-lit', d: 'M164.8 114.5L118 77.6L178 75.4Z' },
    { tone: 'sea-surface', d: 'M164.8 114.5L148 147L118 77.6Z' },
    { tone: 'glow-soft', d: 'M0 72.4L380 73.6L380 77.2L0 78.4Z' },
    { tone: 'glow', d: 'M6 74L374 74.4L374 76.4L6 76.8Z' },
  ],
  front: [
    { tone: 'drop', d: 'M42 38L122 40L122 124L42 124Z' },
    { tone: 'paper', d: 'M104 42L128 44L128 56L104 56Z' },
    { tone: 'paper-lit', d: 'M104 58L128 60L128 72L104 72Z' },
    { tone: 'paper', d: 'M104 74L128 76L128 88L104 88Z' },
    { tone: 'tab-a', d: 'M124 44L130 45L130 54L124 54Z' },
    { tone: 'tab-b', d: 'M124 60L130 61L130 70L124 70Z' },
    { tone: 'tab-c', d: 'M124 76L130 77L130 86L124 86Z' },
    { tone: 'binder-lit', d: 'M38 34L114 31L38 120Z' },
    { tone: 'binder', d: 'M114 31L114 118L38 120Z' },
    { tone: 'binder-shade', d: 'M38 34L47 33L47 120L38 120Z' },
    { tone: 'paper-lit', d: 'M54 46L106 44L106 62L54 64Z' },
    { tone: 'paper-rule', d: 'M58 53L100 51.5L100 55L58 56.5Z' },
  ],
};
