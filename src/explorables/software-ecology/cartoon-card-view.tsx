import type { ReactNode } from 'react';
import { panelArt, type CartoonPanel } from './cartoon-panels.pure.ts';
import { Glyph } from './factory-glyph-view';
import styles from './software-ecology.module.css';

/*
 * Swing and Roles (design-ADR 0024 §13): a work center's cartoon panel and its artefacts, a Roles card with its glyph
 * and job, and the tiles for the cartoon panels that are no work center here. Ported from the reference build's
 * `cardSwing`, `cardRole` and `cardTile`; props only, so the Swing view renders on the server.
 */

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
  readonly panel?: CartoonPanel;
  readonly caption: string;
  readonly blank: string;
  readonly icon: string;
}

/** A cartoon panel's drawing, or a large glyph for a work center the cartoon leaves out. */
export function PanelArt({ panel, caption, blank, icon }: PanelArtProps) {
  if (!panel)
    return (
      <div className={styles.noArt}>
        <Glyph name={icon} className={styles.glyLg} />
      </div>
    );
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
  /** What the role does, for Roles. */
  readonly job: string;
  readonly artefacts: readonly string[];
  readonly words: { readonly artefacts: string; readonly blank: string };
  /** A Slide's Context marker on this card. */
  readonly marker?: ReactNode;
}

/** Swing: the panel, its caption, the role's tag and its artefacts. */
export function SwingCardView(p: CartoonCardProps) {
  return (
    <>
      <PanelArt panel={p.panel} caption={p.caption ?? p.title} blank={p.words.blank} icon={p.icon} />
      <p className={`${styles.cap} text-caption`}>{p.caption ?? p.title}</p>
      <span className={styles.tagRow}>
        <span className={`${styles.tag} text-caption`}>{p.title}</span>
        {p.marker}
      </span>
      <Artefacts label={p.words.artefacts} items={p.artefacts} />
    </>
  );
}

/** Roles: glyph, title and job above the panel, then the artefacts. */
export function RoleCardView(p: CartoonCardProps) {
  return (
    <>
      <div className={styles.headLg}>
        <Glyph name={p.icon} className={styles.glyMd} />
        <div className={styles.headText}>
          <p className={`${styles.cardTitle} text-body font-semibold`}>{p.title}</p>
          <p className={`${styles.job} text-caption`}>{p.job}</p>
        </div>
        {p.marker}
      </div>
      <PanelArt panel={p.panel} caption={p.caption ?? p.title} blank={p.words.blank} icon={p.icon} />
      <Artefacts label={p.words.artefacts} items={p.artefacts} />
    </>
  );
}

export interface TileProps {
  readonly panel: CartoonPanel;
  readonly caption: string;
  /** "Documentation · not a work center here", or the Customer's title on the closing panel. */
  readonly tag: string;
  /** Why it is no work center, shown in Roles. */
  readonly job?: string;
  readonly blank: string;
  readonly cell: readonly [number, number];
  readonly view: 'swing' | 'role';
}

/** A cartoon panel that is no work center here, filling an empty cell; decorative. */
export function TileView(p: TileProps) {
  return (
    <div
      className={styles.cartoon}
      data-card-view={p.view}
      data-tile={p.panel.target ? 'target' : 'extra'}
      style={{ gridColumn: p.cell[0], gridRow: p.cell[1] }}
      aria-hidden="true"
    >
      <PanelArt panel={p.panel} caption={p.caption} blank={p.blank} icon="" />
      <p className={`${styles.cap} text-caption`}>{p.caption}</p>
      <span className={`${styles.tag} text-caption`} data-tone={p.panel.target ? 'primary' : 'muted'}>
        {p.tag}
      </span>
      {p.view === 'role' && p.job ? <p className={`${styles.job} text-caption`}>{p.job}</p> : null}
    </div>
  );
}
