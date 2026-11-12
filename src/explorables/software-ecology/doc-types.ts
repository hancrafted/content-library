/*
 * The canvas' shared shapes (design-ADR 0024 §15): the context, the token colours the painter needs and a document's
 * kind. Types only, so the sprite sheet and the marks it draws can both name them.
 */

export type Ctx = CanvasRenderingContext2D;

/** The token colours the painter needs, resolved to what the canvas understands. */
export interface Colors {
  readonly dark: boolean;
  readonly paper: string;
  readonly fg: string;
  readonly edge: string;
  readonly ai: string;
  readonly aiFill: string;
  readonly good: string;
  readonly warn: string;
  readonly dull: string;
  readonly border: string;
  readonly destr: string;
  readonly badTint: string;
  readonly font: string;
}

/** A document: good (1) or bad (0), AI-made, with a warning mark. */
export interface DocKind {
  readonly q: number;
  readonly ai: boolean;
  readonly warn: boolean;
  /** An own ticket, or the document that carries one on: a lightbulb. */
  readonly own?: boolean;
  /** A release to the Customer: a gift box, with a red bug when it is bad. */
  readonly gift?: boolean;
}
