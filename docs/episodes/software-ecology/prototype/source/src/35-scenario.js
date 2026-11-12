  // ---------- Scenarios: guided tours and checks, run on the model alone (no rendering) ----------
  // A preset may carry a tour (steps: set dials, run to a week, pause, a caption at a card) or a check (one step).
  // Every step's `expect` is judged by the same code here, in the page and in the headless runner (checks7.mjs),
  // so the vocabulary below can move into a *.test.ts unchanged.
  //
  // Expect vocabulary: { "<subject>.<measure>": "<test>" }
  //   subject: customer, or a work center id.
  //   customer measures: output (fulfilled customer requests a week, relative to Ideal), sat (satisfaction, 0..1),
  //     headroom (how many times today's demand the most loaded center could serve, from the solve),
  //     leadDays (request to release, working days, Little's law), bugsPerWeek (complaints a week),
  //     own (own tickets shipped a week), backlog (jobs waiting at all centers).
  //   center measures: weeksWaiting, busy (0..1), bugShare (share of its busy time on complaints and the work they cause),
  //     backlog (jobs waiting), done (jobs finished a week), rework (share of its arrivals that came back),
  //     rush (effectiveness points lost to rushing, 0 to 15: Q114 B).
  //   test: ">2", "<0.5", ">=1", "<=3", "0.9–1.1" (a range, en dash or hyphen), "rises" or "falls" (against the step before).
  const CUST_M = {
    output: (m) => (m.idealOut ? m.outRate / m.idealOut : 0),
    sat: (m) => satRate(m),
    headroom: (m) => solve(m, S).headroom,
    leadDays: (m) => (m.mainRate > 0.05 ? (m.wipAvg / m.mainRate) * DAYS : 0),
    bugsPerWeek: (m) => m.compl,
    own: (m) => m.ownRate,
    backlog: (m) => backlogOf(m),
  };
  const NODE_M = {
    weeksWaiting: (n) => n.Ws,
    busy: (n) => n.u.busy,
    bugShare: (n) => (n.u.busy > 0.02 ? n.u.fail / n.u.busy : 0),
    backlog: (n) => n.L,
    done: (n) => n.rate.done,
    rework: (n) => (n.rate.arr > 0.05 ? n.rate.rwIn / n.rate.arr : 0),
    rush: (n) => rushOf(n),
  };
  function metric(m, key) {
    const [who, what] = key.split('.');
    if (who === 'customer') { if (!CUST_M[what]) throw new Error(`unknown measure ${key}`); return CUST_M[what](m); }
    const n = m.nodes.get(who);
    if (!n || n.kind !== 'role' || !NODE_M[what]) throw new Error(`unknown measure ${key}`);
    return NODE_M[what](n);
  }
  // judge one value against a test; prev is the same measure at the step before (for rises / falls)
  function judge(v, test, prev) {
    const t = String(test).trim();
    if (t === 'rises' || t === 'falls') return prev === undefined ? false : t === 'rises' ? v > prev : v < prev;
    let x = /^(>=|<=|>|<)\s*(-?[\d.]+)$/.exec(t);
    if (x) { const k = Number(x[2]); return x[1] === '>' ? v > k : x[1] === '<' ? v < k : x[1] === '>=' ? v >= k : v <= k; }
    x = /^(-?[\d.]+)\s*[–-]\s*(-?[\d.]+)$/.exec(t);
    if (x) return v >= Number(x[1]) && v <= Number(x[2]);
    throw new Error(`unknown test "${t}"`);
  }
  const validTest = (t) => { try { judge(0, t, 0); return true; } catch { return false; } };
  const validKey = (key, centerIds) => { const [who, what] = String(key).split('.'); return who === 'customer' ? what in CUST_M : centerIds.has(who) && what in NODE_M; };
  // a step's `set`: dials per center (efficiency, effectiveness, fanout, ai, aiSpeed, aiExtra), customer, ai, reality
  const SET_IN = { efficiency: 'eff', effectiveness: 'effv', fanout: 'fan', ai: 'ai', aiSpeed: 'aiSpeed', aiExtra: 'aiExtra' };
  function applySet(set, m, s = S) {
    if (!set) return;
    if (set.reality !== undefined) s.reality = set.reality;
    if (set.ai !== undefined) s.ai = Array.isArray(set.ai) ? [...set.ai] : set.ai;
    for (const [id, o] of Object.entries(set.dials || {})) { const x = (s.over[id] ||= {}); for (const [k, v] of Object.entries(o)) x[SET_IN[k]] = v; }
    if (set.customer) { const cu = custOf(m, s), c = set.customer; s.cust = { ...cu, mix: { ...(c.mix ?? cu.mix) }, good: { ...(c.good ?? cu.good) }, bad: { ...(c.bad ?? cu.bad) }, ...(c.rate !== undefined ? { rate: c.rate } : {}), ...(c.arrivals ? { mode: c.arrivals } : {}) }; }
  }
  // the steps of a preset: its tour, or its check as one step
  const stepsOf = (p) => (p.tour ? p.tour : p.check ? [p.check] : []);
  // The settings a preset starts from, the way the page applies them.
  function startSettings(B, p, s = S) {
    s.bundle = B; s.company = B.data.company || 'service';
    s.strength = { ...MECH_DEFAULTS(), ...(B.data.mechanics || {}) };
    Object.assign(s, { aiq: 'same', mech: { rework: true, churn: true, complaints: true } }, presetSettings(B, p));
  }
  // weeks from the scenario start to model steps: the page and the runner stop on the same step
  const stepsTo = (weeks) => Math.round(weeks / DTW);
  // Run every step of one preset headless, with a fixed seed. Returns one row per step with each expect judged.
  function runScenario(B, id, { seed } = {}) {
    const p = B.data.presets.find((x) => x.id === id);
    startSettings(B, p);
    const m = build(B, seed);
    if (p.start !== 'clear') warm(m, WARM_WEEKS);
    const k0 = Math.round(m.t / DTW), steps = stepsOf(p), keys = [...new Set(steps.flatMap((st) => Object.keys(st.expect || {})))];
    const rows = [];
    let prev = {}, k = k0;
    steps.forEach((st, i) => {
      applySet(st.set, m);
      for (const kk = k0 + stepsTo(st.run); k < kk; k++) step(m);
      const vals = Object.fromEntries(keys.map((key) => [key, metric(m, key)]));
      const checks = Object.entries(st.expect || {}).map(([key, test]) => ({ key, test, v: vals[key], prev: prev[key], ok: judge(vals[key], test, prev[key]) }));
      rows.push({ i, week: st.run, checks });
      prev = vals;
    });
    return rows;
  }
