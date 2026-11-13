import type { ReactNode } from 'react';
import { panelArt, type CartoonPanel } from './cartoon-panels.pure.ts';
import { Glyph } from './factory-glyph-view';
import styles from './software-ecology.module.css';

/*
 * The roles state (design-ADR 0024 §13): a work center's department, its job, its cartoon panel with the cartoon's
 * quote under it, and its artefacts; and the tiles for the cartoon panels that are no work center here. Swing and Roles
 * merged into this one card (feedback 08). Props only, so the roles state renders on the server.
 */

/** A card's cell: its column, and the three grid rows (head, panel, artefacts) of its row, shared with its neighbours. */
export const rowsAt = (cell: readonly [number, number]) => ({
  gridColumn: cell[0],
  gridRow: `${(cell[1] - 1) * 3 + 1} / span 3`,
});

/** Documentation's panel: the cartoon's empty frame. */
function BlankFrame({ blank }: { readonly blank: string }) {
  return (
    <>
      <rect x="10" y="10" width="140" height="94" rx="6" data-art="stroke" data-blank="" />
      <text x="80" y="62" textAnchor="middle" fill="currentColor" opacity=".6" className="text-caption">
        {blank}
      </text>
    </>
  );
}

interface PanelArtProps {
  readonly panel: CartoonPanel;
  readonly caption: string;
  readonly blank: string;
}

/** A cartoon panel's drawing. */
function PanelArt({ panel, caption, blank }: PanelArtProps) {
  return (
    <svg viewBox="0 0 160 110" className={styles.art} role="img" aria-label={caption}>
      {panel.blank ? (
        <BlankFrame blank={blank} />
      ) : (
        <g data-art="stroke" dangerouslySetInnerHTML={{ __html: panelArt(panel) }} />
      )}
    </svg>
  );
}

export function Artefacts({ label, items }: { readonly label: string; readonly items: readonly string[] }) {
  if (!items.length) return null;
  return (
    <div className={styles.hl}>
      <p className={`${styles.hlH} text-caption`}>{label}</p>
      <div className={styles.chips}>
        {items.map((a) => (
          <span key={a} className={`${styles.chip} text-caption`}>
            {a}
          </span>
        ))}
      </div>
    </div>
  );
}

export interface CartoonCardProps {
  readonly title: string;
  readonly icon: string;
  /** Its cartoon panel, when the use case has the cartoon and the role is in it. */
  readonly panel?: CartoonPanel;
  /** The panel's caption. */
  readonly caption?: string;
  /** What the role does. */
  readonly job: string;
  readonly artefacts: readonly string[];
  readonly words: { readonly artefacts: string; readonly blank: string };
  /** A Slide's Context marker on this card. */
  readonly marker?: ReactNode;
}

/** The quote under a panel: the cartoon's caption, as a figure's, with a Slide's Context marker at the end of the line. */
function Quoted(p: {
  readonly panel: CartoonPanel;
  readonly caption: string;
  readonly blank: string;
  readonly marker?: ReactNode;
}) {
  return (
    <figure className={styles.panelFig}>
      <PanelArt panel={p.panel} caption={p.caption} blank={p.blank} />
      <figcaption className={`${styles.cap} text-caption`}>
        {p.caption}
        {p.marker ? (
          <>
            {' '}
            <span className={styles.capMark}>{p.marker}</span>
          </>
        ) : null}
      </figcaption>
    </figure>
  );
}

/**
 * The roles state: glyph, department and job, the cartoon panel with its quote under it, then the artefacts. A work
 * center the cartoon leaves out, and every one in a use case without the cartoon, shows no image.
 */
export function RoleCardView(p: CartoonCardProps) {
  // three rows the grid lines up across a row of cards: head, panel, artefacts; a card with no panel puts its marker on the job line
  return (
    <>
      <div className={styles.headLg}>
        <Glyph name={p.icon} className={styles.glyMd} />
        <div className={styles.headText}>
          <p className={`${styles.cardTitle} text-body font-semibold`}>{p.title}</p>
          <p className={`${styles.job} text-caption`}>
            {p.job}
            {p.panel || !p.marker ? null : (
              <>
                {' '}
                <span className={styles.capMark}>{p.marker}</span>
              </>
            )}
          </p>
        </div>
      </div>
      <div>
        {p.panel ? (
          <Quoted panel={p.panel} caption={p.caption ?? p.title} blank={p.words.blank} marker={p.marker} />
        ) : null}
      </div>
      <div className={styles.artSlot}>
        <Artefacts label={p.words.artefacts} items={p.artefacts} />
      </div>
    </>
  );
}

export interface TileProps {
  readonly panel: CartoonPanel;
  readonly caption: string;
  /** "Documentation · not a work center here", or the Customer's title on the closing panel. */
  readonly tag: string;
  /** Why it is no work center. */
  readonly job?: string;
  readonly blank: string;
  readonly cell: readonly [number, number];
}

/** A cartoon panel that is no work center here, filling an empty cell; decorative. */
export function TileView(p: TileProps) {
  return (
    <div
      className={styles.cartoon}
      data-card-view="role"
      data-tile={p.panel.target ? 'target' : 'extra'}
      style={rowsAt(p.cell)}
      aria-hidden="true"
    >
      <div className={styles.headLg}>
        <div className={styles.headText}>
          <span className={`${styles.tag} text-caption`} data-tone={p.panel.target ? 'primary' : 'muted'}>
            {p.tag}
          </span>
          {p.job ? <p className={`${styles.job} text-caption`}>{p.job}</p> : null}
        </div>
      </div>
      <div>
        <Quoted panel={p.panel} caption={p.caption} blank={p.blank} />
      </div>
      <div className={styles.artSlot} />
    </div>
  );
}
