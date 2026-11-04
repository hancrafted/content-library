import type { ReactNode } from 'react';

const HEMISPHERE = (
  <>
    <path d="M0-25C-7-33-20-28-21-19C-34-18-36-5-29 3C-33 16-23 27-12 23C-6 33 0 28 0 20V-25" />
    <path d="M-23-8c12-4 14 10 5 15M-12-27c-8 9-3 16 3 18M-12 23c-7-8-5-14 3-17" />
  </>
);
const CHAT = (
  <>
    <path d="M-30-24H30V15H-9L-22 28V15H-30Z" />
    {[-13, 0, 13].map((x) => (
      <circle key={x} cx={x} cy="-4" r="2" fill="currentColor" stroke="none" />
    ))}
  </>
);
const AGENT = (
  <>
    <circle cx="-8" cy="-8" r="11" />
    <path d="M-29 12A30 30 0 1 1 18-31" />
    <g transform="translate(18 -31) rotate(-15)">
      <path d="M-6-4 0 0-6 4" />
    </g>
    <path d="M17 3a10 10 0 0 0 12 12L15 29l-7-7L22 8a10 10 0 0 0-5-5Z" />
  </>
);
const WORKFLOW = (
  <>
    <rect x="-9" y="-28" width="18" height="16" rx="7" />
    <rect x="-36" y="12" width="18" height="16" rx="7" />
    <rect x="18" y="12" width="18" height="16" rx="7" />
    <path d="M0-12V0H-27V12M0 0H27V12M36 20H44V-20H9m6 4-6-4 6-4" />
  </>
);
const FACTORY = (
  <>
    <rect x="-47" y="-38" width="94" height="78" rx="7" />
    <circle cx="0" cy="-24" r="6" fill="currentColor" stroke="none" />
    <path d="M0-18V-7H-30V3M0-7V3M0-7H30V3" />
    {[-30, 0, 30].map((x) => (
      <g key={x} transform={`translate(${x} 17) scale(.3)`}>
        {WORKFLOW}
      </g>
    ))}
  </>
);

/** Wide static compositions; callers choose their meaning and accent. Translations center the drawn bounds. */
export const WIDE_CARD_ARTWORK = {
  'intention-capacity': (
    <g transform="translate(6.5 0)">
      <circle cx="104" cy="130" r="58" fill="currentColor" stroke="none" opacity=".1" />
      <g transform="translate(104 130) scale(1.05)">
        {HEMISPHERE}
        <g transform="scale(-1 1)">{HEMISPHERE}</g>
      </g>
      <path d="M161 130H205m-6-4 6 4-6 4" />
      <rect x="221" y="100" width="280" height="60" rx="7" />
      <rect x="232" y="111" width="168" height="38" rx="7" fill="currentColor" stroke="none" opacity=".8" />
      <path d="M416 111v38m24-38v38m24-38v38M221 178h280M221 173v10m280-10v10" />
    </g>
  ),
  'review-funnel': (
    <g transform="translate(4.5 -9.5)">
      <circle cx="40" cy="130" r="8" />
      <path d="M48 130H69V56H91M69 130H91M69 130V204H91" />
      {[56, 130, 204].map((y) => (
        <g key={y} transform={`translate(115 ${y})`}>
          <rect x="-24" y="-18" width="48" height="36" rx="7" />
          <path d="M-12-5h24m-24 10h15" />
        </g>
      ))}
      <path d="M139 56H182M139 130H182M139 204H182" />
      <path d="M182 38 298 104V156L182 222Z" fill="currentColor" stroke="none" opacity=".1" />
      <path d="M182 38 298 104V156L182 222M182 56 286 130M182 130H298M182 204 286 130" />
      <path d="M298 130H328m-6-4 6 4-6 4" />
      <circle cx="374" cy="130" r="43" fill="currentColor" stroke="none" opacity=".1" />
      <circle cx="374" cy="130" r="38" />
      <g transform="translate(374 130) scale(.95)">
        <circle cx="0" cy="-10" r="9" />
        <path d="M-18 20v-8c0-15 36-15 36 0v8M-10 20v-9m20 9v-9" />
      </g>
      <path d="M412 130H487m-6-4 6 4-6 4" />
      <circle cx="505" cy="130" r="14" />
      <path d="M499 130l4 4 8-9M374 168V241H40V138m-4 6 4-6 4 6" />
    </g>
  ),
  'cumulative-orchestration': (
    <g transform="translate(-1.5 2.5)">
      <path d="M27 222H531m-6-4 6 4-6 4" />
      <rect x="37" y="145" width="83" height="60" rx="7" />
      <g transform="translate(78 173) scale(.5)">{CHAT}</g>
      <rect x="156" y="108" width="93" height="97" rx="7" />
      <g transform="translate(202 180) scale(.35)">{CHAT}</g>
      <g transform="translate(202 141) scale(.53)">{AGENT}</g>
      <rect x="286" y="70" width="104" height="135" rx="7" />
      <g transform="translate(315 183) scale(.3)">{CHAT}</g>
      <g transform="translate(361 183) scale(.32)">{AGENT}</g>
      <g transform="translate(338 117) scale(.7)">{WORKFLOW}</g>
      <rect x="427" y="29" width="109" height="176" rx="7" />
      <g transform="translate(456 182) scale(.3)">{CHAT}</g>
      <g transform="translate(508 182) scale(.32)">{AGENT}</g>
      <g transform="translate(481 139) scale(.48)">{WORKFLOW}</g>
      <g transform="translate(481 79) scale(.72)">{FACTORY}</g>
      <path d="M45 155h66M164 118h77M294 80h88M435 39h93" opacity=".35" />
    </g>
  ),
} satisfies Record<string, ReactNode>;
