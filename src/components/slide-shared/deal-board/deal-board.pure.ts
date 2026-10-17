/** One prospect on the deal board. `contact` and `value` are left off on the compact board, which names the company only. */
export interface Deal {
  readonly slug: string;
  readonly company: string;
  readonly contact?: string;
  /** In euros. */
  readonly value?: number;
}

/** A dashed slot closing a lane: a place a note has not reached yet, `success` for the money still to come. */
export interface DealSlot {
  readonly text?: string;
  readonly tone?: 'success';
}

/** One stage of the pipeline: a lane under a dark pill, its deals top to bottom, then its slot if it has one. */
export interface DealLane {
  readonly slug: string;
  readonly label: string;
  readonly deals: readonly Deal[];
  readonly slot?: DealSlot;
}

/** What a lane's deals are worth together. */
export function laneTotal(lane: DealLane): number {
  return lane.deals.reduce((sum, deal) => sum + (deal.value ?? 0), 0);
}

/** What every deal on the board is worth together: the open pipeline. */
export function pipelineTotal(lanes: readonly DealLane[]): number {
  return lanes.reduce((sum, lane) => sum + laneTotal(lane), 0);
}

/** How many deals stand on the board. */
export function dealCount(lanes: readonly DealLane[]): number {
  return lanes.reduce((sum, lane) => sum + lane.deals.length, 0);
}

/** What `checkDealBoard` reads: the lanes, the emphasised lane's slug and the lanes a bracket spans, from 1. */
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
