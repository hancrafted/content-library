// decision: FE-001 §2.3
export async function DevSlideReporter({ folder }: { folder: string }) {
  if (process.env.NODE_ENV !== 'development') return null;
  const { SlideReporter } = await import('./slide-reporter.client');
  return <SlideReporter folder={folder} />;
}
