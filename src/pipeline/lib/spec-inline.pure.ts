// A Spec page is self-contained: its compiled design.css sits in the page as `<style data-design-css>`, not beside it
// as a file, so the page opens from a download, an attachment or any folder. The frame still links `design.css` for
// the designers' previews; the assembler swaps the link for the css once it is compiled.

const DESIGN_LINK = /<link\s+rel="stylesheet"\s+href="design\.css"\s*\/?>/;

/** Whether the page still links its `design.css`, so it is not yet self-contained. */
export const hasDesignLink = (html: string): boolean => DESIGN_LINK.test(html);

/** `html` with its `design.css` link replaced by `css` inline; a page without the link is returned as it is. */
export function inlineDesignCss(html: string, css: string): string {
  if (!hasDesignLink(html)) return html;
  if (/<\/style/i.test(css)) throw new Error('design.css holds "</style" and cannot be inlined');
  return html.replace(DESIGN_LINK, () => `<style data-design-css>${css}</style>`);
}
