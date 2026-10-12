/**
 * The dev-only design-system token editor's trigger, rendered in the site header
 * so it shows on every page. The condition is a build-time constant, so
 * `next build` drops the import and the editor's chunk is never emitted.
 */
export async function DevTokenEditor() {
  if (process.env.NODE_ENV !== 'development') return null;
  const { DesignSystemTokenEditor } = await import('./token-editor-loader.client');
  return <DesignSystemTokenEditor />;
}
