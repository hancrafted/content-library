import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  TryPrompt,
  type PromptKit,
  type PromptSection,
  type PromptSlot,
  type PromptTechnique,
  type TryPromptWords,
} from './try-prompt.client';

const WORDS: TryPromptWords = {
  promptLabel: 'Prompt',
  commandLabel: 'Command',
  copyPrompt: 'Copy prompt',
  copyCommand: 'Copy command',
  openChatgpt: 'Open in ChatGPT',
  newTab: 'new tab',
  tooLong: 'Too long for a link: copies the prompt and opens an empty chat',
  whatToDo: 'What to do',
  preview: 'Prompt preview',
  showFull: 'Show full text',
  collapse: 'Collapse',
  tierBasic: 'Basic',
  tierAdvanced: 'Advanced',
  sampleHint: 'Sample: {title} · {lines} lines',
  sampleHintOne: 'Sample: {title} · 1 line',
};
const NOOP = vi.fn();
const KIT: PromptKit = { words: WORDS, onCopy: NOOP };
const PURPOSES = { role: 'A role steers behaviour.', task: 'The one thing you want done.' };
const SECTIONS: PromptSection[] = [
  { heading: 'Your role', purpose: 'role', text: 'You are a researcher.' },
  { heading: 'Requirements', purpose: 'task', text: '{{spec}}' },
  { heading: 'Plain', text: 'No purpose here.' },
];
const SPEC: PromptSlot = { id: 'spec', mode: 'single', label: 'Spec', sample: 'SAMPLE SPEC' };

function render(props: {
  sections: PromptSection[];
  slots?: PromptSlot[];
  values?: Record<string, string>;
  instructions?: string;
  techniques?: PromptTechnique[];
}): string {
  const { values, ...rest } = props;
  const prompt = { kind: 'prompt' as const, text: '', purposes: PURPOSES, ...rest };
  return renderToStaticMarkup(createElement(TryPrompt, { prompt, kit: KIT, values }));
}

/** The prompt as it is copied, carried on the body. */
function shown(html: string): string {
  const match = /data-prompt-text="([^"]*)"/.exec(html);
  return (match?.[1] ?? '').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&amp;', '&');
}

const SOURCES: PromptSlot = { id: 'research', mode: 'multiple', label: 'Research', sample: 'SAMPLE R' };
const MULTI: PromptSection[] = [{ heading: 'Inputs', text: '{{research_1}}|{{research_2}}|{{research_3}}' }];

function entries(html: string): number {
  return html.split('data-slot-entry').length - 1;
}

describe('success cases', () => {
  it('replaces a marker with the pasted value', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC], values: { spec: 'MY SPEC' } };
    // ACT
    const text = shown(render(props));
    // ASSERT
    expect(text).toContain('## Requirements\n\nMY SPEC');
    expect(text).not.toContain('SAMPLE SPEC');
  });

  it('keeps the sample of an empty slot in the prompt', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC] };
    // ACT
    const text = shown(render(props));
    // ASSERT
    expect(text).toContain('## Requirements\n\nSAMPLE SPEC');
  });

  it('joins sections as H2 headings in one markdown prompt', () => {
    // ARRANGE
    const expected =
      '## Your role\n\nYou are a researcher.\n\n## Requirements\n\nSAMPLE SPEC\n\n## Plain\n\nNo purpose here.';
    // ACT
    const text = shown(render({ sections: SECTIONS, slots: [SPEC] }));
    // ASSERT
    expect(text).toBe(expected);
  });

  it('gives a purpose marker the explanation of its purpose', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('data-purpose="role"');
    expect(html).toContain('A role steers behaviour.');
  });

  it('lists the techniques of a section in its purpose marker, each with its tier', () => {
    // ARRANGE
    const techniques: PromptTechnique[] = [
      { id: 'fence', tier: 'basic', title: 'Fence it', explain: 'Wrap pasted text.' },
      { id: 'shots', tier: 'advanced', title: 'Show one', explain: 'Give an example.' },
    ];
    const sections = [{ ...SECTIONS[0]!, techniques: ['fence', 'shots'] }];
    // ACT
    const html = render({ sections, techniques });
    // ASSERT
    expect(html).toContain('data-techniques="fence shots"');
    expect(html).toMatch(/Basic[^<]*<\/[a-z]+>[^]*Fence it[^]*Wrap pasted text\./);
    expect(html).toMatch(/Advanced[^]*Show one[^]*Give an example\./);
    expect(html).toContain('A role steers behaviour.');
  });

  it('leaves a section without techniques unchanged', () => {
    // ARRANGE
    const techniques: PromptTechnique[] = [{ id: 'fence', tier: 'basic', title: 'Fence it', explain: 'Wrap.' }];
    // ACT
    const html = render({ sections: SECTIONS, techniques });
    // ASSERT
    expect(html).not.toContain('data-techniques');
    expect(html).not.toContain('Fence it');
  });

  it('prefers a per-section explanation over the purpose one', () => {
    // ARRANGE
    const props = { sections: [{ ...SECTIONS[0]!, explain: 'Only here.' }] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('Only here.');
    expect(html).not.toContain('A role steers behaviour.');
  });

  it('fills each numbered marker of a multiple slot from its own entry', () => {
    // ARRANGE
    const props = { sections: MULTI, slots: [SOURCES], values: { research_1: 'A', research_3: 'C' } };
    // ACT
    const text = shown(render(props));
    // ASSERT
    expect(text).toContain('A|SAMPLE R|C');
  });

  it('fills each empty entry of a multiple slot with its own sample', () => {
    // ARRANGE
    const slot: PromptSlot = { ...SOURCES, sample: ['S1', 'S2', 'S3'] };
    const props = { sections: MULTI, slots: [slot], values: { research_2: 'B' } };
    // ACT
    const text = shown(render(props));
    // ASSERT
    expect(text).toContain('S1|B|S3');
  });

  it('hints each empty entry with its own sample title and line count', () => {
    // ARRANGE
    const slot: PromptSlot = { ...SOURCES, sample: ['S1', 'S2', 'S3'] };
    const props = { sections: MULTI, slots: [slot], values: { research_1: 'A', research_2: 'B', research_3: 'C' } };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('placeholder="Sample: S1 · 1 line"');
    expect(html).toContain('placeholder="Sample: S2 · 1 line"');
    expect(html).toContain('placeholder="Sample: S3 · 1 line"');
  });

  it('starts a multiple slot with one entry and a plus button', () => {
    // ARRANGE
    const props = { sections: MULTI, slots: [SOURCES] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(entries(html)).toBe(1);
    expect(html).toContain('data-slot-add');
  });

  it('prefills the ChatGPT link with the prompt and offers no Claude link', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('href="https://chatgpt.com/?q=');
    expect(html).not.toContain('claude.ai');
    expect(html).not.toContain('Claude');
  });

  it('opens the What to do panel and closes the Prompt preview by default', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC], instructions: 'Open a fresh chat.' };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toMatch(
      /aria-expanded="true"[^>]*data-panel-toggle="todo"|data-panel-toggle="todo"[^>]*aria-expanded="true"/,
    );
    expect(html).toMatch(
      /aria-expanded="false"[^>]*data-panel-toggle="preview"|data-panel-toggle="preview"[^>]*aria-expanded="false"/,
    );
    expect(html).toMatch(/<div[^>]*data-panel="preview"[^>]*hidden=""|<div[^>]*hidden=""[^>]*data-panel="preview"/);
    expect(html).not.toMatch(/<div[^>]*data-panel="todo"[^>]*hidden=""/);
  });

  it('renders the instructions in the What to do panel', () => {
    // ARRANGE
    const props = { sections: SECTIONS, instructions: 'Open a fresh chat.' };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('Open a fresh chat.');
    expect(html).toContain('What to do');
  });

  it('shows the What to do panel for slots alone', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('data-panel="todo"');
  });

  it('shows a slot as a label, an upload button, an eye toggle and a one-row textarea', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('>Spec</label>');
    expect(html).toContain('rows="1"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-label="Show full text"');
    expect(html).toContain('type="file"');
  });

  it('hints an empty field with the title and line count of its sample', () => {
    // ARRANGE
    const sample = '---\nkind: spec\n---\n# Old Mill\n## Goal\nx';
    const props = { sections: SECTIONS, slots: [{ ...SPEC, sample }] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('placeholder="Sample: Old Mill · 6 lines"');
  });

  it('keeps every line break of a pasted text in the collapsed field', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC], values: { spec: 'first\nsecond' } };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toMatch(/<textarea[^>]*rows="1"[^>]*>first\nsecond<\/textarea>/);
  });

  it('shows a plain text prompt as one section without heading or marker', () => {
    // ARRANGE
    const prompt = { kind: 'prompt' as const, text: 'Just text.' };
    // ACT
    const html = renderToStaticMarkup(createElement(TryPrompt, { prompt, kit: KIT }));
    // ASSERT
    expect(shown(html)).toBe('Just text.');
    expect(html).not.toContain('data-purpose');
  });
});

describe('failure cases', () => {
  it('shows no What to do panel when the step has neither instructions nor slots', () => {
    // ARRANGE
    const props = { sections: SECTIONS };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).not.toContain('data-panel="todo"');
    expect(html).toContain('data-panel="preview"');
  });

  it('shows no marker on a section without a purpose', () => {
    // ARRANGE
    const props = { sections: [SECTIONS[2]!] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).not.toContain('data-purpose');
  });

  it('shows no marker when the purpose has no explanation', () => {
    // ARRANGE
    const props = { sections: [{ heading: 'X', purpose: 'steps', text: 'a' }] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).not.toContain('data-purpose');
  });

  it('caps a multiple slot at its marker count: no plus button once every marker has an entry', () => {
    // ARRANGE
    const values = { research_1: 'A', research_2: 'B', research_3: 'C' };
    const markers = 3;
    // ACT
    const html = render({ sections: MULTI, slots: [SOURCES], values });
    // ASSERT
    expect(entries(html)).toBe(markers);
    expect(html).not.toContain('data-slot-add');
  });

  it('never shows an entry for a marker the text does not have', () => {
    // ARRANGE
    const values = { research_1: 'A', research_2: 'B', research_4: 'D' };
    const filledMarkers = 2;
    // ACT
    const html = render({ sections: MULTI, slots: [SOURCES], values });
    // ASSERT
    expect(entries(html)).toBe(filledMarkers);
    expect(html).not.toContain('data-slot-entry="research_4"');
  });

  it('opens an empty chat and says so in the tooltip when the prompt is too long for a link', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC], values: { spec: 'x'.repeat(20000) } };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('href="https://chatgpt.com/"');
    expect(html).toContain(WORDS.tooLong);
  });
});

describe('edge cases', () => {
  it('does not mention the fallback while the link fits', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).not.toContain(WORDS.tooLong);
  });

  it('treats a whitespace-only paste as empty and keeps the sample', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC], values: { spec: '   ' } };
    // ACT
    const text = shown(render(props));
    // ASSERT
    expect(text).toContain('SAMPLE SPEC');
  });

  it('leaves an unknown marker as written', () => {
    // ARRANGE
    const props = { sections: [{ heading: 'T', text: 'Chat {{n}}' }] };
    // ACT
    const text = shown(render(props));
    // ASSERT
    expect(text).toBe('## T\n\nChat {{n}}');
  });
});
