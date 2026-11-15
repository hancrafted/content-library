import { localizeSlide } from '@/episodes/components/slide-master/localized-slide';
import type { Slide } from '@/episodes/components/slide-master/slide';
import { episodeRef } from '@/episodes/lib/episode-folders';
import { placeSections } from '@/episodes/lib/episode.pure';
import type { Locale } from '@/shared/lib/locale.pure';
import { load } from 'cheerio';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { whatAnAgenticWorkflowIsSection } from './what-an-agentic-workflow-is';

/*
 * The Section "What an agentic workflow is", as the approved Spec gives it: its section slide, then Slide 3 "What an
 * agent is" (picked Option 3a, the AI capability Explorable with the Agents card turned to Anthropic's cited
 * definition) and Slide 4 "What an agentic workflow is" (picked Option 4a, the human-in-the-loop Explorable running the
 * summer party, the path you design above it and the task the agent steers zoomed below it).
 */

const EPISODE = episodeRef(
  'what-agentic-workflows-require',
  '2026-11-16-cyberforum-akademie-hands-on-agentic-workflows',
).id;
const SECTION = whatAnAgenticWorkflowIsSection as readonly [Slide, ...Slide[]];
const SLIDES: readonly Slide[] = SECTION;
const PLACED = placeSections<Slide>([SECTION]).flat();
const AGENT = 'what-an-agent-is';
const WORKFLOW = 'what-an-agentic-workflow-is-slide';

/** A Slide of the Section by slug. */
function slideOf(slug: string): Slide {
  const own = SLIDES.find((each) => each.slug === slug);
  if (own === undefined) throw new Error(`No Slide "${slug}" in the Section.`);
  return own;
}

/** A Slide as the page localizes it: its shared header's text and its Scene. */
function localizedOf(slug: string, locale: Locale = 'en') {
  const own = PLACED.find((entry) => entry.slide.slug === slug);
  if (own === undefined) throw new Error(`No placed Slide "${slug}".`);
  return localizeSlide(own, {
    episode: EPISODE,
    locale,
    placed: PLACED,
    referenceLabels: { ref: 'opens speaker note', marker: (title) => `Speaker note: ${title}` },
    header: 'shared',
  });
}

/** A Slide's Scene as the page renders it under the shared Slide header. */
function sceneOf(slug: string, locale: Locale = 'en') {
  return load(renderToStaticMarkup(createElement(Fragment, null, localizedOf(slug, locale).content)));
}

interface SlideText {
  title: string;
  caption: string;
  heading?: string;
  voiceScript: { segments: Record<string, { title: string; script: string }> };
  notes: Record<string, { header: string; description: string; sources: Record<string, { title: string }> }>;
}

const textOf = (slug: string, locale: Locale = 'en') => slideOf(slug).messages[locale] as unknown as SlideText;

/** A Slide's Voice script in order, segment title and script. */
const scriptOf = (slug: string) => {
  const text = textOf(slug);
  return slideOf(slug).segments.map(({ slug: segment }) => text.voiceScript.segments[segment]);
};

/** A Slide's Speaker notes in order: header and the URLs of their sources. */
const notesOf = (slug: string) => {
  const text = textOf(slug);
  return slideOf(slug).notes.map((note) => ({
    header: text.notes[note.slug]?.header,
    sources: (note.sources ?? []).map((source) => source.url),
  }));
};

const textsOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .toArray()
    .map((node) => $(node).text().replace(/\s+/g, ' ').trim());

const markersOf = ($: ReturnType<typeof sceneOf>, selector: string) =>
  $(selector)
    .find('[data-context-ref]')
    .toArray()
    .map((node) => $(node).attr('data-context-ref'));

describe('success cases', () => {
  it('holds the section slide, then What an agent is, then What an agentic workflow is, titled as the Spec', () => {
    // ARRANGE
    const expected = [
      { slug: 'what-an-agentic-workflow-is', title: 'What an agentic workflow is' },
      { slug: AGENT, title: 'What an agent is' },
      { slug: WORKFLOW, title: 'What an agentic workflow is' },
    ];
    // ACT
    const actual = SLIDES.map(({ slug }) => ({ slug, title: textOf(slug).title }));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the Voice script of What an agent is verbatim from the Spec', () => {
    // ARRANGE
    const expected = [
      {
        title: 'Model, tools, loop',
        script:
          'An agent is a language model that uses tools in a loop and decides for itself how to reach a goal. It is not a single chat answer you read and move on from, it is a loop of acting, looking at the result and acting again until it believes it is done.',
      },
      {
        title: 'Steers its own steps',
        script:
          'If you have only used a chat tool so far, here is the shift. In a chat you steer every step yourself, because you read each answer and decide what to ask next. An agent steers its own steps, so you cannot assume it takes the steps you would have taken. That is the reason the rest of this Episode is about what you must set up around it.',
      },
    ];
    // ACT
    const actual = scriptOf(AGENT).map((segment) => ({ title: segment?.title, script: segment?.script }));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('carries the Voice script of What an agentic workflow is verbatim from the Spec', () => {
    // ARRANGE
    const expected = [
      {
        title: 'The definition',
        script:
          'An agentic workflow is a process in which agents, not people, take the decisions and do the tasks, within a structure you set. The exact wording and where it comes from are in the Speaker notes.',
      },
      {
        title: 'Two levels',
        script:
          'Read it as two levels. On the first level you design the path, which means the tasks and what each task hands over to the next. On the second level the agent steers inside its own task, and that is the part you hand away.',
      },
      {
        title: 'Minimal, how minimal',
        script:
          'Notice the phrase minimal human intervention, because it carries a lot of weight and says very little. How minimal, and for which task? That is what the next Section answers.',
      },
    ];
    // ACT
    const actual = scriptOf(WORKFLOW).map((segment) => ({ title: segment?.title, script: segment?.script }));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('cites every Speaker note of both Slides with the Spec sources', () => {
    // ARRANGE
    const anthropic = 'https://www.anthropic.com/engineering/building-effective-agents';
    const ibm = 'https://www.ibm.com/think/topics/agentic-workflows';
    const expected = {
      agent: [
        { header: "Anthropic's definition", sources: [anthropic] },
        { header: 'A shorter form', sources: ['https://simonwillison.net/2025/Sep/18/agents/'] },
      ],
      workflow: [
        { header: "IBM's wording", sources: [ibm] },
        { header: "Salesforce's wording", sources: ['https://www.salesforce.com/agentforce/agentic-workflows/'] },
        { header: 'Why the vendors stress autonomy', sources: [ibm] },
        { header: 'Two levels of control', sources: [anthropic] },
        { header: 'Autonomy as a degree', sources: ['https://www.deeplearning.ai/the-batch/issue-253/'] },
      ],
    };
    // ACT
    const actual = { agent: notesOf(AGENT), workflow: notesOf(WORKFLOW) };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it("turns the Agents card to Anthropic's cited definition, with both its markers on the back", () => {
    // ARRANGE
    const expected = {
      definition: [
        'Definition: Agents are systems where LLMs dynamically direct their own processes and tool usage, keeping control over how they accomplish tasks.',
      ],
      markers: ['anthropic-definition', 'shorter-form'],
      source: 'https://www.anthropic.com/engineering/building-effective-agents',
    };
    // ACT
    const $ = sceneOf(AGENT);
    const back = '[data-level="agents"] [data-flipped="true"] > div > div:not([inert])';
    const actual = {
      definition: textsOf($, `${back} p:first-of-type`),
      markers: markersOf($, back),
      source: $(`${back} a`).attr('href'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('plays the summer party in the Agents scene and the Chat scene', () => {
    // ARRANGE
    const expected = [
      'Draft the party invitation in 3 lines.',
      'Plan the party trip.',
      'Search trains',
      '5 routes, fastest first.',
    ];
    // ACT
    const html = sceneOf(AGENT).html();
    const actual = expected.filter((line) => html.includes(line));
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('brackets the path as yours, hands each stage over and zooms into the task the agent steers', () => {
    // ARRANGE
    const expected = {
      design: ['You design this'],
      handoffs: [
        'a plan of epics',
        'tickets you signed off',
        'research, a source per number',
        'one page: the party plan',
      ],
      steers: ['The agent steers this'],
      task: [
        'You set its task: research each ticket in its own fresh chat, with web search and a source for every number. How it gets there is its own call.',
      ],
      steps: ['Search the web', 'Compare 3 venues', 'Note a source per number'],
      gates: ['You sign off', 'You sign off'],
    };
    // ACT
    const $ = sceneOf(WORKFLOW);
    const actual = {
      design: textsOf($, '[data-design-label]'),
      handoffs: textsOf($, '[data-handoff-row] [data-handoff]'),
      steers: textsOf($, '[data-steers-label]'),
      task: textsOf($, '[data-steers-task]'),
      steps: textsOf($, '[data-steers-step]'),
      gates: textsOf($, '[data-gate]'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('places every Context marker of What an agentic workflow is where the mock shows it', () => {
    // ARRANGE
    const expected = {
      design: ['two-levels-of-control'],
      steers: ['two-levels-of-control'],
      minimal: ['autonomy-as-a-degree', 'why-vendors-stress-autonomy'],
      research: 'research',
    };
    // ACT
    const $ = sceneOf(WORKFLOW);
    const actual = {
      design: markersOf($, '[data-design-bracket]'),
      steers: markersOf($, '[data-steers-lens]'),
      minimal: markersOf($, '[data-minimal-chip]'),
      research: $('[data-part="diagram"] > li').eq(2).attr('data-target'),
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it("ends each caption on the markers the mock shows: Anthropic's definition, then IBM's and Salesforce's wording", () => {
    // ARRANGE
    const expected = {
      agent: { note: 'anthropic-definition', notes: undefined },
      workflow: { note: undefined, notes: ['ibm-wording', 'salesforce-wording'] },
    };
    // ACT
    const captionOf = (slug: string) => {
      const header = localizedOf(slug).header;
      return { note: header?.captionNote?.note, notes: header?.captionNotes?.map(({ note }) => note) };
    };
    const actual = { agent: captionOf(AGENT), workflow: captionOf(WORKFLOW) };
    // ASSERT
    expect(actual).toEqual(expected);
  });
});

describe('failure cases', () => {
  it("never puts the Episode's own sentence under Anthropic's name on the Agents card", () => {
    // ARRANGE
    const episodeSentence = 'An agent is a language model that uses tools in a loop';
    // ACT
    const $ = sceneOf(AGENT);
    const cards = textsOf($, '[data-level="agents"] [data-flipped]');
    // ASSERT
    expect(cards.join(' ')).not.toContain(episodeSentence);
  });

  it('keeps the excluded claims out of both Slides, in every word they carry', () => {
    // ARRANGE
    const excluded = [/aviation/i, /backward pass/i, /PLAN-0002/, /exit condition/i];
    // ACT
    const words = [AGENT, WORKFLOW].map((slug) => JSON.stringify(slideOf(slug).messages)).join(' ');
    const found = excluded.filter((pattern) => pattern.test(words));
    // ASSERT
    expect(found).toEqual([]);
  });

  it('shows the human-in-the-loop toolbar with the use-case picker and the view switch alone', () => {
    // ARRANGE
    const hidden = ['demo', 'debug', 'download', 'upload', 'reset', 'level'];
    // ACT
    const $ = sceneOf(WORKFLOW);
    const shown = hidden.filter((control) => $(`[data-control="${control}"]`).length > 0);
    // ASSERT
    expect(shown).toEqual([]);
  });
});

describe('edge cases', () => {
  it('shows the German definition, the German Workflow and the German Voice script titles on the German page', () => {
    // ARRANGE
    const expected = {
      agentSegments: ['Modell, Werkzeuge, Schleife', 'Steuert seine eigenen Schritte'],
      workflowSegments: ['Die Definition', 'Zwei Ebenen', 'Minimal, wie minimal'],
      workflow: 'Ein Sommerfest planen',
    };
    // ACT
    const segmentsOf = (slug: string) =>
      slideOf(slug).segments.map(({ slug: segment }) => textOf(slug, 'de').voiceScript.segments[segment]?.title);
    const actual = {
      agentSegments: segmentsOf(AGENT),
      workflowSegments: segmentsOf(WORKFLOW),
      workflow: sceneOf(WORKFLOW, 'de').html().includes(expected.workflow) ? expected.workflow : '',
    };
    // ASSERT
    expect(actual).toEqual(expected);
  });

  it('leaves the BRIEF letters out of the diagram, since the Episode never names the acronym', () => {
    // ARRANGE
    const letters = 0;
    // ACT
    const $ = sceneOf(WORKFLOW);
    const actual = $('[data-part="diagram"] [data-move]').length;
    // ASSERT
    expect(actual).toBe(letters);
  });
});
