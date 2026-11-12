import type { TargetProps } from '@/shared/lib/context-link.pure';
import { fillTemplate } from '@/shared/lib/template.pure';
import { useMemo, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import { TileView } from './cartoon-card-view';
import { cartoonCardsOf, tilePartsOf, type CartoonCardPart } from './cartoon-parts.pure.ts';
import { gridOf } from './factory-grid.pure.ts';
import type { Snapshot } from './run-snapshot.pure.ts';
import type { Words } from './software-ecology-words.types';
import styles from './software-ecology.module.css';
import type { ViewId } from './software-ecology.types';
import { customerCardOf, type BeltPart, type CardPart } from './stage-parts.pure.ts';
import type { WordsIn } from './use-case-words.pure.ts';
import type { FactoryView } from './use-factory.ts';
import { WorkCenterCard, type CardView } from './work-center-card';

/*
 * The floor of the stage, the cards' layer: in the factory every work center as a station on the line, in Swing and
 * Roles every card at its factory cell with the cartoon tiles in the empty ones (design-ADR 0024 §13). Rendered by
 * the client parent; a card click goes up through `onCard`.
 */

/** Context targets and markers a Slide places, by spot (see `SoftwareEcologyClientProps`). */
export type Spots<T> = Readonly<Partial<Record<string, T>>>;

const spotsFor = <T,>(spots: Spots<T> | undefined, prefix: string): Spots<T> =>
  Object.fromEntries(
    Object.entries(spots ?? {})
      .filter(([k]) => k.startsWith(prefix))
      .map(([k, v]) => [k.slice(prefix.length), v]),
  );

/** A Slide's Context targets and markers by spot, as the client parent receives them. */
export interface SpotProps {
  readonly targets?: Spots<TargetProps>;
  readonly markers?: Spots<ReactNode>;
}

/** Each card's own spots, once per run, so a memoised card redraws only when its readout changes. */
const useCardSpots = (cards: readonly CardPart[], spots: SpotProps) =>
  useMemo(
    () =>
      Object.fromEntries(
        cards.map((c) => [
          c.id,
          { targets: spotsFor(spots.targets, `${c.id}:`), markers: spotsFor(spots.markers, `${c.id}:`) },
        ]),
      ),
    [cards, spots.targets, spots.markers],
  );

function BeltSpots({ belts, spots }: { belts: readonly BeltPart[]; spots: SpotProps }) {
  return belts.map((b) => {
    const m = spots.markers?.[`belt:${b.key}`];
    return m ? (
      <span
        key={b.key}
        className={styles.beltSpot}
        style={{ left: b.at.x, top: b.at.y }}
        {...spots.targets?.[`belt:${b.key}`]}
      >
        {m}
      </span>
    ) : null;
  });
}

export interface FloorProps {
  readonly f: FactoryView;
  readonly cards: readonly CardPart[];
  readonly belts: readonly BeltPart[];
  readonly w: WordsIn;
  readonly words: Words;
  readonly spots: SpotProps;
  readonly onCard: (id: string, shift: boolean) => void;
  /** The card whose dashboard is open. */
  readonly open?: string | null;
  /** The card a tour caption points at. */
  readonly toured?: string;
  /** The work centers picked for the compare stream. */
  readonly picked?: readonly string[];
}

const labelOf = (words: Words, kind: 'role' | 'customer', title: string) =>
  fillTemplate(kind === 'customer' ? words.card.openSettings : words.card.openDashboard, { title });

function CustomerStation(p: FloorProps) {
  const cust = customerCardOf(p.f.run.m, p.w);
  return (
    <WorkCenterCard
      cardView="station"
      kind="customer"
      id="customer"
      label={labelOf(p.words, 'customer', cust.title)}
      customer={{
        ...cust,
        r: p.f.snap.customer,
        words: p.words.customer,
        target: p.spots.targets?.customer,
        marker: p.spots.markers?.customer,
        open: p.open === 'customer',
        toured: p.toured === 'customer',
      }}
    />
  );
}

/** The factory view: the Customer and every work center as stations on the line. */
function StationCards(p: FloorProps) {
  const own = useCardSpots(p.cards, p.spots);
  return (
    <>
      <CustomerStation {...p} />
      {p.cards.map((c) => (
        <WorkCenterCard
          key={c.id}
          cardView="station"
          kind="role"
          id={c.id}
          label={labelOf(p.words, 'role', c.title)}
          station={{
            ...c,
            ...own[c.id],
            r: p.f.snap.stations[c.id] as Snapshot['stations'][string],
            words: p.words.card,
            open: p.open === c.id,
            toured: p.toured === c.id,
            picked: p.picked?.includes(c.id),
          }}
        />
      ))}
      <BeltSpots belts={p.belts} spots={p.spots} />
    </>
  );
}

/** The targets a station places on its rack or signs, for its cartoon card. */
const stationTargets = (spots: SpotProps, id: string): TargetProps[] =>
  Object.entries(spotsFor(spots.targets, `${id}:`)).flatMap(([k, t]) => (k !== 'card' && t ? [t] : []));

/** A card's own spot: the Customer's, or `<id>:card`. */
const cardSpot = (c: CartoonCardPart) => (c.kind === 'customer' ? 'customer' : `${c.id}:card`);

/** Swing and Roles: every card at its factory cell, the cartoon tiles in the empty ones. */
function CartoonCards(p: FloorProps & { view: 'swing' | 'roles' }) {
  const m = p.f.run.m,
    words = p.words.cartoon;
  const cards = useMemo(() => cartoonCardsOf(m, p.w, words), [m, p.w, words]);
  const tiles = useMemo(() => tilePartsOf(m, p.view, { w: p.w, words }), [m, p.view, p.w, words]);
  const cardView: CardView = p.view === 'swing' ? 'swing' : 'role';
  return (
    <>
      {cards.map((c) => (
        <WorkCenterCard
          key={c.id}
          {...c}
          cardView={cardView}
          hidden={cardView === 'swing' && c.outOfSwing}
          label={labelOf(p.words, c.kind, c.title)}
          target={p.spots.targets?.[cardSpot(c)]}
          stationTargets={stationTargets(p.spots, c.id)}
          onOpen={p.onCard}
          cartoon={{ ...c, words, marker: p.spots.markers?.[cardSpot(c)] }}
        />
      ))}
      {tiles.map((t) => (
        <TileView key={t.id} {...t} blank={words.blank} view={cardView} />
      ))}
    </>
  );
}

/** The station cards stay handler-free views: the floor hears their clicks and Enter or Space on a focused card. */
const stationOf = (e: { target: EventTarget }) =>
  (e.target as Element).closest<HTMLElement>('[data-id][role="button"]');

const floorHandlers = (p: FloorProps) => ({
  onClick: (e: MouseEvent) => {
    const card = stationOf(e);
    if (card?.dataset.id) p.onCard(card.dataset.id, e.shiftKey);
  },
  onKeyDown: (e: KeyboardEvent) => {
    const card = stationOf(e);
    if ((e.key !== 'Enter' && e.key !== ' ') || card !== e.target || !card.dataset.id) return;
    e.preventDefault();
    p.onCard(card.dataset.id, e.shiftKey);
  },
});

export function Floor(p: FloorProps & { view: ViewId }) {
  const { layout, run } = p.f;
  const cols = useMemo(() => gridOf(run.m).cols, [run]);
  return (
    <div
      ref={p.f.floor}
      className={styles.floor}
      style={
        p.view === 'factory'
          ? { width: layout.width, height: layout.height }
          : ({ '--cols': String(cols) } as CSSProperties)
      }
      {...(p.view === 'factory' ? floorHandlers(p) : {})}
    >
      {p.view === 'factory' ? <StationCards {...p} /> : <CartoonCards {...p} view={p.view} />}
    </div>
  );
}
