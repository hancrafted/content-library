import { describe, expect, it } from 'vitest';
import { unzipGesture } from './unzip.pure';

describe('success cases', () => {
  it('unzips on Windows from the right-click menu, and warns against the double-click', () => {
    // ARRANGE
    const expected = { kind: 'menu', warn: true };
    // ACT
    const gesture = unzipGesture('windows');
    // ASSERT
    expect(gesture).toEqual(expected);
  });

  it('unzips on Mac by a double-click, with no menu and no warning', () => {
    // ARRANGE
    const expected = { kind: 'double-click', warn: false };
    // ACT
    const gesture = unzipGesture('mac');
    // ASSERT
    expect(gesture).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('reads an unknown OS as Mac, the page default', () => {
    // ARRANGE
    const expected = unzipGesture('mac');
    // ACT
    const gesture = unzipGesture('beos');
    // ASSERT
    expect(gesture).toEqual(expected);
  });
});

describe('edge cases', () => {
  it('unzips on Linux from the file manager menu without the Windows warning', () => {
    // ARRANGE
    const expected = { kind: 'menu', warn: false };
    // ACT
    const gesture = unzipGesture('linux');
    // ASSERT
    expect(gesture).toEqual(expected);
  });
});
