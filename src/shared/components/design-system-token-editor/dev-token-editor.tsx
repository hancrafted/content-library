export async function DevTokenEditor() {
  if (process.env.NODE_ENV !== 'development') return null;
  const { DesignSystemTokenEditor } = await import('./token-editor-loader.client');
  return <DesignSystemTokenEditor />;
}
