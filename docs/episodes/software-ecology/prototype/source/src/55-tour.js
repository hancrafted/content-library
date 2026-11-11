  // ---------- Guided tour (Q111): set the dials, run to a week, pause, a caption at a card; Next / Back ----------
  // The page runs the same model steps as the headless checks (35-scenario.js), so a step's expects read the same values here.
  const tourBox = $('#tourbox');
  const TOUR_SPEED = 10;
  const tourPreset = () => S.tour && UC().presets.find((p) => p.id === S.tour.id);
  function startTour(id) {
    const p = UC().presets.find((x) => x.id === id);
    if (!p || !p.tour) return;
    // the tour starts from the file's own settings, whatever was changed by hand
    S.mech = { rework: true, churn: true, complaints: true }; S.aiq = 'same';
    S.strength = { ...MECH_DEFAULTS(), ...(UC().mechanics || {}) }; S.company = UC().company || 'service';
    // Q118: a tour runs at 10x between steps; Close gives back the speed the user had
    const userSpeed = S.tour ? S.tour.userSpeed : S.speed;
    S.tour = { id, i: 0, target: null, t0k: null, phase: 'warm', speed: TOUR_SPEED, userSpeed, vals: [] };
    applyPreset(id, { keepTour: true });
    if (!M.warming) tourGo();
    renderTour();
  }
  function endTour() {
    if (!S.tour) return;
    S.speed = S.tour.userSpeed;
    S.tour = null; tourBox.hidden = true; tourBox.innerHTML = '';
  }
  // run the current step: its settings, then on to its week
  function tourGo() {
    const T = S.tour, p = tourPreset(); if (!T || !p) return;
    if (T.t0k === null) T.t0k = Math.round(M.t / DTW);
    const st = p.tour[T.i];
    applySet(st.set, M);
    T.target = T.t0k + stepsTo(st.run); T.phase = 'run';
    S.speed = T.speed;
    syncAll(); renderTour(); draw(); start();
  }
  const tourKeys = (p) => [...new Set(stepsOf(p).flatMap((st) => Object.keys(st.expect || {})))];
  // the step's week is reached: pause, judge its expects, show the caption
  function tourArrived() {
    const T = S.tour, p = tourPreset(); if (!T || T.phase !== 'run' || !p) return;
    T.target = null; T.phase = 'show'; S.speed = 0;
    T.vals[T.i] = Object.fromEntries(tourKeys(p).map((k) => [k, metric(M, k)]));
    syncAll(); renderTour();
  }
  // Back: replay from the start to the step before, at once (deterministic: the same seed and the same steps)
  function tourReplay(idx) {
    const T = S.tour, p = tourPreset(); if (!T || !p) return;
    Object.assign(S, presetSettings(S.bundle, p));
    M = build(S.bundle); M.dropped = 0; LANDS.length = 0;
    if (p.start !== 'clear') warm(M, WARM_WEEKS);
    T.t0k = Math.round(M.t / DTW); T.vals = [];
    let k = T.t0k;
    for (let j = 0; j <= idx; j++) {
      const st = p.tour[j];
      applySet(st.set, M);
      for (const kk = T.t0k + stepsTo(st.run); k < kk; k++) step(M);
      T.vals[j] = Object.fromEntries(tourKeys(p).map((key) => [key, metric(M, key)]));
    }
    M.hook = visHook;
    T.i = idx; T.phase = 'show'; T.target = null; S.speed = 0;
    renderFactory(); buildCards(); setView(S.view, false);
    if (S.compare.open && S.compare.ids.length) renderCompare();
    syncAll(); renderTour(); draw();
  }
  function tourNext() { const T = S.tour, p = tourPreset(); if (!T || !p) return; if (T.i >= p.tour.length - 1) { endTour(); syncAll(); return; } T.i++; tourGo(); }
  function tourBack() { const T = S.tour; if (!T || T.i === 0) return; tourReplay(T.i - 1); }
  const weekOf = () => (S.tour && S.tour.t0k !== null ? (Math.round(M.t / DTW) - S.tour.t0k) * DTW : 0);
  function renderTour() {
    const T = S.tour, p = tourPreset();
    if (!T || !p) { tourBox.hidden = true; return; }
    const words = W.scenario(S.bundle, p.id), st = p.tour[T.i], N = p.tour.length;
    const head = `<p class="tour__h"><b>${esc(W.preset(S.bundle, p.id))}</b> <span class="muted">· step ${T.i + 1} of ${N} · week ${st.run}</span></p>`;
    let body;
    if (T.phase !== 'show') body = `<p class="tour__run" data-r="tour-run">${T.phase === 'warm' ? 'Settling the line first…' : `Running to week ${st.run}…`}</p>`;
    else {
      const vals = T.vals[T.i] || {}, prev = T.vals[T.i - 1] || {};
      const checks = Object.entries(st.expect || {}).map(([k, t]) => { const ok = judge(vals[k], t, prev[k]); return `<li class="${ok ? 'ok' : 'bad'}">${ok ? '✓' : '✗'} <code>${esc(k)}</code> ${esc(String(t))} <span class="muted">= ${vals[k] === undefined ? '–' : vals[k].toFixed(2)}</span></li>`; }).join('');
      body = `<p class="tour__cap">${esc((words.steps || [])[T.i] || '')}</p>${checks ? `<ul class="tour__checks" aria-label="What the checks expect here">${checks}</ul>` : ''}`;
    }
    tourBox.innerHTML = `${head}${body}<div class="tour__btns"><button type="button" class="ghost-btn" data-tour="close">Close</button><span></span>
      <button type="button" class="ghost-btn" data-tour="back" ${T.i === 0 || T.phase !== 'show' ? 'disabled' : ''}>Back</button>
      <button type="button" class="tbtn tbtn--solid" data-tour="next" ${T.phase !== 'show' ? 'disabled' : ''}>${T.i >= N - 1 ? 'Finish' : 'Next'}</button></div>`;
    $('[data-tour="close"]', tourBox).addEventListener('click', () => { endTour(); syncAll(); });
    $('[data-tour="back"]', tourBox).addEventListener('click', tourBack);
    $('[data-tour="next"]', tourBox).addEventListener('click', tourNext);
    tourBox.hidden = false;
    placeTour(st.card);
  }
  // the caption points at its card: below it when there is room, else above
  function placeTour(card) {
    const wr = wrap.getBoundingClientRect(), el = (S.compare.open && $(`[data-col="${card}"]`, cmp)) || cardEls.get(card);
    tourBox.style.width = `${Math.min(380, wr.width - 24)}px`;
    for (const x of cardEls.values()) toggle(x, 'is-toured', x === el);
    if (!el || view.hidden && !S.compare.open) { tourBox.style.left = '12px'; tourBox.style.top = '12px'; tourBox.dataset.side = 'none'; return; }
    const r = el.getBoundingClientRect(), bw = tourBox.offsetWidth, bh = tourBox.offsetHeight;
    const cx = r.left - wr.left + r.width / 2, below = r.bottom - wr.top + 12, above = r.top - wr.top - bh - 12;
    const side = below + bh <= wr.height - 8 || above < 8 ? 'below' : 'above';
    tourBox.dataset.side = side;
    tourBox.style.left = `${Math.max(8, Math.min(wr.width - bw - 8, cx - bw / 2))}px`;
    tourBox.style.top = `${side === 'below' ? Math.min(below, wr.height - bh - 8) : above}px`;
    tourBox.style.setProperty('--tail', `${Math.max(16, Math.min(bw - 16, cx - Math.max(8, Math.min(wr.width - bw - 8, cx - bw / 2))))}px`);
  }
  function syncTour() {
    if (!S.tour || S.tour.phase === 'show') return;
    const el = $('[data-r="tour-run"]', tourBox), p = tourPreset();
    if (el && S.tour.phase === 'run') setText(el, `Running to week ${p.tour[S.tour.i].run}… week ${Math.floor(weekOf())}`);
  }
