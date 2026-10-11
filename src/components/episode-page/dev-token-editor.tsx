/**
 * The dev-only design-system token editor, rendered inside the Episode page so
 * it reads the page's URL-state service. The condition is a build-time
 * constant, so `next build` drops the import and the editor's chunk is never
 * emitted.
 */
export async function DevTokenEditor() {
  if (process.env.NODE_ENV !== 'development') return null;
  const { DesignSystemTokenEditor } =
    await import('@/components/design-system-token-editor/token-editor-loader.client');
  return <DesignSystemTokenEditor />;
}
