import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const here = new URL('.', import.meta.url).pathname;
const repo = '/Users/han/Developer/content-library/.worktrees/episode-software-ecology/.scratch/software-ecology';
const design = readFileSync(`${repo}/spec/play.preview/design.css`, 'utf8');
const css = readFileSync(`${here}style.css`, 'utf8');
const body = readFileSync(`${here}body.html`, 'utf8');
const data = Object.fromEntries(readdirSync(`${here}src/data`).filter((f) => f.endsWith('.yaml')).sort().map((f) => [f.replace(/\.yaml$/, ''), readFileSync(`${here}src/data/${f}`, 'utf8')]));
let js = readdirSync(`${here}src`).filter((f) => f.endsWith('.js')).sort().map((f) => readFileSync(`${here}src/${f}`, 'utf8')).join('\n');
js = js.replace('/*SRC*/{}', JSON.stringify(data, null, 1).replace(/<\/script/gi, '<\\/script'));
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Software ecology factory</title>
<!-- Prototype of the software ecology Explorable's Play slide, round 7 (feedback-07.md, grill-07.md): AI per work center, scenarios with tours and checks, the pile-up.
     Built by scratchpad proto3/build.mjs from style.css, body.html, src/*.js and the use-case YAML in src/data; design.css is the Spec's compiled site tokens, inlined. -->
<style>
${design}
</style>
<style>
${css}
</style>
</head>
<body>
${body}
<script>
${js}
</script>
</body>
</html>
`;
writeFileSync(`${repo}/prototype/flow.html`, html);
// The pure model for node checks: head, YAML, glyphs, data and model, without the DOM parts.
const pure = ['00-head.js', '05-yaml.js', '10-glyph.js', '20-data.js', '30-model.js', '35-scenario.js'].map((f) => readFileSync(`${here}src/${f}`, 'utf8')).join('\n')
  .replace(/^\(\(\) => \{/, '').replace('/*SRC*/{}', JSON.stringify(data));
writeFileSync(`${here}model.mjs`, `export const ECO = (() => {${pure}\nreturn { S, presetSettings, realisticSettings, build, step, warm, solve, size, stability, dials, signals, conservation, stateHash, weeksOfWork, leadTime, drain, backlogOf, inTransit, satRate, custOf, builtinBundle, validate, YAML, CATALOG, MECH_DEFAULTS, IDEAL, speedOf, HANDOFF, FLAGS: { FROM_SRC, REDO, COMPL, FAIL, MAIN, OWN }, RHO_REAL, RHO_BN, RHO_OTHER, DAYS, DTW, WARM_WEEKS, rushOf, RUSH_MAX, SIZE_MAX, runScenario, metric, judge, stepsOf, startSettings, applySet, stepsTo, validTest, validKey, get POOL() { return POOL; } };\n})();\n`);
console.log('wrote', html.length);
