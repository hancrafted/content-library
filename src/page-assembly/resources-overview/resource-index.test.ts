import { pageKeyOf, pageLocales, routeOf } from '@/content-store/catalogue/record-routes';
import { PAGES } from '@/content-store/store';
import { describe, expect, it } from 'vitest';
import { resourceIndex } from './resource-index';
import { RESOURCE_KINDS } from './resource-index.pure';

/*
 * The Resource index over the real records: it is a projection of the page catalogue, so it holds a page exactly when
 * the catalogue lists it, in every locale the page is exported in.
 */

const KINDS = new Set<string>(['episode', 'event', 'explorable-page', 'guide', 'template']);
const listedUrls = () =>
  PAGES.filter(({ page, treatment }) => KINDS.has(page.kind) && treatment.listed).flatMap(({ page }) =>
    pageLocales(page).map((locale) => `${locale}:${routeOf(page)}`),
  );

describe('success cases', () => {
  it('holds every listed page of every kind, in each locale it is exported in', () => {
    // ARRANGE
    const expected = listedUrls().sort();
    // ACT
    const held = resourceIndex()
      .map(({ locale, route }) => `${locale}:${route}`)
      .sort();
    // ASSERT
    expect(held).toEqual(expected);
  });

  it('holds no page the catalogue does not list', () => {
    // ARRANGE
    const unlisted = new Set(
      PAGES.filter(({ page, treatment }) => KINDS.has(page.kind) && !treatment.listed).map(({ page }) =>
        pageKeyOf(page),
      ),
    );
    // ACT
    const routes = new Set(resourceIndex().map(({ route }) => route));
    const leaked = PAGES.filter(({ page }) => unlisted.has(pageKeyOf(page)) && routes.has(routeOf(page)));
    // ASSERT
    expect(leaked).toEqual([]);
  });

  it('has entries of every Resource kind the catalogue lists a page of', () => {
    // ARRANGE
    // No Guide exists until the first is scaffolded, so a kind with no listed page is not expected yet.
    const guideListed = PAGES.some(({ page, treatment }) => page.kind === 'guide' && treatment.listed);
    const expected = RESOURCE_KINDS.filter((kind) => kind !== 'guide' || guideListed);
    // ACT
    const kinds = new Set(resourceIndex().map(({ kind }) => kind));
    // ASSERT
    expect(expected.filter((kind) => !kinds.has(kind))).toEqual([]);
  });

  it('gives every entry words, a Tag and a URL its locale writes', () => {
    // ARRANGE
    const entries = resourceIndex();
    // ACT
    const broken = entries.filter(
      ({ title, description, tags, url, locale }) =>
        title === '' ||
        description === '' ||
        tags.length === 0 ||
        (locale === 'en' ? url.startsWith('/de') : !url.startsWith('/de')),
    );
    // ASSERT
    expect(broken).toEqual([]);
  });

  it('is plain data: it survives a JSON round trip unchanged', () => {
    // ARRANGE
    const entries = resourceIndex();
    // ACT
    const copy: unknown = JSON.parse(JSON.stringify(entries));
    // ASSERT
    expect(copy).toEqual(entries);
  });
});

describe('failure cases', () => {
  it('holds no entry for a page of a kind the Resource index does not cover', () => {
    // ARRANGE
    const covered = new Set<string>(RESOURCE_KINDS);
    // ACT
    const stray = resourceIndex().filter(({ kind }) => !covered.has(kind));
    // ASSERT
    expect(stray).toEqual([]);
  });
});

describe('edge cases', () => {
  it('gives a page one entry per locale it is exported in, none twice', () => {
    // ARRANGE
    const entries = resourceIndex();
    // ACT
    const keys = entries.map(({ kind, slug, locale }) => `${kind}:${slug}:${locale}`);
    // ASSERT
    expect(new Set(keys).size).toBe(keys.length);
  });
});
