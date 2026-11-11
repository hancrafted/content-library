  // ---------- Exchange file: one YAML, generated from the real current state ----------
  const SCHEMA = SCHEMA_ID;
  const DATA_KEYS = ['id', 'panels', 'layout', 'mechanics', 'customer', 'company', 'sources', 'bottleneck', 'centers', 'routes', 'presets'];
  const NOTES = {
    '#schema': 'Software ecology factory. Edit any value, save, and drop the file back on the page to run the factory from it. A file is refused if any work center would be over capacity at Realistic.',
    '#mechanics': 'While its toolbar toggle is on: rework = chance bad input is sent back (0 to 1); churn = how many times the documents a center hands on when it keeps bad input (1 to 4). Complaints take their chance from customer.bad.',
    '#customer': 'The one Customer, source and sink. rate: requests a week; Ideal sizes every work center for it. arrivals: steady or random (default: steady in Ideal, random otherwise). mix: where requests go, as weights. good / bad: the chance a good or bad release brings a new request, and where it goes (a bad release brings a complaint); each set adds up to less than 1. releases: the work centers whose shipments are releases (the rest are answers).',
    company: 'service: only the Customer asks for work; product: roles also write tickets of their own (sources). Also a toggle in Model.',
    '#sources': 'Product company only: own tickets a week, written into a work center\'s backlog and handed on like a request ({ id, at, rate }). They scale with that center\'s AI extra tasks.',
    bottleneck: 'the work center near 85 % busy at Realistic; every other is sized to at most 70 %',
    '#centers': 'Work centers: id, role (see roles), at: [x, y], realistic: [efficiency, effectiveness] at Model = Realistic, spawns: what a finished job creates ({ to, n }, { to, p } or choose: [{ to, w }]; to: customer ships; the first spawn carries the request on). Optional: service: exponential, buffer: n (senders wait when it is full), inspection: true with stampUnderPressure (0 to 2), person: (one person runs several centers), dials.',
    '#routes': 'Belt routes, keyed from-to: out and in (port: left, right, top, bottom), via (corners), xm (elbow x), over (crosses on a bridge). The belts themselves come from the spawns and the Customer. Every handoff takes a quarter working day, whatever the length.',
    '#presets': 'States. Swing, Roles, Ideal and Realistic sit on the toolbar; the rest under Scenarios. view: swing | roles | factory. reality: 0 (Ideal) to 100 (Realistic). ai: all, off or a list of center ids. dials: per-center overrides (efficiency, effectiveness, fanout, aiSpeed, aiExtra). compare: up to three ids. customer: overrides of the Customer. start: clear or warm. speed. tour: steps { set, run (weeks from the start), card, expect }; check: one step. expect: { "<customer or center>.<measure>": test }, e.g. { qa.weeksWaiting: ">2", customer.output: "0.9–1.1" }.',
    '#roles': 'Roles used here. fan: tasks handed on per task; aiSize: how much longer an AI document takes to read.',
    '#state': 'What the page shows right now. speed: 0 pause, 1, 2, 5 or 10. customer: its rate, arrivals, mix and follow-up chances. centers: per-center dial overrides. overlays: Follow an order and Isolate, kept for later (no effect yet).',
    '#i18n': 'Words per locale. Titles of centers default to their role title.',
  };
  const OVER_OUT = { eff: 'efficiency', effv: 'effectiveness', fan: 'fanout', ai: 'ai', aiSpeed: 'aiSpeed', aiExtra: 'aiExtra' };
  const OVER_IN = Object.fromEntries(Object.entries(OVER_OUT).map(([a, b]) => [b, a]));

  function exportDoc() {
    const B = S.bundle, uc = B.data;
    const used = [...new Set(['customer', ...uc.centers.map((c) => c.role)])];
    const data = {};
    for (const k of DATA_KEYS) if (uc[k] !== undefined) data[k] = JSON.parse(JSON.stringify(uc[k]));
    data.mechanics = { ...S.strength };
    const centers = {};
    for (const [id, o] of Object.entries(S.over)) {
      const c = {};
      for (const [k, v] of Object.entries(o)) if (OVER_OUT[k] !== undefined) c[OVER_OUT[k]] = v;
      if (Object.keys(c).length) centers[id] = c;
    }
    const cu = custOf(M), customer = { rate: cu.rate, arrivals: cu.mode, mix: { ...cu.mix }, good: { ...cu.good }, bad: { ...cu.bad } };
    const state = {
      preset: S.preset, view: S.view, reality: S.reality, ai: S.ai, company: S.company, aiQuality: S.aiq, speed: S.speed, beltMotion: S.beltMotion,
      mechanics: { ...S.mech }, customer, compare: [...S.compare.ids], centers, overlays: { ...S.overlays },
    };
    const i18n = {};
    for (const l of ['en', 'de']) {
      const w = JSON.parse(JSON.stringify(B.words[l] || {}));
      w.name ||= B.data.id;
      w.presets = Object.fromEntries((uc.presets || []).map((p) => [p.id, w.presets?.[p.id] || CATALOG_WORDS[l]?.presets?.[p.id] || p.id]));
      const sc = Object.fromEntries((uc.presets || []).map((p) => [p.id, w.scenarios?.[p.id] || CATALOG_WORDS[l]?.scenarios?.[p.id]]).filter(([, v]) => v));
      if (Object.keys(sc).length) w.scenarios = sc; else delete w.scenarios;
      w.roles = Object.fromEntries(used.map((r) => [r, roleWords(B, r, l)]));
      i18n[l] = w;
    }
    return { schema: SCHEMA, ...data, roles: Object.fromEntries(used.map((r) => [r, { ...roleOf(B, r) }])), state, i18n };
  }
  const exportYaml = () => YAML.stringify(exportDoc(), NOTES);

  function download() {
    const text = exportYaml();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/yaml' }));
    a.download = `software-ecology-${UC().id}.yaml`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    ioMsg(`Downloaded ${a.download}: the current state of ${W.name(S.bundle)}. Edit it and drop it back here.`);
  }

  // Parse, validate, check stability, and run the factory from the file. Returns the list of problems (empty on success).
  // Q122: the rushing and worst-case warnings show on Upload only, never for the built-in files
  const warnNote = (warn) => {
    const who = (list) => [...new Set(list.map((x) => x.split(':')[0]))].join(', ');
    const rush = warn.filter((x) => !x.includes('inspection')), worst = warn.filter((x) => x.includes('inspection'));
    return (rush.length ? ` Note: if every work center rushed (3+ weeks of work waiting), ${who(rush)} would be over capacity.` : '') +
      (worst.length ? ` If every inspection also passed bad work unread: ${who(worst)}.` : '');
  };
  function importText(text, name = 'the file') {
    let doc;
    try { doc = YAML.parse(text); } catch (e) { ioMsg(`Could not read ${name}: ${e.message}`, [], true); return [e.message]; }
    const errs = validate(doc);
    if (errs.length) { ioMsg(`${name} was not loaded. Fix these and drop it again:`, errs, true); return errs; }
    const data = {};
    for (const k of DATA_KEYS) if (doc[k] !== undefined) data[k] = doc[k];
    data.presets ||= [{ id: 'ideal', view: 'factory' }];
    const roles = doc.roles ? Object.fromEntries(Object.entries(doc.roles).map(([k, v]) => [k, { ...(CATALOG[k] || {}), ...v }])) : null;
    const bundle = { data, roles, words: { en: doc.i18n.en, de: doc.i18n.de || {} }, source: name };
    // the stability contract: refuse a file whose Realistic load exceeds a work center's capacity
    // checked for each company the file can run as (the Model toggle resizes the line)
    const co0 = S.company, cos = (data.sources || []).length ? ['service', 'product'] : [data.company || 'service'];
    const st = { refuse: [], warn: [] };
    for (const co of cos) { S.company = co; const r = stability(build(bundle)); const tag = cos.length > 1 ? ` (as a ${co === 'product' ? 'product company' : 'service provider'})` : ''; st.refuse.push(...r.refuse.map((x) => x + tag)); st.warn.push(...r.warn); }
    S.company = co0;
    if (st.refuse.length) {
      const idx = (id) => data.centers.findIndex((c) => c.id === id);
      const list = st.refuse.map((x) => { const id = x.split(':')[0]; return id === 'customer' ? `customer.good / customer.bad: ${x.slice(x.indexOf(':') + 2)}; lower the follow-up chances` : id.startsWith('person ') ? `centers (person ${id.slice(7)}): ${x.slice(x.indexOf(':') + 2)}; raise its realistic efficiency or lower what reaches it` : `centers[${idx(id)}].realistic: ${x}; raise its efficiency or lower what reaches it`; });
      ioMsg(`${name} was not loaded: at Realistic some work would pile up without end.`, list, true); return list;
    }
    BUNDLES.set(data.id, bundle);
    renderUseCases();
    const st0 = doc.state || {};
    loadBundle(data.id, false);
    if (st0.company) S.company = st0.company;
    const p = data.presets.find((x) => x.id === st0.preset) || data.presets[0];
    Object.assign(S, presetSettings(bundle, p));
    Object.assign(S, {
      view: st0.view || 'factory', reality: st0.reality ?? S.reality, ai: st0.ai ?? S.ai, aiq: st0.aiQuality || 'same',
      preset: st0.preset || p.id, speed: st0.speed ?? 5, beltMotion: !!st0.beltMotion,
    });
    if (st0.customer) { const c = st0.customer; S.cust = { ...S.cust, ...(c.rate !== undefined ? { rate: c.rate } : {}), ...(c.arrivals ? { mode: c.arrivals } : {}), ...(c.mix ? { mix: { ...c.mix } } : {}), ...(c.good ? { good: { ...c.good } } : {}), ...(c.bad ? { bad: { ...c.bad } } : {}) }; }
    S.overlays = { ...S.overlays, ...(st0.overlays || {}) };
    S.mech = { ...S.mech, ...(st0.mechanics || {}) };
    S.over = {};
    for (const [id, o] of Object.entries(st0.centers || {})) { const x = {}; for (const [k, v] of Object.entries(o)) if (OVER_IN[k]) x[OVER_IN[k]] = v; S.over[id] = x; }
    S.compare = { picking: false, ids: (st0.compare || []).slice(0, 3), open: !!(st0.compare && st0.compare.length), note: '' };
    rebuild(S.view);
    ioMsg(`Loaded ${name}: ${data.centers.length} work centers and the Customer, ${M.edges.length} belts from their spawn rules. The factory now runs from this file.${warnNote(st.warn)}`);
    return [];
  }
  function ioMsg(text, list = [], bad = false) {
    const el = $('#io-msg');
    el.className = `io-msg ${bad ? 'io-msg--bad' : ''}`;
    el.innerHTML = `${esc(text)}${list.length ? `<ul>${list.slice(0, 8).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}`;
    el.hidden = false;
  }
  function wireIo() {
    $('#download').addEventListener('click', download);
    const file = $('#upload-file');
    $('#upload').addEventListener('click', () => file.click());
    file.addEventListener('change', async () => { const f = file.files[0]; if (f) importText(await f.text(), f.name); file.value = ''; });
    let depth = 0;
    document.addEventListener('dragenter', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { depth++; document.body.classList.add('is-dropping'); } });
    document.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth) document.body.classList.remove('is-dropping'); });
    document.addEventListener('dragover', (e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) e.preventDefault(); });
    document.addEventListener('drop', async (e) => {
      const f = e.dataTransfer?.files?.[0]; if (!f) return;
      e.preventDefault(); depth = 0; document.body.classList.remove('is-dropping');
      importText(await f.text(), f.name);
    });
  }
