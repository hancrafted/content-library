import { describe, expect, it } from 'vitest';
import { chooseLanguage, parseCommandArgs, recordingLanguages } from './command-args.pure.ts';

describe('success cases', () => {
  it('reads the input, the language and the dry run from the command line', () => {
    // ARRANGE
    const expected = { ok: true, args: { input: 'ai-attention-span', language: 'en', dryRun: true } };
    // ACT
    const parsed = parseCommandArgs(['--lang', 'en', 'ai-attention-span', '--dry-run']);
    // ASSERT
    expect(parsed).toEqual(expected);
  });

  it('leaves the language open when --lang is absent', () => {
    // ARRANGE
    const expected = { ok: true, args: { input: 'x', dryRun: false } };
    // ACT
    const parsed = parseCommandArgs(['x']);
    // ASSERT
    expect(parsed).toEqual(expected);
  });

  it.each([
    ['one language of several kinds of file', ['transcript.de.vtt', 'slide-starts.de.json', 'youtube.de.md'], 'de'],
    ['an English recording', ['transcript.en.vtt'], 'en'],
  ])('infers the language from %s', (_name, files, expected) => {
    // ARRANGE
    // ACT
    const chosen = chooseLanguage(undefined, files);
    // ASSERT
    expect(chosen).toEqual({ ok: true, language: expected });
  });

  it('takes the requested language even when several exist', () => {
    // ARRANGE
    const files = ['transcript.de.vtt', 'transcript.en.vtt'];
    // ACT
    const chosen = chooseLanguage('en', files);
    // ASSERT
    expect(chosen).toEqual({ ok: true, language: 'en' });
  });

  it('lists the languages present, in the site order', () => {
    // ARRANGE
    const files = ['youtube.de.md', 'transcript.en.vtt', 'notes.txt'];
    // ACT
    const languages = recordingLanguages(files);
    // ASSERT
    expect(languages).toEqual(['en', 'de']);
  });
});

describe('failure cases', () => {
  it('refuses several languages and lists them', () => {
    // ARRANGE
    const files = ['transcript.de.vtt', 'transcript.en.vtt'];
    // ACT
    const chosen = chooseLanguage(undefined, files);
    // ASSERT
    expect(chosen).toEqual({
      ok: false,
      reason: 'the Recording folder holds several languages (en, de); pass --lang en|de',
    });
  });

  it('refuses a Recording folder with no language-named file', () => {
    // ARRANGE
    // ACT
    const chosen = chooseLanguage(undefined, []);
    // ASSERT
    expect(chosen.ok).toBe(false);
  });

  it('refuses an unknown --lang value', () => {
    // ARRANGE
    // ACT
    const parsed = parseCommandArgs(['x', '--lang', 'fr']);
    // ASSERT
    expect(parsed).toEqual({ ok: false, reason: '--lang takes en or de, got "fr"' });
  });

  it('refuses a command line without an input', () => {
    // ARRANGE
    // ACT
    const parsed = parseCommandArgs(['--lang', 'de']);
    // ASSERT
    expect(parsed.ok).toBe(false);
  });
});
