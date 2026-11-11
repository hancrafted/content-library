(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  // ---------- Tunables (illustrative, not measured) ----------
  // Time runs in weeks. The model steps in fixed slices of a week; a job finishes at a float time inside a step.
  const DTW = 1 / 480;       // one model step, in weeks
  const DAYS = 5;            // working days a week, for the clock
  const HANDOFF = 0.25 / DAYS; // every handoff takes a quarter working day, whatever the belt length (documents are digital)
  const SPEED_1X = 1 / 16;   // weeks per real second at 1x; 5x (the default) plays a week in about 3 seconds
  const SPEEDS = [0, 1, 2, 5, 10];
  const MAX_STEPS = 40;      // model steps per frame at most; beyond that the time is dropped and flagged
  const WARM_WEEKS = 60, WARM_CHUNK = 2000; // presets settle 60 weeks, at most 2000 steps a frame
  const RHO_IDEAL = 0.7;     // in Ideal every work center is busy 70 % of the time
  const AI_SPEED = 2.5;      // an AI work center finishes work 2.5x faster, unless its dials say otherwise (1 to 5)
  const CV = 0.3;            // service times vary by 30 % (normal), unless the file says exponential
  const EXTRA = 0.3;         // a bad input that is kept takes 30 % longer
  let INSPECT = 2.4;           // an inspection catches bad work this many times as often as a plain work center (rework 0.4: 80 %)
  const TAU = 2;             // rates are averaged over about two weeks
  const TAU_OUT = 6;         // the Customer's output and satisfaction over about six weeks, so a random week does not read as a trend
  const MAX_TOKENS = 4000;   // documents in transit are pooled; beyond this they ride as counts on the last token
  const MAX_SPRITES = 600;   // drawn documents at most; the rest merge into a sprite with a "×n" badge
  const GAP = 13;            // a drawn document takes this much belt; closer ones of the same kind merge
  const MIN_RUN = 40;        // a belt runs at least this far straight out of and into a station
  const HALF = 110, TOP = 48, BOT = 44; // a station card spans x±110, y-48..y+44; belts run at y (round 7: shorter, wider)
  const WX = 36;                         // the document in work sits at x+36; top and bottom ports sit on that line
  const CUST_W = 82, CUST_TOP = 128, CUST_BOT = 128; // the Customer card
  const RACK = 6, RACK_W = 44, RACK_PAD = 5; // the rack: six slots at the card's full height on the left, filling from the bottom; past six the work piles up outside
  const SLOT = (TOP + BOT - 2 * RACK_PAD) / RACK;
  const HANDOFF_SECS = 0.6;              // a handoff animates this long on screen at any speed; the model keeps the quarter day
  const R = 14;              // belt corner radius
  const Q = { BAD: 0, GOOD: 1 }; // documents are good or bad; there is no average
  const AMBER = 1, RED = 2;  // weeks of work waiting: amber from one week, red from two (the dashboard)
  const RET_SHOW = 0.3, RET_HIDE = 0.1; // a rework lane shows above 0.3 sent back a week, hides below 0.1
