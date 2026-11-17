import { Art } from '../../art/art';
import styles from './clouds.module.css';
import type { FacetLayer } from './facet-data';
import { Facets } from './facets';

export type CloudLayer = 'far' | 'mid' | 'near';

export interface CloudAt {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly shape: 0 | 1;
  readonly layer?: CloudLayer;
}

const SURFACE_CLOUDS: readonly CloudAt[] = [
  { x: 430, y: 70, scale: 0.42, shape: 1, layer: 'far' },
  { x: 700, y: 175, scale: 0.38, shape: 0, layer: 'far' },
  { x: 250, y: 190, scale: 0.6, shape: 0, layer: 'mid' },
  { x: 880, y: 300, scale: 0.7, shape: 1, layer: 'mid' },
  { x: 1040, y: 110, scale: 1, shape: 0, layer: 'near' },
  { x: 150, y: 352, scale: 0.95, shape: 0, layer: 'near' },
];

export function cloudLayer({ scale, layer }: Pick<CloudAt, 'scale' | 'layer'>): CloudLayer {
  if (layer !== undefined) return layer;
  return scale >= 0.8 ? 'near' : scale >= 0.55 ? 'mid' : 'far';
}

const WIND_STAGGER_SECONDS = 11;

export function Clouds({ at = SURFACE_CLOUDS }: { readonly at?: readonly CloudAt[] }) {
  return (
    <g className={styles.clouds} data-clouds>
      {at.map((cloud, index) => (
        <g key={`${cloud.x}:${cloud.y}`} transform={`translate(${cloud.x} ${cloud.y}) scale(${cloud.scale})`}>
          <g
            className={styles.wind}
            data-cloud
            data-cloud-layer={cloudLayer(cloud)}
            data-motion="ambient"
            style={{ animationDelay: `${-index * WIND_STAGGER_SECONDS}s` }}
          >
            <Art name={`cloud/${cloud.shape}`}>
              <Facets layers={CLOUDS[cloud.shape]!} />
            </Art>
          </g>
        </g>
      ))}
    </g>
  );
}

const CLOUDS: readonly (readonly FacetLayer[])[] = [
  [
    {
      tone: 'cloud-lit',
      d: 'M-8.6 -69.5L23.2 -47.4L-10.3 -30.6ZM49.3 -79.6L23.2 -47.4L29.9 -82.6ZM23.2 -47.4L9.4 -78.1L29.9 -82.6ZM9.4 -78.1L23.2 -47.4L-8.6 -69.5ZM-26.4 -70.7L-8.6 -69.5L-10.3 -30.6ZM-10.3 -30.6L-45.1 -9.7L-56.7 -59.6ZM23.2 -47.4L73.6 -57L62.8 -26.1Z',
    },
    { tone: 'cloud-shade', d: 'M-10.3 -30.6L26.8 -11.2L0 18.7Z' },
    { tone: 'cloud-lit', d: 'M23.2 -47.4L26.8 -11.2L-10.3 -30.6ZM26.8 -11.2L23.2 -47.4L62.8 -26.1Z' },
    {
      tone: 'cloud-shade',
      d: 'M54.6 12.4L26.8 -11.2L62.8 -26.1ZM26.8 -11.2L54.6 12.4L34.8 14.7ZM108.2 6.3L116 -13.8L124.1 -5.4ZM125.2 4.3L108.2 6.3L124.1 -5.4Z',
    },
    {
      tone: 'cloud-lit',
      d: 'M-42.7 -66.5L-10.3 -30.6L-56.7 -59.6ZM-42.7 -66.5L-26.4 -70.7L-10.3 -30.6ZM73.6 -57L81.8 -46.2L62.8 -26.1Z',
    },
    {
      tone: 'cloud-shade',
      d: 'M116 -13.8L107.7 -33.8L114.7 -24.5ZM71.4 10.5L54.6 12.4L62.8 -26.1ZM-11.3 18.7L-35.9 18.7L-45.1 -9.7ZM-11.3 18.7L-10.3 -30.6L0 18.7Z',
    },
    { tone: 'cloud-lit', d: 'M-11.3 18.7L-45.1 -9.7L-10.3 -30.6Z' },
    { tone: 'cloud-shade', d: 'M-45.1 -9.7L-45.7 18.7L-68.6 18.7ZM-35.9 18.7L-45.7 18.7L-45.1 -9.7Z' },
    { tone: 'cloud-lit', d: 'M49.3 -79.6L64.1 -69.7L23.2 -47.4ZM64.1 -69.7L73.6 -57L23.2 -47.4Z' },
    { tone: 'cloud-shade', d: 'M26.8 -11.2L7.7 18.7L0 18.7Z' },
    {
      tone: 'cloud-lit',
      d: 'M-45.1 -9.7L-66.5 -49.6L-56.7 -59.6ZM-72.4 -38.7L-66.5 -49.6L-45.1 -9.7ZM-74.3 -27.5L-72.4 -38.7L-45.1 -9.7ZM-74.3 -27.5L-45.1 -9.7L-68.6 18.7Z',
    },
    { tone: 'cloud-shade', d: 'M-87.3 18.7L-98 14.9L-90.3 -25.3Z' },
    {
      tone: 'cloud-lit',
      d: 'M-87.3 18.7L-74.3 -27.5L-68.6 18.7ZM-74.3 -27.5L-87.3 18.7L-90.3 -25.3ZM81.8 -46.2L96.7 -41.4L62.8 -26.1Z',
    },
    {
      tone: 'cloud-shade',
      d: 'M17.9 16.6L26.8 -11.2L34.8 14.7ZM17.9 16.6L7.7 18.7L26.8 -11.2ZM92.7 8L71.4 10.5L62.8 -26.1ZM92.7 8L116 -13.8L108.2 6.3ZM92.7 8L107.7 -33.8L116 -13.8ZM96.7 -41.4L92.7 8L62.8 -26.1ZM92.7 8L96.7 -41.4L107.7 -33.8ZM-87.3 18.7L-103.8 18.7L-98 14.9Z',
    },
    {
      tone: 'cloud-lit',
      d: 'M-116.2 -3.9L-113.9 8.7L-125.2 4.3ZM-113.9 8.7L-116.2 -3.9L-98 14.9ZM-98 14.9L-102.9 -20L-90.3 -25.3ZM-116.2 -3.9L-110.9 -12.4L-98 14.9ZM-110.9 -12.4L-102.9 -20L-98 14.9Z',
    },
  ],
  [
    {
      tone: 'cloud-lit',
      d: 'M35.9 -57.9L30.4 -24.5L21.7 -60ZM58 -12.3L30.4 -24.5L59.5 -33.6ZM-19.6 -3.1L-13.1 -30.4L8.7 -10.4ZM-13.1 -30.4L30.4 -24.5L8.7 -10.4ZM30.4 -24.5L-13.1 -30.4L-6.2 -50.5ZM30.4 -24.5L6.9 -56.8L21.7 -60ZM6.9 -56.8L30.4 -24.5L-6.2 -50.5ZM70.4 -30.1L58 -12.3L59.5 -33.6ZM30.4 -24.5L53.5 -41.4L59.5 -33.6Z',
    },
    { tone: 'cloud-shade', d: 'M58 -12.3L39.6 9L30.4 -24.5Z' },
    { tone: 'cloud-lit', d: 'M-13.1 -30.4L-19.2 -51.5L-6.2 -50.5Z' },
    {
      tone: 'cloud-shade',
      d: 'M-26.6 13.6L-19.6 -3.1L-9.8 13.6ZM58 -12.3L78.3 -24.6L83.4 -17.8ZM70.4 -30.1L78.3 -24.6L58 -12.3ZM13 12.1L1.7 13.6L8.7 -10.4ZM25 10.7L13 12.1L8.7 -10.4ZM30.4 -24.5L25 10.7L8.7 -10.4ZM39.6 9L25 10.7L30.4 -24.5ZM84.4 -10.1L58 -12.3L83.4 -17.8ZM84.4 -10.1L76.3 4.8L58 -12.3ZM76.3 4.8L84.4 -10.1L90.3 -4ZM91 3.1L76.3 4.8L90.3 -4Z',
    },
    { tone: 'cloud-lit', d: 'M-31.1 -48.4L-13.1 -30.4L-41.2 -43.3ZM-31.1 -48.4L-19.2 -51.5L-13.1 -30.4Z' },
    { tone: 'cloud-shade', d: 'M-26.6 13.6L-37.1 13.6L-19.6 -3.1Z' },
    { tone: 'cloud-lit', d: 'M35.9 -57.9L46.6 -50.7L30.4 -24.5ZM46.6 -50.7L53.5 -41.4L30.4 -24.5Z' },
    {
      tone: 'cloud-shade',
      d: 'M0 13.6L-19.6 -3.1L8.7 -10.4ZM1.7 13.6L0 13.6L8.7 -10.4ZM-19.6 -3.1L0 13.6L-9.8 13.6ZM-64.4 13.6L-73 13.6L-71.3 10.8Z',
    },
    { tone: 'cloud-lit', d: 'M-84.5 -2.8L-82.1 6.6L-91 3.1Z' },
    { tone: 'cloud-shade', d: 'M52 7.6L39.6 9L58 -12.3Z' },
    { tone: 'cloud-lit', d: 'M-64.4 13.6L-54 -20L-46.8 13.6ZM-54 -20L-13.1 -30.4L-19.6 -3.1Z' },
    { tone: 'cloud-shade', d: 'M-54 -20L-37.1 13.6L-46.8 13.6Z' },
    {
      tone: 'cloud-lit',
      d: 'M-37.1 13.6L-54 -20L-19.6 -3.1ZM-82.1 6.6L-80.7 -9L-71.3 10.8ZM-84.5 -2.8L-80.7 -9L-82.1 6.6Z',
    },
    { tone: 'cloud-shade', d: 'M76.3 4.8L65.6 6L58 -12.3ZM65.6 6L52 7.6L58 -12.3ZM-65.7 -18.4L-64.4 13.6L-71.3 10.8Z' },
    {
      tone: 'cloud-lit',
      d: 'M-65.7 -18.4L-54 -20L-64.4 13.6ZM-80.7 -9L-74.8 -14.6L-71.3 10.8ZM-74.8 -14.6L-65.7 -18.4L-71.3 10.8ZM-54 -20L-52.7 -28.2L-13.1 -30.4ZM-13.1 -30.4L-48.3 -36.1L-41.2 -43.3ZM-52.7 -28.2L-48.3 -36.1L-13.1 -30.4Z',
    },
  ],
];
