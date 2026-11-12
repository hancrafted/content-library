  // ---------- Data: one YAML per use case drives everything; words beside it per locale ----------
  const SRC = /*SRC*/{};
  const CATALOG = YAML.parse(SRC.catalog).roles;                       // role -> { icon, fan, aiSize }
  const CATALOG_WORDS = { en: YAML.parse(SRC['catalog.en']), de: YAML.parse(SRC['catalog.de']) };
  const BUILTIN = ['tire', 'gate', 'teams'];
  const LANG = 'en';
  const MECHS = ['rework', 'churn', 'complaints'];
  // strength range of a mechanic in the YAML, and its default; complaints take their chance from the Customer (bad)
  const MECH_RANGE = { rework: [0, 1, 0.4], churn: [1, 4, 1.2] };
  const STRENGTHS = Object.keys(MECH_RANGE);
  const VIEWS = ['swing', 'roles', 'factory'];

  // A bundle is everything one use case needs: master data, the roles it uses, and its words per locale.
  function builtinBundle(id) {
    const data = YAML.parse(SRC[id]);
    const words = {};
    for (const l of ['en', 'de']) words[l] = YAML.parse(SRC[`${id}.${l}`]) || {};
    // a use case overrides only what differs from the role catalog (its AI profile, say)
    const roles = data.roles ? Object.fromEntries(Object.entries(data.roles).map(([k, v]) => [k, { ...CATALOG[k], ...v }])) : null;
    delete data.roles;
    return { data, roles, words, source: 'built in' };
  }
  const roleOf = (B, role) => (B.roles && B.roles[role]) || CATALOG[role];
  function roleWords(B, role, l = LANG) {
    const own = B.words[l]?.roles?.[role], cat = CATALOG_WORDS[l]?.roles?.[role] || CATALOG_WORDS.en.roles[role] || {};
    return { ...cat, ...(own || {}) };
  }
  const W = {
    name: (B) => B.words[LANG]?.name || B.data.id,
    sub: (B) => B.words[LANG]?.sub || '',
    center: (B, c) => B.words[LANG]?.centers?.[c.id]?.title || roleWords(B, c.role).title || c.id,
    belt: (B, k) => B.words[LANG]?.belts?.[k] || {},
    customer: (B) => B.words[LANG]?.customer?.title || 'Customer',
    customerJob: (B) => B.words[LANG]?.customer?.job || 'Sends requests and receives what ships',
    preset: (B, id) => B.words[LANG]?.presets?.[id] || CATALOG_WORDS[LANG].presets[id] || id,
    // a scenario's "what to watch" line and its tour captions
    scenario: (B, id) => B.words[LANG]?.scenarios?.[id] || CATALOG_WORDS[LANG].scenarios?.[id] || {},
  };

  // ---------- Validation: what an uploaded file must hold (schema software-ecology-factory/5) ----------
  const SCHEMA_ID = 'software-ecology-factory/5';
  function validate(doc) {
    const E = [];
    const isNum = (v, lo = -Infinity, hi = Infinity) => typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi;
    const isXY = (v) => Array.isArray(v) && v.length === 2 && v.every((x) => isNum(x));
    const isMap = (v) => v && typeof v === 'object' && !Array.isArray(v);
    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) return ['The file is not a YAML map.'];
    if (doc.schema !== undefined && doc.schema !== SCHEMA_ID) E.push(`schema: ${SCHEMA_ID} (this file says ${doc.schema})`);
    if (typeof doc.id !== 'string' || !/^[\w-]+$/.test(doc.id)) E.push('id: a word such as tire');
    const L = doc.layout || {};
    if (!isNum(L.width, 200, 4000) || !isNum(L.height, 100, 3000)) E.push('layout: width and height in layout units');
    const roles = { ...CATALOG, ...(doc.roles || {}) };
    for (const [k, r] of Object.entries(doc.roles || {})) {
      if (!r || !isNum(r.fan ?? 1, 1, 50) || !isNum(r.aiSize ?? 1, 0.1, 20)) E.push(`roles.${k}: fan 1 to 50, aiSize a positive number`);
      if (r && r.aiFan !== undefined) E.push(`roles.${k}.aiFan: retired in schema /5; set AI per work center (dials aiSpeed, aiExtra)`);
      if (r && r.icon && !GLYPH[r.icon]) E.push(`roles.${k}.icon: unknown icon "${r.icon}" (one of ${Object.keys(GLYPH).join(', ')})`);
    }
    const ids = new Set(['customer']), centerIds = new Set();
    if (!Array.isArray(doc.centers) || !doc.centers.length) E.push('centers: a list of work centers');
    else doc.centers.forEach((c, i) => {
      const p = `centers[${i}]`;
      if (!c || typeof c.id !== 'string' || !/^[\w-]+$/.test(c.id)) { E.push(`${p}.id: a word`); return; }
      if (ids.has(c.id)) E.push(`${p}.id: "${c.id}" is used twice${c.id === 'customer' ? ' (customer is the Customer)' : ''}`);
      ids.add(c.id); centerIds.add(c.id);
    });
    // the Customer: its values here, or a preset's overrides of them
    const custPart = (cu, p, full) => {
      if (!isMap(cu)) { E.push(`${p}: a map`); return; }
      if (full && !isXY(cu.at)) E.push(`${p}.at: a position [x, y]`);
      if ((full || cu.rate !== undefined) && !isNum(cu.rate, 0, 200)) E.push(`${p}.rate: requests a week, 0 to 200`);
      if (cu.arrivals !== undefined && !['steady', 'random'].includes(cu.arrivals)) E.push(`${p}.arrivals: steady or random`);
      if (full || cu.mix !== undefined) {
        if (!isMap(cu.mix) || !Object.keys(cu.mix).length) E.push(`${p}.mix: where requests go, e.g. { sales: 30, pm: 50, support: 20 }`);
        else for (const [to, w] of Object.entries(cu.mix)) { if (!centerIds.has(to)) E.push(`${p}.mix.${to}: no such work center`); if (!isNum(w, 0, 1000)) E.push(`${p}.mix.${to}: a weight, 0 or more`); }
        if (isMap(cu.mix) && !Object.values(cu.mix).some((w) => w > 0)) E.push(`${p}.mix: at least one weight above 0`);
      }
      for (const k of ['good', 'bad']) if (cu[k] !== undefined) {
        if (!isMap(cu[k])) { E.push(`${p}.${k}: a map of chances, e.g. { pm: 0.2 }`); continue; }
        let sum = 0;
        for (const [to, x] of Object.entries(cu[k])) { if (!centerIds.has(to)) E.push(`${p}.${k}.${to}: no such work center`); if (!isNum(x, 0, 1)) E.push(`${p}.${k}.${to}: a chance, 0 to 1`); else sum += x; }
        if (sum >= 1) E.push(`${p}.${k}: the chances add up to ${sum}; keep them below 1, or the follow-up requests never end`);
      }
      if (cu.releases !== undefined && !(Array.isArray(cu.releases) && cu.releases.every((x) => centerIds.has(x)))) E.push(`${p}.releases: a list of work centers whose shipments are releases`);
    };
    if (!doc.customer) E.push('customer: { at, rate, mix, good, bad }');
    else custPart(doc.customer, 'customer', true);
    const spawnTo = (to, p) => { if (to !== 'customer' && !centerIds.has(to)) E.push(`${p}.to: a work center, or customer`); };
    (doc.centers || []).forEach((c, i) => {
      if (!c || typeof c.id !== 'string') return;
      const p = `centers[${i}]`;
      if (!roles[c.role]) E.push(`${p}.role: unknown role "${c.role}" (one of ${Object.keys(roles).join(', ')})`);
      if (!isXY(c.at)) E.push(`${p}.at: a position [x, y]`);
      if (c.buffer !== undefined && !isNum(c.buffer, 1, 1000)) E.push(`${p}.buffer: 1 to 1000 (leave it out for an unlimited backlog)`);
      if (c.service !== undefined && !['normal', 'exponential'].includes(c.service)) E.push(`${p}.service: normal or exponential`);
      if (c.realistic !== undefined && !(Array.isArray(c.realistic) && c.realistic.length === 2 && isNum(c.realistic[0], 10, 1000) && isNum(c.realistic[1], 5, 100))) E.push(`${p}.realistic: [efficiency 10-1000, effectiveness 5-100]`);
      const d = c.dials || {};
      if (d.efficiency !== undefined && !isNum(d.efficiency, 10, 1000)) E.push(`${p}.dials.efficiency: 10 to 1000`);
      if (d.effectiveness !== undefined && !isNum(d.effectiveness, 5, 100)) E.push(`${p}.dials.effectiveness: 5 to 100`);
      if (d.fanout !== undefined && !isNum(d.fanout, 1, 5)) E.push(`${p}.dials.fanout: tasks handed on per task, 1 to 5`);
      if (d.aiSpeed !== undefined && !isNum(d.aiSpeed, 1, 5)) E.push(`${p}.dials.aiSpeed: AI speed-up, 1 to 5`);
      if (d.aiExtra !== undefined && !isNum(d.aiExtra, 1, 5)) E.push(`${p}.dials.aiExtra: extra tasks per task with AI, 1 to 5`);
      if (c.stampUnderPressure !== undefined && (!c.inspection || !isNum(c.stampUnderPressure, 0, 2))) E.push(`${p}.stampUnderPressure: 0 to 2, on an inspection only`);
      if (!Array.isArray(c.spawns) || !c.spawns.length) E.push(`${p}.spawns: what a finished job creates, e.g. [{ to: ops, n: 1 }]`);
      else {
        const f = c.spawns[0];
        if (f && f.choose === undefined && f.n === undefined) E.push(`${p}.spawns[0]: the first spawn carries the request on, so it is { to, n } or choose`);
      }
      if (Array.isArray(c.spawns)) c.spawns.forEach((sp, j) => {
        const q = `${p}.spawns[${j}]`;
        if (!sp || typeof sp !== 'object') { E.push(`${q}: { to, n }, { to, p } or { choose: [{ to, w }] }`); return; }
        if (sp.choose !== undefined) {
          if (!Array.isArray(sp.choose) || sp.choose.length < 2) E.push(`${q}.choose: two or more { to, w }`);
          else sp.choose.forEach((ch, k) => { spawnTo(ch && ch.to, `${q}.choose[${k}]`); if (ch && ch.w !== undefined && !isNum(ch.w, 0.001, 1000)) E.push(`${q}.choose[${k}].w: a positive weight`); });
          return;
        }
        spawnTo(sp.to, q);
        if (sp.to === c.id) E.push(`${q}.to: a work center cannot spawn into itself`);
        if ((sp.n === undefined) === (sp.p === undefined)) E.push(`${q}: exactly one of n (a count) or p (a chance)`);
        if (sp.n !== undefined && !(Number.isInteger(sp.n) && sp.n >= 1 && sp.n <= 20)) E.push(`${q}.n: a whole number 1 to 20`);
        if (sp.p !== undefined && !isNum(sp.p, 0.001, 1)) E.push(`${q}.p: a chance, more than 0, at most 1`);
      });
    });
    if (doc.centers && !doc.centers.some((c) => c && (c.spawns || []).some((sp) => sp && (sp.to === 'customer' || (sp.choose || []).some((ch) => ch && ch.to === 'customer'))))) E.push('centers: at least one spawn must ship to the Customer (to: customer)');
    for (const [k, r] of Object.entries(doc.routes || {})) {
      if (!/^[\w-]+-[\w-]+$/.test(k)) E.push(`routes.${k}: a key from-to, e.g. sales-billing`);
      if (r && r.via !== undefined && !(Array.isArray(r.via) && r.via.length && r.via.every(isXY))) E.push(`routes.${k}.via: a list of [x, y]`);
      if (r && r.xm !== undefined && !isNum(r.xm)) E.push(`routes.${k}.xm: an x position`);
    }
    if (doc.company !== undefined && !['service', 'product'].includes(doc.company)) E.push('company: service or product');
    if (doc.sources !== undefined) {
      if (!Array.isArray(doc.sources)) E.push('sources: a list of { id, at, rate }');
      else doc.sources.forEach((x, i) => {
        if (!x || typeof x.id !== 'string') E.push(`sources[${i}].id: a word`);
        if (!x || !centerIds.has(x.at)) E.push(`sources[${i}].at: the work center that writes these tickets`);
        if (!x || !isNum(x.rate, 0, 50)) E.push(`sources[${i}].rate: tickets a week, 0 to 50`);
      });
    }
    if (doc.bottleneck !== undefined && !centerIds.has(doc.bottleneck)) E.push('bottleneck: the work center that is the bottleneck at Realistic');
    for (const [k, v] of Object.entries(doc.mechanics || {})) if (!STRENGTHS.includes(k) || !isNum(v, MECH_RANGE[k][0], MECH_RANGE[k][1])) E.push(STRENGTHS.includes(k) ? `mechanics.${k}: ${MECH_RANGE[k][0]} to ${MECH_RANGE[k][1]}` : `mechanics.${k}: unknown (one of ${STRENGTHS.join(', ')}; complaints take their chance from customer.bad)`);
    (doc.presets || []).forEach((p, i) => {
      if (!p || typeof p.id !== 'string') E.push(`presets[${i}].id: a word`);
      if (p && p.view && !VIEWS.includes(p.view)) E.push(`presets[${i}].view: one of ${VIEWS.join(', ')}`);
      if (p && p.reality !== undefined && !isNum(p.reality, 0, 100)) E.push(`presets[${i}].reality: 0 (Ideal) to 100 (Realistic)`);
      if (p && p.ai !== undefined && p.ai !== 'all' && p.ai !== 'off' && !(Array.isArray(p.ai) && p.ai.every((x) => centerIds.has(x)))) E.push(`presets[${i}].ai: all, off or a list of center ids`);
      if (p && p.compare !== undefined && !(Array.isArray(p.compare) && p.compare.length <= 3 && p.compare.every((x) => centerIds.has(x)))) E.push(`presets[${i}].compare: up to three center ids`);
      for (const id of Object.keys((p && p.dials) || {})) if (!centerIds.has(id)) E.push(`presets[${i}].dials.${id}: no such work center`);
      if (p && p.customer !== undefined) custPart(p.customer, `presets[${i}].customer`, false);
      if (p && p.start !== undefined && !['clear', 'warm'].includes(p.start)) E.push(`presets[${i}].start: clear (day 0) or warm (60 weeks settled)`);
      if (p && p.speed !== undefined && !(SPEEDS.includes(p.speed) && p.speed > 0)) E.push(`presets[${i}].speed: 1, 2, 5 or 10`);
      if (p && p.tour !== undefined && p.check !== undefined) E.push(`presets[${i}]: a tour or a check, not both`);
      if (p && p.tour !== undefined && !(Array.isArray(p.tour) && p.tour.length >= 1 && p.tour.length <= 6)) E.push(`presets[${i}].tour: 1 to 6 steps`);
      const steps = p ? (Array.isArray(p.tour) ? p.tour.map((st, j) => [st, `presets[${i}].tour[${j}]`]) : p.check !== undefined ? [[p.check, `presets[${i}].check`]] : []) : [];
      let last = 0;
      for (const [st, q] of steps) {
        if (!isMap(st)) { E.push(`${q}: a map { set, run, card, expect }`); continue; }
        if (!isNum(st.run, 0.5, 200) || st.run <= last) E.push(`${q}.run: weeks from the start, 0.5 to 200, later than the step before`);
        else last = st.run;
        if (st.card !== undefined && st.card !== 'customer' && !centerIds.has(st.card)) E.push(`${q}.card: customer or a work center`);
        const set = st.set;
        if (set !== undefined) {
          if (!isMap(set)) E.push(`${q}.set: a map { dials, customer, ai, reality }`);
          else {
            for (const id of Object.keys(set.dials || {})) if (!centerIds.has(id)) E.push(`${q}.set.dials.${id}: no such work center`);
            if (set.customer !== undefined) custPart(set.customer, `${q}.set.customer`, false);
            if (set.ai !== undefined && set.ai !== 'all' && set.ai !== 'off' && !(Array.isArray(set.ai) && set.ai.every((x) => centerIds.has(x)))) E.push(`${q}.set.ai: all, off or a list of center ids`);
            if (set.reality !== undefined && !isNum(set.reality, 0, 100)) E.push(`${q}.set.reality: 0 to 100`);
          }
        }
        if (st.expect !== undefined && !isMap(st.expect)) E.push(`${q}.expect: a map { "customer.output": "0.9–1.1" }`);
        for (const [k, t] of Object.entries(st.expect || {})) {
          if (!validKey(k, centerIds)) E.push(`${q}.expect.${k}: customer.<output|sat|headroom|leadDays|bugsPerWeek|own|backlog> or <center>.<weeksWaiting|busy|bugShare|backlog|done|rework|rush>`);
          if (!validTest(t)) E.push(`${q}.expect.${k}: a test such as ">2", "<0.5", "0.9–1.1", rises or falls`);
        }
      }
    });
    const st = doc.state || {};
    if (st.view !== undefined && !VIEWS.includes(st.view)) E.push(`state.view: one of ${VIEWS.join(', ')}`);
    if (st.reality !== undefined && !isNum(st.reality, 0, 100)) E.push('state.reality: 0 to 100');
    if (st.speed !== undefined && !SPEEDS.includes(st.speed)) E.push(`state.speed: one of ${SPEEDS.join(', ')} (0 is pause)`);
    if (st.beltMotion !== undefined && typeof st.beltMotion !== 'boolean') E.push('state.beltMotion: true or false');
    if (st.company !== undefined && !['service', 'product'].includes(st.company)) E.push('state.company: service or product');
    if (st.aiQuality !== undefined && !['worse', 'same', 'better'].includes(st.aiQuality)) E.push('state.aiQuality: worse, same or better');
    for (const [k, v] of Object.entries(st.mechanics || {})) if (!MECHS.includes(k) || typeof v !== 'boolean') E.push(`state.mechanics.${k}: true or false`);
    if (st.customer !== undefined) custPart(st.customer, 'state.customer', false);
    for (const [id, o] of Object.entries(st.centers || {})) {
      if (!centerIds.has(id)) { E.push(`state.centers.${id}: no such work center`); continue; }
      if (o && o.efficiency !== undefined && !isNum(o.efficiency, 10, 1000)) E.push(`state.centers.${id}.efficiency: 10 to 1000`);
    }
    if (st.compare !== undefined && !(Array.isArray(st.compare) && st.compare.length <= 3 && st.compare.every((x) => centerIds.has(x)))) E.push('state.compare: up to three center ids');
    if (!doc.i18n || !doc.i18n.en || typeof doc.i18n.en.name !== 'string') E.push('i18n.en.name: the use case name in English');
    return E;
  }
