/** What `checkDealEcho` reads of a lane: whether it is ringed. */
interface RingedLane {
  readonly ringed?: boolean;
}

/** Throws when the echo rings more than one lane: a section slide rings only the one lane its Section changed. */
export function checkDealEcho(lanes: readonly RingedLane[]): void {
  const ringed = lanes.filter((lane) => lane.ringed).length;
  if (ringed > 1) throw new Error(`The deal echo rings ${ringed} lanes; ring only the one lane that changed.`);
}
