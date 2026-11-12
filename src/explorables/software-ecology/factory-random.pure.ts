/*
 * Randomness and storage for the factory model (design-ADR 0024 §1): seeded streams per node, so one setting never
 * reshuffles another's draws, and a deque with O(1) at both ends. Ported unchanged from the reference build, so the
 * same seed draws the same numbers.
 */
export type Rand = () => number;
/** The four random streams of one node: arrivals, service, routing, quality. */
export type Streams = Readonly<Record<'ra' | 'rs' | 'rr' | 'rq', Rand>>;

export const mulberry =
  (seed: number): Rand =>
  () => {
    let a = seed | 0;
    a = (a + 0x6d2b79f5) | 0;
    seed = a;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

export const mix = (a: number, b: number): number => {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  return (h ^ (h >>> 13)) >>> 0;
};

/** The four streams of node `i`: arrivals, service, routing, quality. */
export const streams = (seed: number, i: number): Streams => ({
  ra: mulberry(mix(seed, i * 8 + 1)),
  rs: mulberry(mix(seed, i * 8 + 2)),
  rr: mulberry(mix(seed, i * 8 + 3)),
  rq: mulberry(mix(seed, i * 8 + 4)),
});

export const expo = (r: Rand, mean: number): number => -Math.log(1 - r()) * mean;

export const normal = (r: Rand): number => {
  const u = 1 - r(),
    v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

/** k documents, each good with chance p: exact up to 64, a normal approximation above (a big batch costs one draw). */
export const binom = (r: Rand, k: number, p: number): number => {
  if (p <= 0 || k <= 0) return 0;
  if (p >= 1) return k;
  if (k <= 64) {
    let g = 0;
    for (let i = 0; i < k; i++) if (r() < p) g++;
    return g;
  }
  return Math.max(0, Math.min(k, Math.round(k * p + normal(r) * Math.sqrt(k * p * (1 - p)))));
};

/** A deque with O(1) at both ends. */
export class Ring<T> {
  private a: (T | undefined)[] = new Array<T | undefined>(16);
  private h = 0;
  n = 0;

  at(i: number): T {
    return this.a[(this.h + i) & (this.a.length - 1)] as T;
  }

  private grow(): void {
    const b = new Array<T | undefined>(this.a.length * 2);
    for (let i = 0; i < this.n; i++) b[i] = this.at(i);
    this.a = b;
    this.h = 0;
  }

  push(x: T): void {
    if (this.n === this.a.length) this.grow();
    this.a[(this.h + this.n) & (this.a.length - 1)] = x;
    this.n++;
  }

  unshift(x: T): void {
    if (this.n === this.a.length) this.grow();
    this.h = (this.h - 1) & (this.a.length - 1);
    this.a[this.h] = x;
    this.n++;
  }

  shift(): T {
    const x = this.a[this.h] as T;
    this.a[this.h] = undefined;
    this.h = (this.h + 1) & (this.a.length - 1);
    this.n--;
    return x;
  }

  first(): T | undefined {
    return this.n ? (this.a[this.h] as T) : undefined;
  }

  last(): T | undefined {
    return this.n ? this.at(this.n - 1) : undefined;
  }
}
