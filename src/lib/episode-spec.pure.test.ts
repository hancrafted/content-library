import { describe, expect, it } from 'vitest';
import { checkSpec } from './episode-spec.pure';
import { appendMetaVerified } from './staging-file.pure';

/*
 * In-memory staging folders: a Dossier of one Section with two Slides and a
 * Spec page that agrees with it, then one change per test that breaks exactly
 * one rule of the Spec contract.
 */

const REVIEW_ASSET = `<!-- spec-review:start -->
<form id="spec-review" method="post">
  <button type="submit">Save review</button>
</form>
<!-- spec-review:end -->`;

const DOSSIER = `---
type: dossier
---

# Budget {#budget}

## Why it forgets {#why}

### Spent attention {#spent}

### The quiet middle {#middle}

## Material left out

Extra.
`;

const GENERATED_AT = '2026-10-12T12:00:00Z';
const HAN_AT = '2026-10-12T13:00:00Z';

interface Meta {
  verified?: { by: string; at: string }[];
}

function meta({ verified }: Meta = {}): string {
  const value = {
    type: 'spec',
    title: 'Budget',
    status: 'draft',
    generated: { by: 'claude-code/opus-5.5', at: GENERATED_AT },
    locale: 'en',
    brief: '../brief.md',
    ...(verified === undefined ? {} : { verified }),
  };
  return `<script type="application/json" id="spec-meta">${JSON.stringify(value)}</script>`;
}

interface OptionShape {
  recommended?: boolean;
  picked?: boolean;
  /** Whether the pick checkbox carries `checked`; a picked Option's does, as the contract demands. */
  checked?: boolean;
  mock?: string;
  caption?: string | null;
  notes?: string | null;
  /** Markup after the mock, where a Title-slide Option shows its section slides. */
  after?: string;
}

const OPTION_DEFAULTS = {
  recommended: false,
  picked: false,
  mock: 'bg-card text-foreground',
  caption: 'The bar carries the point. Scene.',
  notes: 'Keeps basic-page, motion none.',
  after: '',
};

function option(slug: string, id: string, shape: OptionShape = {}): string {
  const { recommended, picked, checked, mock, caption, notes, after } = {
    ...OPTION_DEFAULTS,
    checked: shape.picked,
    ...shape,
  };
  const flags = [recommended ? ' data-recommended' : '', picked ? ' data-picked' : ''].join('');
  const tick = checked === true ? ' checked' : '';
  const figcaption = caption === null ? '' : `<figcaption><b>${id}</b> ${caption}</figcaption>`;
  const buildNotes = notes === null ? '' : `<div data-spec="build-notes">${notes}</div>`;
  return `<figure data-spec="option" data-option="${id}"${flags}>
  <div data-spec="mock" class="${mock}"><div class="h-4 w-1/2 bg-accent"></div></div>
  ${after}
  ${figcaption}
  ${buildNotes}
  <label><input type="checkbox" form="spec-review" name="pick:${slug}" value="${id}"${tick}> ${id}</label>
</figure>`;
}

const VOICE = `<ol data-spec="voice-script">
  <li><strong>Whole window</strong> — A model reads its whole window on every turn.</li>
</ol>`;

const NOTES = `<ol data-spec="speaker-notes">
  <li><strong>Attention sums to one</strong> — every token dilutes the rest [1].
    <ul><li data-source="1">[1] Attention Is All You Need — <a href="https://arxiv.org/abs/1706.03762">arxiv.org</a></li></ul>
  </li>
</ol>`;

interface SlideShape {
  options?: string[];
  voice?: string;
  notes?: string;
}

function slide(slug: string, number: number, shape: SlideShape = {}): string {
  const options = shape.options ?? [option(slug, `${number}a`, { recommended: true }), option(slug, `${number}b`)];
  return `<article data-spec="slide" id="${slug}" data-number="${number}">
  <h3>${number} · A Slide</h3>
  <p data-spec="visual-idea">A bar that fills.</p>
  ${shape.voice ?? VOICE}
  ${shape.notes ?? NOTES}
  <div data-spec="options">${options.join('\n')}</div>
  <textarea form="spec-review" name="note:${slug}"></textarea>
</article>`;
}

/** A Context marker in a mock, naming the Speaker note it opens by its title. */
function marker(note: string): string {
  return `<p>Fact <span data-spec="context-marker" data-note="${note}" role="img" aria-label="Speaker note: ${note}"><svg viewBox="0 0 16 16" class="size-4"><path d="M2 3h12v8H6l-4 3z" class="fill-muted-foreground" /></svg></span></p>`;
}

/** A Title-slide Option's section slides: one per Section slug, in order. */
function echoes(sections: readonly string[], mock = 'bg-muted'): string {
  const items = sections.map(
    (section) => `<li data-spec="echo" data-section="${section}"><div data-spec="mock" class="${mock}"></div></li>`,
  );
  return `<ol data-spec="echoes">${items.join('')}</ol>`;
}

function titleOption(id: string, shape: OptionShape = {}): string {
  return option('top', id, { after: echoes(['why']), ...shape });
}

const TITLE_OPTIONS = [titleOption('0a', { recommended: true }), titleOption('0b'), titleOption('0c')];

function titleSlide(options: readonly string[] = TITLE_OPTIONS, id = 'top'): string {
  return `<article data-spec="title-slide" id="${id}">
  <h3>Title slide</h3>
  <div data-spec="options">${options.join('\n')}</div>
  <textarea form="spec-review" name="note:${id}"></textarea>
</article>`;
}

interface SpecShape {
  meta?: string;
  slides?: string[];
  title?: string;
  asset?: string;
}

function spec(shape: SpecShape = {}): string {
  const slides = shape.slides ?? [slide('spent', 1), slide('middle', 2)];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Spec — Budget</title>
<link rel="stylesheet" href="design.css">
${shape.meta ?? meta()}
</head>
<body>
<h1 id="budget">Budget</h1>
<section id="style"><h2>Style</h2><p>Editorial.</p></section>
<section id="visual-language"><h2>Visual language</h2><p>A bar.</p>
  <textarea form="spec-review" name="note:visual-language"></textarea>
</section>
<section id="episode-page"><h2>Episode page</h2>${VOICE}</section>
${shape.title ?? titleSlide()}
<section data-spec="section" id="why"><h2>Why it forgets</h2>
${slides.join('\n')}
</section>
${shape.asset ?? REVIEW_ASSET}
</body>
</html>
`;
}

function folder(files: Record<string, string> = {}): Record<string, string> {
  return { 'dossier.md': DOSSIER, 'spec/spec.html': spec(), ...files };
}

function messages(findings: readonly { message: string }[]): string[] {
  return findings.map(({ message }) => message);
}

describe('success cases', () => {
  it('finds nothing in a Spec that agrees with its Dossier and keeps the contract', () => {
    // ARRANGE
    const files = folder();
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });
});

const SPENT_3 = [option('spent', '1a', { recommended: true }), option('spent', '1b'), option('spent', '1c')];

const APPROVED = meta({ verified: [{ by: 'human:han', at: HAN_AT }] });

const NO_TITLE_SLIDE =
  'The Spec has no Title slide: an <article data-spec="title-slide" id="top"> before the first Section, its three Options each the Title slide and a section slide per Section.';

/** The default Title slide with its recommended Option picked and ticked, as a locked Title slide. */
const PICKED_TITLE = titleSlide([
  titleOption('0a', { recommended: true, picked: true }),
  titleOption('0b'),
  titleOption('0c'),
]);

const picked = (slug: string, number: number): string =>
  slide(slug, number, {
    options: [option(slug, `${number}a`, { recommended: true, picked: true }), option(slug, `${number}b`)],
  });

describe('failure cases', () => {
  it.each([
    [
      'a Dossier Slide with no Slide in the Spec',
      { slides: [slide('spent', 1)] },
      'The Dossier Slide {#middle} has no Slide in the Spec: give it an <article data-spec="slide" id="middle">.',
    ],
    [
      'Slides not numbered 1, 2, … in page order',
      { slides: [slide('spent', 1), slide('middle', 3)] },
      'The Slide {#middle} is numbered 3, but it is Slide 2 in page order.',
    ],
    [
      'a Slide with one Option',
      { slides: [slide('spent', 1, { options: [option('spent', '1a', { recommended: true })] }), slide('middle', 2)] },
      'The Slide {#spent} has 1 Option: it needs two or three.',
    ],
    [
      'a Slide with four Options',
      {
        slides: [slide('spent', 1, { options: [...SPENT_3, option('spent', '1d')] }), slide('middle', 2)],
      },
      'The Slide {#spent} has 4 Options: it needs two or three.',
    ],
    [
      'a Slide with no recommended Option',
      { slides: [slide('spent', 1, { options: [option('spent', '1a'), option('spent', '1b')] }), slide('middle', 2)] },
      'The Slide {#spent} marks 0 Options recommended: mark exactly one with data-recommended.',
    ],
    [
      'a Slide with two recommended Options',
      {
        slides: [
          slide('spent', 1, {
            options: [option('spent', '1a', { recommended: true }), option('spent', '1b', { recommended: true })],
          }),
          slide('middle', 2),
        ],
      },
      'The Slide {#spent} marks 2 Options recommended: mark exactly one with data-recommended.',
    ],
    [
      'Option ids out of letter order',
      {
        slides: [
          slide('spent', 1, { options: [option('spent', '1a', { recommended: true }), option('spent', '1c')] }),
          slide('middle', 2),
        ],
      },
      'The Slide {#spent} has the Options [1a, 1c]: id them 1a, 1b in order, the Slide number and a letter.',
    ],
    [
      'an Option without a figcaption',
      {
        slides: [
          slide('spent', 1, {
            options: [option('spent', '1a', { recommended: true }), option('spent', '1b', { caption: null })],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1b of {#spent} has no figcaption naming its id, reason and build cost.',
    ],
    [
      'an Option without build notes',
      {
        slides: [
          slide('spent', 1, {
            options: [option('spent', '1a', { recommended: true }), option('spent', '1b', { notes: null })],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1b of {#spent} has no build notes: a <div data-spec="build-notes"> with the parts, tokens, props and i18n keys.',
    ],
    [
      'a Voice script item without a title',
      {
        slides: [
          slide('spent', 1, { voice: '<ol data-spec="voice-script"><li>Only the spoken text.</li></ol>' }),
          slide('middle', 2),
        ],
      },
      'A Voice script item of {#spent} has no <strong> title: "Only the spoken text."',
    ],
    [
      'a Voice script item without text',
      {
        slides: [
          slide('spent', 1, { voice: '<ol data-spec="voice-script"><li><strong>Whole window</strong> — </li></ol>' }),
          slide('middle', 2),
        ],
      },
      'The Voice script item "Whole window" of {#spent} has no text after its title.',
    ],
    [
      'a citation that resolves to no source',
      {
        slides: [
          slide('spent', 1, {
            notes: `<ol data-spec="speaker-notes"><li><strong>Two</strong> — cites a missing source [2].
              <ul><li data-source="1">[1] A — <a href="https://example.com">example.com</a></li></ul></li></ol>`,
          }),
          slide('middle', 2),
        ],
      },
      'The Speaker note "Two" of {#spent} cites [2], which resolves to no source nested in it.',
    ],
    [
      'a hex colour in an Option',
      {
        slides: [
          slide('spent', 1, {
            options: [
              option('spent', '1a', { recommended: true, mock: 'bg-card" style="color: #ff0000' }),
              option('spent', '1b'),
            ],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1a of {#spent} uses the hex colour "#ff0000": use a token class.',
    ],
    [
      'an arbitrary Tailwind value in an Option',
      {
        slides: [
          slide('spent', 1, {
            options: [option('spent', '1a', { recommended: true, mock: 'bg-card w-[37px]' }), option('spent', '1b')],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1a of {#spent} uses the arbitrary Tailwind value "w-[37px]": use a token class.',
    ],
    [
      'a raw type size in an Option',
      {
        slides: [
          slide('spent', 1, {
            options: [option('spent', '1a', { recommended: true, mock: 'bg-card md:text-sm' }), option('spent', '1b')],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1a of {#spent} uses the type size "md:text-sm" outside the FE-011 type roles: use a type role (text-body, text-caption, text-subheading, text-heading).',
    ],
    [
      'a missing meta block',
      { meta: '' },
      'The Spec has no meta block: a <script type="application/json" id="spec-meta"> in its head.',
    ],
    [
      'a meta block that is not JSON',
      { meta: '<script type="application/json" id="spec-meta">{ type: spec }</script>' },
      'The meta block is not valid JSON.',
    ],
    [
      'a meta block missing a field',
      { meta: '<script type="application/json" id="spec-meta">{"type":"spec"}</script>' },
      'The meta block lacks "title", "status", "generated", "locale", "brief".',
    ],
    [
      'a missing review asset',
      { asset: '' },
      'The Spec does not inline the review asset from skills/new-episode/assets/spec-review.html, between its <!-- spec-review:start --> and <!-- spec-review:end --> markers.',
    ],
    [
      'an edited review asset',
      { asset: REVIEW_ASSET.replace('Save review', 'Save') },
      'The Spec does not inline the review asset from skills/new-episode/assets/spec-review.html, between its <!-- spec-review:start --> and <!-- spec-review:end --> markers.',
    ],
    [
      'an Option without its pick checkbox',
      {
        slides: [
          slide('spent', 1, {
            options: [
              option('spent', '1a', { recommended: true }),
              option('spent', '1b').replace(/<label>.*<\/label>/, ''),
            ],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1b of {#spent} has no <input type="checkbox" form="spec-review" name="pick:spent" value="1b">.',
    ],
    [
      'a Slide without its note',
      { slides: [slide('spent', 1).replace(/<textarea[^>]*><\/textarea>/, ''), slide('middle', 2)] },
      'The Slide {#spent} has no <textarea form="spec-review" name="note:spent">.',
    ],
    [
      'two picked Options on one Slide',
      {
        slides: [
          slide('spent', 1, {
            options: [
              option('spent', '1a', { recommended: true, picked: true }),
              option('spent', '1b', { picked: true }),
            ],
          }),
          slide('middle', 2),
        ],
      },
      'The Slide {#spent} marks 2 Options picked: mark at most one with data-picked.',
    ],
    [
      'a picked Option whose checkbox is not ticked',
      {
        slides: [
          slide('spent', 1, {
            options: [
              option('spent', '1a', { recommended: true, picked: true, checked: false }),
              option('spent', '1b'),
            ],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1a of {#spent} is picked, but its checkbox lacks checked: a locked Slide comes ticked, so the next round needs nothing on it.',
    ],
    [
      'an unpicked Option whose checkbox is ticked',
      {
        slides: [
          slide('spent', 1, {
            options: [option('spent', '1a', { recommended: true }), option('spent', '1b', { checked: true })],
          }),
          slide('middle', 2),
        ],
      },
      'Option 1b of {#spent} is not picked, but its checkbox is checked: tick only the data-picked Option.',
    ],
  ] satisfies [string, SpecShape, string][])('names %s', (_name, shape, expected) => {
    // ARRANGE
    const files = folder({ 'spec/spec.html': spec(shape) });
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual([expected]);
  });

  it('names both sides of a Slide slug that differs from the Dossier', () => {
    // ARRANGE
    const files = folder({ 'spec/spec.html': spec({ slides: [slide('spent', 1), slide('quiet', 2)] }) });
    const expected = [
      'The Dossier Slide {#middle} has no Slide in the Spec: give it an <article data-spec="slide" id="middle">.',
      'The Spec Slide {#quiet} is no Slide in the Dossier: its id must be the Dossier h3 slug.',
    ];
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it.each([
    ['a Spec with no Title slide', { title: '' }, NO_TITLE_SLIDE],
    [
      'a Title slide with two Options',
      { title: titleSlide(TITLE_OPTIONS.slice(0, 2)) },
      'The Title slide {#top} has 2 Options: it needs three.',
    ],
    [
      'Title-slide Options not ided 0a, 0b, 0c',
      { title: titleSlide([titleOption('1a', { recommended: true }), titleOption('1b'), titleOption('1c')]) },
      'The Title slide {#top} has the Options [1a, 1b, 1c]: id them 0a, 0b, 0c in order, the Slide number and a letter.',
    ],
    [
      'a Title-slide Option whose section slides skip a Section',
      { title: titleSlide([TITLE_OPTIONS[0], titleOption('0b', { after: echoes([]) }), TITLE_OPTIONS[2]]) },
      'Option 0b of {#top} shows the section slides [], not one per Section in page order: [why].',
    ],
    [
      'a Title-slide Option with no Title-slide mock',
      {
        title: titleSlide([
          TITLE_OPTIONS[0],
          TITLE_OPTIONS[1],
          TITLE_OPTIONS[2].replace(/<div data-spec="mock"[^>]*><div[^>]*><\/div><\/div>/, ''),
        ]),
      },
      'Option 0c of {#top} has no mock of the Title slide: a <div data-spec="mock"> directly in its figure.',
    ],
    [
      'a hex colour in a section slide of a Title-slide Option',
      {
        title: titleSlide([
          TITLE_OPTIONS[0],
          titleOption('0b', { after: echoes(['why'], 'fill-[#ff0000]') }),
          TITLE_OPTIONS[2],
        ]),
      },
      'Option 0b of {#top} uses the hex colour "#ff0000": use a token class.',
    ],
    [
      'a Title slide with no note field',
      { title: titleSlide().replace('<textarea form="spec-review" name="note:top"></textarea>', '') },
      'The Title slide {#top} has no <textarea form="spec-review" name="note:top">.',
    ],
    [
      'a Title slide after the first Section',
      { title: '', asset: `${titleSlide()}\n${REVIEW_ASSET}` },
      'The Title slide {#top} comes after the Section {#why}: put it before the first Section.',
    ],
    [
      'a Title slide ided other than top',
      { title: titleSlide(TITLE_OPTIONS, 'hero') },
      'The Title slide is id "hero": id it "top", the anchor feedback keys it by.',
    ],
  ])('reports %s', (_, shape, expected) => {
    // ARRANGE
    const files = folder({ 'spec/spec.html': spec(shape) });
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toContain(expected);
  });

  it('names a Context marker whose note is no Speaker note of its Slide', () => {
    // ARRANGE
    const marked = option('spent', '1b', { after: marker('Attention is finite') });
    const files = folder({
      'spec/spec.html': spec({
        slides: [
          slide('spent', 1, { options: [option('spent', '1a', { recommended: true }), marked] }),
          slide('middle', 2),
        ],
      }),
    });
    const expected = [
      'Option 1b of {#spent} has a Context marker for "Attention is finite", which is no Speaker note of the Slide: name the note by its title in data-note.',
    ];
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('requires a picked Title-slide Option once Han approved the Spec', () => {
    // ARRANGE
    const files = { 'spec/spec.html': spec({ meta: APPROVED, slides: [picked('spent', 1), picked('middle', 2)] }) };
    const expected = ['The Title slide {#top} has no picked Option: an approved Spec picks exactly one per Slide.'];
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('requires one picked Option per Slide once Han approved the Spec', () => {
    // ARRANGE
    const files = {
      'spec/spec.html': spec({ meta: APPROVED, title: PICKED_TITLE, slides: [picked('spent', 1), slide('middle', 2)] }),
    };
    const expected = ['The Slide {#middle} has no picked Option: an approved Spec picks exactly one per Slide.'];
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it("demands the picks once approve.ts has appended Han's entry to the meta block", () => {
    // ARRANGE
    const unapproved = spec({ title: PICKED_TITLE, slides: [picked('spent', 1), slide('middle', 2)] });
    const approved = appendMetaVerified(unapproved, { by: 'human:han', at: HAN_AT });
    const expected = {
      before: [],
      after: ['The Slide {#middle} has no picked Option: an approved Spec picks exactly one per Slide.'],
    };
    // ACT
    const found = {
      before: messages(checkSpec({ 'spec/spec.html': unapproved }, REVIEW_ASSET)),
      after: messages(checkSpec({ 'spec/spec.html': approved }, REVIEW_ASSET)),
    };
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('reports a Dossier left beside an approved Spec', () => {
    // ARRANGE
    const files = folder({
      'spec/spec.html': spec({
        meta: APPROVED,
        title: PICKED_TITLE,
        slides: [picked('spent', 1), picked('middle', 2)],
      }),
    });
    const expected = [
      'dossier.md still sits beside the approved Spec: the Spec is the only source now, so delete it in the approval commit.',
    ];
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names the Spec file and the spec kind in every finding', () => {
    // ARRANGE
    const files = folder({ 'spec/spec.html': spec({ asset: '' }) });
    const expected = [{ kind: 'spec', file: 'spec/spec.html' }];
    // ACT
    const found = checkSpec(files, REVIEW_ASSET).map(({ kind, file }) => ({ kind, file }));
    // ASSERT
    expect(found).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('checks nothing in a folder with no Spec yet', () => {
    // ARRANGE
    const files = { 'dossier.md': DOSSIER };
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts a Context marker that names a Speaker note of its Slide by title', () => {
    // ARRANGE
    const marked = option('spent', '1a', { recommended: true, after: marker('Attention sums to one') });
    const files = folder({
      'spec/spec.html': spec({
        slides: [slide('spent', 1, { options: [marked, option('spent', '1b')] }), slide('middle', 2)],
      }),
    });
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts three Options and one Option picked before the Gate, as a locked Slide', () => {
    // ARRANGE
    const files = folder({
      'spec/spec.html': spec({ slides: [slide('spent', 1, { options: SPENT_3 }), picked('middle', 2)] }),
    });
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it("checks an approved Spec without its Dossier against the Spec's own Slides", () => {
    // ARRANGE
    const files = {
      'spec/spec.html': spec({
        meta: APPROVED,
        title: PICKED_TITLE,
        slides: [picked('spent', 1), picked('middle', 2)],
      }),
    };
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('reads an approval older than the generation as no approval', () => {
    // ARRANGE
    const stale = meta({ verified: [{ by: 'human:han', at: '2026-10-12T11:00:00Z' }] });
    const files = folder({ 'spec/spec.html': spec({ meta: stale }) });
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('accepts the review asset reformatted, whitespace and line breaks aside', () => {
    // ARRANGE
    const reformatted = REVIEW_ASSET.replace(
      '<form id="spec-review" method="post">',
      '<form\n    id="spec-review"\n    method="post"\n  >',
    ).replace('<button type="submit">Save review</button>', '<button type="submit">\n    Save review\n  </button>');
    const files = folder({ 'spec/spec.html': spec({ asset: reformatted }) });
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('allows a hex colour and an arbitrary value outside the Options, in the page chrome', () => {
    // ARRANGE
    const chrome = '<style>.page { color: #222; width: calc(100% - 2rem); }</style><div class="max-w-[72rem]"></div>';
    const files = folder({ 'spec/spec.html': spec().replace('</body>', `${chrome}</body>`) });
    // ACT
    const findings = checkSpec(files, REVIEW_ASSET);
    // ASSERT
    expect(findings).toEqual([]);
  });

  it('checks the Voice script of a Section and of the Episode page like a Slide one', () => {
    // ARRANGE
    const html = spec().replace(
      '<section id="episode-page"><h2>Episode page</h2>',
      '<section id="episode-page"><h2>Episode page</h2><ol data-spec="voice-script"><li>No title.</li></ol>',
    );
    const files = folder({ 'spec/spec.html': html });
    const expected = ['A Voice script item of {#episode-page} has no <strong> title: "No title."'];
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual(expected);
  });

  it('names a Dossier Section with no Section in the Spec', () => {
    // ARRANGE
    const html = spec()
      .replace('data-spec="section" id="why"', 'data-spec="section" id="forgets"')
      .replaceAll('data-section="why"', 'data-section="forgets"');
    const files = folder({ 'spec/spec.html': html });
    const expected = [
      'The Dossier Section {#why} has no Section in the Spec: give it a <section data-spec="section" id="why">.',
      'The Spec Section {#forgets} is no Section in the Dossier: its id must be the Dossier h2 slug.',
    ];
    // ACT
    const found = messages(checkSpec(files, REVIEW_ASSET));
    // ASSERT
    expect(found).toEqual(expected);
  });
});
