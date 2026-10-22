/** The link that opens ChatGPT with the text prefilled in a new tab. */
export function chatLinks(text: string): { readonly chatgpt: string } {
  return { chatgpt: `https://chatgpt.com/?q=${encodeURIComponent(text)}` };
}

/** The longest encoded prompt a `?q=` link carries; past it the chat tools and browsers drop or reject the link. */
export const MAX_LINK_QUERY = 6000;

/**
 * Where "open in" goes: the prefilled link, or an empty chat when the prompt is too long for one
 * (`tooLong`: the caller copies the prompt so it can be pasted there).
 */
export function openInLinks(text: string): { readonly chatgpt: string; readonly tooLong: boolean } {
  if (encodeURIComponent(text).length > MAX_LINK_QUERY) return { chatgpt: 'https://chatgpt.com/', tooLong: true };
  return { ...chatLinks(text), tooLong: false };
}
