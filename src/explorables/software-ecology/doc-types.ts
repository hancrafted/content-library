// decision: docs/adr/0024-software-ecology-flow-model-and-use-case-files.md
export type Ctx = CanvasRenderingContext2D;

export interface Colors {
  readonly dark: boolean;
  readonly paper: string;
  readonly fg: string;
  readonly edge: string;
  readonly ai: string;
  readonly aiFill: string;
  readonly good: string;
  readonly warn: string;
  readonly bulb: string;
  readonly bulbEdge: string;
  readonly dull: string;
  readonly border: string;
  readonly destr: string;
  readonly badTint: string;
  readonly font: string;
}

export interface DocKind {
  readonly q: number;
  readonly ai: boolean;
  readonly warn: boolean;
  readonly own?: boolean;
  readonly gift?: boolean;
}
