// A two-Slide Spec in the shape `write-spec` emits (design-ADR 0011), small enough to read in a test.
export const SPEC = `<!doctype html><html><head><title>Spec</title><style>.spec-card{padding:1rem}</style>
<link rel="stylesheet" href="design.css" /><script>/* review form */</script></head><body>
<h1 id="cash-first">Cash first</h1>
<article data-spec="title-slide" id="top"><h3>Title slide and section slides</h3>
  <figure data-spec="option" data-option="0a" data-recommended><div data-spec="mock">Title A</div></figure>
  <figure data-spec="option" data-option="0b" data-picked><div data-spec="mock">Title B</div></figure>
</article>
<section data-spec="section" id="why-cash"><h2>Why cash</h2>
  <article data-spec="slide" id="watch-cash">
    <header><h3>Watch cash</h3></header>
    <div data-panel="visual-idea"><h4>Visual idea</h4><p data-spec="visual-idea">A board of month columns.</p>
      <p>Design reference: reference/deck/design-reference.md#page-3</p></div>
    <div data-panel="voice-script"><ol data-spec="voice-script"><li>Spoken words</li></ol></div>
    <figure data-spec="option" data-option="1a" data-recommended><div data-spec="mock">Board A</div>
      <details><summary>Build notes</summary><div data-spec="build-notes">
        <p>Design reference: <code>docs/episodes/cash-first-run-2/reference/deck/pages/page-08.jpg</code></p></div></details></figure>
    <figure data-spec="option" data-option="1b" data-picked><div data-spec="mock">Board B</div></figure>
  </article>
  <article data-spec="slide" id="cash-left">
    <header><h3>Cash left</h3></header>
    <div data-panel="visual-idea"><p data-spec="visual-idea">One falling line.</p></div>
    <figure data-spec="option" data-option="2a" data-picked><div data-spec="mock">Line A</div></figure>
  </article>
</section></body></html>`;

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
