  // ---------- Boot ----------
  function setTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    $('#theme').setAttribute('aria-checked', String(dark));
    readColors(); renderLegend(); renderOpts(); renderMore(); dockSig = ''; renderDock(); if (S.compare.open) syncCompare(true); draw(M.t);
  }
  $('#theme').addEventListener('click', () => setTheme(!document.documentElement.classList.contains('dark')));
  $('#usecase').addEventListener('change', (e) => loadBundle(e.target.value));
  readColors();
  renderUseCases(); wireModelMenu(); wireIo(); renderOpts(); renderMore();
  loadBundle('tire', false);
  applyPreset('ideal');
  if (matchMedia('(prefers-color-scheme: dark)').matches) setTheme(true);
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; start(); }).observe(wrap);
  new ResizeObserver(() => { if (!M) return; measure(); draw(); placePopover(); }).observe(wrap);
  document.addEventListener('visibilitychange', start);
  reduce.addEventListener('change', start);

  // Test seam: probes run a fresh seeded model without touching the page.
  window.__eco = { S, get M() { return M; }, startTour, tourNext, tourBack, endTour, metric: (k) => metric(M, k), judge, LANDS, dials, signals, warm, step, solve, stability, conservation, exportYaml, importText, YAML, validate, applyPreset, clearFactory, drawStats: () => ({ drawn, sprites, tokens: M.tokens }), custOf: () => custOf(M), satRate: () => satRate(M),
    // every belt runs at least MIN_RUN straight out of and into a work center (the customer ends excepted)
    geomCheck(id) {
      const m = build(BUNDLES.get(id)), bad = [];
      for (const e of m.edges) {
        const c = e.corners, first = Math.hypot(c[1][0] - c[0][0], c[1][1] - c[0][1]), last = Math.hypot(c[c.length - 1][0] - c[c.length - 2][0], c[c.length - 1][1] - c[c.length - 2][1]);
        if (first < MIN_RUN - 0.5) bad.push(`${e.key}: ${Math.round(first)} after ${e.from.id}`);
        if (last < MIN_RUN - 0.5) bad.push(`${e.key}: ${Math.round(last)} before ${e.to.id}`);
        for (let i = 1; i < c.length; i++) if (c[i][0] !== c[i - 1][0] && c[i][1] !== c[i - 1][1]) bad.push(`${e.key}: a diagonal run`);
      }
      return bad;
    } };
})();
