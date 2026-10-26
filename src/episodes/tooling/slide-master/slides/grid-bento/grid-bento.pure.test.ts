import { describe, expect, it } from 'vitest';
import { BENTO_COLUMNS, BENTO_TILES, loopPlayState, packTiles } from './grid-bento.pure';

const lead = BENTO_TILES[0];

describe('success cases', () => {
  it('packs the six tiles onto the 4-column grid with no hole, in three rows', () => {
    // ARRANGE
    const expectedRows = 3;
    // ACT
    const packing = packTiles(BENTO_TILES, BENTO_COLUMNS.md);
    // ASSERT
    expect(packing).toEqual({ rows: expectedRows, holes: 0 });
  });

  it('packs the same tiles onto the 2-column grid with no hole', () => {
    // ARRANGE
    const columns = BENTO_COLUMNS.sm;
    // ACT
    const packing = packTiles(BENTO_TILES, columns);
    // ASSERT
    expect(packing.holes).toBe(0);
  });

  it('plays the lead tile loop only while the Slide is active', () => {
    // ARRANGE
    const zones = ['far', 'near', 'active'] as const;
    const expected = ['paused', 'paused', 'running'];
    // ACT
    const states = zones.map(loopPlayState);
    // ASSERT
    expect(states).toEqual(expected);
  });
});

describe('failure cases', () => {
  it('rejects a tile wider than the grid', () => {
    // ARRANGE
    const columns = lead.cols - 1;
    // ACT
    const pack = () => packTiles([lead], columns);
    // ASSERT
    expect(pack).toThrow(lead.cell);
  });

  it('rejects a grid with no columns', () => {
    // ARRANGE
    const columns = 0;
    // ACT
    const pack = () => packTiles(BENTO_TILES, columns);
    // ASSERT
    expect(pack).toThrow(String(columns));
  });
});

describe('edge cases', () => {
  it('counts the empty cells a lone narrow tile leaves in its row', () => {
    // ARRANGE
    const narrow = { cell: 'c3', cols: 1, rows: 1 } as const;
    const columns = BENTO_COLUMNS.md;
    // ACT
    const packing = packTiles([narrow], columns);
    // ASSERT
    expect(packing).toEqual({ rows: narrow.rows, holes: columns - narrow.cols });
  });

  it('needs no rows for no tiles', () => {
    // ARRANGE
    const empty = { rows: 0, holes: 0 };
    // ACT
    const packing = packTiles([], BENTO_COLUMNS.md);
    // ASSERT
    expect(packing).toEqual(empty);
  });

  it('makes the lead the only tile spanning two rows and two columns', () => {
    // ARRANGE
    const span = 2;
    // ACT
    const leads = BENTO_TILES.filter((tile) => tile.cols === span && tile.rows === span);
    // ASSERT
    expect(leads).toEqual([lead]);
  });
});
