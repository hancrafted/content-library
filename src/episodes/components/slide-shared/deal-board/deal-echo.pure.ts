interface RingedLane {
  readonly ringed?: boolean;
}

export function checkDealEcho(lanes: readonly RingedLane[]): void {
  const ringed = lanes.filter((lane) => lane.ringed).length;
  if (ringed > 1) throw new Error(`The deal echo rings ${ringed} lanes; ring only the one lane that changed.`);
}
