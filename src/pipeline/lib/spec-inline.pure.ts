const DESIGN_LINK = /<link\s+rel="stylesheet"\s+href="design\.css"\s*\/?>/;

export const hasDesignLink = (html: string): boolean => DESIGN_LINK.test(html);

export function inlineDesignCss(html: string, css: string): string {
  if (!hasDesignLink(html)) return html;
  if (/<\/style/i.test(css)) throw new Error('design.css holds "</style" and cannot be inlined');
  return html.replace(DESIGN_LINK, () => `<style data-design-css>${css}</style>`);
}
