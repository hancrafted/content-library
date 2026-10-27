/** Hands the browser a text file to save: the one download the human-in-the-loop controls use (the context window's own downloads are separate). */
export function saveFile({
  name,
  text,
  type,
}: {
  readonly name: string;
  readonly text: string;
  readonly type: string;
}) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = Object.assign(document.createElement('a'), { download: name });
  link.setAttribute('href', url);
  link.click();
  URL.revokeObjectURL(url);
}
