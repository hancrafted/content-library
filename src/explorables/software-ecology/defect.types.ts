// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
type Chances = Readonly<Record<string, number>>;

export type Defect = 'spec' | 'code';

export type Catch = Readonly<Partial<Record<Defect, number>>>;

export type KindChances = Record<Defect, Record<string, number>>;

export type BadChances = Chances | Readonly<Partial<Record<Defect, Chances>>>;
