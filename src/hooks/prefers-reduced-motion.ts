/** Whether the reader asked the OS for reduced motion; browser-only, call from effects or callbacks. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
