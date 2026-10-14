import { describe, expect, it } from 'vitest';
import { IDLE_MS, expandJobs, fitScale, isIdle, mainCheckout, parseArgs, parseEndpoint } from './inspect-page.pure.ts';

describe('parseArgs', () => {
  it('collects repeated --url and a comma-separated --theme', () => {
    const parsed = parseArgs(['--url', 'http://a/', '--url', 'http://b/', '--theme', 'light,dark']);
    expect(parsed).toMatchObject({ urls: ['http://a/', 'http://b/'], themes: ['light', 'dark'], stop: false });
  });
  it('defaults to viewport 1280x800, no theme, 500 ms wait', () => {
    expect(parseArgs(['--url', 'http://a/'])).toMatchObject({ width: 1280, height: 800, themes: [null], wait: 500 });
  });
  it('accepts --stop without a url', () => {
    expect(parseArgs(['--stop'])).toMatchObject({ stop: true });
  });
  it('rejects a missing url and an unknown theme', () => {
    expect(parseArgs([])).toHaveProperty('error');
    expect(parseArgs(['--url', 'x', '--theme', 'sepia'])).toHaveProperty('error');
  });
});

describe('expandJobs', () => {
  it('yields one job per url x theme, url-major', () => {
    const jobs = expandJobs(['a', 'b'], ['light', 'dark']);
    expect(jobs.map((job) => `${job.url}/${job.theme}`)).toEqual(['a/light', 'a/dark', 'b/light', 'b/dark']);
  });
});

describe('fitScale', () => {
  it('keeps a small capture at device pixel ratio 2', () => {
    expect(fitScale({ width: 300, height: 200 })).toEqual({ scale: 1, pixels: { width: 600, height: 400 } });
  });
  it('shrinks so the long edge is 1568 px', () => {
    const { scale, pixels } = fitScale({ width: 1280, height: 800 });
    expect(pixels.width).toBe(1568);
    expect(pixels.height).toBe(980);
    expect(scale).toBeCloseTo(0.6125);
  });
  it('caps a tall page on its height', () => {
    expect(fitScale({ width: 1280, height: 10000 }).pixels.height).toBe(1568);
  });
});

describe('parseEndpoint', () => {
  it('reads a saved endpoint', () => {
    expect(parseEndpoint('{"pid":5,"port":9222,"watchdog":6}')).toEqual({ pid: 5, port: 9222, watchdog: 6 });
  });
  it('treats garbage as no endpoint', () => {
    expect(parseEndpoint('nope')).toBeNull();
    expect(parseEndpoint('{"pid":"x"}')).toBeNull();
  });
});

describe('isIdle', () => {
  it('is idle only after ten minutes without a call', () => {
    expect(isIdle(0, IDLE_MS - 1)).toBe(false);
    expect(isIdle(0, IDLE_MS)).toBe(true);
  });
});

describe('mainCheckout', () => {
  it('is the parent of an absolute common dir, so every worktree resolves to the same checkout', () => {
    expect(mainCheckout('/repo/.git', '/repo/.worktrees/a')).toBe('/repo');
  });
  it('resolves the relative common dir of the main checkout itself', () => {
    expect(mainCheckout('.git', '/repo')).toBe('/repo');
  });
});
