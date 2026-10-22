import { describe, expect, it } from 'vitest';
import { chatLinks } from './chat-links.pure';

describe('success cases', () => {
  it('prefills ChatGPT with the encoded prompt through ?q=', () => {
    // ARRANGE
    const encoded = encodeURIComponent('Prompt of b & more');
    // ACT
    const links = chatLinks('Prompt of b & more');
    // ASSERT
    expect(links).toEqual({ chatgpt: `https://chatgpt.com/?q=${encoded}` });
  });
});

describe('failure cases', () => {
  it('never lets a prompt break out of the query string', () => {
    // ARRANGE
    const text = 'a&b=c#d';
    // ACT
    const links = chatLinks(text);
    // ASSERT
    expect(links.chatgpt).toBe('https://chatgpt.com/?q=a%26b%3Dc%23d');
  });
});

describe('edge cases', () => {
  it('encodes an empty prompt as an empty query', () => {
    // ARRANGE
    const text = '';
    // ACT
    const links = chatLinks(text);
    // ASSERT
    expect(links.chatgpt).toBe('https://chatgpt.com/?q=');
  });
});
