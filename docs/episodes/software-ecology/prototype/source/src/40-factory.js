  // ---------- Factory floor: belts (SVG), work center cards (HTML), documents (canvas) ----------
  const view = $('#view'), stage = $('#stage'), floor = $('#floor');
  let canvas, ctx, overlay, cardEls = new Map(), labelEls = [];
  const geom = (n) => {
    const { x, y } = n.def;
    if (n.kind === 'customer') return [x - CUST_W, y - CUST_TOP, CUST_W * 2, CUST_TOP + CUST_BOT];
    return [x - HALF, y - TOP, HALF * 2, TOP + BOT];
  };

  function beltSvg(list, bw = 22) {
    // a rework lane runs thin beside its belt and shows only while work is sent back on it
    const sw = bw - 4, ds = list.map((e) => e.path.d), rets = list.filter((e) => e.returns).map((e) => [e.i, offsetD(e.path, RET)]);
    return `<g class="rets">${rets.map(([i, d]) => `<g class="ret" data-ret="${i}"><path d="${d}" class="belt-rail" stroke-width="13" /><path d="${d}" class="belt-surface" stroke-width="10" /><path d="${d}" class="belt-slats belt-slats--back" stroke-width="8" /></g>`).join('')}</g>`
      + ds.map((d) => `<path d="${d}" class="belt-rail" stroke-width="${bw + 2}" />`).join('')
      + ds.map((d) => `<path d="${d}" class="belt-surface" stroke-width="${sw}" />`).join('')
      + ds.map((d) => `<path d="${d}" class="belt-slats" stroke-width="${sw - 2}" />`).join('');
  }
  function renderFactory() {
    const uc = UC(), { width: Wd, height: Ht } = uc.layout, Y0 = uc.layout.top ?? 0;
    const under = M.edges.filter((e) => !e.over), over = M.edges.filter((e) => e.over);
    const plates = [...M.J.values()].map(([x, y]) => `<rect x="${x - 14}" y="${y - 14}" width="28" height="28" rx="3" class="plate" />`).join('');
    // a belt marked over: true crosses the others on a bridge, drawn on top with its own rails
    const base = beltSvg(under) + plates + beltSvg(over);
    // labels on straight runs, clear of cards and each other
    const boxes = [...M.nodes.values()].map((n) => { const [x, y, w, hh] = geom(n); return [x - 4, y - 4, x + w + 4, y + hh + 4]; });
    const hit = (b) => boxes.some((q) => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1]);
    const place = (e, text) => {
      const w = text.length * 6.4 + 70, cands = [], runs = [];
      for (let i = 1; i < e.corners.length; i++) runs.push([e.corners[i - 1], e.corners[i]]);
      runs.sort((a, b) => Math.hypot(b[1][0] - b[0][0], b[1][1] - b[0][1]) - Math.hypot(a[1][0] - a[0][0], a[1][1] - a[0][1]));
      for (const [[x0, y0], [x1, y1]] of runs) {
        const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
        if (y0 === y1) for (const f of [0.5, 0.3, 0.7]) { const xx = x0 + (x1 - x0) * f; cands.push({ x: xx, y: my + 30, a: 'middle', b: [xx - w / 2, my + 18, xx + w / 2, my + 42] }, { x: xx, y: my - 34, a: 'middle', b: [xx - w / 2, my - 46, xx + w / 2, my - 22] }); }
        else for (const f of [0.5, 0.3, 0.7]) { const yy = y0 + (y1 - y0) * f; cands.push({ x: mx + 18, y: yy, a: 'start', b: [mx + 14, yy - 12, mx + 18 + w, yy + 12] }, { x: mx - 26, y: yy, a: 'end', b: [mx - 26 - w, yy - 12, mx - 22, yy + 12] }); }
      }
      const c = cands.find((q) => !hit(q.b)) || cands[0];
      boxes.push(c.b);
      return c;
    };
    const labels = M.edges.map((e) => {
      const c = place(e, `${e.label} · 12 a week · ↩ ${e.retLabel}`);
      return `<g class="elabel" data-elabel="${e.i}" data-x="${c.x}" data-y="${c.y}" data-anchor="${c.a}"><rect class="elabel__bg" rx="11" height="22" /><text class="elabel__tx" y="${c.y + 4}"></text></g>`;
    }).join('');
    const hits = M.edges.map((e) => `<path d="${e.path.d}" class="edge-hit" data-edge="${e.i}" />`).join('');
    stage.innerHTML = `<svg viewBox="0 ${Y0} ${Wd} ${Ht}" class="base" aria-hidden="true">${base}</svg><canvas aria-hidden="true"></canvas>
      <svg viewBox="0 ${Y0} ${Wd} ${Ht}" class="overlay" aria-hidden="true">${hits}${labels}</svg>`;
    canvas = $('canvas', stage); ctx = canvas.getContext('2d'); overlay = $('.overlay', stage);
    labelEls = $$('.elabel', overlay);
    for (const p of $$('.edge-hit', overlay)) {
      p.addEventListener('pointerenter', () => showEdgeLabel(Number(p.dataset.edge), true));
      p.addEventListener('pointerleave', () => showEdgeLabel(Number(p.dataset.edge), false));
    }
    retEls = new Map($$('[data-ret]', stage).map((g) => [Number(g.dataset.ret), g]));
    syncReturns();
  }
  let retEls = new Map();
  // a rework lane shows while work is sent back on it (the model holds the hysteresis), so it never blinks
  function syncReturns() { for (const [i, g] of retEls) { const on = M.edges[i].retOn; if (g._on !== on) { g._on = on; g.classList.toggle('is-on', on); } } }
  function showEdgeLabel(i, on) {
    const g = labelEls[i], e = M.edges[i];
    if (on) {
      const x = Number(g.dataset.x), y = Number(g.dataset.y), a = g.dataset.anchor, tx = $('text', g);
      const back = Math.round(e.backRate);
      tx.innerHTML = `${esc(e.label)} <tspan class="elabel__rate">· ${Math.round(e.rate)} a week${back ? ` · ↩ ${back} ${esc(e.retLabel)}` : ''}</tspan>`;
      tx.setAttribute('text-anchor', a); tx.setAttribute('x', x);
      const w = tx.getComputedTextLength() + 20, bg = $('rect', g);
      bg.setAttribute('x', a === 'middle' ? x - w / 2 : a === 'end' ? x - w + 10 : x - 10); bg.setAttribute('y', y - 11); bg.setAttribute('width', w);
    }
    g.classList.toggle('is-on', on);
  }

  // ---------- Colours: read from the design tokens ----------
  let C = {};
  const probeEl = document.createElement('span');
  const tokenColor = (css) => { probeEl.style.color = ''; probeEl.style.color = css; return getComputedStyle(probeEl).color; };
  function readColors() {
    if (!probeEl.isConnected) { probeEl.hidden = true; document.body.append(probeEl); }
    const dark = document.documentElement.classList.contains('dark');
    const paper = dark ? 'color-mix(in oklab, var(--foreground) 92%, var(--background))' : 'var(--card)';
    C = {
      dark, paper: tokenColor(paper), ink: tokenColor(dark ? 'var(--background)' : 'var(--foreground)'),
      good: tokenColor(`color-mix(in oklab, var(--success) 24%, ${paper})`), bad: tokenColor(`color-mix(in oklab, var(--destructive) 24%, ${paper})`),
      aiFill: tokenColor(`color-mix(in oklab, var(--ai) 20%, ${paper})`),
      edge: tokenColor(dark ? 'color-mix(in oklab, var(--background) 60%, var(--foreground))' : 'color-mix(in oklab, var(--foreground) 45%, var(--card))'),
      ai: tokenColor('var(--ai)'), good2: tokenColor('var(--success)'), warn: tokenColor('var(--warning)'), dull: tokenColor('var(--muted-foreground)'), fg: tokenColor('var(--foreground)'),
      track: tokenColor('color-mix(in oklab, var(--foreground) 14%, transparent)'), badTint: tokenColor('color-mix(in oklab, var(--destructive) 18%, transparent)'), border: tokenColor('var(--border)'), destr: tokenColor('var(--destructive)'),
      font: getComputedStyle(document.body).fontFamily,
    };
    iconCache.clear(); sheetKey = '';
  }

  // ---------- Stage: the layout fits inside the stage (contain), centred ----------
  let K = 1, OX = 0, OY = 0, DPR = 1;
  function measure() {
    if (!canvas) return false;
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    const uc = UC();
    DPR = Math.min(2, window.devicePixelRatio || 1);
    K = Math.min(r.width / uc.layout.width, r.height / uc.layout.height);
    OX = (r.width - uc.layout.width * K) / 2; OY = (r.height - uc.layout.height * K) / 2 - (uc.layout.top ?? 0) * K;
    const w = Math.round(r.width * DPR), hh = Math.round(r.height * DPR);
    if (canvas.width !== w || canvas.height !== hh) { canvas.width = w; canvas.height = hh; }
    if (S.view === 'factory') { const tf = `translate(${OX}px, ${OY}px) scale(${K})`; if (floor.style.transform !== tf) floor.style.transform = tf; }
    return true;
  }
  function placeCards() {
    for (const [id, el] of cardEls) {
      const n = M.nodes.get(id);
      const [x, y, w, hh] = S.view === 'factory' ? geom(n).map((v) => `${v}px`) : ['', '', '', ''];
      Object.assign(el.style, { left: x, top: y, width: w, height: hh });
    }
  }

  // ---------- Documents: Option A (Han's): marks inside the sheet ----------
  // doc: { q, ai, mark } with mark 'warn' for a complaint or work sent back for rework.
  function bang(c, cx, cy, sz, color) { c.fillStyle = color; c.fillRect(cx - 0.45 * sz, cy - 1.7 * sz, 0.9 * sz, 2.3 * sz); c.fillRect(cx - 0.45 * sz, cy + 1 * sz, 0.9 * sz, 0.85 * sz); }
  function star(c, cx, cy, r, color) { c.fillStyle = color; c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4 - Math.PI / 2, rr = i % 2 ? r * 0.32 : r; c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.closePath(); c.fill(); }
  const DW = 9, DH = 11.5, DF = 3;
  const sheetPath = (c) => { c.beginPath(); c.moveTo(-DW / 2, -DH / 2); c.lineTo(DW / 2 - DF, -DH / 2); c.lineTo(DW / 2, -DH / 2 + DF); c.lineTo(DW / 2, DH / 2); c.lineTo(-DW / 2, DH / 2); c.closePath(); };
  // fill: 0..1 of the sheet filled from the bottom (a document in work); undefined draws a finished one
  function drawDoc(c, x, y, s, d, fill) {
    const ai = d.ai, warn = d.mark === 'warn', bad = d.q === Q.BAD;
    c.save(); c.translate(x, y); c.scale(s, s);
    c.lineJoin = 'round';
    sheetPath(c); c.fillStyle = ai ? C.aiFill : C.paper; c.fill();
    if (fill !== undefined) { c.save(); sheetPath(c); c.clip(); c.fillStyle = ai ? C.ai : C.fg; c.globalAlpha = 0.28; c.fillRect(-DW / 2, DH / 2 - DH * fill, DW, DH * fill); c.restore(); }
    c.lineWidth = ai ? 1.5 : 0.9; c.strokeStyle = ai ? C.ai : C.edge; sheetPath(c); c.stroke();
    c.beginPath(); c.moveTo(DW / 2 - DF, -DH / 2); c.lineTo(DW / 2 - DF, -DH / 2 + DF); c.lineTo(DW / 2, -DH / 2 + DF); c.closePath(); c.lineWidth = 0.7; c.strokeStyle = C.edge; c.stroke();
    if (fill === undefined) {
      if (warn) { c.fillStyle = C.destr; c.beginPath(); c.moveTo(0, -2.6); c.lineTo(3.9, 3.6); c.lineTo(-3.9, 3.6); c.closePath(); c.fill(); bang(c, 0, 1.3, 0.95, C.paper); }
      else if (bad) { c.fillStyle = C.destr; c.beginPath(); c.roundRect(-3, -0.95, 6, 1.9, 0.9); c.fill(); }
    }
    if (ai) star(c, -DW / 2 + 0.3, -DH / 2 + 0.3, 3.4, C.ai);
    c.restore();
  }
  // the same icon as an image, for the DOM (compare view, legend)
  const iconCache = new Map();
  function docIconURL(d) {
    const k = `${d.q}|${d.ai ? 1 : 0}|${d.mark || ''}`;
    if (!iconCache.has(k)) {
      const cv = document.createElement('canvas'); cv.width = 40; cv.height = 46;
      const c = cv.getContext('2d'); c.scale(2, 2); drawDoc(c, 10, 11.6, 1.55, d);
      iconCache.set(k, cv.toDataURL());
    }
    return iconCache.get(k);
  }
  // Sprite sheet: the eight icons (good/bad x AI x warning), drawn once at the current scale; a frame only copies them.
  let sheet = null, sheetKey = '';
  const SPR = 15; // a sprite cell in layout units
  const spriteIdx = (q, ai, warn) => (warn ? 4 : 0) + (ai ? 2 : 0) + q;
  function ensureSheet() {
    const px = Math.max(8, Math.ceil(SPR * K * DPR)), k = `${px}|${C.paper}|${C.ai}`;
    if (k === sheetKey) return px;
    sheetKey = k;
    sheet = document.createElement('canvas'); sheet.width = px * 8; sheet.height = px;
    const c = sheet.getContext('2d');
    for (let i = 0; i < 8; i++) { c.setTransform(px / SPR, 0, 0, px / SPR, i * px, 0); drawDoc(c, SPR / 2, SPR / 2, 1.05, { q: i & 1, ai: (i >> 1) & 1, mark: i >= 4 ? 'warn' : '' }); }
    return px;
  }
  const label = (c, text, x, y, color, align = 'left', size = 11) => { c.font = `600 ${size}px ${C.font}`; c.fillStyle = color; c.textAlign = align; c.fillText(text, x, y); };
  function badge(c, x, y, n) {
    const t = `×${n}`;
    c.font = `700 8.5px ${C.font}`;
    const w = c.measureText(t).width + 6;
    c.fillStyle = C.fg; c.beginPath(); c.roundRect(x, y - 6, w, 11, 5.5); c.fill();
    c.fillStyle = C.paper; c.textAlign = 'left'; c.fillText(t, x + 3, y + 3);
  }

  // ---------- Drawing one frame ----------
  let drawn = 0, sprites = 0;
  // A belt holds tokens; each is a count of identical documents. Neighbours of the same kind closer than GAP merge into one sprite with "×n".
  // A document leaves the station from the document in work: it shrinks to belt size over the stretch inside the card.
  // Q97: a handoff animates HANDOFF_SECS on screen at any speed. A token's place on the belt runs on real time from when the page
  // first drew it; one the model has already delivered rides on as a "landing" until it reaches the end, then joins the rack.
  const WORK_S = 2.8, RACK_S = 1.15; // document sizes in work and in the rack, relative to one on a belt
  const MERGE = new Float64Array(8 * 2);
  let NOW = 0;
  const visF = (x, tr) => {
    if (reduce.matches) { const f = (tr - x.t0) / (x.t1 - x.t0); return f < 0 ? 0 : f > 1 ? 1 : f; }
    if (!x.vr) x.vr = NOW;
    const f = (NOW - x.vr) / (HANDOFF_SECS * 1000);
    return f > 1 ? 1 : f;
  };
  function drawBelt(c, e, list, tr, back, px) {
    if (e.hideIn === undefined) e.hideIn = !back && e.from.kind === 'role' && e.corners[0][1] < e.from.def.y - 1 ? e.inner : -1;
    const path = back ? e.retVis : e.vis, L = path.L, inner = back ? 0 : e.inner, n = list.n ?? list.length;
    let bucket = -1;
    MERGE.fill(0);
    const flush = () => {
      if (bucket < 0) return;
      for (let k = 0; k < 8; k++) {
        const cnt = MERGE[k * 2]; if (!cnt) continue;
        if (sprites >= MAX_SPRITES) { MERGE[k * 2] = 0; continue; }
        const s = MERGE[k * 2 + 1] / cnt;
        if (s < e.hideIn) { MERGE[k * 2] = 0; MERGE[k * 2 + 1] = 0; continue; } // leaving through the head: hidden until it is out of the card
        const p = at(path, s);
        const grow = s < inner && !back ? WORK_S - (WORK_S - 1) * (s / inner) : 1, sz = (back ? 0.8 : 1) * SPR * grow;
        c.drawImage(sheet, k * px, 0, px, px, p[0] - sz / 2, p[1] - sz / 2, sz, sz);
        if (cnt > 1) badge(c, p[0] + 4, p[1] - 7, cnt);
        sprites++; MERGE[k * 2] = 0; MERGE[k * 2 + 1] = 0;
      }
    };
    for (let i = n - 1; i >= 0; i--) { // newest first: from the start of the belt
      const x = list.at ? list.at(i) : list[i];
      const s = L * visF(x, tr), b = Math.floor(s / GAP);
      if (b !== bucket) { flush(); bucket = b; }
      const k = x.k ?? spriteIdx(back ? 0 : x.q, x.ai, back || (x.fl & COMPL) ? 1 : 0);
      MERGE[k * 2] += x.c; MERGE[k * 2 + 1] += s * x.c;
      drawn += x.c;
    }
    flush();
  }

  // ---------- The station: a rack of six slots at full card height on the left, the document in work beside it ----------
  // The rack mirrors the model's backlog: documents slide in from the belt, down the rack, into work, and out onto the next belt.
  const rackX = (n) => n.def.x - HALF + RACK_PAD + RACK_W / 2;
  const slotY = (n, i) => n.def.y + BOT - RACK_PAD - SLOT / 2 - i * SLOT;
  const kindOf = (r) => spriteIdx(r.q, r.ai, r.fl & (REDO | COMPL) ? 1 : 0);
  const visOf = (n) => (n.v ||= { q: [], work: null, ghosts: [], land: [], pile: null });
  const mkDoc = (k, x, y, s, a = 1) => ({ k, x, y, s, a });
  // landings: documents the model delivered while their handoff still plays on screen
  const LANDS = [];
  function visHook(type, n, e, x) {
    if (type === 'request') return;
    const v = visOf(n);
    if (type === 'arrive' || type === 'front') {
      const back = type === 'front';
      if (reduce.matches) { const p = (back ? e.retVis : e.path).pts; const q = p[p.length - 1]; v.q.push(mkDoc(back ? spriteIdx(Q.BAD, x.ai, 1) : spriteIdx(x.q, x.ai, x.fl & COMPL ? 1 : 0), q[0], q[1], 1)); return; }
      const l = { e, back, n, c: x.c, k: back ? spriteIdx(Q.BAD, x.ai, 1) : spriteIdx(x.q, x.ai, x.fl & COMPL ? 1 : 0), vr: x.vr || NOW };
      LANDS.push(l); v.land.push(l);
    } else if (type === 'own') {
      v.q.push(mkDoc(spriteIdx(Q.GOOD, 0, 0), rackX(n), slotY(n, RACK - 1) - SLOT, RACK_S, 0)); // an own ticket appears at the top of the rack
    } else if (type === 'start') {
      const d = v.q.shift(), [wx, wy] = workAt(n.def);
      v.work = d || mkDoc(0, wx, wy, WORK_S); // nothing in the rack: the next job starts in place, full size
    } else if (type === 'done') v.work = null;
  }
  // a landing that reached the end of its belt joins the rack where the belt ends
  function landAll() {
    for (let i = LANDS.length - 1; i >= 0; i--) {
      const l = LANDS[i];
      if ((NOW - l.vr) < HANDOFF_SECS * 1000 && M.edges[l.e.i] === l.e) continue;
      LANDS.splice(i, 1);
      const v = visOf(l.n); v.land.splice(v.land.indexOf(l), 1);
      if (M.edges[l.e.i] !== l.e) continue; // from a model that has since been rebuilt
      const p = (l.back ? l.e.retVis : l.e.path).pts, q = p[p.length - 1];
      const d = mkDoc(l.k, q[0], q[1], l.back ? 0.8 : 1);
      if (l.back) v.q.unshift(d); else v.q.push(d);
    }
  }
  // Each frame: ease every document toward its place, and keep the rack in step with the model (kinds, count).
  let lastReal = 0;
  function settle(n, ease) {
    const v = visOf(n), landing = v.land.reduce((a, l) => a + l.c, 0), want = Math.max(0, Math.min(n.L - landing, RACK));
    while (v.q.length > want) v.ghosts.push({ ...v.q.pop(), life: 1 });
    let i = 0;
    for (let ri = 0; ri < n.runs.n && i < want; ri++) { const r = n.runs.at(ri), k = kindOf(r); for (let j = 0; j < r.c && i < want; j++, i++) { if (i >= v.q.length) v.q.push(mkDoc(k, rackX(n), slotY(n, RACK - 1), RACK_S, 0)); v.q[i].k = k; } }
    for (let j = 0; j < v.q.length; j++) { const d = v.q[j], ty = slotY(n, j); d.x += (rackX(n) - d.x) * ease; d.y += (ty - d.y) * ease; d.s += (RACK_S - d.s) * ease; d.a += (1 - d.a) * ease; }
    const sv = n.server, inWork = sv.n === n && (sv.busy || sv.blocked);
    if (!inWork) v.work = null;
    else { const [wx, wy] = workAt(n.def); if (!v.work) v.work = mkDoc(0, wx, wy, WORK_S); const w = v.work; w.x += (wx - w.x) * ease; w.y += (wy - w.y) * ease; w.s += (WORK_S - w.s) * ease; }
    for (const g of v.ghosts) { g.x += (rackX(n) - g.x) * ease; g.y += (slotY(n, RACK - 1) - g.y) * ease; g.life -= ease * 0.9; }
    if (v.ghosts.length) v.ghosts = v.ghosts.filter((g) => g.life > 0.05);
  }
  function drawRack(c, n, px) {
    const v = visOf(n), x = rackX(n), over = n.L > RACK, hw = RACK_W / 2;
    // the rack: six slots at the card's full height, filling from the bottom; past six the top slot turns red and the rest piles up outside
    c.lineWidth = 0.8; c.strokeStyle = C.border;
    const top = slotY(n, RACK - 1) - SLOT / 2, bot = slotY(n, 0) + SLOT / 2;
    if (over) { c.fillStyle = C.badTint; c.fillRect(x - hw, top, RACK_W, SLOT); }
    c.beginPath(); c.moveTo(x - hw, top); c.lineTo(x - hw, bot); c.lineTo(x + hw, bot); c.lineTo(x + hw, top);
    for (let i = 1; i < RACK; i++) { const yy = slotY(n, i) + SLOT / 2; c.moveTo(x - hw, yy); c.lineTo(x + hw, yy); }
    c.stroke();
    if (over) { c.strokeStyle = C.destr; c.lineWidth = 1.4; c.strokeRect(x - hw, top, RACK_W, SLOT); }
    for (const g of v.ghosts) { c.globalAlpha = Math.max(0, g.life); const sz = SPR * g.s; c.drawImage(sheet, g.k * px, 0, px, px, g.x - sz / 2, g.y - sz / 2, sz, sz); }
    for (const d of v.q) { c.globalAlpha = d.a; const sz = SPR * d.s; c.drawImage(sheet, d.k * px, 0, px, px, d.x - sz / 2, d.y - sz / 2, sz, sz); }
    c.globalAlpha = 1;
  }

  // ---------- Q104: the pile-up past the rack, at the end of the incoming belt (visual only; the model is unchanged) ----------
  // Three Options (⋮ menu): heap (documents tumble onto a heap), stack (a leaning stack that sways), drift (a scattered drift that jiggles).
  // Every station draws its own seeded shapes, so no two piles look alike. Sprites grow with the weeks of work waiting, 12 at most.
  const PILE_MAX = 12;
  const PILES = {
    heap: { name: 'Tumbling heap', note: 'documents drop onto a heap at the belt end and settle at an angle' },
    stack: { name: 'Leaning stack', note: 'a stack of sheets grows up from the belt end, leaning and swaying a little' },
    drift: { name: 'Scattered drift', note: 'documents scatter around the belt end and jiggle, like a drift against a wall' },
  };
  function pileOf(n) {
    const v = visOf(n);
    if (v.pile && v.pile.seedFor === M.seed) return v.pile;
    // the incoming belt the pile sits on: the busiest one into this station
    const e = n.ins.slice().sort((a, b) => b.rate - a.rate || a.i - b.i)[0];
    const r = mulberry(mix(M.seed, 9000 + n.idx));
    const items = Array.from({ length: PILE_MAX }, (_, i) => ({ u: r(), w: r(), z: r(), ph: r() * Math.PI * 2, t: 0 }));
    return (v.pile = { seedFor: M.seed, e, lean: (r() - 0.5) * 0.5, items, shown: 0 });
  }
  function drawPile(c, n, px, dt) {
    if (!n.ins.length) return;
    const P = pileOf(n), want = n.L > RACK ? Math.min(PILE_MAX, Math.max(1, Math.ceil(n.Ws * 3))) : 0;
    P.shown += (want - P.shown) * Math.min(1, dt * 4);
    const k = Math.round(P.shown); if (!k && P.shown < 0.05) return;
    const e = P.e, pts = e.path.pts, end = pts[pts.length - 1], prev = pts[Math.max(0, pts.length - 6)];
    let dx = end[0] - prev[0], dy = end[1] - prev[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; // along the belt, into the card
    const nx = -dy, ny = dx, mode = S.pile || 'heap', t = NOW / 1000;
    // the kinds of what waits past the rack
    let ri = 0, skip = RACK, kinds = [];
    for (; ri < n.runs.n && kinds.length < k; ri++) { const r = n.runs.at(ri); for (let j = 0; j < r.c && kinds.length < k; j++) { if (skip) { skip--; continue; } kinds.push(kindOf(r)); } }
    for (let i = 0; i < k; i++) {
      const it = P.items[i], kd = kinds[i] ?? 0;
      it.t = Math.min(1, it.t + dt * 3); // a new sprite drops in
      let ax, ay, rot, s = 1;
      if (mode === 'stack') { // a leaning stack: up from the belt end, away from the card
        const h = i * 4.2, lean = P.lean;
        ax = end[0] - dx * 16 + (-ny * h) * 0 + nx * 0 + Math.sin(lean) * h; ay = end[1] - dy * 16 - h - (1 - it.t) * 14;
        rot = lean * 0.6 + Math.sin(t * 1.7 + it.ph) * 0.04 * (i / k) + (it.u - 0.5) * 0.15;
      } else if (mode === 'drift') { // a drift: scattered behind the belt end, jiggling
        const back = 10 + it.u * (10 + k * 2.2), side = (it.w - 0.5) * (14 + k * 2.5);
        ax = end[0] - dx * back + nx * side + Math.sin(t * 2.3 + it.ph) * 0.9; ay = end[1] - dy * back + ny * side + Math.cos(t * 2.9 + it.ph) * 0.9 - (1 - it.t) * 10;
        rot = (it.z - 0.5) * 1.6 + Math.sin(t * 1.3 + it.ph) * 0.08;
      } else { // a heap: a pyramid on the belt end, top sprites tumble in
        const row = Math.floor((Math.sqrt(8 * i + 1) - 1) / 2), col = i - (row * (row + 1)) / 2, width = row + 1;
        const lay = 4 - row; // bottom rows are wider
        const along = 12 + (col - row / 2) * 9 * (1 + 0.1 * lay) + (it.u - 0.5) * 4;
        ax = end[0] - dx * along + nx * (it.w - 0.5) * 6; ay = end[1] - dy * along - (3 - Math.min(3, lay)) * 0 - row * 6 - (1 - it.t) * (16 + row * 4);
        rot = (it.z - 0.5) * 0.9 + (1 - it.t) * (it.u - 0.5) * 3;
        s = 1 - row * 0.03 + 0 * width;
      }
      const sz = SPR * s;
      c.save(); c.translate(ax, ay); c.rotate(rot); c.globalAlpha = Math.min(1, 0.3 + it.t);
      c.drawImage(sheet, kd * px, 0, px, px, -sz / 2, -sz / 2, sz, sz); c.restore();
      sprites++;
    }
    for (let i = k; i < PILE_MAX; i++) P.items[i].t = 0;
    c.globalAlpha = 1;
  }
  // The document in work fills from the bottom and is stamped good or bad as it ends; it never restarts within a job.
  function drawWork(c, n, tr) {
    const sv = n.server, w = n.v && n.v.work;
    if (sv.n !== n || !(sv.busy || sv.blocked) || !w) return;
    const J = sv.J, ai = M.dc[n.idx]?.ai;
    const doc = { q: J.fl & (COMPL | FROM_SRC) ? Q.GOOD : J.q, ai: ai ? 1 : 0, mark: sv.bounce || J.fl & (COMPL | REDO) ? 'warn' : '' }, s = 1.05 * w.s;
    if (sv.blocked) { drawDoc(c, w.x, w.y, s, doc); label(c, 'blocked', w.x, w.y + 26, C.destr, 'center', 11); return; }
    const p = progressOf(sv, tr), realSecs = (sv.end - sv.start) / Math.max(1e-6, S.speed * SPEED_1X);
    // faster than a quarter second a job, the station shows a steady document in work: no blinking
    if (S.speed > 0 && realSecs < 0.25) { drawDoc(c, w.x, w.y, s, doc, 0.6); return; }
    drawDoc(c, w.x, w.y, s, doc, p);
    if (p > 0.78) {
      const good = sv.preQ === Q.GOOD && !sv.bounce, a = Math.min(1, (p - 0.78) / 0.08), k = w.s / 1.4;
      c.save(); c.globalAlpha = a; c.translate(w.x - 8 * k, w.y + 5 * k); c.scale(k, k); c.rotate(-0.25); c.strokeStyle = good ? C.good2 : C.destr; c.lineWidth = 1.7; c.beginPath(); c.arc(0, 0, 6.5, 0, Math.PI * 2); c.stroke();
      c.beginPath(); if (good) { c.moveTo(-3.2, 0); c.lineTo(-0.8, 2.6); c.lineTo(3.4, -2.6); } else { c.moveTo(-2.8, -2.8); c.lineTo(2.8, 2.8); c.moveTo(2.8, -2.8); c.lineTo(-2.8, 2.8); } c.stroke(); c.restore();
    }
  }

  function draw(tr = M.t) {
    if (S.view !== 'factory' || !measure()) return;
    const c = ctx, px = ensureSheet(), now = performance.now(), dt = lastReal ? Math.min(0.1, (now - lastReal) / 1000) : 0.016;
    lastReal = now; NOW = now;
    const ease = 1 - Math.exp(-dt / 0.07);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, canvas.width, canvas.height);
    c.setTransform(DPR * K, 0, 0, DPR * K, DPR * OX, DPR * OY);
    drawn = 0; sprites = 0;
    landAll();
    for (const e of M.edges) { drawBelt(c, e, e.fwd, tr, false, px); if (e.back.n) drawBelt(c, e, e.back, tr, true, px); }
    for (const l of LANDS) { LAND1[0] = l; drawBelt(c, l.e, LAND1, tr, l.back, px); }
    for (const n of M.centers) { settle(n, M.warming ? 1 : ease); drawPile(c, n, px, dt); drawRack(c, n, px); drawWork(c, n, tr); }
    if (M.warming) { c.setTransform(DPR, 0, 0, DPR, 0, 0); label(c, `Warming up · day ${Math.floor(M.t * DAYS)} of ${WARM_WEEKS * DAYS}`, 16, 22, C.dull, 'left', 12); }
    for (const [k, o] of Object.entries(OVERLAYS)) if (S.overlays[k] && o.draw) o.draw(c);
  }
  const LAND1 = [null];
