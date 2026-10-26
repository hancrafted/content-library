/**
 * Dev-only: rendered inside a page under its URL-state provider, so the token editor
 * in the header learns which Slide is active (via `useActiveSlide()`, FE-001 §2.3),
 * and the source folder the page names (`folder`, a prop). Dropped from `next build` like the editor itself.
 */
export async function DevSlideReporter({ folder }: { folder: string }) {
  if (process.env.NODE_ENV !== 'development') return null;
  const { SlideReporter } = await import('./slide-reporter.client');
  return <SlideReporter folder={folder} />;
}
