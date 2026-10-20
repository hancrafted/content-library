// A two-Slide Spec in the shape `write-spec` emits (design-ADR 0011), small enough to read in a test.
export const SPEC = `<!doctype html><html><head><title>Spec</title><style>.spec-card{padding:1rem}</style>
<link rel="stylesheet" href="design.css" /><script>/* option tabs */</script>
<script type="application/json" id="spec-meta">{"type":"spec"}</script></head><body>
<div class="spec-shell">
<nav class="spec-outline" aria-label="Slides"><ol>
  <li><span class="spec-outline-section">Episode</span><ol><li><a href="#top">0 · Title slide and section slides</a></li></ol></li>
  <li><span class="spec-outline-section">Why cash</span><ol>
    <li><a href="#watch-cash">1 · Watch cash</a></li><li><a href="#cash-left">2 · Cash left</a></li></ol></li>
</ol></nav>
<main class="spec-page">
<h1 id="cash-first">Cash first</h1>
<article data-spec="title-slide" id="top"><header class="spec-slide-head"><span class="spec-number">0</span><h3>Title slide and section slides</h3></header>
  <div class="spec-options">
  <figure data-spec="option" data-option="0a" data-recommended><div data-spec="mock">Title A</div>
    <label class="spec-pick"><input type="checkbox" form="spec-review" name="pick:top" value="0a" /> Pick 0a</label></figure>
  <figure data-spec="option" data-option="0b" data-picked><div data-spec="mock">Title B</div>
    <label class="spec-pick"><input type="checkbox" form="spec-review" name="pick:top" value="0b" checked /> Pick 0b</label></figure>
  </div>
  <textarea class="spec-note" form="spec-review" name="note:top"></textarea>
</article>
<section data-spec="section" id="why-cash"><h2>Why cash</h2>
  <article data-spec="slide" id="watch-cash">
    <header class="spec-slide-head"><span class="spec-number">1</span><h3>Watch cash</h3></header>
    <div class="spec-words">
      <input type="radio" name="words:watch-cash" id="watch-cash--visual-idea" value="visual-idea" checked />
      <label for="watch-cash--visual-idea">Visual idea</label>
      <input type="radio" name="words:watch-cash" id="watch-cash--voice-script" value="voice-script" />
      <label for="watch-cash--voice-script">Voice script</label>
      <input type="radio" name="words:watch-cash" id="watch-cash--speaker-notes" value="speaker-notes" />
      <label for="watch-cash--speaker-notes">Speaker notes</label>
      <div class="spec-card spec-panel" data-panel="visual-idea"><h4>Visual idea</h4><p data-spec="visual-idea">A board of month columns.</p>
        <p>Design reference: reference/deck/design-reference.md#page-3</p></div>
      <div class="spec-card spec-panel" data-panel="voice-script"><ol data-spec="voice-script"><li>Spoken words</li></ol></div>
      <div class="spec-card spec-panel" data-panel="speaker-notes"><ol data-spec="speaker-notes"><li>A sourced fact</li></ol></div>
    </div>
    <div class="spec-options">
    <figure data-spec="option" data-option="1a" data-recommended><div data-spec="mock">Board A</div>
      <details><summary>Build notes</summary><div data-spec="build-notes">
        <p>Design reference: <code>docs/episodes/cash-first-run-2/reference/deck/pages/page-08.jpg</code></p></div></details>
      <label class="spec-pick"><input type="checkbox" form="spec-review" name="pick:watch-cash" value="1a" /> Pick 1a</label></figure>
    <figure data-spec="option" data-option="1b" data-picked><div data-spec="mock">Board B</div>
      <label class="spec-pick"><input type="checkbox" form="spec-review" name="pick:watch-cash" value="1b" checked /> Pick 1b</label></figure>
    </div>
    <textarea class="spec-note" form="spec-review" name="note:watch-cash"></textarea>
  </article>
  <article data-spec="slide" id="cash-left">
    <header class="spec-slide-head"><span class="spec-number">2</span><h3>Cash left</h3></header>
    <div class="spec-words">
      <input type="radio" name="words:cash-left" id="cash-left--visual-idea" value="visual-idea" checked />
      <label for="cash-left--visual-idea">Visual idea</label>
      <div class="spec-card spec-panel" data-panel="visual-idea"><p data-spec="visual-idea">One falling line.</p></div>
    </div>
    <div class="spec-options">
    <figure data-spec="option" data-option="2a" data-picked><div data-spec="mock">Line A</div></figure>
    </div>
  </article>
</section>
</main></div>
<form id="spec-review" method="post"><button>Save</button></form>
<script>/* review form */</script>
</body></html>`;

export const FEEDBACK: Record<string, string> = {
  'feedback/01/feedback.md': [
    '---',
    'type: feedback',
    'round: 1',
    '---',
    '',
    '# Feedback round 1',
    '',
    '- `why-cash--watch-cash` · design — picked: 1b — 1b is simple, more like this',
    '- `top` · design — picked: 0b',
    '- `why-cash--cash-left` · content — say "cash left"',
    '',
  ].join('\n'),
  'feedback/02/feedback.md': [
    '---',
    'type: feedback',
    'round: 2',
    '---',
    '',
    '# Feedback round 2',
    '',
    '- `why-cash--watch-cash` · design — use € everywhere',
    '',
  ].join('\n'),
};

function designer(attempt: number, t: string, text: string): string {
  return JSON.stringify({ kind: 'start', t, name: `write-spec#${attempt}/designer`, 'gen_ai.input.messages': text });
}

export const EVENTS = [
  JSON.stringify({ kind: 'start-run', t: '2026-01-01T00:00:00Z' }),
  designer(1, '2026-01-01T01:00:00Z', 'Draw Section `why-cash`: Slide 1 `watch-cash`, Slide 2 `cash-left`.'),
  designer(1, '2026-01-01T01:05:00Z', 'Draw Section `why-cash`: Slide 1 `watch-cash`, Slide 2 `cash-left`.'),
  designer(2, '2026-01-01T02:00:00Z', '- **1a and 1b:** use unsigned amounts.'),
  designer(1, '2026-01-01T01:00:01Z', 'Draw the Title slide Options 0a and 0b.'),
  JSON.stringify({
    kind: 'end',
    t: '2026-01-01T02:00:00Z',
    name: 'write-spec#2/reviewer',
    'gen_ai.input.messages': 'Review `watch-cash`.',
  }),
].join('\n');
