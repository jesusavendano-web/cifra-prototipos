// Cifra · Alerts (prototipo ENG-2595)
// Datos, reglas, preview y "Describe your alert" para schedules.html y alert.html.
// Los cambios se guardan en sessionStorage para que la lista y el formulario compartan estado.

(function () {
  const METRICS = {
    net_sales:       { label: 'Net sales',           unit: 'money',   base: 4200, vol: .16 },
    total_orders:    { label: 'Total orders',        unit: 'count',   base: 62,   vol: .18 },
    gross_profit:    { label: 'Gross profit',        unit: 'money',   base: 1900, vol: .2 },
    aov:             { label: 'Average order value', unit: 'money',   base: 68,   vol: .08 },
    roas:            { label: 'ROAS',                unit: 'ratio',   base: 2.6,  vol: .22 },
    ad_spend:        { label: 'Ad spend',            unit: 'money',   base: 850,  vol: .15 },
    conversion_rate: { label: 'Conversion rate',     unit: 'percent', base: 2.4,  vol: .14 },
    sessions:        { label: 'Sessions',            unit: 'count',   base: 2600, vol: .15 },
  };
  const CONDITIONS = {
    drops_pct: { label: 'Drops by %',      verb: 'drops',       pct: true },
    rises_pct: { label: 'Increases by %',  verb: 'increases',   pct: true },
    below:     { label: 'Falls below',     verb: 'falls below', pct: false },
    above:     { label: 'Goes above',      verb: 'goes above',  pct: false },
  };
  const WINDOWS = {
    day:   { label: 'Daily',   noun: 'a day',   prev: 'the day before',   points: 30, unit: 'days',   per: 'day' },
    week:  { label: 'Weekly',  noun: 'a week',  prev: 'the week before',  points: 12, unit: 'weeks',  per: 'week' },
    month: { label: 'Monthly', noun: 'a month', prev: 'the month before', points: 12, unit: 'months', per: 'month' },
  };

  // ---------------------------------------------------------------- store
  const SEED = [
    { id: 's1', type: 'schedule', name: 'Net sales drop 20%', status: 'active', lastSent: 'N/A', next: 'November 11, 2026 8:00 AM', author: null },
    { id: 's2', type: 'schedule', name: 'demo', status: 'active', lastSent: 'N/A', next: 'November 10, 2026 12:00 PM', author: 'Julio Flores' },
    { id: 'a1', type: 'alert', name: 'Weekly total orders drop 20%', status: 'active', lastSent: 'Not yet', author: null, createdVia: 'chat',
      rule: { metric: 'total_orders', condition: 'drops_pct', value: 20, window: 'week' },
      channel: 'email', recipients: ['jesus.avendano@getcifra.com'], slackChannel: '#alerts', hour: 8, ampm: 'am', once: true },
  ];
  const KEY = 'cifra-alerts-v1';
  function load() {
    try { const s = sessionStorage.getItem(KEY); if (s) return JSON.parse(s); } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function save(items) { try { sessionStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function flash(msg) { try { sessionStorage.setItem(KEY + ':toast', msg); } catch (e) {} }
  function takeFlash() { try { const m = sessionStorage.getItem(KEY + ':toast'); sessionStorage.removeItem(KEY + ':toast'); return m; } catch (e) { return null; } }

  // ---------------------------------------------------------------- texto
  const lc = (s) => s.replace(/^[A-Z](?=[a-z])/, (m) => m.toLowerCase());
  function unitSuffix(rule) {
    if (CONDITIONS[rule.condition].pct) return '%';
    const u = METRICS[rule.metric].unit;
    return u === 'percent' ? '%' : u === 'ratio' ? 'x' : '';
  }
  function unitPrefix(rule) {
    return !CONDITIONS[rule.condition].pct && METRICS[rule.metric].unit === 'money' ? '$' : '';
  }
  function fmtRuleValue(rule) {
    const v = Number(rule.value);
    const n = METRICS[rule.metric].unit === 'money' && !CONDITIONS[rule.condition].pct ? v.toLocaleString('en-US') : v;
    return unitPrefix(rule) + n + unitSuffix(rule);
  }
  function ruleText(rule) {
    const m = METRICS[rule.metric], c = CONDITIONS[rule.condition], w = WINDOWS[rule.window];
    if (c.pct) return `${m.label} of ${w.noun} ${c.verb} ${rule.value}% or more vs ${w.prev}`;
    return `${m.label} of ${w.noun} ${c.verb} ${fmtRuleValue(rule)}`;
  }
  function autoName(rule) {
    const m = METRICS[rule.metric], c = CONDITIONS[rule.condition];
    const per = WINDOWS[rule.window].label;
    if (c.pct) return `${per} ${lc(m.label)} ${rule.condition === 'drops_pct' ? 'drop' : 'increase'} ${rule.value}%`;
    return `${m.label} ${c.verb} ${fmtRuleValue(rule)}`;
  }
  function fmt(metric, v) {
    const u = METRICS[metric].unit;
    if (u === 'money') return '$' + Math.round(v).toLocaleString('en-US');
    if (u === 'percent') return v.toFixed(2) + '%';
    if (u === 'ratio') return v.toFixed(2);
    return Math.round(v).toLocaleString('en-US');
  }

  // ---------------------------------------------------------------- serie de ejemplo + evaluación
  function rng(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  const isRate = (k) => ['aov', 'roas', 'conversion_rate'].includes(k);
  function scaleFor(metric, window) { return isRate(metric) ? 1 : { day: 1, week: 7, month: 30 }[window]; }
  function series(metric, window) {
    const m = METRICS[metric], n = WINDOWS[window].points + 1;
    const base = m.base * scaleFor(metric, window);
    const r = rng(Object.keys(METRICS).indexOf(metric) * 97 + n * 13 + 7);
    const out = [];
    for (let i = 0; i < n; i++) {
      let v = base * (1 + (r() - .5) * 2 * m.vol * (window === 'day' ? 1 : .6));
      if (i === Math.floor(n * .35)) v *= .68;
      if (i === Math.floor(n * .8)) v *= .74;
      if (i === Math.floor(n * .6)) v *= 1.32;
      out.push(v);
    }
    return out;
  }
  function evaluate(rule) {
    const s = series(rule.metric, rule.window);
    const hits = [];
    const v = Number(rule.value) || 0;
    for (let i = 1; i < s.length; i++) {
      const cur = s[i], prev = s[i - 1];
      let hit = false;
      if (rule.condition === 'drops_pct') hit = (prev - cur) / prev * 100 >= v;
      if (rule.condition === 'rises_pct') hit = (cur - prev) / prev * 100 >= v;
      if (rule.condition === 'below') hit = cur < v;
      if (rule.condition === 'above') hit = cur > v;
      if (hit) hits.push(i);
    }
    return { s, hits };
  }
  function pointDate(window, i, n) {
    const d = new Date(2026, 10, 9);
    const back = n - 1 - i;
    if (window === 'day') d.setDate(d.getDate() - back);
    if (window === 'week') d.setDate(d.getDate() - back * 7);
    if (window === 'month') d.setMonth(d.getMonth() - back);
    return d;
  }
  function pointLabel(window, i, n, long) {
    const d = pointDate(window, i, n);
    if (window === 'month') return d.toLocaleDateString('en-US', { month: long ? 'long' : 'short', year: 'numeric' });
    const s = d.toLocaleDateString('en-US', { month: long ? 'long' : 'short', day: 'numeric', year: long ? 'numeric' : undefined });
    return (window === 'week' ? 'Week of ' : '') + s;
  }

  // ---------------------------------------------------------------- gráfica (mismo look que CifraCharts.lineChart)
  function niceTicks(min, max, count = 4) {
    const span = max - min || 1;
    const step0 = span / count, mag = Math.pow(10, Math.floor(Math.log10(step0)));
    const step = [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= step0) || step0;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    const out = []; for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(6)); return out;
  }
  function chart(rule, width) {
    const { s, hits } = evaluate(rule);
    const c = CONDITIONS[rule.condition];
    const W = Math.max(320, Math.round(width || 600)), H = 220, L = 56, R = 12, T = 12, B = 28;
    const thr = Number(rule.value);
    const all = c.pct ? s : s.concat([thr]);
    const ticks = niceTicks(Math.min(...all) * .9, Math.max(...all) * 1.05);
    const min = ticks[0], max = ticks[ticks.length - 1];
    const sx = (i) => L + (i / (s.length - 1)) * (W - L - R);
    const sy = (v) => T + (1 - (v - min) / (max - min || 1)) * (H - T - B);
    let g = '';
    ticks.forEach((v) => {
      g += `<line x1="${L}" x2="${W - R}" y1="${sy(v)}" y2="${sy(v)}" stroke="var(--c-chart-grid)"/>`;
      g += `<text x="${L - 8}" y="${sy(v) + 4}" text-anchor="end">${fmt(rule.metric, v)}</text>`;
    });
    [0, Math.floor((s.length - 1) / 2), s.length - 1].forEach((i, k) => {
      g += `<text x="${sx(i)}" y="${H - 8}" text-anchor="${k === 0 ? 'start' : k === 2 ? 'end' : 'middle'}">${pointLabel(rule.window, i, s.length)}</text>`;
    });
    const bw = (W - L - R) / (s.length - 1);
    hits.forEach((i) => { g += `<rect x="${sx(i) - bw / 2}" y="${T}" width="${bw}" height="${H - T - B}" fill="rgba(197,31,31,.07)"/>`; });
    const pts = s.map((v, i) => `${sx(i).toFixed(1)},${sy(v).toFixed(1)}`);
    g += `<path d="M${pts.join(' L')} L${sx(s.length - 1)},${sy(min)} L${sx(0)},${sy(min)} Z" fill="var(--c-chart-area)"/>`;
    g += `<polyline points="${pts.join(' ')}" fill="none" stroke="var(--c-chart-1)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    if (!c.pct) g += `<line x1="${L}" x2="${W - R}" y1="${sy(thr)}" y2="${sy(thr)}" stroke="var(--c-negative)" stroke-width="1.5" stroke-dasharray="4 4"/>`;
    hits.forEach((i) => { g += `<circle cx="${sx(i)}" cy="${sy(s[i])}" r="4.5" fill="var(--c-negative)" stroke="#fff" stroke-width="2"><title>${pointLabel(rule.window, i, s.length, true)} · ${fmt(rule.metric, s[i])}</title></circle>`; });
    return `<svg class="c-chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${METRICS[rule.metric].label}: ${hits.length} alerts in the last ${s.length - 1} ${WINDOWS[rule.window].unit}">${g}</svg>`;
  }

  // ---------------------------------------------------------------- "Describe your alert" (IA simulada)
  function parsePrompt(text) {
    const t = text.toLowerCase();
    const rule = {};
    const out = { rule, channel: null, recipients: [] };
    const map = [
      [/roas|return on ad/, 'roas'],
      [/aov|average order|ticket promedio|valor promedio/, 'aov'],
      [/conversion|conversi[oó]n/, 'conversion_rate'],
      [/sessions?|sesiones|visitas|traffic|tr[aá]fico/, 'sessions'],
      [/ad spend|spend|gasto|inversi[oó]n/, 'ad_spend'],
      [/gross profit|profit|ganancia|beneficio|margen/, 'gross_profit'],
      [/orders?|pedidos|[oó]rdenes/, 'total_orders'],
      [/net sales|sales|ventas|revenue|ingresos|facturaci[oó]n/, 'net_sales'],
    ];
    for (const [re, k] of map) if (re.test(t)) { rule.metric = k; break; }
    const num = t.match(/(\d+(?:[.,]\d+)?)\s*(%|por ?ciento|percent)?/);
    const isPct = !!(num && num[2]);
    if (num) rule.value = parseFloat(num[1].replace(',', '.'));
    const down = /(drop|fall|decrease|declin|down|cae|caen|caiga|bajan?|baje|disminu)/.test(t);
    const up = /(rise|increase|grow|spike|jump|sube|suben|aumenta|crece|supera)/.test(t);
    const belowW = /(below|under|less than|por debajo|menos de|baja de|baje de)/.test(t);
    const aboveW = /(above|over|more than|exceed|por encima|m[aá]s de|supera)/.test(t);
    if (isPct) rule.condition = up && !down ? 'rises_pct' : 'drops_pct';
    else if (belowW || (down && num)) rule.condition = 'below';
    else if (aboveW || (up && num)) rule.condition = 'above';
    else if (down) rule.condition = 'drops_pct';
    else if (up) rule.condition = 'rises_pct';
    if (/week|semana/.test(t)) rule.window = 'week';
    else if (/month|mes\b|mensual/.test(t)) rule.window = 'month';
    else if (/day|daily|d[ií]a|diari/.test(t)) rule.window = 'day';
    if (/slack/.test(t)) out.channel = 'slack';
    else if (/email|e-mail|correo|mail/.test(t)) out.channel = 'email';
    const em = text.match(/[\w.+-]+@[\w-]+\.[\w.]+/g);
    if (em) out.recipients = em;
    return out;
  }

  // ---------------------------------------------------------------- toast (réplica de shopify.toast)
  function toast(msg) {
    let t = document.querySelector('.c-toast');
    if (!t) { t = document.createElement('div'); t.className = 'c-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg;
    t.dataset.show = 'true';
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.dataset.show = 'false'; }, 2800);
  }

  window.CifraAlerts = { METRICS, CONDITIONS, WINDOWS, load, save, flash, takeFlash, ruleText, autoName, fmt, fmtRuleValue, unitPrefix, unitSuffix, evaluate, pointLabel, chart, parsePrompt, toast, scaleFor, lc };
})();
