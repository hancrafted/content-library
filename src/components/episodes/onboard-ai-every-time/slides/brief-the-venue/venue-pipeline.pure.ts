/** The BRIEF move a stage makes, by its first letter. */
export type Move = 'B' | 'R' | 'I' | 'E' | 'F';

export type StageId = 'party' | 'interview' | 'requirements' | 'research' | 'compare' | 'recommendation';

/**
 * A job inside a stage, every one a fresh chat: `piece` the one part taken forward, `parked` a part that waits for its
 * turn, `chat` a job the AI does, `card` the signed-off requirements card, `plan` the venue plan for the boss.
 */
export interface Job {
  readonly id: string;
  readonly kind: 'piece' | 'parked' | 'chat' | 'card' | 'plan';
  readonly checked?: boolean;
}

export interface Stage {
  readonly id: StageId;
  readonly move?: Move;
  readonly jobs: readonly Job[];
  /** The connector into this stage fans out to its jobs, or fans its jobs back in. */
  readonly fan?: 'out' | 'in';
}

/**
 * The venue pipeline in workflow order, which is not the order of the letters. The venue sits in the middle of the
 * party's five pieces, so the flow line runs straight on into the interview.
 */
export const STAGES: readonly Stage[] = [
  {
    id: 'party',
    move: 'B',
    jobs: [
      { id: 'travel', kind: 'parked' },
      { id: 'catering', kind: 'parked' },
      { id: 'venue', kind: 'piece' },
      { id: 'invitations', kind: 'parked' },
      { id: 'budget', kind: 'parked' },
    ],
  },
  { id: 'interview', move: 'I', jobs: [{ id: 'interview', kind: 'chat' }] },
  { id: 'requirements', move: 'R', jobs: [{ id: 'card', kind: 'card' }] },
  {
    id: 'research',
    move: 'F',
    fan: 'out',
    jobs: [
      { id: 'venue1', kind: 'chat', checked: true },
      { id: 'venue2', kind: 'chat', checked: true },
      { id: 'venue3', kind: 'chat', checked: true },
    ],
  },
  { id: 'compare', move: 'E', fan: 'in', jobs: [{ id: 'compare', kind: 'chat' }] },
  { id: 'recommendation', jobs: [{ id: 'plan', kind: 'plan' }] },
];
