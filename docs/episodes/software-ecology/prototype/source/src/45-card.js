  // ---------- WorkCenterCard: one component, four views (swing | role | station | dashboard) ----------
  let uidN = 0;
  const panelFor = (n) => (n.kind === 'customer' ? PANELS[0] : PANELS.find((p) => p.node === n.roleId));
  const iconOf = (n) => (n.kind === 'customer' ? 'customer' : n.role.icon || n.roleId);
  const SIGNS = {
    rework: ['rework', 'Rework: this center sent bad work back'],
    churn: ['churn', 'Churn: it kept bad input and made more documents from it'],
    unread: ['unread', 'Passing unread: its queue is so full that bad work goes through unchecked'],
    complaint: ['complaint', 'A customer complaint arrived here'],
  };
  const signOn = (n, k) => (k === 'rework' ? S.mech.rework : k === 'churn' ? S.mech.churn : k === 'complaint' ? S.mech.complaints : true) && M.t - n.sign[k] < SIGN_HOLD;
  const HELP = {
    eff: 'Efficiency is output: how fast this center finishes a document, 10 % to 1000 %. Faster only helps if work is waiting for it; then the bottleneck moves downstream.',
    effv: 'Effectiveness is outcome: the chance a document leaves good, given the conditions here (time, tools, clear input).',
    fan: 'Tasks handed on per task: every document is a task, so this is how many tasks one finished task creates downstream. More tasks mean more work at the next center.',
    ai: 'AI speeds this center up (2.5× unless you change it below) and may make it write extra tasks; AI-made documents take the next center a little longer to read. Its quality effect is set in Model.',
    aiSpeed: 'AI speed-up: how much faster this center works with AI, 1× to 5×.',
    aiExtra: 'Extra tasks per task with AI: 1× hands on what it would anyway; 2× hands on twice the tasks (more pull requests, more documents) for the next center.',
    out: 'Jobs finished a week. The dashed line is Ideal.',
    good: 'Share of what it hands on that is good. The dashed line is 100 %.',
    wait: 'Weeks of work waiting: the backlog divided by what this center finishes in a week. Amber from one week, red from two.',
    light: 'Green: keeping up. Amber: a week of work or more waiting, a lot of work coming back, passing bad work unread, or mostly waiting for work. Red: two weeks of work or more waiting, or blocked.',
    rate: 'How many requests the Customer sends a week. Ideal sizes every work center for the file’s rate; more than that fills the line.',
    mode: 'Steady: one request every 1/rate. Random: the same rate on average, but requests come in bursts and gaps (a Poisson process), the way real requests arrive.',
    mix: 'Where new requests go: new customers to Sales, feature and change requests to the product manager, bugs and support tickets to Support.',
    lead: 'Lead time: working days from a request to its release, over about six weeks (Little’s law: requests in the line ÷ requests finished a week).',
    headroom: 'How many times today’s demand the line could serve before its most loaded work center is full (from the expected flows at these settings).',
    bugs: 'Bugs reported a week: complaints after bad releases. Each is failure demand: work that adds no value.',
    own: 'Product company: tickets the company writes itself (roadmap, leads, tech debt) that shipped, a week. Counted apart from the Customer’s requests; both share the same backlogs.',
    follow: 'Each release may bring a new request at once. A good release brings a change request; a bad one a complaint (a bug or support request, marked with the red warning). Kept below 1 in total, so the requests settle.',
  };

  function cardStation(n) {
    const head = `<div class="wcc__head">${glyph(iconOf(n))}<span class="wcc__title">${esc(n.title)}</span>${n.def.inspection ? `<span class="wcc__insp" data-tip="Inspection: reviews the work it receives">${icon('qa')}</span>` : ''}</div>`;
    if (n.kind === 'customer') return `${head}<div class="wcc__body wcc__body--cust">
        <div class="cust__row"><div class="grid12" data-r="grid" role="img" aria-label="The last 12 releases">${'<i></i>'.repeat(12)}</div>
        <div class="dock__rel" data-tip="Output: fulfilled requests a week, relative to ideal"><b data-r="rel">1.0×</b><span>of ideal</span></div></div>
        <p class="dock__sat" data-tip="Customer satisfaction: good releases minus complaints, out of the last 12"><span>Satisfied</span> <b data-r="sat">100 %</b></p>
        <p class="dock__sat" data-tip="${esc(HELP.lead)}"><span>Lead time</span> <b data-r="lead">–</b></p>
        <p class="dock__sat" data-tip="${esc(HELP.headroom)}"><span>Could serve</span> <b data-r="head">–</b></p>
        <p class="dock__sat" data-tip="${esc(HELP.bugs)}"><span>Bugs a week</span> <b data-r="bugs">0</b></p>
        <p class="dock__sat" data-r="ownrow" data-tip="${esc(HELP.own)}"><span>Own, a week</span> <b data-r="own">0</b></p>
        <p class="cust__dials" data-tip="${esc(HELP.rate)}"><b data-r="rate"></b> <span data-r="mode"></span></p></div>`;
    const complTo = [UC().customer, ...(UC().presets || []).map((p) => p.customer || {})].some((c) => c.bad && n.id in c.bad);
    const signs = Object.entries(SIGNS).filter(([k]) => k !== 'unread' || n.def.inspection).filter(([k]) => k !== 'complaint' || complTo);
    return `${head}<div class="wcc__body"><span class="wcc__status" data-r="status-box"><span class="wcc__bugs" data-r="bugs"></span><span><b data-r="status"></b> waiting</span></span></div>
      <div class="wcc__signs">${signs.map(([k, [ic, t]]) => `<span class="sign sign--${k}" data-sign="${k}" data-tip="${esc(t)}" aria-label="${esc(t)}">${icon(ic)}</span>`).join('')}</div>
      <span class="aid aid--turbo" aria-hidden="true"><svg viewBox="0 0 30 14"><g class="aid__chev"><path d="M2 2l5 5-5 5M10 2l5 5-5 5M18 2l5 5-5 5" /></g></svg></span>`;
  }
  // Swing and Roles: the cartoon panel and the tangible deliverables; tasks and "with AI" stay on the dashboard.
  const artefacts = (n) => { const a = roleWords(S.bundle, n.roleId).artefacts || []; return a.length ? `<div class="hl"><p class="hl__h">Artefacts</p><div class="chips">${a.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div></div>` : ''; };
  const art = (n) => { const p = UC().panels && panelFor(n); return p ? `<svg viewBox="0 0 160 110" class="wcc__art" role="img" aria-label="${esc(p.cap)}">${panelArt(p)}</svg>` : `<div class="wcc__noart">${glyph(iconOf(n), 'gly gly--lg')}</div>`; };
  function cardSwing(n) {
    const p = panelFor(n);
    return `${art(n)}<p class="wcc__cap">${esc(p ? p.cap : n.title)}</p><span class="tag ${p && p.target ? 'tag--primary' : ''}">${esc(n.title)}</span>${artefacts(n)}`;
  }
  // A cartoon panel that is not a work center here (Documentation, Billing), or the closing panel.
  function cardTile(p, v) {
    const what = p.target ? 'the tire swing' : 'not a work center here';
    return `<svg viewBox="0 0 160 110" class="wcc__art" role="img" aria-label="${esc(p.cap)}">${panelArt(p)}</svg><p class="wcc__cap">${esc(p.cap)}</p>
      <span class="tag ${p.target ? 'tag--primary' : 'tag--muted'}">${esc(p.role)}${p.target ? '' : ` · ${what}`}</span>${v === 'roles' && !p.target ? `<p class="wcc__job">${esc(p.role === 'Documentation' ? 'Too broad for one role: everyone writes documentation.' : 'Too narrow for a work center: billing follows the deal.')}</p>` : ''}`;
  }
  function highlights(n) {
    const w = roleWords(S.bundle, n.roleId);
    return `<div class="hl"><p class="hl__h">Artefacts</p><div class="chips">${(w.artefacts || []).map((a) => `<span class="chip">${esc(a)}</span>`).join('')}</div></div>
      <div class="hl"><p class="hl__h">Tasks</p><ul class="hl__list">${(w.tasks || []).map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
      <div class="hl hl--ai"><p class="hl__h">With AI here</p><ul class="hl__list">${(w.ai || []).map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>`;
  }
  function cardRole(n) {
    const w = n.kind === 'role' ? roleWords(S.bundle, n.roleId) : { job: W.customerJob(S.bundle) };
    return `<div class="wcc__head wcc__head--lg">${glyph(iconOf(n), 'gly gly--md')}<div><p class="wcc__title">${esc(n.title)}</p><p class="wcc__job">${esc(w.job || '')}</p></div></div>${art(n)}${artefacts(n)}`;
  }

  // The dashboard is a monitor: traffic light, signals, three trends; the dials sit folded away in Settings,
  // the queueing measures in "How it flows" (progressive disclosure: not everyone knows queueing theory).
  const trend = (k, title, unit) => `<figure class="trend" data-trend="${k}"><figcaption><span class="trend__t" data-tip="${esc(HELP[k])}">${title}</span><b data-r="tv-${k}">–</b><span class="muted">${unit}</span></figcaption>
    <svg viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden="true"><path class="trend__ref" data-r="tr-${k}" /><path class="trend__area" data-r="ta-${k}" /><path class="trend__line" data-r="tl-${k}" /></svg>
    <p class="help">${esc(HELP[k])}</p></figure>`;
  // efficiency on a log slider: 0..200 maps to 10 %..1000 %
  const effToPos = (v) => Math.round(Math.log10(v / 10) * 100);
  const posToEff = (p) => { const v = 10 * 10 ** (p / 100); return v < 100 ? Math.round(v) : v < 300 ? Math.round(v / 5) * 5 : Math.round(v / 10) * 10; };
  function cardDashboard(n, { closable = false } = {}) {
    const id = `d${++uidN}`, d = dials(n), w = roleWords(S.bundle, n.roleId), en = d.en;
    // Q102: every setting is a slider showing what is set and, while AI changes it, what is in effect
    const row = (k, label, sub, help, min, max, st, ai = false) => `<div class="step step--range${ai ? ' step--ai' : ''}" data-row="${k}"${ai && !d.ai ? ' hidden' : ''}><label class="step__l" for="${id}-${k}" data-tip="${esc(help)}">${label} <span class="muted">${sub}</span></label>
        <input type="range" class="range" id="${id}-${k}" data-set="${k}" min="${min}" max="${max}" step="${st}" /><output class="step__v" data-r="${k}-v"></output><p class="help">${esc(help)}</p></div>`;
    const effRow = en.includes('efficiency') ? row('eff', 'Efficiency', '· output', HELP.eff, 0, 200, 1) : '';
    const effvRow = en.includes('effectiveness') ? row('effv', 'Effectiveness', '· outcome', HELP.effv, 5, 100, 1) : '';
    const fanRow = en.includes('fanout') ? row('fan', 'Tasks handed on per task', '', HELP.fan, 1, 5, 0.5) : '';
    const aiRows = en.includes('ai') ? row('aiSpeed', 'AI speed-up', '', HELP.aiSpeed, 1, 5, 0.5, true) + row('aiExtra', 'AI extra tasks', '· per task', HELP.aiExtra, 1, 5, 0.5, true) : '';
    return `<header class="dash__head">${glyph(iconOf(n), 'gly gly--md')}
        <div class="dash__t"><h3 class="wcc__title" id="${id}-t">${esc(n.title)}</h3><p class="wcc__job">${esc(w.job || '')}</p></div>
        <span class="light" data-r="light" role="img" data-tip="${esc(HELP.light)}"><i data-l="red"></i><i data-l="amber"></i><i data-l="green"></i></span>
        ${en.includes('ai') ? `<button type="button" role="switch" class="switch switch--sm" data-r="ai" aria-checked="${d.ai}" data-tip="${esc(HELP.ai)}"><span class="switch__track" aria-hidden="true"></span><span>AI</span></button>` : ''}
        <button type="button" class="icon-btn" data-r="help" aria-pressed="${S.help}" aria-label="Explain the charts" data-tip="Explain the charts">${icon('help')}</button>
        ${closable ? `<button type="button" class="icon-btn" data-r="close" aria-label="Close" data-tip="Close (Esc)">${icon('close')}</button>` : ''}
      </header>
      <ul class="sigs" data-r="sigs" aria-live="polite"></ul>
      <p class="drain" data-r="drain"></p>
      <div class="trends">${trend('out', 'Output', 'a week')}${trend('good', 'Outcome', '% good')}${trend('wait', 'Waiting', 'weeks of work')}</div>
      <details class="settings"><summary>${icon('model')}<span>Settings</span><span class="muted settings__sum" data-r="setsum"></span></summary>
        <div class="steps">${effRow}${effvRow}${fanRow}${aiRows}</div>
      </details>
      <details class="settings flows"><summary>${icon('fast')}<span>How it flows</span><span class="muted settings__sum">for the queueing-minded</span></summary>
        <div class="flows__body">
          <div class="util" data-r="util" role="img"><i class="util__busy"></i><i class="util__blocked"></i><i class="util__starved"></i></div>
          <p class="util__legend"><span><i class="util__busy"></i>busy <b data-r="u-busy"></b></span><span><i class="util__blocked"></i>blocked <b data-r="u-blocked"></b></span><span><i class="util__starved"></i>waiting for work <b data-r="u-starved"></b></span></p>
          <ul class="flows__list">
            <li><span>Throughput</span><b data-r="f-x"></b><span class="muted">jobs it finishes a week</span></li>
            <li><span>Arriving</span><b data-r="f-a"></b><span class="muted">jobs that reach it a week</span></li>
            <li><span>Capacity</span><b data-r="f-c"></b><span class="muted">jobs it could finish a week</span></li>
            <li><span>Average backlog</span><b data-r="f-l"></b><span class="muted">jobs waiting, over two weeks</span></li>
            <li><span>Lead time</span><b data-r="f-w"></b><span class="muted" data-r="f-wn"></span></li>
          </ul>
        </div>
      </details>
      <div class="dash__hl">${highlights(n)}</div>`;
  }
  // The Customer's dashboard: how many requests a week, steady or random, where they go, and what a release brings back.
  const pctIn = (id, k, v) => `<input type="range" class="range range--sm" data-${k}="${id}" min="0" max="${k === 'mix' ? 100 : 0.9}" step="${k === 'mix' ? 5 : 0.05}" value="${v}" />`;
  function cardCustomer(n, { closable = true } = {}) {
    const id = `c${++uidN}`, cu = custOf(M), title = (to) => esc(M.nodes.get(to)?.title || to);
    const targets = M.cust.outs.map((e) => e.to.id);
    return `<header class="dash__head">${glyph('customer', 'gly gly--md')}
        <div class="dash__t"><h3 class="wcc__title" id="${id}-t">${esc(n.title)}</h3><p class="wcc__job">${esc(W.customerJob(S.bundle))}</p></div>
        ${closable ? `<button type="button" class="icon-btn" data-r="close" aria-label="Close" data-tip="Close (Esc)">${icon('close')}</button>` : ''}</header>
      <div class="step step--range"><label class="step__l" for="${id}-rate" data-tip="${esc(HELP.rate)}">Requests a week</label>
        <input type="range" class="range" id="${id}-rate" data-r="rate" min="0" max="${Math.max(30, Math.ceil(M.B.data.customer.rate * 4))}" step="0.5" /><output class="step__v" data-r="ratev"></output></div>
      <div class="mrow"><span class="muted" id="${id}-m" data-tip="${esc(HELP.mode)}">Arrivals</span><div class="seg" role="group" aria-labelledby="${id}-m">
        <button type="button" data-mode="steady">Steady</button><button type="button" data-mode="random">Random</button></div></div>
      <fieldset class="mfs"><legend data-tip="${esc(HELP.mix)}">Request mix</legend>
        ${targets.filter((to) => to in cu.mix || (UC().presets || []).some((p) => p.customer?.mix && to in p.customer.mix)).map((to) => `<div class="mrow mrow--s"><label class="tip-l">${title(to)}</label>${pctIn(to, 'mix', cu.mix[to] ?? 0)}<b data-mixv="${to}"></b></div>`).join('')}</fieldset>
      <fieldset class="mfs"><legend data-tip="${esc(HELP.follow)}">A release brings a new request</legend>
        ${targets.filter((to) => to in cu.good || (UC().presets || []).some((p) => p.customer?.good && to in p.customer.good)).map((to) => `<div class="mrow mrow--s"><label class="tip-l">Good · ${title(to)}</label>${pctIn(to, 'good', cu.good[to] ?? 0)}<b data-goodv="${to}"></b></div>`).join('')}
        ${targets.filter((to) => to in cu.bad || (UC().presets || []).some((p) => p.customer?.bad && to in p.customer.bad)).map((to) => `<div class="mrow mrow--s"><label class="tip-l">Bad · ${title(to)} <span class="muted">(complaint)</span></label>${pctIn(to, 'bad', cu.bad[to] ?? 0)}<b data-badv="${to}"></b></div>`).join('')}</fieldset>
      <p class="text-caption muted" data-r="cust-note"></p>`;
  }
  function wireCustomer(el, n, onChange, onClose) {
    const r = (k) => $(`[data-r="${k}"]`, el);
    const cur = () => { const cu = custOf(M); S.cust = { ...cu, mix: { ...cu.mix }, good: { ...cu.good }, bad: { ...cu.bad }, ...(S.cust ? {} : {}) }; return S.cust; };
    r('rate').addEventListener('input', (e) => { cur().rate = Number(e.target.value); syncCustomer(el, n); onChange(false); });
    for (const b of $$('[data-mode]', el)) b.addEventListener('click', () => { cur().mode = b.dataset.mode; syncCustomer(el, n); onChange(false); });
    for (const k of ['mix', 'good', 'bad']) for (const inp of $$(`[data-${k}]`, el)) inp.addEventListener('input', () => {
      const c = cur(), to = inp.dataset[k], v = Number(inp.value);
      if (k !== 'mix') { const others = Object.entries(c[k]).filter(([t]) => t !== to).reduce((a, [, x]) => a + x, 0); c[k][to] = Math.min(v, 0.95 - others); } // follow-ups stay below 1
      else c[k][to] = v;
      syncCustomer(el, n); onChange(false);
    });
    r('close')?.addEventListener('click', onClose);
    syncCustomer(el, n);
  }
  function syncCustomer(el, n) {
    const cu = custOf(M), r = (k) => $(`[data-r="${k}"]`, el);
    if (document.activeElement !== r('rate')) r('rate').value = cu.rate;
    setText(r('ratev'), `${cu.rate}`);
    for (const b of $$('[data-mode]', el)) setAttr(b, 'aria-pressed', String(b.dataset.mode === cu.mode));
    const mw = Object.values(cu.mix).reduce((a, b) => a + b, 0) || 1;
    for (const k of ['mix', 'good', 'bad']) for (const inp of $$(`[data-${k}]`, el)) {
      const to = inp.dataset[k], v = cu[k][to] ?? 0;
      if (document.activeElement !== inp && inp.value !== String(v)) inp.value = v;
      setText($(`[data-${k}v="${to}"]`, el), k === 'mix' ? `${Math.round((v / mw) * 100)} %` : `${Math.round(v * 100)} %`);
    }
    const g = solve(M, S).gain;
    setText(r('cust-note'), `${cu.rate === M.B.data.customer.rate ? 'Ideal sizes every work center for this rate.' : `${(cu.rate / (M.B.data.customer.rate || 1)).toFixed(1)}× the rate Ideal is sized for.`} Follow-ups: about ${g.toFixed(2)} new requests per request${S.mech.complaints ? '' : ' (complaints are off in the toolbar)'}.`);
  }

  // Wire a dashboard's inputs; `onChange(full)` lets the page react.
  function wireDashboard(el, n, onChange, onClose) {
    const r = (k) => $(`[data-r="${k}"]`, el);
    const setOver = (k, v) => { (S.over[n.id] ||= {})[k] = v; onChange(false); };
    for (const inp of $$('[data-set]', el)) inp.addEventListener('input', () => {
      const k = inp.dataset.set, v = Number(inp.value);
      setOver(k, k === 'eff' ? posToEff(v) : v); syncDashboard(el, n, true);
    });
    r('ai')?.addEventListener('click', () => { const on = !dials(n).ai; setOver('ai', on); setAttr(r('ai'), 'aria-checked', String(on)); syncDashboard(el, n, true); });
    r('help').addEventListener('click', () => { S.help = !S.help; document.body.classList.toggle('help-on', S.help); for (const b of $$('[data-r="help"]')) b.setAttribute('aria-pressed', String(S.help)); });
    r('close')?.addEventListener('click', onClose);
  }
  // DOM writes only on change
  const setText = (el, t) => { if (el && el.textContent !== t) el.textContent = t; };
  const setAttr = (el, k, v) => { if (el && el.getAttribute(k) !== v) el.setAttribute(k, v); };
  // a small line chart over the last 16 weeks, with a dashed reference line
  function sparkline(el, k, data, ref, max) {
    const r = (x) => $(`[data-r="${x}${k}"]`, el), pts = data.map((v, i) => [data.length > 1 ? (i / (data.length - 1)) * 100 : 0, v]).filter((p) => p[1] !== null);
    const Y = (v) => (32 - (Math.min(v, max) / max) * 30).toFixed(1);
    if (pts.length < 2) { setAttr(r('tl-'), 'd', ''); setAttr(r('ta-'), 'd', ''); }
    else {
      const line = pts.map(([x, v], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${Y(v)}`).join(' ');
      setAttr(r('tl-'), 'd', line); setAttr(r('ta-'), 'd', `${line} L${pts[pts.length - 1][0].toFixed(1)} 34 L${pts[0][0].toFixed(1)} 34 Z`);
    }
    setAttr(r('tr-'), 'd', ref === null ? '' : `M0 ${Y(ref)} L100 ${Y(ref)}`);
  }
  const pct = (x) => `${Math.round(x * 100)} %`;
  const num = (x) => (x >= 10 ? Math.round(x).toString() : x.toFixed(1));
  // charts at 2 Hz, the rest at 4 Hz (the caller decides); `force` after a click
  function syncDashboard(el, n, charts = true) {
    const r = (k) => $(`[data-r="${k}"]`, el), d = dials(n), sg = signals(n), h = n.hist;
    const light = r('light'); if (light.dataset.level !== sg.level) { light.dataset.level = sg.level; light.setAttribute('aria-label', `Status ${sg.level}: ${sg.list.map((x) => x[2]).join('; ')}`); }
    const sig = sg.list.map((x) => x[1] + x[2]).join(' ');
    const ul = r('sigs');
    if (ul.dataset.sig !== sig) { ul.dataset.sig = sig; ul.innerHTML = sg.list.map(([lv, k, t]) => `<li class="sig sig--${lv}">${icon(lv === 'green' ? 'ok' : lv === 'red' ? 'complaint' : 'dot')}<span>${esc(t)}</span></li>`).join(''); }
    setText(r('drain'), drainText(n));
    const ideal = n.idealJobs, outNow = n.rate.done, tot = n.rate.out[0] + n.rate.out[1];
    setText(r('tv-out'), num(outNow));
    setText(r('tv-good'), tot > 0.05 ? String(Math.round((n.rate.out[1] / tot) * 100)) : '–');
    setText(r('tv-wait'), n.Ws.toFixed(1));
    if (charts) {
      sparkline(el, 'out', h.out, ideal, Math.max(ideal * 2.2, ...h.out, 1));
      sparkline(el, 'good', h.good, 100, 100);
      sparkline(el, 'wait', h.wait, AMBER, Math.max(RED * 1.5, ...h.wait));
    }
    for (const k of ['out', 'good', 'wait']) { const f = $(`[data-trend="${k}"]`, el), st = k === 'wait' ? (n.lvl === 2 ? 'bad' : n.lvl === 1 ? 'warn' : '') : k === 'good' ? (tot > 0.05 && n.rate.out[1] / tot < 0.75 ? 'bad' : '') : ''; if (f.dataset.state !== st) f.dataset.state = st; }
    // set → effective: "100 % → 250 % with AI"
    const withAi = (set, eff, unit = '') => (d.ai && eff !== set ? `${set}${unit} → ${eff}${unit} with AI` : `${set}${unit}`);
    const vals = { eff: [effToPos(d.eff), withAi(d.eff, d.effEff, ' %')], effv: [d.base, withAi(d.base, d.effv, ' %')], fan: [d.fan, withAi(d.fan, d.fanEff, '×')], aiSpeed: [d.aiSpeed, `${d.aiSpeed}×`], aiExtra: [d.aiExtra, `${d.aiExtra}×`] };
    for (const inp of $$('[data-set]', el)) {
      const k = inp.dataset.set, [pos, txt] = vals[k];
      if (document.activeElement !== inp && inp.value !== String(pos)) inp.value = String(pos);
      setAttr(inp, 'aria-valuetext', txt); setText(r(`${k}-v`), txt);
    }
    for (const rw of $$('.step--ai', el)) if (rw.hidden === d.ai) rw.hidden = !d.ai;
    setText(r('setsum'), `${withAi(d.eff, d.effEff, ' %')} · ${withAi(d.base, d.effv, ' %')} · ${withAi(d.fan, d.fanEff, '×')}`);
    const ai = r('ai'); if (ai) setAttr(ai, 'aria-checked', String(d.ai));
    // How it flows
    const u = n.u, tt = Math.max(1e-6, u.busy + u.blocked + u.starved + Math.max(0, 1 - u.busy - u.blocked - u.starved));
    const ut = r('util');
    if (ut) {
      const bars = ut.children, ws = [u.busy, u.blocked, u.starved].map((x) => `${Math.round((x / tt) * 100)}%`);
      for (let i = 0; i < 3; i++) if (bars[i].style.width !== ws[i]) bars[i].style.width = ws[i];
      setAttr(ut, 'aria-label', `Busy ${pct(u.busy)}, blocked ${pct(u.blocked)}, waiting for work ${pct(u.starved)}`);
      setText(r('u-busy'), pct(u.busy)); setText(r('u-blocked'), pct(u.blocked)); setText(r('u-starved'), pct(u.starved));
      setText(r('f-x'), num(n.rate.done)); setText(r('f-a'), num(n.rate.arr)); setText(r('f-c'), num(speedOf(n, d))); setText(r('f-l'), num(n.Lavg));
      const W_ = leadTime(n);
      setText(r('f-w'), W_ === null ? '–' : `${num(W_)} wk`);
      setText(r('f-wn'), W_ === null ? 'shown once the backlog is steady (Little’s law: backlog ÷ throughput)' : 'how long a job waits and is worked on here (Little’s law: backlog ÷ throughput)');
    }
  }
  // Honest drain time; the fast remedy is raising this center's efficiency.
  function drainText(n) {
    if (n.Ws < AMBER * 0.85 && n.lvl === 0) return '';
    const dr = drain(n);
    if (dr.grow > 0.05) return `Its backlog grows by about ${num(dr.grow)} jobs a week. Raise its efficiency, or send less its way.`;
    const wk = dr.weeks;
    return `At this pace its backlog clears in about ${wk < 1.5 ? 'a week' : `${Math.round(wk)} weeks`}. Raising its efficiency clears it faster.`;
  }

  // Station sync: classes and signs change only when their state changes, so nothing flickers.
  const SIGN_HOLD = 1.5; // weeks: a sign stays for a week and a half after its last event, so it does not blink
  const satisfaction = () => { const g = M.shelf.filter((s) => s.q === Q.GOOD).length, c = M.shelf.filter((s) => s.compl).length; return M.shelf.length ? Math.max(0, g - c) / M.shelf.length : 1; };
  const relOut = () => (M.idealOut ? M.outRate / M.idealOut : 1);
  const toggle = (el, k, v) => { if (el.classList.contains(k) !== v) el.classList.toggle(k, v); };
  function syncStation(el, n) {
    if (n.kind === 'customer') {
      const cells = $$('[data-r="grid"] i', el);
      cells.forEach((c, i) => {
        const s = M.shelf[M.shelf.length - 1 - i], cls = s ? `${s.q === Q.GOOD ? 'g' : 'b'}${s.compl ? ' c' : ''}` : '';
        if (c.className !== cls) { c.className = cls; c.innerHTML = s && s.compl ? icon('complaint') : ''; }
      });
      setText($('[data-r="rel"]', el), `${relOut().toFixed(1)}×`);
      const sat = satisfaction(); setText($('[data-r="sat"]', el), `${Math.round(sat * 100)} %`);
      toggle(el, 'is-unhappy', sat < 0.6);
      const cu = custOf(M), lead = M.mainRate > 0.05 ? (M.wipAvg / M.mainRate) * DAYS : null;
      setText($('[data-r="lead"]', el), lead === null ? '–' : `${lead < 10 ? lead.toFixed(1) : Math.round(lead)} days`);
      const hr = headroom(); setText($('[data-r="head"]', el), `${hr.toFixed(1)}× demand`);
      toggle(el, 'is-full', hr < 1);
      setText($('[data-r="bugs"]', el), M.compl < 0.05 ? '0' : M.compl.toFixed(1));
      const own = $('[data-r="ownrow"]', el), on = S.company === 'product' && M.srcs.length > 0; if (own.hidden === on) own.hidden = !on;
      setText($('[data-r="own"]', el), M.ownRate.toFixed(1));
      setText($('[data-r="rate"]', el), `${cu.rate} a week`); setText($('[data-r="mode"]', el), cu.mode === 'steady' ? 'steady' : 'random');
      toggle(el, 'is-open', S.popover === n.id);
      return;
    }
    const d = dials(n);
    const cls = { 'is-ai': d.ai, 'is-open': S.popover === n.id, 'is-picked': S.compare.ids.includes(n.id) };
    for (const [k, v] of Object.entries(cls)) toggle(el, k, v);
    for (const s of $$('[data-sign]', el)) toggle(s, 'is-on', signOn(n, s.dataset.sign));
    // the status line: what waits here, and (when it matters) the share of its time on bugs
    const bug = n.u.busy > 0.02 ? n.u.fail / n.u.busy : 0;
    setText($('[data-r="status"]', el), String(n.L));
    setText($('[data-r="bugs"]', el), bug >= 0.05 ? `${Math.round(bug * 100)}\u202f% on bugs` : '');
    toggle(el, 'is-piling', n.L > RACK);
  }
  // headroom from the expected flows, solved again only when a setting changes
  let hrKey = '', hrVal = 1;
  function headroom() {
    const k = JSON.stringify([M.seed, M.B.data.id, S.reality, S.ai, S.aiq, S.over, S.cust, S.mech, S.strength, S.company]);
    if (k !== hrKey) { hrKey = k; hrVal = solve(M, S).headroom; }
    return hrVal;
  }
