/*
 * `assembleSpec(inputs) → html` (design-ADR 0011): the Spec page's whole structure, so agents supply content only,
 * the designers' fragments and the Visual language. It owns the head, outline, masthead, Section bands, the
 * Title-slide article, word tabs, meta block, pick boxes, note fields, review form and the `data-picked`/`checked`
 * locks read from every feedback round. Inputs are optional by stage and the page renders what exists: the Brief
 * alone gives Slide cards, plus the Dossier the words, plus fragments the Options. It refuses an approved Spec.
 */

import { load } from 'cheerio';
import { briefCardMarkup } from './episode-spec-assemble-brief.pure.ts';
import { escape, inline, notesList, visualPanel, voiceList, wordTabs } from './episode-spec-assemble-words.pure.ts';
import { fragmentSlides, pickBox } from './episode-spec-fragment.pure.ts';
import { FORM } from './episode-spec-slide.pure.ts';
import { briefSource, dossierSource, mergedSource, type Source } from './episode-spec-source.pure.ts';
import { metaGateTier } from './staging-file.pure.ts';
import { TITLE_ANCHOR } from './title-anchor.pure.ts';

export interface SpecInputs {
  /** The Spec frame asset, `<title>` to be set; the page continues after its head. */
  frame: string;
  /** The review asset, inlined before `</body>`. */
  reviewAsset: string;
  /** `generated` of the meta block: the caller's stamp, never invented here. */
  generated: { by: string; at: string };
  brief: string;
  dossier?: string;
  /** The designers' fragment files, each `<!-- slide: <slug> -->` markers then Option figures. */
  fragments?: readonly string[];
  /** Markup inside the Visual language and Episode page cards. */
  visualLanguage?: string;
  episodePage?: string;
  /** Every feedback round's `feedback.md`, oldest first. */
  feedback?: readonly string[];
  /** The current `spec.html`, if any; assembly refuses when it is approved. */
  existing?: string;
  locale?: string;
}

/** The picks that lock a Slide: its latest feedback item with exactly one pick, by Slide slug. */
const PICK_LINE = /^- `([a-z0-9-]+(?:--[a-z0-9-]+)?)` · design — picked: (none|\d+[a-z](?:, \d+[a-z])*)/;

/** A feedback line's Slide slug and the Options it picked, none for a line of another form. */
function pickOf(line: string): { slug: string; picks: string[] } | undefined {
  const item = PICK_LINE.exec(line);
  if (item === null) return undefined;
  return {
    slug: (item[1] ?? '').split('--').at(-1) ?? '',
    picks: (item[2] ?? '').split(', ').filter((pick) => pick !== 'none'),
  };
}

function locksOf(rounds: readonly string[]): Map<string, string> {
  const locks = new Map<string, string>();
  const picked = rounds.flatMap((round) => round.split('\n').flatMap((line) => pickOf(line) ?? []));
  for (const { slug, picks } of picked) {
    if (picks.length === 1) locks.set(slug, picks[0] ?? '');
    else locks.delete(slug);
  }
  return locks;
}

/** One Slide's Options: build notes wrapped, pick boxes added, the locked Option marked picked and ticked. */
function optionsMarkup(slug: string, html: string, locked: string | undefined): string {
  const $ = load(html, null, false);
  const figures = $('figure[data-spec="option"]');
  const lock = figures.toArray().some((figure) => $(figure).attr('data-option') === locked) ? locked : undefined;
  figures.each((_, figure) => {
    const option = $(figure);
    const id = option.attr('data-option') ?? '';
    const notes = option.find('[data-spec="build-notes"]').first();
    notes.replaceWith(`<details class="spec-build"><summary>Build notes</summary>${$.html(notes)}</details>`);
    option.append(pickBox(slug, id, id === lock));
    if (id === lock) option.attr('data-picked', '');
  });
  return $.html();
}

/** What the Options of a page come from: the designers' fragments by Slide slug, and Han's locked picks. */
interface Parts {
  fragments: Map<string, string>;
  locks: Map<string, string>;
}

type SourceSlide = Source['sections'][number]['slides'][number];

function slideWords(slide: SourceSlide): string {
  return wordTabs(slide.slug, {
    'visual-idea': visualPanel(slide.visual),
    'voice-script': voiceList(slide.voice),
    'speaker-notes': slide.notes === undefined ? '' : notesList(slide.notes),
  });
}

/** The Options stage and the note field, once the Slide has Options. */
function slideStage(slide: SourceSlide, number: number, { fragments, locks }: Parts): string {
  const options = fragments.get(slide.slug);
  if (options === undefined) return '';
  const note = `<textarea class="spec-note" form="${FORM}" name="note:${slide.slug}" placeholder="Note on Slide ${number}"></textarea>`;
  return `<div class="spec-options">\n${optionsMarkup(slide.slug, options, locks.get(slide.slug))}\n</div>\n${note}`;
}

function slideMarkup(slide: SourceSlide, number: number, parts: Parts): string {
  const purpose = slide.purpose === undefined ? '' : `<p class="spec-purpose">${inline(slide.purpose)}</p>`;
  return `<article data-spec="slide" id="${slide.slug}" data-number="${number}">
<header class="spec-slide-head">
<span class="spec-number">${number}</span>
<h3>${inline(slide.title)}</h3>
</header>
${purpose}
${slideWords(slide)}
${slideStage(slide, number, parts)}
</article>`;
}

function titleArticle(html: string, locked: string | undefined): string {
  return `<article data-spec="title-slide" id="${TITLE_ANCHOR}">
<header class="spec-slide-head">
<span class="spec-number">0</span>
<h3>Title slide and section slides</h3>
</header>
<p>Each Option is a set: the Title slide, which sets the Hero motif, and under it the section slide of every Section, which echoes the motif and brings in its own Section. Picking an Option picks the set.</p>
<div class="spec-options">
${optionsMarkup(TITLE_ANCHOR, html, locked)}
</div>
<textarea class="spec-note" form="${FORM}" name="note:${TITLE_ANCHOR}" placeholder="Note on the Title slide and section slides"></textarea>
</article>`;
}

function outline(source: Source, hasTitle: boolean): string {
  let number = 0;
  const groups = source.sections.map(
    ({ title, slides }) =>
      `<li><span class="spec-outline-section">${inline(title)}</span><ol>\n${slides
        .map((slide) => `<li><a href="#${slide.slug}">${++number} · ${inline(slide.title)}</a></li>`)
        .join('\n')}\n</ol></li>`,
  );
  const top = hasTitle
    ? [
        `<li><span class="spec-outline-section">Episode</span><ol>\n<li><a href="#${TITLE_ANCHOR}">0 · Title slide and section slides</a></li>\n</ol></li>`,
      ]
    : [];
  return `<nav class="spec-outline" aria-label="Slides"><ol>\n${[...top, ...groups].join('\n')}\n</ol></nav>`;
}

function intro(inputs: SpecInputs, source: Source): string {
  const cards = [
    briefCardMarkup(inputs.brief),
    source.style === undefined
      ? ''
      : `<section id="style" class="spec-card">\n<h2>Style</h2>\n<p>${inline(source.style)}</p>\n</section>`,
    inputs.visualLanguage === undefined
      ? ''
      : `<section id="visual-language" class="spec-card">\n<h2>Visual language</h2>\n${inputs.visualLanguage}\n<textarea class="spec-note" form="${FORM}" name="note:visual-language" placeholder="Note on the Visual language"></textarea>\n</section>`,
    inputs.episodePage === undefined
      ? ''
      : `<section id="episode-page" class="spec-card">\n<h2>Episode page</h2>\n${inputs.episodePage}\n</section>`,
  ].filter(Boolean);
  return cards.length === 0 ? '' : `<div class="spec-intro">\n${cards.join('\n')}\n</div>`;
}

/** The frame up to its head's end, its `<title>` set. */
function head(frame: string, title: string): string {
  return frame
    .replace(/<title>[\s\S]*?<\/title>/, `<title>Spec · ${escape(title)}</title>`)
    .replace(/\s*<\/head>[\s\S]*$/, '\n');
}

const LEDE =
  'Each Slide shows its words as tabs above its Options, which are tabs too: open each, pick one, and dictate a note where it should change. Save at the bottom when done.';

function sectionsMarkup(source: Source, parts: Parts): string {
  let number = 0;
  return source.sections
    .map(
      (section, at) => `<section data-spec="section" id="${section.slug}">
<div class="spec-section-band">
<p class="spec-kicker">Section ${at + 1} · section slide, drawn in the Title-slide Options</p>
<h2>${inline(section.title)}</h2>
${voiceList(section.voice)}
</div>
${section.slides.map((slide) => slideMarkup(slide, ++number, parts)).join('\n')}
</section>`,
    )
    .join('\n');
}

function masthead(source: Source): string {
  const count = source.sections.reduce((sum, { slides }) => sum + slides.length, 0);
  return `<header class="spec-masthead">
<p class="spec-kicker">Spec · ${count} Slides</p>
<h1${source.slug === undefined ? '' : ` id="${source.slug}"`}>${inline(source.title)}</h1>
<p>${LEDE}</p>
</header>`;
}

function metaBlock(inputs: SpecInputs, title: string): string {
  const meta = {
    type: 'spec',
    title,
    status: 'draft',
    generated: inputs.generated,
    locale: inputs.locale ?? 'en',
    brief: '../brief.md',
  };
  return `<script type="application/json" id="spec-meta">\n${JSON.stringify(meta, null, 2)}\n</script>`;
}

/** The Spec page for whatever the inputs hold; throws when `existing` is an approved Spec. */
export function assembleSpec(inputs: SpecInputs): string {
  if (inputs.existing !== undefined && metaGateTier(inputs.existing) === 'approved')
    throw new Error('the Spec is approved: an approved Spec cannot be assembled again');
  const brief = briefSource(inputs.brief);
  const source = inputs.dossier === undefined ? brief : mergedSource(brief, dossierSource(inputs.dossier));
  const fragments = new Map(
    (inputs.fragments ?? []).flatMap((file) =>
      fragmentSlides(file).map(({ slug, html }) => [slug, html.trim()] as const),
    ),
  );
  const parts = { fragments, locks: locksOf(inputs.feedback ?? []) };
  const titleOptions = fragments.get(TITLE_ANCHOR);
  const title = titleOptions === undefined ? '' : titleArticle(titleOptions, parts.locks.get(TITLE_ANCHOR));
  return `${head(inputs.frame, source.title)}${metaBlock(inputs, source.title)}
</head>
<body>
<div class="spec-shell">
${outline(source, titleOptions !== undefined)}
<main class="spec-page">
${masthead(source)}
${intro(inputs, source)}
${title}
${sectionsMarkup(source, parts)}
</main>
</div>
${inputs.reviewAsset.trimEnd()}
</body>
</html>
`;
}
