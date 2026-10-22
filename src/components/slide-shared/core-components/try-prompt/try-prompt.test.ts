import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import {
  TryPrompt,
  type PromptKit,
  type PromptSection,
  type PromptSlot,
  type TryPromptWords,
} from './try-prompt.client';

const WORDS: TryPromptWords = {
  promptLabel: 'Prompt',
  commandLabel: 'Command',
  copyPrompt: 'Copy prompt',
  copyCommand: 'Copy command',
  openChatgpt: 'Open in ChatGPT',
  openClaude: 'Open in Claude',
  short: 'Short',
  shortTip: 'Shorter',
  newTab: 'new tab',
  tooLong: 'Too long for a link: copies the prompt and opens an empty chat',
};
const NOOP = vi.fn();
const KIT: PromptKit = { short: false, words: WORDS, onShort: NOOP, onCopy: NOOP };
const PURPOSES = { role: 'A role steers behaviour.', task: 'The one thing you want done.' };
const SECTIONS: PromptSection[] = [
  { heading: 'Your role', purpose: 'role', text: 'You are a researcher.' },
  { heading: 'Requirements', purpose: 'task', text: '{{spec}}' },
  { heading: 'Plain', text: 'No purpose here.' },
];
const SPEC: PromptSlot = { id: 'spec', mode: 'single', label: 'Spec', sample: 'SAMPLE SPEC' };

function render(props: { sections: PromptSection[]; slots?: PromptSlot[]; values?: Record<string, string> }): string {
  const { values, ...rest } = props;
  const prompt = { kind: 'prompt' as const, text: '', purposes: PURPOSES, ...rest };
  return renderToStaticMarkup(createElement(TryPrompt, { prompt, kit: KIT, values }));
}

/** The text of the prompt as shown, which is the text that is copied. */
function shown(html: string): string {
  const match = /data-prompt-text=""[^>]*>([\s\S]*?)<\/pre>/.exec(html);
  return (match?.[1] ?? '').replaceAll('&quot;', '"').replaceAll('&#x27;', "'");
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

  it('starts a multiple slot with one entry and a plus button', () => {
    // ARRANGE
    const props = { sections: MULTI, slots: [SOURCES] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(entries(html)).toBe(1);
    expect(html).toContain('data-slot-add');
  });

  it('prefills the chat link with the prompt', () => {
    // ARRANGE
    const props = { sections: SECTIONS, slots: [SPEC] };
    // ACT
    const html = render(props);
    // ASSERT
    expect(html).toContain('href="https://claude.ai/new?q=');
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
    expect(html).toContain('href="https://claude.ai/new"');
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
