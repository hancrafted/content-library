/*
 * Defect origin (design-ADR 0024 §5): a bad document carries the kind of its first defect, `spec` (made bad at or
 * before Analysis) or `code` (made bad from Engineering on). software-ecology.types.ts re-exports these.
 */
/** Chances a follow-up goes to each work center. */
type Chances = Readonly<Record<string, number>>;

export type Defect = 'spec' | 'code';

/** A station's chance to send back a bad input, per kind; a kind left out passes. */
export type Catch = Readonly<Partial<Record<Defect, number>>>;

/** A bad release's follow-up chances per kind, at the settings: where a change request or a bug goes. */
export type KindChances = Record<Defect, Record<string, number>>;

/** `customer.bad` in a file: per kind, or one map for every kind. */
export type BadChances = Chances | Readonly<Partial<Record<Defect, Chances>>>;
