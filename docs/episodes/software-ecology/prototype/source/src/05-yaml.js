  // ---------- YAML: the subset this Explorable reads and writes ----------
  // Block maps and lists, flow [..] and {..}, quoted and plain scalars, numbers, booleans, null, # comments.
  const YAML = (() => {
    class YamlError extends Error {}
    const stripComment = (s) => {
      let q = null;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (q) { if (q === '"' && c === '\\') { i++; continue; } if (c === q) q = null; }
        else if (c === '"' || c === "'") { if (i === 0 || /[\s\[{,:]/.test(s[i - 1])) q = c; }
        else if (c === '#' && (i === 0 || /\s/.test(s[i - 1]))) return s.slice(0, i);
      }
      return s;
    };
    const KEY = /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*'|[^\s"'\[\]{},#&*!|>%@`-][^:]*?|-[^\s:][^:]*?)\s*:(?:\s+(.*))?$/;
    const unq = (s) => (s[0] === '"' ? JSON.parse(s) : s[0] === "'" ? s.slice(1, -1).replace(/''/g, "'") : s);
    function scalar(s) {
      s = s.trim();
      if (s === '' || s === '~' || s === 'null') return null;
      if (s[0] === '"' || s[0] === "'") {
        if (s[s.length - 1] !== s[0] || s.length < 2) throw new YamlError(`unclosed quote in ${s}`);
        try { return unq(s); } catch { throw new YamlError(`bad string ${s}`); }
      }
      if (s === 'true') return true;
      if (s === 'false') return false;
      if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(s)) return Number(s);
      return s;
    }
    function flow(s) {
      let p = 0;
      const ws = () => { while (p < s.length && /\s/.test(s[p])) p++; };
      const tok = (stops) => {
        ws();
        const c = s[p];
        if (c === '"' || c === "'") {
          const st = p++;
          while (p < s.length && s[p] !== c) { if (c === '"' && s[p] === '\\') p++; p++; }
          if (p >= s.length) throw new YamlError('unclosed quote');
          p++;
          return s.slice(st, p);
        }
        const st = p;
        while (p < s.length && !stops.test(s[p])) p++;
        return s.slice(st, p).trim();
      };
      function val() {
        ws();
        if (s[p] === '[') {
          p++; const a = []; ws();
          if (s[p] === ']') { p++; return a; }
          for (;;) { a.push(val()); ws(); if (s[p] === ',') { p++; continue; } if (s[p] === ']') { p++; return a; } throw new YamlError(`expected , or ] in ${s}`); }
        }
        if (s[p] === '{') {
          p++; const o = {}; ws();
          if (s[p] === '}') { p++; return o; }
          for (;;) {
            const k = unq(tok(/[:,}\]]/)); ws();
            if (s[p] !== ':') throw new YamlError(`expected : after ${k}`);
            p++; o[k] = val(); ws();
            if (s[p] === ',') { p++; continue; }
            if (s[p] === '}') { p++; return o; }
            throw new YamlError(`expected , or } in ${s}`);
          }
        }
        return scalar(tok(/[,}\]]/));
      }
      const v = val(); ws();
      if (p < s.length) throw new YamlError(`unexpected "${s.slice(p)}"`);
      return v;
    }
    const value = (s) => (s[0] === '[' || s[0] === '{' ? flow(s) : scalar(s));

    function parse(text) {
      const lines = [];
      String(text).replace(/\t/g, '  ').split(/\r?\n/).forEach((raw, i) => {
        const s = stripComment(raw).replace(/\s+$/, '');
        const t = s.trim();
        if (t && t !== '---' && t !== '...') lines.push({ n: i + 1, ind: s.length - s.trimStart().length, t });
      });
      let i = 0;
      const fail = (m, l) => { throw new YamlError(`line ${l ? l.n : '?'}: ${m}`); };
      const isItem = (t) => t === '-' || t.startsWith('- ');
      const isKey = (t) => t[0] !== '[' && t[0] !== '{' && t[0] !== '"' && t[0] !== "'" ? KEY.test(t) : /^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*')\s*:(\s|$)/.test(t);
      function block(ind) { const l = lines[i]; return isItem(l.t) ? seq(l.ind) : map(l.ind); }
      function seq(ind) {
        const out = [];
        while (i < lines.length && lines[i].ind === ind && isItem(lines[i].t)) {
          const l = lines[i], rest = l.t === '-' ? '' : l.t.slice(2).trim();
          if (!rest) { i++; out.push(i < lines.length && lines[i].ind > ind ? block(lines[i].ind) : null); continue; }
          if (isKey(rest)) { lines[i] = { n: l.n, ind: ind + 2, t: rest }; out.push(map(ind + 2)); continue; }
          i++;
          try { out.push(value(rest)); } catch (e) { fail(e.message, l); }
        }
        if (i < lines.length && lines[i].ind > ind) fail('unexpected indentation', lines[i]);
        return out;
      }
      function map(ind) {
        const out = {};
        while (i < lines.length && lines[i].ind === ind) {
          const l = lines[i];
          if (isItem(l.t)) fail('a list item where a key was expected', l);
          const m = KEY.exec(l.t);
          if (!m) fail(`expected "key: value", found "${l.t}"`, l);
          const k = unq(m[1]), rest = (m[2] || '').trim();
          if (k in out) fail(`duplicate key "${k}"`, l);
          i++;
          if (rest) { try { out[k] = value(rest); } catch (e) { fail(e.message, l); } continue; }
          const nx = lines[i];
          out[k] = nx && (nx.ind > ind || (nx.ind === ind && isItem(nx.t))) ? block(nx.ind) : null;
        }
        if (i < lines.length && lines[i].ind > ind) fail('unexpected indentation', lines[i]);
        return out;
      }
      if (!lines.length) return null;
      const doc = block(lines[0].ind);
      if (i < lines.length) fail('unexpected text', lines[i]);
      return doc;
    }

    // ---- stringify ----
    const RESERVED = /^(true|false|null|~|yes|no|on|off)$/i;
    const str = (s) => (/^[A-Za-zÀ-ž(][^:#\[\]{},"\n]*$/.test(s) && !/\s$/.test(s) && !RESERVED.test(s) && !/: /.test(s) ? s : JSON.stringify(s));
    const keyS = (k) => (/^[A-Za-z_][\w-]*$/.test(k) ? k : JSON.stringify(k));
    const sc = (v) => (v === null || v === undefined ? 'null' : typeof v === 'string' ? str(v) : typeof v === 'number' ? String(Math.round(v * 10000) / 10000) : String(v));
    const isSc = (v) => v === null || typeof v !== 'object';
    function inline(v) {
      if (isSc(v)) return sc(v);
      if (Array.isArray(v)) return `[${v.map(inline).join(', ')}]`;
      return `{ ${Object.entries(v).map(([k, x]) => `${keyS(k)}: ${inline(x)}`).join(', ')} }`;
    }
    const scList = (x) => Array.isArray(x) && x.every((y) => isSc(y) || (Array.isArray(y) && y.every(isSc)));
    const flat = (v) => isSc(v) || (Array.isArray(v) ? v.every((x) => isSc(x) || scList(x)) : Object.values(v).every((x) => isSc(x) || scList(x)));
    function emit(v, ind, notes, path) {
      const pad = ' '.repeat(ind), out = [];
      const note = (p) => (notes && notes[p] ? `  # ${notes[p]}` : '');
      if (Array.isArray(v)) {
        for (const x of v) {
          if (isSc(x) || (flat(x) && inline(x).length + ind < 120)) { out.push(`${pad}- ${inline(x)}`); continue; }
          const sub = emit(x, ind + 2, notes, path + '[]');
          out.push(`${pad}- ${sub[0].trimStart()}`, ...sub.slice(1));
        }
        return out;
      }
      for (const [k, x] of Object.entries(v)) {
        const p = path ? `${path}.${k}` : k;
        if (notes && notes[`#${p}`]) out.push(`${pad}# ${notes[`#${p}`]}`);
        if (isSc(x)) out.push(`${pad}${keyS(k)}: ${sc(x)}${note(p)}`);
        else if ((Array.isArray(x) ? !x.length : !Object.keys(x).length) || (flat(x) && inline(x).length + ind + k.length < 110)) out.push(`${pad}${keyS(k)}: ${inline(x)}${note(p)}`);
        else out.push(`${pad}${keyS(k)}:${note(p)}`, ...emit(x, ind + 2, notes, p));
      }
      return out;
    }
    const stringify = (v, notes) => emit(v, 0, notes, '').join('\n') + '\n';
    return { parse, stringify, YamlError };
  })();
