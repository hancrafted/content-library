export interface Deal {
  readonly slug: string;
  readonly company: string;
  readonly contact?: string;
  /** In euros. */
  readonly value?: number;
  readonly tag?: string;
  readonly ringed?: boolean;
}

export type DealSlot = { readonly kind: 'open' } | { readonly kind: 'payment'; readonly text?: string };

export interface DealLane<Slug extends string = string> {
  readonly slug: Slug;
  readonly label: string;
  readonly deals: readonly Deal[];
  readonly slot?: DealSlot;
}

export function laneTotal(lane: DealLane): number {
  return lane.deals.reduce((sum, deal) => sum + (deal.value ?? 0), 0);
}

export function pipelineTotal(lanes: readonly DealLane[]): number {
  return lanes.reduce((sum, lane) => sum + laneTotal(lane), 0);
}

export function dealCount(lanes: readonly DealLane[]): number {
  return lanes.reduce((sum, lane) => sum + lane.deals.length, 0);
}

interface DealBoardPlacements {
  readonly lanes: readonly DealLane[];
  readonly emphasis?: string;
  readonly bracket?: { readonly from: number; readonly to: number };
}

/** Throws when a bracket end is not a lane from 1 to `count`. */
function checkBracketLane(lane: number, count: number): void {
  if (!Number.isInteger(lane) || lane < 1 || lane > count) {
    throw new Error(`The bracket reaches lane ${lane}; the deal board has lanes 1 to ${count}.`);
  }
}

/** Throws when the emphasis names no lane, or a bracket reaches a lane the board does not have. */
export function checkDealBoard({ lanes, emphasis, bracket }: DealBoardPlacements): void {
  if (emphasis !== undefined && !lanes.some((lane) => lane.slug === emphasis)) {
    throw new Error(`The deal board has no lane "${emphasis}" to emphasise.`);
  }
  if (bracket) [bracket.from, bracket.to].forEach((lane) => checkBracketLane(lane, lanes.length));
}
