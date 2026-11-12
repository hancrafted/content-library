// Round 7 headless checks: every step of every scenario, on the model alone, fixed seed, no rendering.
// The expects live in the use-case YAML (presets[].tour[].expect, presets[].check.expect); judge() is the model's own.
// Shape, so it can become a *.test.ts: for each (useCase, preset, step, key) -> expect(judge(value, test, prev)).toBe(true).
import { ECO } from './model.mjs';
const rows = []; let n = 0, fails = 0;
const fmt = (v) => (v === undefined ? '–' : Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2));
for (const id of ['tire', 'gate', 'teams']) {
  const B = ECO.builtinBundle(id);
  for (const p of B.data.presets) {
    if (!ECO.stepsOf(p).length) continue;
    const t0 = performance.now(), res = ECO.runScenario(B, p.id), ms = performance.now() - t0;
    for (const r of res) for (const c of r.checks) {
      n++; if (!c.ok) fails++;
      rows.push(`${String(n).padStart(3)}  ${c.ok ? 'pass' : 'FAIL'}  ${id.padEnd(5)} ${p.id.padEnd(15)} ${p.tour ? `step ${r.i + 1}` : 'check '} wk ${String(r.week).padStart(2)}  ${c.key.padEnd(22)} ${String(c.test).padEnd(10)} = ${fmt(c.v)}${/rises|falls/.test(c.test) ? ` (before ${fmt(c.prev)})` : ''}`);
    }
    rows.push(`     ${''.padEnd(5)} ${id} ${p.id}: ${ms.toFixed(0)} ms`);
  }
}
// Model checks that are not a preset (feedback 07 item 1, Q100, Q93, Q108, determinism)
const extra = [];
const chk = (name, ok, detail) => { n++; if (!ok) fails++; extra.push(`${String(n).padStart(3)}  ${ok ? 'pass' : 'FAIL'}  ${name}: ${detail}`); };
{
  const B = ECO.builtinBundle('tire'); const S = ECO.S;
  const run = (ai, company, weeks = 40) => {
    ECO.startSettings(B, B.data.presets.find((x) => x.id === 'ideal')); S.company = company; if (ai) S.ai = 'all';
    const m = ECO.build(B, 7); ECO.warm(m, 20); const o = m.outN; ECO.warm(m, weeks);
    return { out: (m.outN - o) / weeks / m.idealOut, L: ECO.backlogOf(m), lead: (m.wipAvg / m.mainRate) * ECO.DAYS, m };
  };
  for (const co of ['service', 'product']) {
    const a = run(false, co), b = run(true, co);
    chk(`Ideal + AI everywhere (${co})`, b.out > 0.95 && b.out < 1.05 && b.L <= 3 && b.lead < a.lead, `out ${b.out.toFixed(2)}× (AI off ${a.out.toFixed(2)}×), backlog ${b.L} jobs, lead ${b.lead.toFixed(1)} d vs ${a.lead.toFixed(1)} d`);
  }
  ECO.startSettings(B, B.data.presets.find((x) => x.id === 'ideal')); S.company = 'product';
  const m = ECO.build(B, 7), r = ECO.solve(m, S);
  chk('Q108 Product company Ideal at most 70 % busy (Q121: centers sized up for Realistic run lower)', Object.values(r.rho).every((x) => x <= 0.7 + 1e-6), Object.entries(r.rho).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(' '));
  for (const id of ['tire', 'gate', 'teams']) for (const co of ['service', 'product']) {
    const B2 = ECO.builtinBundle(id); B2.data.company = co; ECO.startSettings(B2, B2.data.presets.find((x) => x.id === 'realistic'));
    const m2 = ECO.build(B2), r2 = ECO.solve(m2, ECO.realisticSettings(B2, co)), mx = Math.max(...Object.values(r2.rho), ...Object.values(r2.persons));
    const ri = ECO.solve(m2, { ...ECO.IDEAL(m2), company: co }), mi = Math.max(...m2.centers.filter((x) => !x.def.person).map((x) => ri.rho[x.id]));
    const bnId = B2.data.bottleneck, bnN = m2.nodes.get(bnId), bnRho = bnN.def.person ? r2.persons[bnN.def.person] : r2.rho[bnId];
    const others = m2.centers.filter((x) => x !== bnN && !(bnN.def.person && x.def.person === bnN.def.person)).map((x) => (x.def.person ? r2.persons[x.def.person] : r2.rho[x.id]));
    const mo = Math.max(...others);
    chk(`Q93/Q121 sizing ${id} ${co}`, bnRho <= ECO.RHO_BN + 1e-6 && mo <= ECO.RHO_OTHER + 1e-6 && mi <= 0.7 + 1e-6, `Realistic bottleneck ${bnId} ρ ${bnRho.toFixed(2)} (≤ ${ECO.RHO_BN}), others max ${mo.toFixed(2)} (≤ ${ECO.RHO_OTHER}), Ideal max ρ ${mi.toFixed(2)}`);
  }
  // internal tickets scale with AI extra tasks (Q110)
  ECO.startSettings(B, B.data.presets.find((x) => x.id === 'ideal')); S.company = 'product';
  const m3 = ECO.build(B), base = ECO.solve(m3, S).own; S.ai = ['pm']; S.over.pm = { aiExtra: 2 };
  const own2 = ECO.solve(m3, S).own;
  chk('Q110 own tickets scale with AI extra tasks', own2 > base * 1.2, `own shipped a week ${base.toFixed(2)} → ${own2.toFixed(2)} with PM AI 2× extra (roadmap 2 → 4 a week)`);
  // Q115: a file whose Realistic sizing needs more than 1.5x the Ideal capacity is refused, naming the center
  for (const co of ['service', 'product']) {
    const Bx = ECO.builtinBundle('tire'), sup = Bx.data.centers.find((x) => x.id === 'support');
    sup.realistic = [60, 95]; S.company = co;
    const r = ECO.stability(ECO.build(Bx)).refuse.filter((t) => t.includes('Ideal capacity'));
    chk(`Q115 oversized center refused (${co})`, r.length === 1 && r[0].startsWith('support:'), r.join('; ') || 'not refused');
  }
  for (const id of ['tire', 'gate', 'teams']) for (const co of ['service', 'product']) {
    const Bx = ECO.builtinBundle(id); S.company = co;
    const st = ECO.stability(ECO.build(Bx)), r = st.refuse;
    chk(`Q115 built-in ${id} accepted (${co})`, r.length === 0, r.join('; ') || (() => { const mb = ECO.build(Bx), q = Math.max(...mb.centers.map((n) => n.muQ93 / n.muIdeal)), c = Math.max(...mb.centers.map((n) => n.mu / n.muIdeal)); return `Q93 sizing at most ${q.toFixed(2)}× Ideal capacity (≤ 1.5); with the Q121 margin the line has up to ${c.toFixed(2)}×; rush warnings ${st.warn.filter((t) => t.includes('rushes (')).length}`; })());
  }
  // Q114 B: the worst case and the rushing pass take the rush into account
  {
    S.company = 'service'; const mb = ECO.build(B), st = ECO.stability(mb), e = (r) => r.rho.eng, u = (r) => r.rho.support;
    const w0 = ECO.solve(mb, ECO.realisticSettings(B, 'service'), { worst: true, rush: false });
    chk('Q114 B stability accounts for rushing', e(st.rush) > e(st.nominal) && u(st.worst) > u(w0), `eng ρ nominal ${e(st.nominal).toFixed(2)} → rushing ${e(st.rush).toFixed(2)}; worst case support ρ ${u(w0).toFixed(2)} without rush → ${u(st.worst).toFixed(2)} with`);
  }
  // determinism: the same scenario twice gives the same values
  const a = JSON.stringify(ECO.runScenario(B, 'bug-spiral')), b = JSON.stringify(ECO.runScenario(B, 'bug-spiral'));
  chk('Determinism (bug spiral twice)', a === b, a === b ? 'identical' : 'differs');
}

// ---------- Model invariants carried over from round 6 (Q123: checks6r7.mjs retired) ----------
// Not carried over, because checks above cover them: 11a batch means (Q121 300-week Realistic), 11c stability contract
// (Q93/Q121 sizing, Q115, Q114 B), 11f preset bands (ai-unbalanced and ai-balanced expects), 6 Determinism (bug spiral twice).
{
const S = ECO.S;
const fmt = (x, d = 2) => (typeof x === 'number' ? x.toFixed(d) : x);
const report = (name, ok, detail) => chk(name, ok, detail.replace(/\n\s+/g, ' '));
// a scenario whose tour sets AI or dials in a step is checked in its end state (the sets folded into the preset)
const BB = (id) => { const B = ECO.builtinBundle(id); for (const p of B.data.presets) for (const st of p.tour || []) { const x = st.set || {}; if (x.ai !== undefined) p.ai = x.ai; for (const [c, o] of Object.entries(x.dials || {})) p.dials = { ...(p.dials || {}), [c]: { ...((p.dials || {})[c] || {}), ...o } }; } S.company = B.data.company || 'service'; return B; };
const UCS = ['tire', 'gate', 'teams'];
function setPreset(uc, pid) {
  const B = BB(uc), p = B.data.presets.find((x) => x.id === pid);
  Object.assign(S, { bundle: B, aiq: 'same', mech: { rework: true, churn: true, complaints: true }, strength: { ...ECO.MECH_DEFAULTS(), ...(B.data.mechanics || {}) } }, ECO.presetSettings(B, p));
  return B;
}
const W = 480; // steps a week
function run(m, weeks, each) { for (let i = 0, n = Math.round(weeks * W); i < n; i++) { ECO.step(m); if (each) each(m, i); } }
const maxWeeks = (m) => Math.max(...m.centers.map((n) => ECO.weeksOfWork(n)));
const worstCenter = (m) => m.centers.reduce((a, n) => (ECO.weeksOfWork(n) > ECO.weeksOfWork(a) ? n : a));
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const sd = (a) => { const m = mean(a); return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / (a.length - 1)); };
// output and satisfaction over a window: fulfilled requests a week relative to ideal; good releases minus complaints out of all releases
function measure(m, weeks) {
  const o0 = m.outN, t0 = m.t; let G = 0, Bd = 0, C = 0;
  run(m, weeks, (mm) => { G += mm.rel[1]; Bd += mm.rel[0]; C += mm.compl; });
  return { rel: (m.outN - o0) / (m.t - t0) / m.idealOut, sat: G + Bd > 0 ? Math.max(0, G - C) / (G + Bd) : 1 };
}

// 0. Every handoff takes a quarter working day, whatever the belt length
for (const uc of UCS) {
  const m = ECO.build(BB(uc)), Ts = new Set(m.edges.map((e) => e.T)), Ls = m.edges.map((e) => e.path.L);
  report(`0 Fixed handoff time · ${uc}`, Ts.size === 1 && Math.abs([...Ts][0] - 0.05) < 1e-12, `${m.edges.length} belts, every one ${fmt([...Ts][0] * 5, 2)} working days; belt lengths ${Math.round(Math.min(...Ls))} to ${Math.round(Math.max(...Ls))} layout units, so documents ride ${fmt(Math.max(...Ls) / Math.min(...Ls), 1)}× faster on the longest`);
}

// 1. Ideal, 200 weeks: every backlog at most 3, output = ideal, every release good
for (const uc of UCS) {
  const B = setPreset(uc, 'ideal'), m = ECO.build(B);
  let maxL = 0;
  run(m, 100);
  const r = measure(m, 100);
  run(m, 0); m.centers.forEach(() => {});
  const m2 = ECO.build(B); run(m2, 100); run(m2, 100, (mm) => { for (const n of mm.centers) maxL = Math.max(maxL, n.L); });
  report(`1 Ideal 200 weeks · ${uc}`, maxL <= 3 && Math.abs(r.rel - 1) < 0.03 && r.sat === 1, `largest backlog in weeks 100-200: ${maxL} (≤ 3); fulfilled ${fmt(r.rel, 3)}× the ideal rate of ${fmt(m.idealOut, 2)} requests a week (1.00 ± 0.03); satisfied ${Math.round(r.sat * 100)} %`);
}

// 1b. Output counts fulfilled requests only: Realistic is below ideal, though more documents reach the Customer
for (const uc of UCS) {
  const rels = [], docs = [];
  for (let seed = 1; seed <= 10; seed++) {
    const B = setPreset(uc, 'realistic'), m = ECO.build(B, seed * 7919); run(m, 60);
    const c0 = m.consumed, o0 = m.outN; let a0 = 0;
    const r = measure(m, 40); rels.push(r.rel);
    docs.push(m.cust.ins.length);
  }
  const B = setPreset(uc, 'realistic'), m = ECO.build(B, 5); run(m, 60);
  let arr = 0; const o0 = m.outN; run(m, 40, (mm) => { arr += mm.arrRate / W; });
  const sol = ECO.solve(m, S).out / m.idealOut;
  report(`1b Realistic output below ideal · ${uc}`, mean(rels) < 0.98 && sol < 1 && mean(rels) > 0.85, `fulfilled requests: traffic solve ${fmt(sol)}× ideal; simulated mean ${fmt(mean(rels))}× over 10 seeds (< 1), single 40-week windows ${fmt(Math.min(...rels))}-${fmt(Math.max(...rels))}×; documents reaching the Customer ${fmt(arr / 40, 1)} a week against ${fmt((m.outN - o0) / 40, 1)} fulfilled requests: extra documents, rework and answers to complaints are not output`);
}

// 11b. Congestion: Realistic with AI unbalanced and the upstream centers at 200 % for 5 weeks, then Ideal: at most one week of work within 30 weeks
for (const uc of UCS) {
  const B = setPreset(uc, 'realistic'), m = ECO.build(B);
  run(m, 60);
  const unb = B.data.presets.find((p) => p.id === 'ai-unbalanced');
  const up = new Set();
  for (const id of unb.ai) for (const e of m.nodes.get(id).ins) if (e.from.kind === 'role') up.add(e.from.id);
  S.ai = unb.ai; S.over = Object.fromEntries([...up].map((id) => [id, { eff: 200 }]));
  run(m, 5);
  const peak = maxWeeks(m), who = worstCenter(m).id;
  Object.assign(S, ECO.presetSettings(B, B.data.presets.find((p) => p.id === 'ideal')));
  let w = 0; while (maxWeeks(m) > 1 && w < 200) { run(m, 0.5); w += 0.5; }
  const B2 = setPreset(uc, 'realistic'), m2 = ECO.build(B2); run(m2, 60); S.ai = unb.ai; S.over = Object.fromEntries([...up].map((id) => [id, { eff: 200 }])); run(m2, 15);
  const peak15 = maxWeeks(m2), who15 = worstCenter(m2).id;
  Object.assign(S, ECO.presetSettings(B2, B2.data.presets.find((p) => p.id === 'ideal')));
  let w15 = 0; while (maxWeeks(m2) > 1 && w15 < 400) { run(m2, 1); w15 += 1; }
  const B3 = setPreset(uc, 'realistic'), m3 = ECO.build(B3); run(m3, 60); S.ai = unb.ai; S.over = Object.fromEntries([...up].map((id) => [id, { eff: 200 }])); run(m3, 15);
  Object.assign(S, ECO.presetSettings(B3, B3.data.presets.find((p) => p.id === 'ideal')));
  S.over = { [who15]: { eff: 1000 } };
  let wf = 0; while (maxWeeks(m3) > 1 && wf < 400) { run(m3, 0.5); wf += 0.5; }
  report(`11b Congestion drains after Ideal · ${uc}`, w <= 30, `5 weeks of AI at ${unb.ai.join(', ')} with ${[...up].join(', ') || 'no upstream center'} at 200 %: peak ${fmt(peak, 1)} weeks of work at ${who}; Ideal brings every center to ≤ 1 week in ${w} weeks (≤ 30).
      For the hint: after 15 weeks of the same, ${fmt(peak15, 1)} weeks of work at ${who15}; Ideal alone takes ${w15 >= 400 ? '> 400' : w15} weeks; Ideal with ${who15} at 1000 % takes ${wf} weeks.`);
}

// 11g. The follow-up loop: fewer than one new request per request, in every preset; a file whose chances add up to 1 or more is refused
for (const uc of UCS) {
  const B = BB(uc), m = ECO.build(B), parts = [];
  let ok = true;
  for (const p of B.data.presets.filter((x) => x.view === 'factory')) {
    setPreset(uc, p.id); const r = ECO.solve(m, S);
    parts.push(`${p.id} ${fmt(r.gain, 3)}`); ok &&= r.converged && r.gain < 1;
  }
  report(`11g Follow-up loop under 1 · ${uc}`, ok, `follow-up requests per request: ${parts.join(', ')}`);
}
{
  const doc = ECO.YAML.parse(ECO.YAML.stringify({ ...BB('tire').data, i18n: { en: { name: 'x' } } }));
  doc.customer.good = { pm: 0.7, sales: 0.4 };
  const errs = ECO.validate(doc);
  report('11g A file whose follow-ups never settle is refused', errs.some((x) => x.startsWith('customer.good')), JSON.stringify(errs));
}

// 11d. Conservation across a mid-run dial change: created = received or finished + waiting + on belts + in work
{
  const B = setPreset('tire', 'realistic'), m = ECO.build(B);
  const gaps = [];
  run(m, 20); gaps.push(ECO.conservation(m));
  S.ai = 'all'; S.over = { eng: { eff: 1000 }, qa: { eff: 25 } }; S.cust = { ...S.cust, rate: 14, mode: 'random', mix: { sales: 10, pm: 10, support: 80 } };
  run(m, 7.37); gaps.push(ECO.conservation(m));
  S.mech.rework = false; S.mech.complaints = false; S.reality = 0;
  run(m, 13.1); gaps.push(ECO.conservation(m));
  report('11d Conservation across dial changes', gaps.every((g) => g.gap === 0), gaps.map((g) => `created ${g.created} = received or done ${g.consumed} + waiting ${g.backlog} + on belts ${g.transit} + in work ${g.work} (gap ${g.gap})`).join('\n      '));
}

// 11e. Clear starts empty at day 0
{
  const B = setPreset('tire', 'realistic'), m = ECO.build(B);
  const c = ECO.conservation(m);
  report('11e Clear starts empty at day 0', c.created === 0 && c.backlog === 0 && c.transit === 0 && c.work === 0 && m.t === 0, `after build: day ${m.t * 5}, created ${c.created}, waiting ${c.backlog}, on belts ${c.transit}, in work ${c.work}`);
}

// 3. AI upstream: the downstream backlog grows roughly linearly, the AI centers put out more, fulfilled requests do not rise
for (const uc of UCS) {
  const Br = setPreset(uc, 'realistic'), mr = ECO.build(Br); run(mr, 60);
  const unb = Br.data.presets.find((p) => p.id === 'ai-unbalanced');
  const outR = mean(unb.ai.map((id) => { const n = mr.nodes.get(id); return n.rate.out[0] + n.rate.out[1]; }));
  const relR = measure(mr, 40).rel;
  const B = setPreset(uc, 'ai-unbalanced'), m = ECO.build(B);
  const xs = [], ys = [];
  let o0 = 0, t0 = 0;
  for (let w = 0; w <= 80; w += 10) { if (w) run(m, 10); if (w === 20) { o0 = m.outN; t0 = m.t; } if (w >= 20) { xs.push(w); ys.push(ECO.backlogOf(m)); } }
  const mx = mean(xs), my = mean(ys), b = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0) / xs.reduce((a, x) => a + (x - mx) ** 2, 0);
  const r2 = 1 - xs.reduce((a, x, i) => a + (ys[i] - (my + b * (x - mx))) ** 2, 0) / ys.reduce((a, y) => a + (y - my) ** 2, 0);
  const outA = mean(unb.ai.map((id) => { const n = m.nodes.get(id); return n.rate.out[0] + n.rate.out[1]; }));
  const rel = (m.outN - o0) / (m.t - t0) / m.idealOut;
  report(`3 AI upstream floods downstream · ${uc}`, r2 > 0.95 && b > 0 && rel <= relR,
    `backlog grows ${fmt(b, 1)} jobs a week, linear fit R² ${fmt(r2, 3)} (> 0.95); documents out of ${unb.ai.join(', ')} ${fmt(outA / outR)}× Realistic (reported, not judged since Q121); fulfilled requests ${fmt(rel)}× ideal against Realistic's ${fmt(relR)}× (no gain)`);
}

// 5. Bottleneck shift: in AI unbalanced, the bottleneck (its person too) at 1000 % drains, and the largest backlog moves downstream or output rises
const downstream = (m, id) => { const seen = new Set(), st = [m.nodes.get(id)]; while (st.length) { const n = st.pop(); for (const e of n.outs) if (e.to.kind === 'role' && !e.loop && !seen.has(e.to.id)) { seen.add(e.to.id); st.push(e.to); } } return seen; };
for (const uc of UCS) {
  const B = setPreset(uc, 'ai-unbalanced'), m = ECO.build(B); run(m, 30);
  const bn = worstCenter(m), before = ECO.weeksOfWork(bn);
  const team = m.centers.filter((n) => n === bn || (bn.def.person && n.def.person === bn.def.person)).map((n) => n.id);
  const relBefore = measure(m, 10).rel;
  for (const id of team) S.over[id] = { ...(S.over[id] || {}), eff: 1000 };
  run(m, 20); const relAfter = measure(m, 10).rel;
  const after = worstCenter(m), wAfter = ECO.weeksOfWork(after), down = downstream(m, bn.id);
  const drained = team.every((id) => ECO.weeksOfWork(m.nodes.get(id)) < 1);
  const moved = wAfter > 1 && down.has(after.id), out = relAfter > relBefore * 1.2;
  report(`5 Bottleneck shift · ${uc}`, drained && (moved || out),
    `AI unbalanced: ${team.join(' + ')} the bottleneck (${fmt(before, 1)} weeks of work at ${bn.id}); 30 weeks after raising it to 1000 %: ${team.map((id) => `${id} ${fmt(ECO.weeksOfWork(m.nodes.get(id)), 1)}`).join(', ')} weeks of work; largest backlog now ${after.id} (${fmt(wAfter, 1)} weeks${down.has(after.id) ? ', downstream' : ''}); fulfilled ${fmt(relBefore)}× → ${fmt(relAfter)}× ideal`);
}

// 6. Determinism: same seed and inputs, same state after 100 weeks; another seed differs
{
  const h = (seed) => { const B = setPreset('tire', 'realistic'), m = ECO.build(B, seed); run(m, 100); return ECO.stateHash(m); };
  const a = h(42), b = h(42), c = h(43);
  report('6 Determinism', a === b && a !== c, `seed 42: ${a} and ${b}; seed 43: ${c}`);
}
{ // separate streams: switching rework off changes the work, not the Customer's requests
  const reqs = (rework) => { const B = setPreset('tire', 'realistic'); S.mech.rework = rework; const m = ECO.build(B, 9); const L = []; m.hook = (t, c, e, at) => { if (t === 'request') L.push(`${e.i}@${at.toFixed(6)}`); }; run(m, 20); return { L: L.join(','), n: L.length, h: ECO.stateHash(m) }; };
  const x = reqs(true), y = reqs(false);
  report('6 Separate streams', x.L === y.L && x.h !== y.h, `${x.n} Customer requests over 20 weeks, with rework on vs off: identical times and targets ${x.L === y.L}; the rest of the state differs ${x.h !== y.h}`);
}

// Q121: Realistic stays busy but coping while centers rush: 300 weeks x 10 seeds, no center ends beyond 2 weeks of work
for (const uc of UCS) for (const co of ['service', 'product']) {
  const B = ECO.builtinBundle(uc), p = B.data.presets.find((x) => x.id === 'realistic'); const ends = [];
  let worst = null;
  for (let seed = 1; seed <= 10; seed++) {
    ECO.startSettings(B, p); S.company = co; const m = ECO.build(B, seed * 7919); ECO.warm(m, 300);
    const e = m.centers.reduce((a, n) => (n.Ws > a.Ws ? n : a)); ends.push(e.Ws); if (!worst || e.Ws > worst.w) worst = { w: e.Ws, id: e.id };
  }
  chk(`Q121 Realistic coping over 300 weeks · ${uc} ${co}`, Math.max(...ends) <= 2, `largest weeks of work waiting at week 300 over 10 seeds: ${fmt(worst.w)} at ${worst.id} (≤ 2); per seed ${ends.map((x) => fmt(x, 1)).join(' ')}`);
}
}
console.log(' #   result use   preset          step   week measure               test       = value');
console.log(rows.join('\n'));
console.log('\nModel checks');
console.log(extra.join('\n'));
console.log(`\n${n - fails} of ${n} pass${fails ? `, ${fails} fail` : ''}`);
process.exitCode = fails ? 1 : 0;
