/** The links that open a chat tool with the text prefilled in a new tab. */
export function chatLinks(text: string): { readonly chatgpt: string; readonly claude: string } {
  const q = encodeURIComponent(text);
  return { chatgpt: `https://chatgpt.com/?q=${q}`, claude: `https://claude.ai/new?q=${q}` };
}
