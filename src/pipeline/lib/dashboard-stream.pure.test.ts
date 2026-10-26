import { describe, expect, it } from 'vitest';
import { createLogStream } from './dashboard-stream.pure';

describe('success cases', () => {
  it('carries partial JSONL and UTF-8 bytes across appends', () => {
    // ARRANGE
    const stream = createLogStream();
    const bytes = new TextEncoder().encode('{"name":"Grüße"}\n{"next":true}\n');
    const cut = 12;
    const expected = ['{"name":"Grüße"}', '{"next":true}'];
    // ACT
    const first = stream.append(bytes.slice(0, cut), cut);
    const second = stream.append(bytes.slice(cut), bytes.length);
    // ASSERT
    expect(first.lines).toEqual([]);
    expect(second.lines).toEqual(expected);
    expect(stream.offset).toBe(bytes.length);
  });
});

describe('failure cases', () => {
  it('rejects malformed UTF-8 rather than replacing its bytes silently', () => {
    // ARRANGE
    const stream = createLogStream();
    const invalid = new Uint8Array([255, 10]);
    const expected = /encoded data/;
    // ACT
    const append = () => stream.append(invalid, invalid.length);
    // ASSERT
    expect(append).toThrow(expected);
    expect(stream.offset).toBe(0);
  });
});

describe('edge cases', () => {
  it('resets the byte offset and partial tail when a file shrinks to empty', () => {
    // ARRANGE
    const stream = createLogStream();
    const partial = new TextEncoder().encode('{"partial":');
    const replacement = new TextEncoder().encode('{"fresh":true}\n');
    const expected = ['{"fresh":true}'];
    stream.append(partial, partial.length);
    // ACT
    const truncated = stream.append(new Uint8Array(), 0);
    const resetOffset = stream.offset;
    const next = stream.append(replacement, replacement.length);
    const empty = stream.append(new Uint8Array(), replacement.length);
    // ASSERT
    expect(truncated.reset).toBe(true);
    expect(resetOffset).toBe(0);
    expect(next.lines).toEqual(expected);
    expect(empty.lines).toEqual([]);
    expect(empty.reset).toBe(false);
    expect(stream.offset).toBe(replacement.length);
  });
});
