export interface InkPoint {
  x: number;
  y: number;
}

export interface InkRect extends InkPoint {
  width: number;
  height: number;
  radius: number;
}

export interface InkHost {
  surface: InkRect;
  primary?: InkRect;
  secondary?: InkRect;
  reach?: number;
  enabled?: boolean;
}

export interface InkInput {
  pointer: InkPoint | null;
  delta: number;
  enabled: boolean;
  /** The explicitly registered host under the actual pointer target, resolving overlapping hosts. */
  owner?: string | null;
}

export interface InkContact extends InkPoint {
  nx: number;
  ny: number;
  distance: number;
}

export interface InkShape extends InkPoint {
  rx: number;
  ry: number;
  angle: number;
}

export interface InkView {
  paths: string[];
  secondaryPaths: string[];
  primaryFill: number;
  secondaryFill: number;
  strength: number;
  stage: 'outside' | 'travelling' | 'primary' | 'secondary';
  primaryHovered: boolean;
  origin: InkPoint;
  moving: boolean;
}

export interface InkState {
  host: InkHost;
  contact: InkContact;
  inside: boolean;
  flight: number;
  primaryFill: number;
  primaryShapes: InkShape[];
  secondaryShapes: InkShape[];
}
