/*
 * The page `npm run episode:spec-preview` renders: a designer's fragment inside the Spec's own frame, so what a
 * designer measures is what the user sees. The shell is the Spec's (`spec-shell` with its outline column, `spec-page`),
 * so the Option stage has the Spec's exact width at every viewport; only the tab script is left out, which lets
 * every Option show, stacked, each its own screenshot target.
 */
import { fragmentSlides, pickBox } from '../../../src/lib/episode-spec-fragment.pure.ts';

/** Marks each element of an Option that runs past the Option's box, by `data-overflow`, once the page has laid out. */
const OVERFLOW_SCRIPT = `<script>
addEventListener('load', () => {
  for (const figure of document.querySelectorAll('[data-spec="option"]')) {
    const edge = figure.getBoundingClientRect().right;
    for (const element of figure.querySelectorAll('*')) {
      const rect = element.getBoundingClientRect();
      const wider = element.clientWidth > 0 && element.scrollWidth > element.clientWidth + 1;
      if (wider || (rect.width > 0 && rect.right > edge + 1)) element.setAttribute('data-overflow', '');
    }
  }
});
</script>`;

/** The frame with its tab script cut and its body left open for the page. */
function frameHead(frame: string): string {
  return frame.replace(/<script>[\s\S]*?<\/script>\s*/, '').replace(/\s*<\/head>[\s\S]*$/, '\n  </head>');
}

/** One Slide as the Spec lays it out, its Options stacked under the head. */
function slideMarkup(slug: string, html: string): string {
  const withBoxes = html.replace(
    /(<figure\b[^>]*data-option="([^"]+)"[^>]*>)/g,
    (tag, _all, id: string) => `${tag}${pickBox(slug, id)}`,
  );
  const number = /data-option="(\d+)/.exec(html)?.[1] ?? '0';
  const attrs = slug === 'top' ? 'data-spec="title-slide"' : `data-spec="slide" data-number="${number}"`;
  return `<article ${attrs} id="${slug}">
  <header class="spec-slide-head"><span class="spec-number">${number}</span><h3>${slug}</h3></header>
  <div class="spec-options">${withBoxes}</div>
</article>`;
}

/** The Option ids of a fragment, in order. */
export function optionIds(fragment: string): string[] {
  return [...fragment.matchAll(/<figure\b[^>]*data-option="([^"]+)"/g)].map((match) => match[1] ?? '');
}

/** The full preview page for a fragment, given the Spec frame. */
export function previewPage(frame: string, fragment: string): string {
  const slides = fragmentSlides(fragment).map(({ slug, html }) => slideMarkup(slug, html));
  return `${frameHead(frame)}
  <body>
    <div class="spec-shell">
      <nav class="spec-outline" aria-label="Slides"></nav>
      <main class="spec-page">
${slides.join('\n')}
      </main>
    </div>
    ${OVERFLOW_SCRIPT}
  </body>
</html>
`;
}
