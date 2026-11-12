  // ---------- Page: views, popover, compare, toolbar, options ----------
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const BUNDLES = new Map(BUILTIN.map((id) => [id, builtinBundle(id)]));
  const wrap = $('#view-wrap'), pop = $('#popover'), cmp = $('#compare');
  let popDash = null, cmpCols = [], cmpGaps = [];

  // ---- cards on the floor (same elements in every view, so they can morph) ----
  let tileEls = [];
  // Panels that are not work centers here: Documentation and Billing (Swing and Roles), and the closing panel (Swing).
  const extraPanels = () => (UC().panels ? PANELS.filter((p) => p.target || !p.node || !M.nodes.has(p.node)).filter((p) => p !== PANELS[0]) : []);
  function buildCards() {
    floor.innerHTML = ''; cardEls = new Map(); tileEls = [];
    for (const id of M.order) {
      const n = M.nodes.get(id);
      const el = h(`<div class="wcc" data-id="${id}" data-kind="${n.kind}"></div>`);
      el.tabIndex = 0; el.setAttribute('role', 'button');
      el.addEventListener('click', (ev) => cardClick(id, ev));
      el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); cardClick(id, ev); } });
      floor.append(el); cardEls.set(id, el);
    }
    for (const p of extraPanels()) { const el = h('<div class="wcc wcc--tile" aria-hidden="true"></div>'); el.panel = p; floor.append(el); tileEls.push(el); }
  }
  // Q105: Swing and Roles keep every card at its factory place: the Customer in the first column, the work centers in the
  // grid of their columns and rows; leftover cartoon panels fill the empty cells. Switching views moves little; panels fade.
  function gridOf() {
    const xs = [...new Set(M.centers.map((n) => n.def.x))].sort((a, b) => a - b), ys = [...new Set(M.centers.map((n) => n.def.y))].sort((a, b) => a - b);
    const near = (list, v) => list.reduce((bi, x, i) => (Math.abs(x - v) < Math.abs(list[bi] - v) ? i : bi), 0);
    const at = new Map([['customer', [1, near(ys, M.cust.def.y) + 1]]]);
    for (const n of M.centers) at.set(n.id, [xs.indexOf(n.def.x) + 2, ys.indexOf(n.def.y) + 1]);
    return { cols: xs.length + 1, rows: ys.length, at };
  }
  const placeGrid = (el, c) => { const gc = c ? String(c[0]) : '', gr = c ? String(c[1]) : ''; if (el.style.gridColumn !== gc) el.style.gridColumn = gc; if (el.style.gridRow !== gr) el.style.gridRow = gr; };
  function renderCardContent(el, n, v) {
    const cv = v === 'factory' ? 'station' : v === 'swing' ? 'swing' : 'role';
    el.className = `wcc wcc--${cv}`;
    el.setAttribute('aria-label', `${n.title}: open its ${n.kind === 'customer' ? 'settings' : 'dashboard'}`);
    el.innerHTML = cv === 'station' ? cardStation(n) : cv === 'swing' ? cardSwing(n) : cardRole(n);
    el.style.order = '';
    placeGrid(el, cv === 'station' ? null : gridOf().at.get(n.id));
    // a work center with no panel in the cartoon (quality assurance) sits out the Swing view; its cell stays empty
    el.hidden = cv === 'swing' && PANELS.indexOf(panelFor(n)) < 0;
  }
  function renderTiles(v) {
    const g = gridOf(), used = new Set([...g.at.values()].map((c) => c.join(','))), free = [];
    for (let r = 1; r <= g.rows; r++) for (let c = 2; c <= g.cols; c++) if (!used.has(`${c},${r}`)) free.push([c, r]);
    const custRow = g.at.get('customer')[1];
    for (let r = 1; r <= g.rows; r++) if (r !== custRow) free.push([1, r]);
    const take = (want) => { const i = want ? free.findIndex((c) => c.join(',') === want.join(',')) : -1; return free.splice(i >= 0 ? i : 0, 1)[0]; };
    for (const el of tileEls) {
      const p = el.panel, show = v === 'swing' || (v === 'roles' && !p.target);
      el.hidden = !show;
      if (!show) { el.innerHTML = ''; continue; }
      el.className = `wcc wcc--tile wcc--${v === 'swing' ? 'swing' : 'role'}`;
      el.innerHTML = cardTile(p, v);
      el.style.order = '';
      // what the customer really needed sits under the Customer; Documentation and Billing take the empty cells in the grid
      placeGrid(el, take(p.target ? [1, Math.min(g.rows, custRow + 1)] : null));
    }
  }
  const rects = () => new Map([...cardEls].map(([id, el]) => [id, el.getBoundingClientRect()]));
  function setView(v, animate = true, first = rects()) {
    if (v === 'swing' && !UC().panels) v = 'roles';
    S.view = v; view.dataset.view = v;
    closePopover(false);
    for (const [id, el] of cardEls) renderCardContent(el, M.nodes.get(id), v);
    renderTiles(v);
    if (v !== 'factory') { floor.style.transform = ''; floor.style.setProperty('--cols', String(gridOf().cols)); }
    floor.style.width = v === 'factory' ? `${UC().layout.width}px` : '';
    floor.style.height = v === 'factory' ? `${UC().layout.height}px` : '';
    wrap.dataset.view = v;
    placeCards(); measure(); syncAll();
    if (animate && !reduce.matches && first.size) {
      const k = v === 'factory' ? K : 1;
      view.classList.add('is-morphing');
      for (const [id, el] of cardEls) {
        const a = first.get(id), b = el.getBoundingClientRect();
        if (!a || !a.width || !b.width) continue;
        el.animate([{ transform: `translate(${(a.left - b.left) / k}px, ${(a.top - b.top) / k}px) scale(${a.width / b.width}, ${a.height / b.height})` }, { transform: 'none' }], { duration: 560, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
      setTimeout(() => view.classList.remove('is-morphing'), 560);
    }
    draw(); start();
  }

  function cardClick(id, ev) {
    if (S.view !== 'factory') { setView('factory'); return; }
    if ((S.compare.picking || ev.shiftKey) && M.nodes.get(id).kind === 'role') { pick(id); return; }
    if (S.compare.picking && M.nodes.get(id).kind !== 'role') return;
    if (S.popover === id) closePopover(); else openPopover(id);
  }

  // ---- dashboard popover: a speech bubble left of the work center, else above, else below ----
  function openPopover(id) {
    const n = M.nodes.get(id);
    S.popover = id;
    if (n.kind === 'customer') {
      pop.innerHTML = `<div class="dash dash--cust">${cardCustomer(n)}</div>`;
      popDash = { el: pop, n, cust: true };
      wireCustomer(pop, n, (full) => changed(full), () => closePopover());
    } else {
      pop.innerHTML = `<div class="dash">${cardDashboard(n, { closable: true })}</div>`;
      popDash = { el: pop, n };
      wireDashboard(pop, n, (full) => changed(full), () => closePopover());
    }
    pop.setAttribute('aria-labelledby', $('h3', pop).id);
    pop.hidden = false;
    placePopover();
    if (!popDash.cust) syncDashboard(pop, n); syncCards();
    pop.tabIndex = -1; pop.focus({ preventScroll: true }); // focus the dialog, not its close button, so no tooltip covers it
  }
  function placePopover() {
    if (!S.popover) return;
    const el = cardEls.get(S.popover), wr = wrap.getBoundingClientRect(), cr = el.getBoundingClientRect();
    const pw = Math.min(540, wr.width - 24); pop.style.width = `${pw}px`;
    const ph = pop.offsetHeight, cx = cr.left - wr.left, cy = cr.top - wr.top;
    let side, x, y;
    if (cx - pw - 16 < 8 && cx + cr.width + 16 + pw <= wr.width - 8) { side = 'right'; x = cx + cr.width + 16; y = Math.max(8, Math.min(wr.height - ph - 8, cy + cr.height / 2 - ph / 2)); }
    else if (cx - pw - 16 >= 8) { side = 'left'; x = cx - pw - 16; y = Math.max(8, Math.min(wr.height - ph - 8, cy + cr.height / 2 - ph / 2)); }
    else if (cy - ph - 16 >= 8) { side = 'above'; y = cy - ph - 16; x = Math.max(8, Math.min(wr.width - pw - 8, cx + cr.width / 2 - pw / 2)); }
    else { side = 'below'; y = cy + cr.height + 16; x = Math.max(8, Math.min(wr.width - pw - 8, cx + cr.width / 2 - pw / 2)); }
    pop.dataset.side = side;
    pop.style.left = `${x}px`; pop.style.top = `${y}px`;
    pop.style.setProperty('--tail', side === 'left' || side === 'right' ? `${Math.max(16, Math.min(ph - 16, cy + cr.height / 2 - y))}px` : `${Math.max(16, Math.min(pw - 16, cx + cr.width / 2 - x))}px`);
  }
  function closePopover(focus = true) {
    if (!S.popover) return;
    const id = S.popover;
    S.popover = null; popDash = null; pop.hidden = true; pop.innerHTML = '';
    syncCards();
    if (focus) cardEls.get(id)?.focus({ preventScroll: true });
  }

  // ---- compare: pick up to three, then flatten into a stream ----
  function pick(id) {
    const c = S.compare;
    if (!c.picking) { c.picking = true; closePopover(false); }
    if (c.ids.includes(id)) { c.ids = c.ids.filter((x) => x !== id); c.note = ''; }
    else if (c.ids.length >= 3) c.note = 'Three at most: remove one by clicking its slot.';
    else { c.ids.push(id); c.note = ''; }
    renderCompareWidget(); syncCards();
  }
  function renderCompareWidget() {
    const c = S.compare, w = $('#compare-w');
    const slots = [0, 1, 2].map((i) => {
      const id = c.ids[i], n = id && M.nodes.get(id);
      return n ? `<button type="button" class="slot" data-slot="${id}" data-tip="Remove ${esc(n.title)}" aria-label="Remove ${esc(n.title)} from compare">${glyph(iconOf(n))}</button>`
        : `<span class="slot slot--empty" aria-hidden="true"></span>`;
    }).join('');
    w.innerHTML = `<button type="button" class="tbtn" id="cmp-toggle" aria-pressed="${c.picking || c.open}" data-tip="Compare: pick up to three work centers (or shift-click them)">${icon('compare')}<span class="tbtn__l">Compare</span></button>
      ${c.picking || c.open ? `<span class="slots" role="group" aria-label="Picked work centers">${slots}</span>
      ${c.open ? `<button type="button" class="tbtn tbtn--solid" id="cmp-exit">Exit</button>` : `<button type="button" class="tbtn tbtn--solid" id="cmp-go" ${c.ids.length ? '' : 'disabled'}>Show</button>`}` : ''}
      <span class="cmp-note" aria-live="polite">${esc(c.note)}</span>`;
    $('#cmp-toggle').addEventListener('click', () => { if (c.open) exitCompare(); else { c.picking = !c.picking; c.note = c.picking ? 'Click work centers on the line.' : ''; if (!c.picking) c.ids = []; renderCompareWidget(); syncCards(); } });
    for (const b of $$('[data-slot]', w)) b.addEventListener('click', () => { c.ids = c.ids.filter((x) => x !== b.dataset.slot); c.note = ''; if (c.open) { if (c.ids.length) renderCompare(); else exitCompare(); } renderCompareWidget(); syncCards(); });
    $('#cmp-go')?.addEventListener('click', openCompare);
    $('#cmp-exit')?.addEventListener('click', exitCompare);
  }
  function openCompare() { S.compare.open = true; S.compare.picking = false; S.compare.note = ''; closePopover(false); renderCompare(); renderCompareWidget(); }
  function exitCompare() { Object.assign(S.compare, { open: false, picking: false, ids: [], note: '' }); cmp.hidden = true; view.hidden = false; cmpCols = []; cmpGaps = []; renderCompareWidget(); setView('factory', false); }
  function renderCompare() {
    const c = S.compare, ids = M.order.filter((id) => c.ids.includes(id) && M.nodes.get(id)?.kind === 'role'), uc = UC();
    view.hidden = true; cmp.hidden = false;
    // overview strip: the whole line, small, with the picked centers marked
    const strip = `<svg viewBox="0 ${uc.layout.top ?? 0} ${uc.layout.width} ${uc.layout.height}" class="strip" role="img" aria-label="Overview of the whole line; compared work centers are marked">
      ${M.edges.map((e) => `<path d="${e.path.d}" class="strip__belt" />`).join('')}
      ${[...M.nodes.values()].map((n) => { const [x, y, w, hh] = geom(n); const on = ids.includes(n.id); return `<g class="strip__n ${on ? 'is-on' : ''}" data-strip="${n.id}"><rect x="${x}" y="${y + 18}" width="${w}" height="${hh - 18}" rx="8" />${on ? `<text x="${x + w / 2}" y="${y + 6}" text-anchor="middle">${esc(n.title)}</text>` : ''}</g>`; }).join('')}</svg>`;
    let cols = '', prev = M.order.indexOf('customer'), prevId = null;
    ids.forEach((id, i) => {
      const at = M.order.indexOf(id), skipped = M.order.slice(prev + 1, at).filter((x) => M.nodes.get(x).kind === 'role').length;
      const e = prevId && M.edges.find((f) => f.from.id === prevId && f.to.id === id);
      // neighbours: the belt between them carries the live flow; otherwise the gap counts the stations in between
      cols += e ? `<div class="gap gap--belt" data-gap="${e.i}"><span class="gap__rate" data-r="rate"></span><div class="gbelt" data-r="belt"></div><span class="gap__l">${esc(e.label)}</span></div>`
        : `<div class="gap" aria-label="${skipped} work centers between">${skipped ? `<span>+${skipped} station${skipped > 1 ? 's' : ''}</span>` : ''}${icon('play', 'ico gap__arrow')}</div>`;
      const n = M.nodes.get(id);
      cols += `<div class="ccol" data-col="${id}"><div class="cs">${compareStation(n)}</div><div class="dash">${cardDashboard(n)}</div></div>`;
      prev = at; prevId = id;
    });
    cmp.innerHTML = `<div class="cmp-top"><p class="cmp-h">Compare · ${ids.length} work center${ids.length > 1 ? 's' : ''} in flow order</p><button type="button" class="tbtn tbtn--solid" id="cmp-exit2">Exit compare</button></div>
      ${strip}<div class="cmp-cols" style="--n:${ids.length}">${cols}</div>`;
    $('#cmp-exit2').addEventListener('click', exitCompare);
    cmpCols = ids.map((id) => { const el = $(`[data-col="${id}"]`, cmp), n = M.nodes.get(id); wireDashboard($('.dash', el), n, (full) => changed(full), () => {}); return { el, n, sig: '', vis: null, p: '', url: '' }; });
    cmpGaps = $$('[data-gap]', cmp).map((g) => ({ g, e: M.edges[Number(g.dataset.gap)], belt: $('[data-r="belt"]', g) }));
    syncCompare(true);
  }
  function compareStation(n) {
    return `<div class="cs__head">${glyph(iconOf(n), 'gly gly--md')}<span class="wcc__title">${esc(n.title)}</span>
      <span class="wcc__signs cs__signs">${Object.entries(SIGNS).map(([k, [ic, t]]) => `<span class="sign" data-sign="${k}" data-tip="${esc(t)}" aria-label="${esc(t)}">${icon(ic)}</span>`).join('')}</span></div>
      <div class="cs__line"><div class="cs__queue" data-r="queue"></div><div class="cs__box"><span class="ring" data-r="ring"><i class="dchip" data-r="work"></i></span></div></div>
      <p class="cs__note" data-r="note"></p>`;
  }
  const chipURL = (d) => docIconURL({ q: d.q, ai: d.ai, mark: d.mark || '' });
  const chip = (d) => `<i class="dchip" style="background-image:url(${chipURL(d)})"></i>`;
  function queueDocs(n, max) {
    const out = [];
    for (let i = 0; i < n.runs.n && out.length < max; i++) { const r = n.runs.at(i); for (let j = 0; j < r.c && out.length < max; j++) out.push({ q: r.fl & COMPL ? Q.BAD : r.q, ai: r.ai, mark: r.fl & (REDO | COMPL) ? 'warn' : '' }); }
    return out;
  }
  function syncCompare(force = false, charts = true) {
    for (const col of cmpCols) {
      const { el, n } = col, q = queueDocs(n, 10);
      const sig = q.map((d) => `${d.q}${d.ai}${d.mark}`).join('') + '|' + n.L;
      if (force || sig !== col.sig) {
        col.sig = sig;
        $('[data-r="queue"]', el).innerHTML = q.map(chip).join('') + (n.L > 10 ? `<b>+${n.L - 10}</b>` : '');
      }
      syncDashboard($('.dash', el), n, charts);
      setText($('[data-r="note"]', el), `${n.L} waiting · ${n.Ws.toFixed(1)} weeks of work · busy ${Math.round(n.u.busy * 100)} % · ${num(n.rate.done)} done a week`);
      for (const s of $$('[data-sign]', el)) toggle(s, 'is-on', signOn(n, s.dataset.sign));
    }
    for (const { g, e } of cmpGaps) setText($('[data-r="rate"]', g), `${Math.round(e.rate)} a week`);
    for (const g of $$('[data-strip]', cmp)) { const n = M.nodes.get(g.dataset.strip); toggle(g, 'is-hot', n.kind === 'role' && n.lvl === 2); }
  }
  function frameCompare(tr) {
    for (const col of cmpCols) {
      const { el, n } = col, sv = n.server, mine = sv.n === n && (sv.busy || sv.blocked), w = $('[data-r="work"]', el), ring = $('[data-r="ring"]', el);
      if (col.vis !== mine) { col.vis = mine; ring.style.visibility = mine ? 'visible' : 'hidden'; }
      if (mine) {
        const fast = (sv.end - sv.start) / Math.max(1e-6, S.speed * SPEED_1X) < 0.25;
        const p = fast ? '0.6' : progressOf(sv, tr).toFixed(2);
        if (col.p !== p) { col.p = p; ring.style.setProperty('--p', p); }
        toggle(ring, 'is-ai', !!dials(n).ai);
        const url = `url(${chipURL({ q: sv.J.fl & COMPL ? Q.GOOD : sv.J.q, ai: dials(n).ai ? 1 : 0, mark: sv.bounce ? 'warn' : '' })})`; if (col.url !== url) { col.url = url; w.style.backgroundImage = url; }
      }
    }
    // the live flow on the belt between neighbouring columns: one chip per token (merged counts), at most 24
    for (const gp of cmpGaps) {
      const e = gp.e, kids = gp.belt.children, list = [];
      for (let i = e.fwd.n - 1; i >= 0 && list.length < 24; i--) list.push(e.fwd.at(i));
      while (kids.length < list.length) gp.belt.append(document.createElement('i'));
      while (kids.length > list.length) kids[kids.length - 1].remove();
      list.forEach((x, i) => {
        const k = kids[i], f = Math.max(0, Math.min(1, (tr - x.t0) / (x.t1 - x.t0)));
        if (k.className !== 'dchip') k.className = 'dchip';
        k.style.left = `${(f * 100).toFixed(1)}%`;
        const url = `url(${chipURL({ q: x.q, ai: x.ai, mark: x.fl & COMPL ? 'warn' : '' })})`; if (k._u !== url) { k._u = url; k.style.backgroundImage = url; }
      });
    }
  }

  // ---- toolbar ----
  // Q107: Swing, Roles, Ideal and Realistic on the toolbar; every other state under Scenarios ▾; a Tour button for the current one
  const MAIN_STATES = ['swing', 'roles', 'ideal', 'realistic'];
  const scenariosOf = () => UC().presets.filter((p) => !MAIN_STATES.includes(p.id));
  function renderStates() {
    const uc = UC(), sc = scenariosOf();
    $('#states').innerHTML = uc.presets.filter((p) => MAIN_STATES.includes(p.id)).map((p) => `<button type="button" class="state" data-preset="${esc(p.id)}" aria-pressed="${S.preset === p.id}">${esc(W.preset(S.bundle, p.id))}</button>`).join('')
      + (sc.length ? `<span class="menu-anchor"><button type="button" class="state state--menu" id="scn-btn" aria-expanded="false" aria-controls="scn" aria-pressed="false">Scenarios <span aria-hidden="true">▾</span></button>
        <div class="menu scn" id="scn" hidden role="menu" aria-label="Scenarios">${sc.map((p) => `<button type="button" class="scn__i" role="menuitemradio" data-preset="${esc(p.id)}" aria-checked="${S.preset === p.id}"><b>${esc(W.preset(S.bundle, p.id))}</b><span class="muted">${esc(W.scenario(S.bundle, p.id).watch || '')}</span>${p.tour ? `<span class="scn__tour">${p.tour.length}-step tour</span>` : ''}</button>`).join('')}</div></span>` : '')
      + `<button type="button" class="state state--tour" id="tour-btn" data-tip="A guided tour of this scenario: set the dials, run to a week, pause, read what to look at">${icon('play')}<span>Tour</span></button>`;
    for (const b of $$('[data-preset]', $('#states'))) b.addEventListener('click', () => { $('#scn') && ($('#scn').hidden = true); applyPreset(b.dataset.preset); });
    const sb = $('#scn-btn');
    if (sb) sb.addEventListener('click', () => { const m = $('#scn'), open = m.hidden; for (const x of $$('.menu')) x.hidden = true; m.hidden = !open; sb.setAttribute('aria-expanded', String(open)); });
    $('#tour-btn').addEventListener('click', () => startTour(S.preset));
  }
  const MECH_TIPS = {
    rework: ['Rework', 'rework', 'Rework: a work center sends bad input back on its return belt, to the front of the sender’s backlog, and it is done again. Sign at the station: the arrow.'],
    churn: ['Churn', 'churn', 'Churn: bad input that is kept multiplies; the center hands on more documents than usual, and the work takes longer. Sign at the station: the fan.'],
    complaints: ['Complaints', 'complaints', 'Customer complaints: a bad release may bring a complaint, a bug or support request marked with the red warning: work that adds no value. The Customer’s grid marks it; its chance is on the Customer card.'],
  };
  const SPEED_TIP = { 1: '1×: a working day takes about 3 seconds', 2: '2×: a working day takes about 1.6 seconds', 5: '5×: a working day takes about 0.6 seconds', 10: '10×: a working day takes about 0.3 seconds' };
  function renderToolbar() {
    $('#mechs').innerHTML = MECHS.map((k) => `<button type="button" class="tbtn tbtn--mech" data-mech="${k}" aria-pressed="${S.mech[k]}" data-tip="${esc(MECH_TIPS[k][2])}">${icon(MECH_TIPS[k][1])}<span class="tbtn__l">${MECH_TIPS[k][0]}</span></button>`).join('');
    for (const b of $$('[data-mech]')) b.addEventListener('click', () => { S.mech[b.dataset.mech] = !S.mech[b.dataset.mech]; syncControls(); changed(false); });
    $('#speed').innerHTML = SPEEDS.map((v) => `<button type="button" class="tbtn tbtn--speed" data-speed="${v}" aria-pressed="${S.speed === v}" aria-label="${v ? `Speed ${v}×` : 'Pause'}" data-tip="${v ? SPEED_TIP[v] : 'Pause'}">${v ? `${v}×` : icon('pause')}</button>`).join('')
      + `<button type="button" class="tbtn" id="clear" data-tip="Clear: an empty factory at day 0 with the current settings, to watch it fill">${icon('clear')}<span class="tbtn__l">Clear</span></button>`
      + `<span class="clock" id="clock" aria-live="off" data-tip="Simulated time in working days; every handoff takes a quarter day">Day 1</span>`;
    for (const b of $$('[data-speed]')) b.addEventListener('click', () => { S.speed = Number(b.dataset.speed); syncControls(); start(); });
    $('#clear').addEventListener('click', clearFactory);
    renderCompareWidget();
  }
  const TIPS = {
    reality: 'From Ideal to Realistic: lowers every work center’s efficiency and effectiveness toward its realistic values. More bad documents go out, get sent back or multiply; the bottleneck runs near 90 % busy.',
    ai: 'Where AI works: those centers run faster (2.5× unless a dashboard says otherwise) and may write extra tasks; AI-made documents take the next center a little longer to read. Set the speed-up and extra tasks per work center on its dashboard.',
    company: 'Service provider: only the Customer asks for work. Product company: the product manager also writes roadmap items, Sales brings leads and the engineer writes tech debt tickets. They share the same backlogs; every center is sized again so Ideal stays 70 % busy.',
    aiq: 'What AI does to the chance a document leaves good: Worse lowers it by 15 points, Better raises it by 15. Same leaves it.',
    rework: 'Chance a work center sends a bad document back on the return belt. It goes to the front of the sender’s backlog and costs time twice.',
    churn: 'When bad input is kept, the center hands on this many times its usual documents: it guesses, and writes more.',
    reset: 'Undo every change made since you picked the state.',
  };
  function renderModel() {
    const uc = UC(), aiSets = [], seen = new Set();
    for (const p of uc.presets) if (Array.isArray(p.ai) && !seen.has(p.ai.join())) { seen.add(p.ai.join()); aiSets.push({ id: `ai:${p.ai.join(',')}`, ai: p.ai, label: p.ai.map((x) => M.nodes.get(x)?.title || x).join(', ') }); }
    aiSets.push({ id: 'ai:all', ai: 'all', label: 'Everywhere' });
    const tip = (k, text, forId) => `<label ${forId ? `for="${forId}"` : `id="m-${k}-l"`} class="tip-l" data-tip="${esc(TIPS[k])}">${text}</label>`;
    $('#model').innerHTML = `
      <div class="mrow">${tip('reality', 'Model', 'm-reality')}<span class="muted">Ideal</span><input type="range" class="range" id="m-reality" min="0" max="100" step="5" /><span class="muted">Realistic</span></div>
      <div class="mrow">${tip('ai', 'AI')}<div class="seg seg--ai" role="group" aria-labelledby="m-ai-l">
        <button type="button" data-ai="off">Off</button>${aiSets.map((p) => `<button type="button" data-ai="${esc(p.id)}">${esc(p.label)}</button>`).join('')}</div></div>
      ${(uc.sources || []).length ? `<div class="mrow">${tip('company', 'Company')}<div class="seg" role="group" aria-labelledby="m-company-l"><button type="button" data-company="service">Service provider</button><button type="button" data-company="product">Product company</button></div></div>` : ''}
      <div class="mrow">${tip('aiq', 'AI quality effect')}<div class="seg" role="group" aria-labelledby="m-aiq-l">
        ${['worse', 'same', 'better'].map((v) => `<button type="button" data-aiq="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div></div>
      <fieldset class="mfs"><legend>Strength of each mechanic</legend>${STRENGTHS.map((k) => `<div class="mrow mrow--s">${tip(k, MECH_TIPS[k][0], `m-s-${k}`)}<input type="range" class="range" id="m-s-${k}" data-strength="${k}" min="${MECH_RANGE[k][0]}" max="${MECH_RANGE[k][1]}" step="0.1" /><b data-strength-v="${k}"></b></div>`).join('')}</fieldset>
      <p class="text-caption muted">The Customer’s rate, request mix and follow-up chances sit on its card: click the Customer on the left.</p>
      <div class="mrow mrow--btns"><button type="button" class="ghost-btn" id="m-reset" data-tip="${esc(TIPS.reset)}">Back to the state</button></div>`;
    $('#m-reality').addEventListener('input', (e) => { S.reality = Number(e.target.value); for (const o of Object.values(S.over)) { delete o.eff; delete o.effv; } changed(); });
    for (const b of $$('[data-ai]', $('#model'))) b.addEventListener('click', () => { const p = aiSets.find((x) => x.id === b.dataset.ai); S.ai = p ? (Array.isArray(p.ai) ? [...p.ai] : p.ai) : 'off'; for (const o of Object.values(S.over)) delete o.ai; changed(); });
    // the company: switching resizes the line (Ideal stays 70 % busy with the own tickets), so the factory settles again
    for (const b of $$('[data-company]', $('#model'))) b.addEventListener('click', () => { if (S.company === b.dataset.company) return; S.company = b.dataset.company; endTour(); rebuild(S.view); });
    for (const b of $$('[data-aiq]')) b.addEventListener('click', () => { S.aiq = b.dataset.aiq; changed(); });
    for (const r of $$('[data-strength]')) r.addEventListener('input', () => { S.strength[r.dataset.strength] = Number(r.value); changed(false); });
    $('#m-reset').addEventListener('click', () => applyPreset(S.preset));
  }
  // every control writes only what changed: no attribute churn per frame
  function syncControls() {
    const m = $('#model'), uc = UC();
    const rr = $('#m-reality', m); if (document.activeElement !== rr && rr.value !== String(S.reality)) rr.value = S.reality;
    setAttr(rr, 'aria-valuetext', S.reality ? `Realistic ${S.reality} %` : 'Ideal');
    const same = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x) => b.includes(x));
    const aiKey = S.ai === 'off' ? 'off' : S.ai === 'all' ? 'ai:all' : Array.isArray(S.ai) ? `ai:${(uc.presets.find((p) => Array.isArray(p.ai) && same(p.ai, S.ai)) || { ai: [] }).ai.join(',')}` : '';
    for (const b of $$('[data-ai]', m)) setAttr(b, 'aria-pressed', String(b.dataset.ai === aiKey));
    for (const b of $$('[data-aiq]', m)) setAttr(b, 'aria-pressed', String(b.dataset.aiq === S.aiq));
    for (const r of $$('[data-strength]', m)) { const v = String(S.strength[r.dataset.strength] ?? 0); if (document.activeElement !== r && r.value !== v) r.value = v; setText($(`[data-strength-v="${r.dataset.strength}"]`, m), Number(v).toFixed(1)); }
    for (const b of $$('[data-speed]')) setAttr(b, 'aria-pressed', String(Number(b.dataset.speed) === S.speed));
    for (const b of $$('[data-mech]')) setAttr(b, 'aria-pressed', String(S.mech[b.dataset.mech]));
    for (const b of $$('.state[data-preset]')) setAttr(b, 'aria-pressed', String(b.dataset.preset === S.preset));
    for (const b of $$('.scn__i')) setAttr(b, 'aria-checked', String(b.dataset.preset === S.preset));
    const scn = $('#scn-btn'); if (scn) setAttr(scn, 'aria-pressed', String(!MAIN_STATES.includes(S.preset)));
    const tb = $('#tour-btn'), tp = UC().presets.find((p) => p.id === S.preset);
    if (tb) { const has = !!(tp && tp.tour); if (tb.disabled === has) tb.disabled = !has; setAttr(tb, 'aria-pressed', String(!!S.tour)); }
    for (const b of $$('[data-company]', m)) setAttr(b, 'aria-pressed', String(b.dataset.company === S.company));
    for (const b of $$('[data-pile]')) setAttr(b, 'aria-pressed', String(b.dataset.pile === S.pile));
    toggle(view, 'is-paused', S.speed === 0);
    toggle(view, 'belts-move', S.beltMotion);
    setAttr($('#belt-motion'), 'aria-checked', String(S.beltMotion));
    const dur = `${(12 / (300 / HANDOFF) / Math.max(0.05, S.speed * SPEED_1X)).toFixed(3)}s`; // slats move at a typical belt's speed if (view.style.getPropertyValue('--belt-dur') !== dur) view.style.setProperty('--belt-dur', dur);
  }
  // a toolbar dropdown: Model and the ⋮ menu share open, close and Escape
  function wireMenu(btnSel, menuSel, onOpen) {
    const btn = $(btnSel), menu = $(menuSel);
    const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => { const open = menu.hidden; for (const m of $$('.menu')) if (m !== menu) { m.hidden = true; } for (const b of $$('[aria-controls]')) if (b !== btn) b.setAttribute('aria-expanded', 'false'); menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open && onOpen) onOpen(); });
    document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) close(); });
    return { close, btn, menu };
  }
  const menus = [];
  function wireModelMenu() {
    menus.push(wireMenu('#model-btn', '#model', syncControls), wireMenu('#more-btn', '#more'));
    // the Scenarios menu is rebuilt with the toolbar; one listener closes it on an outside click or Escape
    const scnClose = () => { const m = $('#scn'); if (m && !m.hidden) { m.hidden = true; $('#scn-btn')?.setAttribute('aria-expanded', 'false'); return true; } return false; };
    document.addEventListener('click', (e) => { const m = $('#scn'); if (m && !m.hidden && !m.contains(e.target) && !$('#scn-btn').contains(e.target)) scnClose(); });
    menus.push({ menu: { get hidden() { return !$('#scn') || $('#scn').hidden; } }, close: scnClose, btn: { focus: () => $('#scn-btn')?.focus() } });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const open = menus.find((m) => !m.menu.hidden);
      if (open) { open.close(); open.btn.focus(); return; }
      if (S.tour) { endTour(); return; }
      if (S.popover) closePopover();
      else if (S.compare.picking && !S.compare.open) { S.compare.picking = false; S.compare.ids = []; S.compare.note = ''; renderCompareWidget(); syncCards(); }
    });
    $('#belt-motion').addEventListener('click', () => { S.beltMotion = !S.beltMotion; syncControls(); });
  }

  // ---- prototype notes: what this round settled (no open Options in round 6) ----
  function renderOpts() {
    const box = $('#opts'); box.innerHTML = '';
    const ic = document.createElement('div'); ic.className = 'opt';
    ic.innerHTML = `<span class="opt__name">Document icon</span><p class="text-caption">Option A (Han’s design): ${[{ q: Q.GOOD }, { q: Q.BAD }, { q: Q.BAD, mark: 'warn' }, { q: Q.GOOD, ai: true }, { q: Q.BAD, ai: true }].map((d) => `<img class="docicon" src="${docIconURL(d)}" alt="" />`).join(' ')}</p>`;
    const st = document.createElement('div'); st.className = 'opt';
    st.innerHTML = `<span class="opt__name">Station (Q96, Q97)</span><p class="text-caption">Shorter, wider cards; the rack of six at full card height on the left; the document in work twice the size; “n waiting” bottom right (with the share of time on bugs once it is 5 % or more). Every handoff plays 0.6 s on screen at any speed; the model keeps the quarter day.</p>`;
    const pl = document.createElement('div'); pl.className = 'opt';
    pl.innerHTML = `<span class="opt__name">Pile-up (Q104), three Options in the ⋮ menu</span><p class="text-caption">Past the rack’s six, documents pile up at the end of the incoming belt, up to 12, growing with the weeks of work waiting. ${Object.entries(PILES).map(([k, p]) => `<b>${esc(p.name)}</b>: ${esc(p.note)}.`).join(' ')} Each station seeds its own shapes. Visual only: the model is unchanged.</p>`;
    const sp = document.createElement('div'); sp.className = 'opt';
    sp.innerHTML = `<span class="opt__name">Bug spiral (Q114)</span><p class="text-caption">Bug fixes jump the engineer’s queue, and a work center with more than a week of work waiting rushes: its effectiveness drops linearly, to 15 points lower at 3 weeks. With the engineer at 65 % effectiveness, output settles at about 70 % of Ideal and does not recover, while the lead time explodes. Realistic is sized with a margin (bottleneck 85 % busy, every other center 70 %), so ordinary bad luck does not tip it into rushing.</p>`;
    box.append(ic, st, pl, sp);
  }
  function renderMore() {
    $('#more-opts').innerHTML = `<p class="more-opts__h"><b>Pile-up past the rack</b> <span class="muted">Q104 Options</span></p><div class="seg" role="group" aria-label="Pile-up animation">${Object.entries(PILES).map(([k, p]) => `<button type="button" data-pile="${k}" aria-pressed="${S.pile === k}" data-tip="${esc(p.note)}">${esc(p.name)}</button>`).join('')}</div>`;
    for (const b of $$('[data-pile]')) b.addEventListener('click', () => { S.pile = b.dataset.pile; for (const x of $$('[data-pile]')) x.setAttribute('aria-pressed', String(x.dataset.pile === S.pile)); });
  }

  // ---- status, legend, dock panel ----
  const rel = (k) => (k > 0.9 && k < 1.1 ? 'About as much as in Ideal' : k < 0.6 ? `About ${k < 0.4 ? 'a third' : 'half'} of Ideal` : `${k.toFixed(1)}× Ideal`);
  const isIdeal = () => S.reality === 0 && S.ai === 'off' && custOf(M).rate === M.B.data.customer.rate && Object.values(S.over).every((o) => !Object.keys(o).length);
  function renderStatus() {
    const el = $('#status');
    const extra = Object.entries(OVERLAYS).filter(([k, o]) => S.overlays[k] && o.status).map(([, o]) => o.status()).join(' ');
    let html;
    if (M.warming) html = `Settling the line: ${WARM_WEEKS} simulated weeks, then it runs live.`;
    else if (isIdeal() && !extra && M.centers.every((n) => !n.lvl)) html = 'A simplified organization in Ideal: every handoff is good and nothing piles up. We all know reality is messier.';
    else {
      const hot = M.centers.filter((n) => n.lvl).sort((a, b) => b.Ws - a.Ws);
      const parts = [];
      if (hot.length) {
        const n = hot[0], dr = drain(n);
        parts.push(`<b>${n.lvl === 2 ? 'Bottleneck' : 'Busiest'}:</b> ${esc(n.title)}, ${n.Ws.toFixed(1)} weeks of work waiting`);
        parts.push(dr.grow > 0.05 ? `growing by about ${num(dr.grow)} jobs a week; raise its efficiency, or send less its way` : `clears in about ${dr.weeks < 1.5 ? 'a week' : `${Math.round(dr.weeks)} weeks`} at this pace; raising its efficiency clears it faster`);
        if (hot.length > 1) parts.push(`also ${hot.slice(1, 3).map((x) => esc(x.title)).join(', ')}`);
      } else parts.push('Busy but coping: no work center has a week of work waiting');
      const back = Math.round(M.centers.reduce((a, n) => a + n.rate.back, 0));
      if (back) parts.push(`<b>${back}</b> sent back a week`);
      if (M.dropped > 0.5) parts.push('<span class="muted">this device is behind: time runs slower than the speed says</span>');
      html = extra + parts.join(' · ');
    }
    if (el._h !== html) { el._h = html; el.innerHTML = html; }
    const calm = isIdeal() && !M.warming;
    toggle(el, 'status--calm', calm);
  }
  function renderLegend() {
    const el = $('#legend');
    const item = (d, text) => `<span class="legend__item"><img class="docicon" src="${docIconURL(d)}" alt="" />${text}</span>`;
    el.innerHTML = item({ q: Q.GOOD }, 'good') + item({ q: Q.BAD }, 'bad') + item({ q: Q.BAD, mark: 'warn' }, 'complaint or rework') + item({ q: Q.GOOD, ai: true }, 'AI-made')
      + '<span>past six waiting, the rack’s top slot turns red and work piles up at the belt end</span><span>×n: documents riding together</span><span>every handoff takes a quarter day</span>';
  }
  let dockSig = '';
  function renderDock() {
    const k = relOut(), sat = satisfaction(), rate = M.outRate, compl = Math.round(M.compl);
    const cells = Array.from({ length: 12 }, (_, i) => M.shelf[M.shelf.length - 1 - i]);
    const sig = `${rel(k)}|${Math.round(rate)}|${Math.round(sat * 100)}|${cells.map((s) => (s ? `${s.q}${s.compl ? 'c' : ''}` : '-')).join('')}|${compl}|${k.toFixed(1)}`;
    if (sig === dockSig) return; dockSig = sig;
    const verdict = k > 1.15 && sat < 0.75 ? 'More output, an unhappier customer' : sat < 0.6 ? 'The customer is unhappy' : k < 0.85 ? 'Fewer requests fulfilled than the customer asked for' : 'What the customer asked for';
    $('#dockp').innerHTML = `<p class="eyebrow text-caption">At the Customer · the last 12 releases</p>
      <div class="dockp__row">
        <div class="dockp__grid" role="img" aria-label="${cells.filter((s) => s && s.q === Q.GOOD).length} of the last 12 releases good, ${cells.filter((s) => s && s.compl).length} brought complaints">${cells.map((s) => `<i class="${s ? (s.q === Q.GOOD ? 'g' : 'b') : ''}${s && s.compl ? ' c' : ''}">${s && s.compl ? icon('complaint') : ''}</i>`).join('')}</div>
        <div class="dockp__out"><p class="dockp__k">${k.toFixed(1)}×</p><p class="dockp__l">Output relative to ideal</p><p class="text-caption dock__sub">${esc(rel(k))}: about ${Math.round(rate)} requests fulfilled a week</p></div>
      </div>
      <div class="dockp__sat"><p><span>Customer satisfaction</span><b>${Math.round(sat * 100)} %</b></p><div class="satbar"><i style="width:${Math.round(sat * 100)}%"></i></div><p class="text-caption">good releases minus complaints, out of the last 12</p></div>
      <p class="dock__cap">${esc(verdict)}</p>
      <p class="text-caption">Output counts fulfilled requests only: never the extra documents, rework or answers to complaints.${compl ? ` About ${compl} complaints a week come back: failure demand, not new value.` : ''}</p>`;
  }

  // ---- state changes ----
  function syncCards() { for (const [id, el] of cardEls) if (S.view === 'factory') syncStation(el, M.nodes.get(id)); }
  const fmtClock = (t) => `Day ${Math.floor(t * DAYS + 1e-9) + 1}`;
  // Q118: while a tour runs, the clock counts from the tour's start, so it reads the weeks its steps name
  const fmtTourClock = (k) => { const d = Math.floor(k * DTW * DAYS + 1e-9); return `Week ${Math.floor(d / DAYS)} · Day ${(d % DAYS) + 1}`; };
  const clockText = () => (M.warming ? 'Warming up' : S.tour && S.tour.t0k !== null ? fmtTourClock(Math.round(M.t / DTW) - S.tour.t0k) : fmtClock(M.t));
  // readouts at 4 Hz; charts at 2 Hz
  function syncAll(charts = true) {
    syncCards(); syncControls(); renderStatus(); renderDock(); syncReturns(); syncTour();
    setText($('#clock'), clockText());
    if (popDash) { if (popDash.cust) syncCustomer(popDash.el, popDash.n); else syncDashboard(popDash.el, popDash.n, charts); }
    if (S.compare.open) syncCompare(false, charts);
  }
  // A control changed: live in motion; under reduced motion, re-run from the seed so the still frame is the steady state.
  function changed(full = true) {
    if (reduce.matches) { M = build(S.bundle); warm(M, WARM_WEEKS); M.hook = visHook; }
    syncAll();
    if (full && S.view !== 'factory') for (const [id, el] of cardEls) renderCardContent(el, M.nodes.get(id), S.view);
    draw(); start();
  }
  function applyPreset(id, { keepTour = false } = {}) {
    const p = UC().presets.find((x) => x.id === id) || UC().presets[0];
    if (!keepTour) endTour();
    Object.assign(S, presetSettings(S.bundle, p));
    if (p.speed) S.speed = p.speed;
    setText($('#watch'), W.scenario(S.bundle, p.id).watch || '');
    S.compare = { picking: false, ids: (p.compare || []).slice(0, 3), open: !!(p.compare && p.compare.length), note: '' };
    rebuild(p.view || 'factory', true);
  }
  function loadBundle(id, withPreset = true) {
    S.bundle = BUNDLES.get(id);
    S.strength = { ...MECH_DEFAULTS(), ...(UC().mechanics || {}) };
    S.company = UC().company || 'service';
    $('#usecase').value = id;
    setText($('#usecase-sub'), W.sub(S.bundle));
    if (withPreset) { const keep = UC().presets.some((p) => p.id === S.preset) ? S.preset : (UC().presets.find((p) => p.view === 'factory') || UC().presets[0]).id; applyPreset(keep); }
  }
  // Rebuild the model from the file; presets settle 60 weeks in chunks across frames, behind "Warming up".
  function rebuild(v = S.view, animate = false, settle = true) {
    closePopover(false);
    const first = !view.hidden && animate ? rects() : new Map();
    M = build(S.bundle);
    M.dropped = 0; LANDS.length = 0;
    const pr = UC().presets.find((x) => x.id === S.preset);
    if (pr && pr.start === 'clear') settle = false; // a scenario that starts from day 0
    if (settle) { if (reduce.matches || document.hidden) warm(M, WARM_WEEKS); else { M.warming = true; M.warmLeft = Math.round(WARM_WEEKS / DTW); } }
    if (!M.warming) M.hook = visHook;
    renderFactory(); buildCards(); renderStates(); renderModel(); renderToolbar();
    view.hidden = false; cmp.hidden = true; cmpCols = []; cmpGaps = [];
    setView(v, animate && first.size > 0, first);
    if (S.compare.open && S.compare.ids.length) renderCompare();
    renderCompareWidget(); renderLegend(); syncAll();
  }
  // Clear: an empty factory at week 0 with the current settings, no warm-up
  function clearFactory() {
    const keep = { ...S.compare };
    M = build(S.bundle); M.dropped = 0; M.hook = visHook; LANDS.length = 0;
    renderFactory(); buildCards(); setView(S.view, false);
    if (keep.open && keep.ids.length) { S.compare = keep; renderCompare(); }
    syncAll(); draw(); start();
  }
  function renderUseCases() {
    const sel = $('#usecase');
    sel.innerHTML = [...BUNDLES].map(([id, b]) => `<option value="${esc(id)}">${esc(W.name(b))}${b.source !== 'built in' ? ' (from file)' : ''}</option>`).join('');
    if (S.bundle) sel.value = UC().id;
  }

  // ---- loop: real time drives the model (speed in weeks a second), 60 fps paint, paused off-screen ----
  let running = false, last = 0, acc = 0, slow = 0, ticks = 0, visible = true;
  function frame(now) {
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60; last = now;
    if (M.warming) {
      const n = Math.min(WARM_CHUNK, M.warmLeft);
      for (let i = 0; i < n; i++) step(M);
      M.warmLeft -= n;
      if (M.warmLeft <= 0) { M.warming = false; M.hook = visHook; acc = 0; syncAll(); if (S.tour && S.tour.phase === 'warm') tourGo(); }
    } else {
      acc += dt * S.speed * SPEED_1X;
      let n = 0;
      const stop = S.tour && S.tour.target != null ? S.tour.target : Infinity; // a tour step stops on the very step the checks use
      while (acc >= DTW && n < MAX_STEPS && Math.round(M.t / DTW) < stop) { step(M); acc -= DTW; n++; }
      if (Math.round(M.t / DTW) >= stop) { acc = 0; tourArrived(); }
      if (acc >= DTW) { M.dropped = Math.min(5, (M.dropped || 0) + 1); acc = 0; } else if (M.dropped) M.dropped *= 0.995; // late frames drop time instead of spiralling
    }
    const tr = M.t + (M.warming ? 0 : acc);
    draw(tr); if (S.compare.open) frameCompare(tr);
    slow += dt;
    if (slow > 0.25) { slow = 0; ticks++; syncAll(ticks % 2 === 0); }
    if (visible && !reduce.matches && !document.hidden && (S.view === 'factory' || S.compare.open || M.warming)) requestAnimationFrame(frame); else { running = false; last = 0; }
  }
  function start() {
    if (reduce.matches) { if (M.warming) { warm(M, M.warmLeft * DTW); M.warming = false; M.hook = visHook; } draw(); syncAll(); if (S.compare.open) frameCompare(M.t); return; }
    if (running || !visible) return;
    running = true; requestAnimationFrame(frame);
  }
