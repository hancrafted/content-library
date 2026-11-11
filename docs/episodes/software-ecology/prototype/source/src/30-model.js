  // ---------- Settings: everything the controls set ----------
  const S = {
    bundle: null, preset: 'ideal', view: 'factory', reality: 0, ai: 'off', aiq: 'same', company: 'service',
    over: {}, cust: null, mech: { rework: true, churn: true, complaints: true }, strength: {},
    speed: 5, beltMotion: false, help: false, popover: null, tour: null, pile: 'heap',
    compare: { picking: false, ids: [], open: false, note: '' },
    // Overlay seam: Follow an order and Isolate work centers were taken out in round 4.
    overlays: { follow: false, isolate: false },
  };
  const OVERLAYS = {}; // name -> { draw(ctx), status() }
  const UC = () => S.bundle.data;

  // ---------- Geometry: belts are derived from spawns; routes are hints in the file ----------
  // A belt leaves a card at a port (right by default; top or bottom on the line of the document in work) and enters at one.
  const isCust = (d) => d.kind === 'customer';
  const halfW = (d) => (isCust(d) ? CUST_W : HALF), topH = (d) => (isCust(d) ? CUST_TOP : TOP), botH = (d) => (isCust(d) ? CUST_BOT : BOT);
  const workAt = (d) => [d.x + WX, d.y];
  function port(d, side) {
    const px = isCust(d) ? d.x : d.x + WX;
    return side === 'left' ? [d.x - halfW(d), d.y] : side === 'top' ? [px, d.y - topH(d)] : side === 'bottom' ? [px, d.y + botH(d)] : [d.x + halfW(d), d.y];
  }
  const horiz = (side) => side === 'left' || side === 'right';
  function corners(r, A, B) {
    const outS = r.out || 'right', p0 = port(A, outS), v = (r.via || []).map((p) => p.slice());
    const lx = v.length ? v[v.length - 1][0] : p0[0];
    const inS = r.in || (lx > B.x ? 'right' : 'left'), p1 = port(B, inS);
    if (v.length) return [p0, ...v, p1];
    if (horiz(outS) && horiz(inS)) { if (p0[1] === p1[1]) return [p0, p1]; const xm = r.xm ?? (p0[0] + p1[0]) / 2; return [p0, [xm, p0[1]], [xm, p1[1]], p1]; }
    if (!horiz(outS) && !horiz(inS)) { if (p0[0] === p1[0]) return [p0, p1]; const ym = r.ym ?? (p0[1] + p1[1]) / 2; return [p0, [p0[0], ym], [p1[0], ym], p1]; }
    return horiz(outS) ? [p0, [p1[0], p0[1]], p1] : [p0, [p0[0], p1[1]], p1];
  }
  const key = (p) => `${Math.round(p[0])},${Math.round(p[1])}`;
  const onSeg = (p, a, b) => (a[0] === b[0] ? Math.abs(p[0] - a[0]) < 0.5 && p[1] >= Math.min(a[1], b[1]) - 0.5 && p[1] <= Math.max(a[1], b[1]) + 0.5
    : Math.abs(p[1] - a[1]) < 0.5 && p[0] >= Math.min(a[0], b[0]) - 0.5 && p[0] <= Math.max(a[0], b[0]) + 0.5);
  // A corner of one belt that lies on another belt is a transfer: drawn square, with a plate.
  function junctions(edges) {
    const J = new Map();
    for (const e of edges) for (let i = 1; i < e.corners.length - 1; i++) {
      const p = e.corners[i];
      for (const f of edges) if (f !== e) for (let j = 1; j < f.corners.length; j++) if (onSeg(p, f.corners[j - 1], f.corners[j])) J.set(key(p), p);
    }
    return J;
  }
  function sample(raw, J = new Map()) {
    const pts = raw.filter((p, i) => i === 0 || Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]) > 0.01).map((p) => p.slice());
    const out = [];
    let d = `M${pts[0][0]} ${pts[0][1]}`;
    const push = (x, y) => { const l = out[out.length - 1]; if (!l || Math.hypot(l[0] - x, l[1] - y) > 0.01) out.push([x, y]); };
    const line = (x, y) => { const l = out[out.length - 1]; const n = Math.max(1, Math.ceil(Math.hypot(x - l[0], y - l[1]) / 3)); for (let k = 1; k <= n; k++) push(l[0] + ((x - l[0]) * k) / n, l[1] + ((y - l[1]) * k) / n); };
    push(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], next = pts[i + 1];
      if (next && !J.has(key([x1, y1]))) {
        const l1 = Math.hypot(x1 - x0, y1 - y0), l2 = Math.hypot(next[0] - x1, next[1] - y1);
        const r = Math.min(R, l1 / 2, l2 / 2);
        const ex = x1 - ((x1 - x0) / l1) * r, ey = y1 - ((y1 - y0) / l1) * r;
        const fx = x1 + ((next[0] - x1) / l2) * r, fy = y1 + ((next[1] - y1) / l2) * r;
        line(ex, ey); d += ` L${ex} ${ey} Q${x1} ${y1} ${fx} ${fy}`;
        for (let k = 1; k <= 8; k++) { const t = k / 8, u = 1 - t; push(u * u * ex + 2 * u * t * x1 + t * t * fx, u * u * ey + 2 * u * t * y1 + t * t * fy); }
        pts[i] = [fx, fy];
      } else { line(x1, y1); d += ` L${x1} ${y1}`; }
    }
    const cum = [0];
    for (let i = 1; i < out.length; i++) cum.push(cum[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
    return { pts: out, cum, L: cum[cum.length - 1], d };
  }
  const AT = [0, 0, 0, 1]; // at() writes here: no garbage per drawn document
  function at(path, s) {
    const { pts, cum, L } = path;
    s = s < 0 ? 0 : s > L ? L : s;
    let lo = 0, hi = cum.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (cum[m] <= s) lo = m; else hi = m; }
    const seg = cum[hi] - cum[lo] || 1, t = (s - cum[lo]) / seg;
    const dx = pts[hi][0] - pts[lo][0], dy = pts[hi][1] - pts[lo][1], l = Math.hypot(dx, dy) || 1;
    AT[0] = pts[lo][0] + dx * t; AT[1] = pts[lo][1] + dy * t; AT[2] = -dy / l; AT[3] = dx / l;
    return AT;
  }
  const offsetD = (path, off) => path.pts.map((p, i) => { const [x, y, nx, ny] = at(path, path.cum[i]); return `${i ? 'L' : 'M'}${(x + nx * off).toFixed(1)} ${(y + ny * off).toFixed(1)}`; }).join(' ');

  // ---------- Randomness: separate seeded streams per node, so one setting never reshuffles another's draws ----------
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const mix = (a, b) => { let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); return (h ^ (h >>> 13)) >>> 0; };
  const streams = (seed, i) => ({ ra: mulberry(mix(seed, i * 8 + 1)), rs: mulberry(mix(seed, i * 8 + 2)), rr: mulberry(mix(seed, i * 8 + 3)), rq: mulberry(mix(seed, i * 8 + 4)) });
  const expo = (r, mean) => -Math.log(1 - r()) * mean;
  function normal(r) { const u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  // k documents, each good with chance p: exact up to 64, a normal approximation above (a big batch costs one draw)
  function binom(r, k, p) {
    if (p <= 0 || k <= 0) return 0; if (p >= 1) return k;
    if (k <= 64) { let g = 0; for (let i = 0; i < k; i++) if (r() < p) g++; return g; }
    return Math.max(0, Math.min(k, Math.round(k * p + normal(r) * Math.sqrt(k * p * (1 - p)))));
  }

  // ---------- Ring buffer: a deque with O(1) at both ends ----------
  class Ring {
    constructor() { this.a = new Array(16); this.h = 0; this.n = 0; }
    at(i) { return this.a[(this.h + i) & (this.a.length - 1)]; }
    grow() { const b = new Array(this.a.length * 2); for (let i = 0; i < this.n; i++) b[i] = this.at(i); this.a = b; this.h = 0; }
    push(x) { if (this.n === this.a.length) this.grow(); this.a[(this.h + this.n) & (this.a.length - 1)] = x; this.n++; }
    unshift(x) { if (this.n === this.a.length) this.grow(); this.h = (this.h - 1) & (this.a.length - 1); this.a[this.h] = x; this.n++; }
    shift() { const x = this.a[this.h]; this.a[this.h] = undefined; this.h = (this.h + 1) & (this.a.length - 1); this.n--; return x; }
    first() { return this.a[this.h]; }
    last() { return this.at(this.n - 1); }
  }


  // Job flags. A job is one document waiting at a work center.
  // FROM_SRC: a request straight from the Customer (never sent back); REDO: to be redone; COMPL: a complaint (a bad release's request);
  // FAIL: failure demand (a complaint and the work it causes); SENT: on its way back; MAIN: the document that carries a request on.
  // OWN: a ticket of the company's own (roadmap, leads, tech debt), not a customer request.
  const FROM_SRC = 1, REDO = 2, COMPL = 4, FAIL = 8, SENT = 16, MAIN = 32, OWN = 64;
  const RET = -20; // a rework lane runs beside its belt, on the left of the direction of travel (round 7: wider)

  // ---------- Build: the network from the use-case file ----------
  let M = null;
  // every Customer target a file or its presets name: mix, good and bad follow-ups
  const custTargets = (uc) => { const t = new Set(); for (const c of [uc.customer, ...(uc.presets || []).map((p) => p.customer || {})]) for (const k of ['mix', 'good', 'bad']) for (const to of Object.keys((c && c[k]) || {})) t.add(to); return [...t]; };
  function build(B, seed = 20261111) {
    const uc = B.data, nodes = new Map();
    let idx = 0;
    const mk = (def, kind) => {
      const role = kind === 'role' ? roleOf(B, def.role) : CATALOG.customer;
      const n = {
        id: def.id, idx: idx++, kind, def: { ...def, x: def.at[0], y: def.at[1], kind }, role, roleId: kind === 'role' ? def.role : 'customer',
        title: kind === 'role' ? W.center(B, def) : W.customer(B),
        ins: [], outs: [], spawns: [], runs: new Ring(), L: 0, mu: 1, ...streams(seed, idx),
        rate: { done: 0, arr: 0, back: 0, rwIn: 0, unread: 0, out: [0, 0], compl: 0 },
        u: { busy: 0, starved: 0, blocked: 0, fail: 0 }, Lavg: 0, Ws: 0, lvl: 0, press: 0,
        sign: { rework: -99, churn: -99, unread: -99, complaint: -99 }, hist: { out: [], good: [], wait: [], L: [] },
      };
      nodes.set(def.id, n);
      return n;
    };
    const cust = mk({ id: 'customer', ...uc.customer }, 'customer');
    for (const c of uc.centers) mk(c, 'role');
    // Belts: one per from-to pair that the Customer or a spawn rule names.
    const pairs = [], seen = new Map();
    const pair = (from, to, kind) => { const k = `${from}-${to}`; if (!seen.has(k)) { seen.set(k, pairs.length); pairs.push({ from, to, kind, k }); } return seen.get(k); };
    for (const to of custTargets(uc)) pair('customer', to, 'src');
    for (const c of uc.centers) for (const sp of c.spawns || []) for (const to of sp.choose ? sp.choose.map((ch) => ch.to) : [sp.to]) pair(c.id, to, to === 'customer' ? 'ship' : 'role');
    const routes = uc.routes || {}, rel = uc.customer.releases;
    const edges = pairs.map((p, i) => {
      const A = nodes.get(p.from), Bn = nodes.get(p.to), w = W.belt(B, p.k), r = routes[p.k] || {};
      const e = { i, key: p.k, kind: p.kind, from: A, to: Bn, label: w.label || '', retLabel: w.back || 'sent back',
        over: !!r.over, loop: false, returns: false, release: p.kind === 'ship' && (!rel || rel.includes(p.from)),
        fwd: new Ring(), back: new Ring(), inT: 0, backT: 0, rate: 0, backRate: 0, retOn: false, T: HANDOFF,
        aiSize: A.kind === 'role' ? A.role.aiSize ?? 1 : 1 };
      e.corners = corners(r, A.def, Bn.def);
      A.outs.push(e); Bn.ins.push(e);
      return e;
    });
    const J = junctions(edges);
    for (const e of edges) {
      e.path = sample(e.corners, J);
      // a document rides from the document in work, out of the card and along the belt; a rework lane back to the sender's rack
      const w0 = e.from.kind === 'role' ? [workAt(e.from.def)] : [];
      e.vis = w0.length ? sample([...w0, ...e.corners], J) : e.path;
      e.inner = w0.length ? Math.hypot(e.corners[0][0] - w0[0][0], e.corners[0][1] - w0[0][1]) : 0;
      const off = e.path.pts.map((p, k) => { const a = at(e.path, e.path.cum[k]); return [a[0] + a[2] * RET, a[1] + a[3] * RET]; }).reverse();
      e.retVis = sample(e.to.kind === 'role' ? [workAt(e.to.def), ...off] : off);
    }
    // Loops: a belt that closes a cycle (work flowing back upstream) never carries rework.
    const state = new Map();
    const dfs = (n) => { state.set(n, 1); for (const e of n.outs) { if (e.to === cust) continue; const s = state.get(e.to); if (s === 1) e.loop = true; else if (!s) dfs(e.to); } state.set(n, 2); };
    dfs(cust);
    for (const n of nodes.values()) if (!state.get(n)) dfs(n);
    for (const e of edges) e.returns = e.kind === 'role' && !e.loop;
    // Spawn rules, resolved to belts.
    for (const c of uc.centers) {
      const n = nodes.get(c.id);
      n.spawns = (c.spawns || []).map((sp) => sp.choose
        ? { choose: sp.choose.map((ch) => ({ e: edges[seen.get(`${c.id}-${ch.to}`)], w: ch.w ?? 1 })), W: sp.choose.reduce((a, ch) => a + (ch.w ?? 1), 0) }
        : { e: edges[seen.get(`${c.id}-${sp.to}`)], n: sp.n, p: sp.p });
    }
    cust.edgeTo = new Map(cust.outs.map((e) => [e.to.id, e]));
    cust.next = 0; cust.rateSeen = -1; cust.mixCur = {}; cust.acc = [{}, {}];
    // Servers: one per work center, or one per person who runs several.
    const servers = [], byPerson = new Map();
    for (const n of nodes.values()) if (n.kind === 'role') {
      const p = n.def.person;
      let sv = p ? byPerson.get(p) : null;
      if (!sv) { sv = { id: p || n.id, nodes: [], busy: false, blocked: false, n: null, J: { q: 1, ai: 0, fl: 0, e: 0, b: 0 }, start: 0, end: 0, bounce: false, churn: 1, preQ: 1 }; servers.push(sv); if (p) byPerson.set(p, sv); }
      sv.nodes.push(n); n.server = sv;
    }
    // flow order for the compare stream: longest path from the Customer, loops and releases ignored
    const rank = new Map([['customer', 0]]);
    for (let it = 0; it < nodes.size; it++) for (const e of edges) if (!e.loop && e.to !== cust && rank.has(e.from.id)) rank.set(e.to.id, Math.max(rank.get(e.to.id) ?? 0, rank.get(e.from.id) + 1));
    const order = [...nodes.values()].sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0) || a.def.y - b.def.y).map((n) => n.id);
    // internal sources (Product company): a role writes tickets of its own into its backlog, e.g. roadmap items
    const srcs = (uc.sources || []).map((x, i) => ({ id: x.id, n: nodes.get(x.at), rate: x.rate, next: Infinity, seen: -1, modeSeen: '', ...streams(seed, 200 + i) }));
    const m = { B, seed, nodes, edges, J, cust, servers, order, srcs, centers: [...nodes.values()].filter((n) => n.kind === 'role'),
      t: 0, sampleAt: 0, tokens: 0, overflow: 0, shelf: [], created: 0, consumed: 0, dc: [], hook: null,
      outRate: 0, outN: 0, ownRate: 0, ownN: 0, arrRate: 0, rel: [0, 0], compl: 0, fu: 0, req: 0, failOut: 0,
      wip: 0, wipAvg: 0, mainRate: 0, company: S.company };
    size(m);
    return m;
  }

  // ---------- Dials: Reality -> center defaults -> per-center overrides -> AI ----------
  const aiOn = (n, s = S) => (s.ai === 'all' ? true : Array.isArray(s.ai) ? s.ai.includes(n.id) : false);
  function dials(n, s = S) {
    const o = s.over[n.id] || {}, d0 = n.def.dials || {};
    const m = n.def.realistic || [100, 100], k = s.reality / 100;
    const eff = o.eff ?? Math.round((d0.efficiency ?? 100) + (m[0] - 100) * k);
    const base = o.effv ?? Math.round((d0.effectiveness ?? 100) + (m[1] - 100) * k);
    const ai = !!(o.ai ?? d0.ai ?? aiOn(n, s));
    const aiq = ai ? { worse: -15, same: 0, better: 15 }[s.aiq] : 0;
    const effv = Math.max(5, Math.min(100, base + aiq));
    const fan = o.fan ?? d0.fanout ?? n.role.fan;
    // AI per work center: a speed-up (1 to 5x) and extra tasks per task (1x: none extra)
    const aiSpeed = o.aiSpeed ?? d0.aiSpeed ?? AI_SPEED, aiExtra = o.aiExtra ?? d0.aiExtra ?? 1;
    const en = n.def.enabled || ['efficiency', 'effectiveness', 'fanout', 'ai'];
    return { eff, effv, base, ai, fan, aiSpeed, aiExtra, fanEff: fan * (ai ? aiExtra : 1), effEff: Math.round(eff * (ai ? aiSpeed : 1)), en };
  }
  const mechOf = (s, k) => (s.mech[k] ? s.strength[k] ?? 0 : 0);
  const speedOf = (n, d) => n.mu * (d.eff / 100) * (d.ai ? d.aiSpeed : 1);   // jobs a week at size 1
  // Q114 B: a center with more than a week of work waiting rushes: its effectiveness drops linearly, 0 points at 1 week
  // of work waiting to RUSH_MAX points at 3 weeks and beyond (never below 5 %).
  const RUSH_MAX = 15, RUSH_FROM = 1, RUSH_TO = 3;
  const rushOf = (n) => RUSH_MAX * Math.max(0, Math.min(1, (n.Ws - RUSH_FROM) / (RUSH_TO - RUSH_FROM)));
  const effvNow = (n, d) => Math.max(5, d.effv - rushOf(n)) / 100;
  const srcRate = (src, d) => src.rate * (d.ai ? d.aiExtra : 1); // internal tickets scale with the role's AI extra tasks
  const productCo = (s) => s.company === 'product';
  // The Customer at given settings: the file's values, a preset's overrides, then the dashboard's.
  function custOf(m, s = S) {
    const base = m.B.data.customer, c = s.cust || {};
    return { rate: c.rate ?? base.rate ?? 0, mode: c.mode ?? base.arrivals ?? (s.reality > 0 ? 'random' : 'steady'),
      mix: c.mix ?? base.mix ?? {}, good: c.good ?? base.good ?? {}, bad: c.bad ?? base.bad ?? {} };
  }

  // ---------- Traffic solve: the expected flows at given settings ----------
  // F[e]: documents a week entering belt e, by quality (bad 0, good 1), failure demand (0, 1), times sent back (0..2)
  // and what the document carries (0 nothing, 1 a customer request, 2 an own ticket).
  const NF_ = 36, fi = (q, f, b, mn) => ((q * 2 + f) * 3 + b) * 3 + mn;
  function solve(m, s = S, { worst = false, rush = worst } = {}) {
    const E = m.edges.length, N = m.nodes.size, cu = custOf(m, s), cust = m.cust;
    let F = m.edges.map(() => new Float64Array(NF_));
    let load, jobs, out = 0, own = 0, relG = 0, relB = 0, fu = 0, R, converged = false;
    // the worst case: every inspection passes bad work unread, and every center rushes at the full RUSH_MAX (Q114 B)
    const D = [...m.nodes.values()].map((n) => { if (n.kind !== 'role') return null; const d = dials(n, s); return rush ? { ...d, effv: Math.max(5, d.effv - RUSH_MAX) } : d; });
    const rework = mechOf(s, 'rework'), churn = Math.max(1, mechOf(s, 'churn') || 1), complOn = !!s.mech.complaints;
    const mixW = Object.values(cu.mix).reduce((a, b) => a + b, 0) || 1;
    const badP = complOn ? Object.values(cu.bad).reduce((a, b) => a + b, 0) : 0;
    const srcs = productCo(s) ? m.srcs : [];
    for (let it = 0; it < 800; it++) {
      const NF = m.edges.map(() => new Float64Array(NF_));
      R = m.edges.map(() => new Float64Array(18)); // redo jobs at the sender of e: f * 9 + b * 3 + mn
      load = new Float64Array(N); jobs = new Float64Array(N);
      // the Customer: new requests, and follow-ups from the releases it received
      out = 0; own = 0; relG = 0; relB = 0; fu = 0;
      for (const e of cust.ins) { const Fe = F[e.i]; for (let q = 0; q < 2; q++) for (let f = 0; f < 2; f++) for (let b = 0; b < 3; b++) for (let mn = 1; mn < 3; mn++) { const r = Fe[fi(q, f, b, mn)]; if (!r) continue; if (q && !f) { if (mn === 1) out += r; else own += r; } if (e.release) { if (q) relG += r; else relB += r; } } }
      for (const [to, w] of Object.entries(cu.mix)) NF[cust.edgeTo.get(to).i][fi(1, 0, 0, 1)] += (cu.rate * w) / mixW;
      for (const [to, p] of Object.entries(cu.good)) { NF[cust.edgeTo.get(to).i][fi(1, 0, 0, 1)] += relG * p; fu += relG * p; }
      if (complOn) for (const [to, p] of Object.entries(cu.bad)) { NF[cust.edgeTo.get(to).i][fi(1, 1, 0, 1)] += relB * p; fu += relB * p; }
      const spawnOut = (n, d, r, qIn, f, mn, mult) => {
        const gq = qIn ? d.effv / 100 : 0;
        n.spawns.forEach((sp, j) => {
          const list = sp.choose ? sp.choose.map((c) => [c.e, c.w / sp.W, true]) : [[sp.e, sp.n ?? sp.p ?? 1, false]];
          for (const [e, x, ch] of list) {
            const docs = r * x * mult, main = mn && j === 0 ? (ch ? r * x : r) : 0, rest = Math.max(0, docs - main), A = NF[e.i];
            A[fi(1, f, 0, mn)] += main * gq; A[fi(0, f, 0, mn)] += main * (1 - gq);
            A[fi(1, f, 0, 0)] += rest * gq; A[fi(0, f, 0, 0)] += rest * (1 - gq);
          }
        });
      };
      // own tickets: written at the role itself, then handed on like a request
      for (const src of srcs) { const n = src.n, d = D[n.idx], r = srcRate(src, d); load[n.idx] += r; jobs[n.idx] += r; spawnOut(n, d, r, 1, 0, 2, d.fanEff); }
      for (const n of m.centers) {
        const d = D[n.idx], insp = !!n.def.inspection, p0 = Math.min(0.95, rework * INSPECT);
        for (const e of n.ins) {
          const Fe = F[e.i], sz = e.from.kind === 'role' && D[e.from.idx].ai ? e.aiSize : 1;
          for (let q = 0; q < 2; q++) for (let f = 0; f < 2; f++) for (let b = 0; b < 3; b++) for (let mn = 0; mn < 3; mn++) {
            const r = Fe[fi(q, f, b, mn)]; if (!r) continue;
            jobs[n.idx] += r;
            if (q === 1 || e.kind === 'src') { load[n.idx] += r * sz; spawnOut(n, d, r, 1, f, mn, d.fanEff); continue; }
            const elig = e.returns && b < 2;
            const pb = !elig ? 0 : insp ? (worst ? 0 : p0) : rework;
            const Bk = r * pb, kept = r - Bk;
            load[n.idx] += Bk * 0.3 * sz;
            if (Bk) R[e.i][f * 9 + Math.min(2, b + 1) * 3 + mn] += Bk;
            if (insp) { load[n.idx] += kept * sz; spawnOut(n, d, kept, 0, f, mn, d.fanEff); }
            else { load[n.idx] += kept * sz * (1 + EXTRA); spawnOut(n, d, kept, 0, f, mn, d.fanEff * churn); }
          }
        }
      }
      // redo jobs: the sender does the work again and hands on the same document, rolled afresh
      for (const e of m.edges) for (let f = 0; f < 2; f++) for (let b = 1; b < 3; b++) for (let mn = 0; mn < 3; mn++) {
        const r = R[e.i][f * 9 + b * 3 + mn]; if (!r) continue;
        const sn = e.from, g = D[sn.idx].effv / 100;
        load[sn.idx] += r; jobs[sn.idx] += r;
        NF[e.i][fi(1, f, b, mn)] += r * g; NF[e.i][fi(0, f, b, mn)] += r * (1 - g);
      }
      let diff = 0, tot = 0;
      for (let i = 0; i < E; i++) for (let j = 0; j < NF_; j++) { diff = Math.max(diff, Math.abs(NF[i][j] - F[i][j])); tot += NF[i][j]; }
      F = NF;
      if (diff < 1e-10) { converged = true; break; }
      if (!(tot < 1e9)) break;
    }
    const rho = {}, persons = {};
    for (const n of m.centers) {
      rho[n.id] = load[n.idx] / speedOf(n, D[n.idx]);
      const p = n.def.person;
      if (p) persons[p] = (persons[p] || 0) + rho[n.id];
    }
    const req = cu.rate + fu, rels = relG + relB;
    // headroom: how many times today's demand the most loaded center (or person) could serve
    const maxRho = Math.max(...m.centers.filter((n) => !n.def.person).map((n) => rho[n.id]), ...Object.values(persons), 1e-9);
    // satisfaction: good releases minus complaints, out of all releases; gain: follow-up requests per request
    return { F, load, jobs, rho, persons, out, own, relG, relB, fu, req, gain: req > 0 ? fu / req : 0, converged, headroom: 1 / maxRho,
      sat: rels > 0 ? Math.max(0, relG - relB * badP) / rels : 1 };
  }
  const IDEAL = (m, s = S) => ({ reality: 0, ai: 'off', aiq: 'same', over: {}, cust: null, mech: { rework: true, churn: true, complaints: true }, strength: {}, company: s.company });
  // Sizing (Q93): every work center gets the capacity that keeps it 70 % busy in Ideal, and at most RHO_REAL busy at
  // Realistic; a person's is the sum. Q115 judges a file on this sizing (muQ93).
  // Q121: on top, a coping margin so Realistic stays busy but coping while centers rush (Q114 B): the file's bottleneck
  // (or the person it belongs to) is sized to RHO_BN at Realistic, every other center to RHO_OTHER. Tuned so that over
  // 300 weeks x 10 seeds no center in any built-in Realistic ends beyond 2 weeks of work waiting.
  const RHO_REAL = 0.9, RHO_BN = 0.85, RHO_OTHER = 0.7;
  function size(m, s = S) {
    const bn = m.nodes.get(m.B.data.bottleneck), bp = bn && bn.def.person;
    const rhoAt = (n) => (n === bn || (bp && n.def.person === bp) ? RHO_BN : RHO_OTHER);
    for (const n of m.centers) n.mu = 1;
    const r = solve(m, IDEAL(m, s)), rr = solve(m, realisticSettings(m.B, s.company));
    const per = {}, perR = {};
    for (const n of m.centers) {
      const w = r.load[n.idx], wr = rr.rho[n.id]; n.idealJobs = r.jobs[n.idx];
      if (n.def.person) { per[n.def.person] = (per[n.def.person] || 0) + w; perR[n.def.person] = (perR[n.def.person] || 0) + wr; }
      n.muIdeal = Math.max(0.05, w / RHO_IDEAL);
      n.muQ93 = Math.max(n.muIdeal, wr / RHO_REAL);
      n.mu = Math.max(n.muIdeal, wr / rhoAt(n));
    }
    for (const n of m.centers) if (n.def.person) {
      const w = per[n.def.person], wr = perR[n.def.person];
      n.muIdeal = Math.max(0.05, w / RHO_IDEAL); n.muQ93 = Math.max(n.muIdeal, wr / RHO_REAL); n.mu = Math.max(n.muIdeal, wr / rhoAt(n));
    }
    m.idealOut = r.out; m.idealOwn = r.own; m.idealReq = r.req;
  }
  // The settings of Realistic: the file's realistic preset if it has one.
  function realisticSettings(B, company = S.company) {
    const p = (B.data.presets || []).find((x) => x.id === 'realistic') || { id: 'realistic', reality: 100 };
    return { ...IDEAL(null, { company }), ...presetSettings(B, p), reality: 100, ai: 'off', over: {}, strength: { ...MECH_DEFAULTS(), ...(B.data.mechanics || {}) } };
  }
  // The stability contract: at Realistic every load stays below capacity (a person's: the sum), and the follow-up loop
  // brings less than one new request per request. Nominal must hold, or the file is refused; the worst case
  // (every inspection passes all bad work unread) warns.
  // Q115: a file is refused when Q93 sizing would give a center (a person: the sum) more than SIZE_MAX times its Ideal
  // capacity: its realistic values are then far from what the line is built for.
  const SIZE_MAX = 1.5;
  function stability(m, s = realisticSettings(m.B, m.company ?? S.company)) {
    const out = { refuse: [], warn: [], nominal: null, rush: null, worst: null };
    const seen = new Set();
    for (const n of m.centers) {
      const p = n.def.person, k = p ? `person ${p}` : n.id;
      if (seen.has(k)) continue; seen.add(k);
      const x = n.muQ93 / n.muIdeal;
      if (x > SIZE_MAX + 1e-9) out.refuse.push(`${k}: Realistic needs ${x.toFixed(2)}× its Ideal capacity (at most ${SIZE_MAX}×)`);
    }
    // three passes: nominal refuses; full rushing (Q114 B) and the worst case only warn. A center that is under
    // capacity at nominal but over it while rushing is bistable: once more than RUSH_FROM weeks behind, it may not recover.
    const TAILS = { nominal: '', rush: ` when every center rushes (${RUSH_TO}+ weeks of work waiting)`, worst: ' when every center rushes and every inspection passes bad work unread' };
    for (const pass of ['nominal', 'rush', 'worst']) {
      const r = solve(m, s, { worst: pass === 'worst', rush: pass !== 'nominal' });
      out[pass] = r;
      const list = pass === 'nominal' ? out.refuse : out.warn, tail = TAILS[pass];
      if (!r.converged || !(r.gain < 1)) list.push(`customer: the follow-up requests never settle (${r.gain.toFixed(2)} new requests per request)${tail}`);
      for (const n of m.centers) if (!n.def.person && !(r.rho[n.id] < 1)) list.push(`${n.id}: load ${r.rho[n.id].toFixed(2)} of capacity at Realistic${tail}`);
      for (const [p, v] of Object.entries(r.persons)) if (!(v < 1)) list.push(`person ${p}: load ${v.toFixed(2)} of capacity at Realistic${tail}`);
    }
    return out;
  }
  const MECH_DEFAULTS = () => Object.fromEntries(STRENGTHS.map((k) => [k, MECH_RANGE[k][2]]));

  // ---------- Backlog: a deque of runs of identical jobs, bucketed per week ----------
  function pushBack(n, q, ai, fl, e, b, wk, c) {
    const R_ = n.runs;
    for (let i = R_.n - 1, k = 0; i >= 0 && k < 12; i--, k++) {
      const r = R_.at(i);
      if (r.wk !== wk) break;
      if (r.q === q && r.ai === ai && r.fl === fl && r.e === e && r.b === b) { if (i === R_.n - 1) { r.c += c; n.L += c; return; } break; }
    }
    R_.push({ q, ai, fl, e, b, wk, c }); n.L += c;
  }
  function pushFront(n, q, ai, fl, e, b, wk, c) {
    const f = n.runs.first();
    if (f && f.q === q && f.ai === ai && f.fl === fl && f.e === e && f.b === b) f.c += c; else n.runs.unshift({ q, ai, fl, e, b, wk, c });
    n.L += c;
  }
  function popJob(n, J) {
    const r = n.runs.first();
    J.q = r.q; J.ai = r.ai; J.fl = r.fl; J.e = r.e; J.b = r.b;
    if (--r.c === 0) n.runs.shift();
    n.L--;
  }

  // ---------- Transit: pooled tokens, each a count of identical documents; every handoff takes HANDOFF ----------
  const POOL = [];
  function send(m, e, c, q, ai, fl, b, t0) {
    if (c <= 0) return;
    m.created += c; e.inT += c; e.rate += c / TAU;
    if (m.tokens >= MAX_TOKENS) {
      for (let i = e.fwd.n - 1, k = 0; i >= 0 && k < 8; i--, k++) { const x = e.fwd.at(i); if (x.q === q && x.ai === ai && x.fl === fl && x.b === b) { x.c += c; m.overflow += c; return; } }
    }
    const x = POOL.pop() || {};
    x.c = c; x.q = q; x.ai = ai; x.fl = fl; x.b = b; x.t0 = t0; x.t1 = t0 + e.T; x.vr = 0; // vr: when the page first drew it (real time)
    e.fwd.push(x); m.tokens++;
  }
  function sendBack(m, e, J, t0) {
    const x = POOL.pop() || {};
    x.c = 1; x.q = Q.BAD; x.ai = J.ai; x.fl = (J.fl & (FAIL | MAIN | OWN)) | SENT; x.b = J.b + 1; x.t0 = t0; x.t1 = t0 + e.T; x.vr = 0;
    e.back.push(x); e.backT++; m.tokens++;
    e.backRate += 1 / TAU;
  }
  const bump = 1 / TAU;

  // The Customer's follow-up request after a release: in Ideal in strict turns, otherwise by chance.
  function followUp(m, list, q) {
    const c = m.cust;
    if (S.reality === 0) {
      const acc = c.acc[q];
      for (const [to, p] of Object.entries(list)) { acc[to] = (acc[to] || 0) + p; if (acc[to] >= 1 - 1e-9) { acc[to] -= 1; return c.edgeTo.get(to); } }
      return null;
    }
    let r = c.rq(); // follow-ups draw from their own stream, so the request mix never shifts with release quality
    for (const [to, p] of Object.entries(list)) { if (r < p) return c.edgeTo.get(to); r -= p; }
    return null;
  }
  function deliver(m, e, x) {
    const B_ = e.to, wk = Math.floor(x.t1);
    if (B_.kind === 'customer') {
      m.consumed += x.c; m.arrRate += x.c * bump;
      if (!(x.fl & MAIN)) return; // documents beside the request (fan-out, churn, AI's extra): received, not output
      const cu = m.cs;
      for (let i = 0; i < x.c; i++) {
        m.wip--; m.mainRate += 1 / TAU_OUT;
        // output: fulfilled customer requests, never failure demand; own tickets are counted apart
        if (x.q === Q.GOOD && !(x.fl & FAIL)) { if (x.fl & OWN) { m.ownRate += 1 / TAU_OUT; m.ownN++; } else { m.outRate += 1 / TAU_OUT; m.outN++; } }
        if (!e.release) continue;
        m.rel[x.q] += 1 / TAU_OUT;
        const fe = x.q === Q.GOOD ? followUp(m, cu.good, 1) : S.mech.complaints ? followUp(m, cu.bad, 0) : null;
        const compl = !!fe && x.q === Q.BAD;
        m.shelf.push({ q: x.q, ai: x.ai, compl });
        if (fe) { send(m, fe, 1, Q.GOOD, 0, FROM_SRC | MAIN | (compl ? COMPL | FAIL : 0), 0, x.t1); m.wip++; m.fu += bump; if (compl) m.compl += 1 / TAU_OUT; }
      }
      if (m.shelf.length > 12) m.shelf.splice(0, m.shelf.length - 12);
      return;
    }
    B_.rate.arr += x.c * bump;
    if (x.fl & COMPL) B_.sign.complaint = m.t;
    // Q114 A: complaint-born work handed on by another center (a bug ticket from Support) jumps the line
    if (x.fl & FAIL && e.from.kind === 'role') pushFront(B_, x.q, x.ai, x.fl, e.i, x.b, wk, x.c);
    else pushBack(B_, x.q, x.ai, x.fl, e.i, x.b, wk, x.c);
    if (m.hook) m.hook('arrive', B_, e, x);
  }
  function deliverBack(m, e, x) {
    const A = e.from;
    A.rate.arr += bump; A.rate.rwIn += bump;
    pushFront(A, Q.BAD, x.ai, REDO | (x.fl & (FAIL | MAIN | OWN)), e.i, x.b, Math.floor(x.t1), x.c); // rework never waits: front of the line
    if (m.hook) m.hook('front', A, e, x);
  }

  // ---------- Service: event-time completion inside a step ----------
  function pickCenter(sv) {
    if (sv.nodes.length === 1) return sv.nodes[0].L ? sv.nodes[0] : null;
    let best = null, bw = -1;
    for (const n of sv.nodes) if (n.L) { const w = n.L / n.mu; if (w > bw) { bw = w; best = n; } } // a person serves the most waiting work
    return best;
  }
  function serviceTime(m, n, mean) {
    if (S.reality === 0) return mean;              // Ideal: steady service
    if (n.def.service === 'exponential') return expo(n.rs, mean);
    return Math.max(0.1 * mean, mean * (1 + CV * normal(n.rs)));
  }
  function startJob(m, sv, n, t) {
    const J = sv.J, d = m.dc[n.idx];
    popJob(n, J);
    const e = m.edges[J.e];
    let size = J.fl & (REDO | FROM_SRC) ? 1 : J.ai ? e.aiSize : 1, bounce = false, churn = 1;
    if (J.q === Q.BAD && !(J.fl & (FROM_SRC | REDO))) {
      const elig = e.returns && J.b < 2;
      if (n.def.inspection) {
        // an inspection sends bad work back, but passes more of it unread as its backlog fills
        const p0 = elig ? Math.min(0.95, mechOf(S, 'rework') * INSPECT) : 0, k = Math.max(0, 1 - 1.4 * (n.def.stampUnderPressure ?? 0.8) * n.press), r = n.rr();
        bounce = r < p0 * k;
        if (!bounce && r < p0) { n.rate.unread += bump; n.sign.unread = t; }
      } else {
        bounce = elig && n.rr() < mechOf(S, 'rework');
        if (!bounce) { const c = mechOf(S, 'churn'); if (c > 1) { churn = c; n.sign.churn = t; } size *= 1 + EXTRA; } // kept and worked on: it multiplies and takes longer
      }
    }
    if (bounce) size *= 0.3;
    // the result is rolled when work starts, so the station can stamp it as the job ends
    sv.preQ = (J.fl & (REDO | FROM_SRC) || J.q === Q.GOOD) && n.rq() < effvNow(n, d) ? Q.GOOD : Q.BAD;
    sv.n = n; sv.bounce = bounce; sv.churn = churn; sv.busy = true; sv.start = t;
    sv.end = t + serviceTime(m, n, size / speedOf(n, d));
    if (m.hook) m.hook('start', n);
  }
  // buffer: a center with a limit blocks its senders after service (BAS)
  function roomFor(n) {
    for (const e of n.outs) { const B_ = e.to; if (B_.kind === 'role' && B_.def.buffer && B_.L + e.inT >= B_.def.buffer) return false; }
    return true;
  }
  function finish(m, sv, t) {
    const n = sv.n, J = sv.J, d = m.dc[n.idx];
    if (sv.bounce) { sendBack(m, m.edges[J.e], J, t); n.rate.back += bump; n.sign.rework = t; if (m.hook) m.hook('done', n); return true; } // the same document rides back
    if (!roomFor(n)) return false;
    m.consumed++; n.rate.done += bump;
    if (m.hook) m.hook('done', n);
    const ai = d.ai ? 1 : 0;
    if (J.fl & REDO) { send(m, m.edges[J.e], 1, sv.preQ, ai, J.fl & (FAIL | MAIN | OWN), J.b, t); n.rate.out[sv.preQ] += bump; return true; }
    const qIn = J.fl & FROM_SRC ? Q.GOOD : J.q, fl = J.fl & FAIL, main = J.fl & (MAIN | OWN), mult = d.fanEff * sv.churn;
    // Ideal routes steadily (every other one for p 0.5, in turn for choose); Realistic rolls the dice.
    const steady = S.reality === 0;
    for (let j = 0; j < n.spawns.length; j++) {
      const sp = n.spawns[j];
      let e, base;
      if (sp.choose) {
        let i = 0;
        if (steady) { let best = -Infinity; sp.choose.forEach((c, k) => { c.cur = (c.cur || 0) + c.w; if (c.cur > best) { best = c.cur; i = k; } }); sp.choose[i].cur -= sp.W; }
        else { let r = n.rr() * sp.W; while (i < sp.choose.length - 1 && r >= sp.choose[i].w) { r -= sp.choose[i].w; i++; } }
        e = sp.choose[i].e; base = 1;
      } else if (sp.n !== undefined) { e = sp.e; base = sp.n; }
      else { e = sp.e; if (steady) { sp.acc = (sp.acc || 0) + sp.p; base = sp.acc >= 1 - 1e-9 ? 1 : 0; if (base) sp.acc -= 1; } else base = n.rr() < sp.p ? 1 : 0; }
      if (!base) continue;
      const f = base * mult; let k = Math.floor(f);
      if (f > k) { if (steady) { sp.facc = (sp.facc || 0) + (f - k); if (sp.facc >= 1 - 1e-9) { sp.facc -= 1; k++; } } else if (n.rr() < f - k) k++; }
      if (!k) continue;
      // the first spawn's first document carries the request on, with the result rolled at the start
      if (j === 0) { send(m, e, 1, sv.preQ, ai, fl | main, 0, t); n.rate.out[sv.preQ] += bump; k--; }
      if (!k) continue;
      const g = qIn === Q.GOOD ? binom(n.rq, k, effvNow(n, d)) : 0;
      send(m, e, g, Q.GOOD, ai, fl, 0, t); send(m, e, k - g, Q.BAD, ai, fl, 0, t);
      n.rate.out[1] += g * bump; n.rate.out[0] += (k - g) * bump;
    }
    return true;
  }
  function runServer(m, sv, t0, t1) {
    let t = t0;
    for (let guard = 0; guard < 2000; guard++) {
      if (sv.blocked) { if (!finish(m, sv, t)) return; sv.blocked = false; sv.busy = false; }
      if (sv.busy) {
        if (sv.end > t1) return;
        t = sv.end;
        if (!finish(m, sv, t)) { sv.blocked = true; return; }
        sv.busy = false;
      }
      const n = pickCenter(sv);
      if (!n) { sv.n = null; return; }
      startJob(m, sv, n, t);
    }
  }

  // ---------- One step of the model ----------
  function nextGap(c, mode, r) { return mode === 'steady' ? 1 / r : expo(c.ra, 1 / r); }
  function pickMix(m, cu) {
    const c = m.cust, ent = Object.entries(cu.mix);
    let W_ = 0; for (const [, w] of ent) W_ += w;
    if (!W_) return null;
    if (cu.mode === 'steady') { // smooth weighted round robin: the mix in strict turns
      let best = -Infinity, pick = null;
      for (const [to, w] of ent) { c.mixCur[to] = (c.mixCur[to] || 0) + w; if (c.mixCur[to] > best) { best = c.mixCur[to]; pick = to; } }
      c.mixCur[pick] -= W_;
      return c.edgeTo.get(pick);
    }
    let r = c.rr() * W_;
    for (const [to, w] of ent) { if (r < w) return c.edgeTo.get(to); r -= w; }
    return c.edgeTo.get(ent[ent.length - 1][0]);
  }
  function step(m, dt = DTW) {
    const t0 = m.t, t1 = t0 + dt, fdec = Math.exp(-dt / TAU), a = 1 - Math.exp(-dt / 0.25);
    for (const n of m.centers) m.dc[n.idx] = dials(n);
    // the Customer: requests Steady (one every 1/rate) or Random (Poisson), split by the mix
    const cu = m.cs = custOf(m), c = m.cust, r = cu.rate;
    if (r !== c.rateSeen || cu.mode !== c.modeSeen) { c.rateSeen = r; c.modeSeen = cu.mode; c.next = r > 0 ? t0 + nextGap(c, cu.mode, r) : Infinity; }
    while (c.next <= t1) { const e = pickMix(m, cu); if (e) { send(m, e, 1, Q.GOOD, 0, FROM_SRC | MAIN, 0, c.next); m.wip++; m.req += bump; if (m.hook) m.hook('request', c, e, c.next); } c.next += nextGap(c, cu.mode, r); }
    // own tickets (Product company): written into the role's own backlog, steady in Ideal, random otherwise
    if (productCo(S)) for (const src of m.srcs) {
      const n = src.n, rs = srcRate(src, m.dc[n.idx]);
      if (rs !== src.seen || cu.mode !== src.modeSeen) { src.seen = rs; src.modeSeen = cu.mode; src.next = rs > 0 ? t0 + nextGap(src, cu.mode, rs) : Infinity; }
      while (src.next <= t1) { m.created++; m.wip++; n.rate.arr += bump; pushBack(n, Q.GOOD, 0, FROM_SRC | MAIN | OWN, -1, 0, Math.floor(src.next), 1); if (m.hook) m.hook('own', n); src.next += nextGap(src, cu.mode, rs); }
    }
    // belts: deliver what has arrived
    for (const e of m.edges) {
      while (e.fwd.n && e.fwd.first().t1 <= t1) { const x = e.fwd.shift(); e.inT -= x.c; m.tokens--; deliver(m, e, x); POOL.push(x); }
      while (e.back.n && e.back.first().t1 <= t1) { const x = e.back.shift(); e.backT -= x.c; m.tokens--; deliverBack(m, e, x); POOL.push(x); }
    }
    for (const sv of m.servers) runServer(m, sv, t0, t1);
    m.t = t1;
    // averages, utilisation, weeks of work waiting
    const sampleNow = m.t >= m.sampleAt;
    if (sampleNow) m.sampleAt = m.t + 0.5;
    for (const n of m.centers) {
      const r_ = n.rate, u = n.u, sv = n.server, d = m.dc[n.idx];
      r_.done *= fdec; r_.arr *= fdec; r_.back *= fdec; r_.rwIn *= fdec; r_.unread *= fdec; r_.out[0] *= fdec; r_.out[1] *= fdec;
      const mine = sv.n === n, busy = mine && sv.busy && !sv.blocked ? 1 : 0, blocked = mine && sv.blocked ? 1 : 0, starved = !mine && !n.L ? 1 : 0;
      const g = 1 - fdec, onBug = busy && sv.J.fl & FAIL ? 1 : 0;
      u.busy += (busy - u.busy) * g; u.fail += (onBug - u.fail) * g; u.blocked += (blocked - u.blocked) * g; u.starved += (starved - u.starved) * g;
      n.Lavg += (n.L - n.Lavg) * g;
      n.Ws += (n.L / speedOf(n, d) - n.Ws) * a;
      n.press = Math.min(1, n.Ws / RED);
      // weeks of work waiting: amber from one week, red from two, with a gap so it never blinks
      const w = n.Ws;
      if (n.lvl === 0 && w >= AMBER) n.lvl = 1;
      else if (n.lvl === 1) { if (w >= RED) n.lvl = 2; else if (w < AMBER * 0.85) n.lvl = 0; }
      else if (n.lvl === 2 && w < RED * 0.9) n.lvl = 1;
      if (sampleNow) {
        const h = n.hist, tot = r_.out[0] + r_.out[1];
        h.out.push(r_.done); h.good.push(tot > 0.05 ? (r_.out[1] / tot) * 100 : null); h.wait.push(n.Ws); h.L.push(n.Lavg);
        for (const k of ['out', 'good', 'wait', 'L']) if (h[k].length > 32) h[k].shift();
      }
    }
    for (const e of m.edges) {
      e.rate *= fdec; e.backRate *= fdec;
      // a rework lane shows while work is sent back on it, with a gap so it never blinks
      if (!e.retOn && e.backRate > RET_SHOW) e.retOn = true; else if (e.retOn && e.backRate < RET_HIDE) e.retOn = false;
    }
    const odec = Math.exp(-dt / TAU_OUT);
    m.wipAvg += (m.wip - m.wipAvg) * (1 - odec); m.mainRate *= odec; m.ownRate *= odec;
    m.outRate *= odec; m.rel[0] *= odec; m.rel[1] *= odec; m.compl *= odec; m.arrRate *= fdec; m.fu *= fdec; m.req *= fdec;
  }
  function warm(m, weeks) { for (let i = 0, n = Math.round(weeks / DTW); i < n; i++) step(m); }

  // ---------- Readouts ----------
  const inWork = (m) => m.servers.reduce((a, sv) => a + (sv.busy || sv.blocked ? 1 : 0), 0);
  const inTransit = (m) => m.edges.reduce((a, e) => a + e.inT + e.backT, 0);
  const backlogOf = (m) => m.centers.reduce((a, n) => a + n.L, 0);
  // documents created = received by the Customer or finished + waiting + on belts + in work
  const conservation = (m) => ({ created: m.created, consumed: m.consumed, backlog: backlogOf(m), transit: inTransit(m), work: inWork(m), gap: m.created - m.consumed - backlogOf(m) - inTransit(m) - inWork(m) });
  const weeksOfWork = (n) => n.L / speedOf(n, dials(n));
  const progressOf = (sv, t) => (sv.busy ? Math.max(0, Math.min(1, (t - sv.start) / Math.max(1e-9, sv.end - sv.start))) : sv.blocked ? 1 : 0);
  // satisfaction over the averaged releases: good ones minus complaints, out of all
  const satRate = (m) => { const t = m.rel[0] + m.rel[1]; return t > 0.05 ? Math.max(0, m.rel[1] - m.compl) / t : 1; };
  // Little's law holds only while the backlog is steady: compare the average backlog now with four weeks ago
  function leadTime(n) {
    const h = n.hist.L; if (h.length < 9) return null;
    const now = h[h.length - 1], then = h[h.length - 9], x = n.rate.done;
    if (x < 0.05 || Math.abs(now - then) > Math.max(1, 0.15 * Math.max(now, then))) return null;
    return now / x;
  }
  // How long the backlog takes to clear at this pace: capacity minus what keeps arriving.
  function drain(n) {
    const cap = speedOf(n, dials(n)), free = cap - n.rate.arr;
    return { weeks: free > 0.05 ? n.L / free : Infinity, grow: -free, cap };
  }

  // Signals and the traffic light of a work center (the monitor on its dashboard).
  function signals(n) {
    const r = n.rate, w = n.Ws, L = [];
    const rwShare = r.arr > 0.05 ? r.rwIn / r.arr : 0;
    if (n.u.blocked > 0.2) L.push(['red', 'backing', 'Blocked: finished work cannot leave, the next center is full']);
    if (n.lvl === 2) L.push(['red', 'bottleneck', `Bottleneck: ${w.toFixed(1)} weeks of work waiting`]);
    else if (n.lvl === 1) L.push(['amber', 'overloaded', `Busy: ${w.toFixed(1)} weeks of work waiting`]);
    if (rwShare > 0.2) L.push(['amber', 'rework', `Rework-heavy: ${Math.round(rwShare * 100)} % of its work comes back`]);
    if (n.def.inspection && r.unread >= 0.5) L.push(['amber', 'unread', 'Passing unread: bad work goes through unchecked']);
    if (n.u.starved > 0.6) L.push(['amber', 'starved', 'Starved: mostly waiting for work']);
    const level = L.some((x) => x[0] === 'red') ? 'red' : L.length ? 'amber' : 'green';
    if (!L.length) L.push(['green', 'ok', 'Keeping up']);
    return { level, list: L };
  }
  // a hash of the whole state, for the determinism check
  function stateHash(m) {
    let h = 2166136261;
    const add = (x) => { h = Math.imul(h ^ (Math.round(x * 1e6) | 0), 16777619) >>> 0; };
    add(m.t); add(m.created); add(m.consumed); add(m.outN);
    for (const n of m.centers) { add(n.L); add(n.rate.done); }
    for (const e of m.edges) { add(e.inT); add(e.backT); }
    for (const sv of m.servers) add(sv.end);
    return h.toString(16);
  }

  // ---------- Presets: the settings a state sets (pure, so the checks can use it) ----------
  function presetSettings(B, p) {
    const over = {};
    for (const [id, o] of Object.entries(p.dials || {})) { const x = {}; if (o.efficiency !== undefined) x.eff = o.efficiency; if (o.effectiveness !== undefined) x.effv = o.effectiveness; if (o.fanout !== undefined) x.fan = o.fanout; if (o.aiSpeed !== undefined) x.aiSpeed = o.aiSpeed; if (o.aiExtra !== undefined) x.aiExtra = o.aiExtra; over[id] = x; }
    const reality = p.reality ?? 0, base = B.data.customer, pc = p.customer || {};
    const cust = { rate: pc.rate ?? base.rate, mode: pc.arrivals ?? base.arrivals ?? (reality > 0 ? 'random' : 'steady'),
      mix: { ...(pc.mix ?? base.mix) }, good: { ...(pc.good ?? base.good ?? {}) }, bad: { ...(pc.bad ?? base.bad ?? {}) } };
    return { preset: p.id, reality, ai: p.ai ?? 'off', over, cust };
  }
