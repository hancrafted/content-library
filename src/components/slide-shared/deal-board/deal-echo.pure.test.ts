import { describe, expect, it } from 'vitest';
import { checkDealEcho } from './deal-echo.pure';

describe('success cases', () => {
  it('accepts one ringed lane', () => {
    // ARRANGE
    const lanes = [{ ringed: true }, {}, {}];
    // ACT
    const check = () => checkDealEcho(lanes);
    // ASSERT
    expect(check).not.toThrow();
  });
});

describe('failure cases', () => {
  it('refuses a second ringed lane, naming how many it rings', () => {
    // ARRANGE
    const lanes = [{ ringed: true }, { ringed: true }];
    const expected = /rings 2 lanes/;
    // ACT
    const check = () => checkDealEcho(lanes);
    // ASSERT
    expect(check).toThrow(expected);
  });
});

describe('edge cases', () => {
  it('accepts an echo that rings no lane', () => {
    // ARRANGE
    const lanes = [{}, { ringed: false }];
    // ACT
    const check = () => checkDealEcho(lanes);
    // ASSERT
    expect(check).not.toThrow();
  });
});
