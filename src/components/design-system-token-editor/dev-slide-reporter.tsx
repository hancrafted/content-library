/**
 * Dev-only: rendered inside an Episode page, under its URL-state provider, so the
 * token editor in the header learns which Slide is active (via `useActiveSlide()`,
 * FE-001 §2.3). Dropped from `next build` like the editor itself.
 */
export async function DevSlideReporter() {
  if (process.env.NODE_ENV !== 'development') return null;
  const { SlideReporter } = await import('./slide-reporter.client');
  return <SlideReporter />;
}
