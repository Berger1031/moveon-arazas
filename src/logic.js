// Domain logic for the Move-ON pricing app: job normalisation, billing, the time model,
// storage back-ends (browser-local and Supabase) and Excel row parsing.
export const LKEY = "moveon_v4_local",
  AKEY = "moveon_auth_v1",
  SKEY = "moveon_session_v1",
  MIN = 5;
export const newId = () =>
  window.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 3) | 8).toString(16);
      });
export const num = (v) => {
  const x = parseFloat(
    String(v ?? "")
      .replace(/\s/g, "")
      .replace(",", "."),
  );
  return isFinite(x) ? x : 0;
};
export const has = (v) => v !== "" && v != null && isFinite(parseFloat(String(v).replace(/\s/g, "").replace(",", ".")));
export const fq = (x) => Number(x).toLocaleString("hu-HU", { maximumFractionDigits: 1 });
export const ft = (x) => (x < 0 ? "−" : "") + Math.round(Math.abs(x)).toLocaleString("hu-HU") + " Ft";
export const sft = (x) => (x >= 0 ? "+" : "") + ft(x);
export const med = (a) => {
  const s = [...a].sort((x, y) => x - y),
    m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
export const mean = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);
export const clone = (o) => JSON.parse(JSON.stringify(o));
export const fdate = (d) => (d ? new Date(d + (String(d).length === 10 ? "T12:00" : "")).toLocaleDateString("hu-HU") : "");
export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const LOC = { bp: "Budapest", hu: "Vidék", int: "Külföld" };
export const defaultConfig = () => ({
  packages: [
    { id: "p0", name: "Autó + sofőr", rate: 9990, movers: 0 },
    { id: "p1", name: "Autó + 1 rakodó", rate: 10990, movers: 1 },
    { id: "p2", name: "Autó + 2 rakodó", rate: 14990, movers: 2 },
    { id: "p3", name: "Autó + 3 rakodó", rate: 18990, movers: 3 },
  ],
  callout: 1,
  vat: 27,
  rules: {},
});
export const emptyJob = () => ({
  source: "new",
  date: ymd(new Date()),
  loc: "bp",
  pkg: "",
  pkgOther: "",
  workers: "",
  fromFloor: "",
  fromLift: null,
  toFloor: "",
  toLift: null,
  boxMin: "",
  boxMax: "",
  smallF: "",
  largeF: "",
  heavy: "",
  heavyNote: "",
  extras: "",
  unusual: "",
  trH: "",
  trM: "",
  totH: "",
  totM: "0",
  price: "",
  cf: {},
  note: "",
});
export const seg = (cur, v, l, on) => {
  const a = cur === v;
  return {
    label: l,
    onClick: on,
    bg: a ? "#FFFFFF" : "transparent",
    fg: a ? "#18212F" : "#5E6673",
    weight: a ? "700" : "500",
    shadow: a ? "0 1px 3px rgba(20,30,45,.14)" : "none",
  };
};
export const liftAt = (fl, li) => (li === true ? true : li === false && has(fl) ? false : null);
export const noLiftFloors = (fl, li) => {
  if (!has(fl)) return null;
  const f = num(fl);
  if (f <= 0) return 0;
  const l = liftAt(fl, li);
  return l === true ? 0 : l === false ? f : null;
};
export const floorsNoLift = (j) => {
  const a = noLiftFloors(j.fromFloor, j.fromLift),
    b = noLiftFloors(j.toFloor, j.toLift);
  return a == null || b == null ? null : a + b;
};
export const liftAny = (j) => {
  const a = liftAt(j.fromFloor, j.fromLift),
    b = liftAt(j.toFloor, j.toLift);
  return a === true || b === true ? true : a === false && b === false ? false : null;
};
export const tri = (v) => (v === true ? true : v === false ? false : null);
export const curVer = (db) => db.versions[db.versions.length - 1];
export const activeFields = (db) => db.fields.filter((f) => !f.archived && f.type !== "text");
export const toNet = (v, type, vat) => (type === "brutto" ? num(v) / (1 + num(vat) / 100) : num(v));
export const totMin = (j) => (has(j.totalMin) ? num(j.totalMin) : num(j.hours) > 0 ? num(j.hours) * 60 : null);
export const trMin = (j) => (has(j.travelMin) ? num(j.travelMin) : null);
export const workMin = (j) => {
  const t = totMin(j),
    r = trMin(j);
  return t != null && r != null && t - r > 0 ? t - r : null;
};
export const fmin = (x) => {
  const a = Math.round(Math.abs(x)),
    h = Math.floor(a / 60),
    m = a % 60;
  return h ? h + " óra" + (m ? " " + m + " perc" : "") : m + " perc";
};
export const sfmin = (x) => (x >= 0 ? "+" : "−") + fmin(x);
export const boxEst = (j) => {
  const a = has(j.boxMin) ? num(j.boxMin) : null,
    b = has(j.boxMax) ? num(j.boxMax) : null;
  if (a != null && b != null) return (a + b) / 2;
  if (a != null) return a;
  if (b != null) return b;
  return has(j.boxes) ? num(j.boxes) : null;
};
export const boxTxt = (j) => {
  const a = has(j.boxMin) ? num(j.boxMin) : null,
    b = has(j.boxMax) ? num(j.boxMax) : null;
  if (a != null && b != null) return a === b ? a + " db" : a + "–" + b + " db (becslés)";
  if (a != null) return "legalább " + a + " db";
  if (b != null) return "legfeljebb " + b + " db";
  return has(j.boxes) ? num(j.boxes) + " db" : null;
};
export const crew = (j, c) => {
  if (has(j.workers)) return num(j.workers);
  const p = c.packages.find((x) => x.id === j.pkg);
  return p ? num(p.movers) : null;
};
export const billOf = (j, c) => {
  const p = c.packages.find((x) => x.id === j.pkg),
    t = totMin(j);
  if (!p || !(t > 0)) return null;
  const r = num(p.rate),
    co = r * num(c.callout ?? 1);
  return { p, rate: r, callout: co, hours: t / 60, total: co + (r * t) / 60 };
};
export const learnMissing = (j) => {
  const m = [];
  if (!(totMin(j) > 0)) m.push("teljes eltelt idő");
  if (trMin(j) == null) m.push("át-út ideje");
  return m;
};
export function normJob(f, c) {
  const e = [];
  [
    ["boxMin", "Dobozok minimum"],
    ["boxMax", "Dobozok maximum"],
    ["smallF", "Kis bútor"],
    ["largeF", "Nagy bútor"],
    ["heavy", "Nehéz tárgyak"],
    ["fromFloor", "Indulási emelet"],
    ["toFloor", "Érkezési emelet"],
    ["workers", "Rakodók száma"],
  ].forEach(([k, l]) => {
    if (has(f[k]) && !(Number.isInteger(num(f[k])) && num(f[k]) >= 0)) e.push(l + ": egész, nem negatív szám kell");
  });
  if (has(f.boxMin) && has(f.boxMax) && num(f.boxMax) < num(f.boxMin)) e.push("A dobozok maximuma nem lehet kisebb a minimumnál");
  const hm = (h, m, l) => {
    if (!has(h) && !has(m)) return null;
    if (has(h) && (num(h) < 0 || !Number.isInteger(num(h)))) e.push(l + ": az óra egész, nem negatív szám legyen");
    if (has(m) && (num(m) < 0 || num(m) >= 60 || !Number.isInteger(num(m)))) e.push(l + ": a perc 0 és 59 közötti egész szám legyen");
    return num(h) * 60 + num(m);
  };
  if (has(f.totH) && (num(f.totH) < 1 || num(f.totH) > 10 || !Number.isInteger(num(f.totH))))
    e.push("Teljes eltelt idő: az óra 1 és 10 közötti egész szám legyen");
  if (has(f.totM) && ![0, 10, 20, 30, 40, 50, 60].includes(num(f.totM)))
    e.push("Teljes eltelt idő: a perc 0, 10, 20, 30, 40, 50 vagy 60 lehet");
  const tot = !has(f.totH) ? null : num(f.totH) * 60 + num(f.totM),
    tr = hm(f.trH, f.trM, "Át-út ideje");
  if (tot != null && tr != null && tr > tot) e.push("Az át-út ideje nem lehet több a teljes eltelt időnél");
  const m = Object.assign({}, f, {
    source: "new",
    loc: "bp",
    totalMin: tot,
    travelMin: tr,
    hours: tot != null ? String(Math.round((tot / 60) * 1000) / 1000) : "",
    priceType: "netto",
  });
  if (!has(m.workers)) {
    const cw = crew(m, c);
    m.workers = cw != null ? String(cw) : "";
  }
  const b = billOf(m, c);
  m.price = b ? String(Math.round(b.total)) : "";
  return { m, errs: e };
}
export function splitMin(t) {
  return t == null ? ["", ""] : [String(Math.floor(t / 60)), String(Math.round(t % 60))];
}

export function timeDefs(fields, c) {
  const d = [
    { key: "floor", label: "Emelet lift nélkül", unit: "emelet", per: 1, kind: "num", get: floorsNoLift },
    {
      key: "nolift",
      label: "Nincs lift (emeleten)",
      kind: "bool",
      when: "ha nem volt lift",
      yes: "lift nélküli",
      get: (j) => {
        const s = (fl, li) => {
          if (!has(fl)) return null;
          if (num(fl) <= 0) return false;
          const l = liftAt(fl, li);
          return l === false ? true : l === true ? false : null;
        };
        const a = s(j.fromFloor, j.fromLift),
          b = s(j.toFloor, j.toLift);
        return a === true || b === true ? true : a === false && b === false ? false : null;
      },
    },
    { key: "boxes", label: "Dobozok és zsákok (becsült)", unit: "doboz", per: 10, kind: "num", get: boxEst },
    { key: "smallF", label: "Kis bútor", unit: "db", per: 1, kind: "num", get: (j) => (has(j.smallF) ? num(j.smallF) : null) },
    { key: "largeF", label: "Nagy bútor", unit: "db", per: 1, kind: "num", get: (j) => (has(j.largeF) ? num(j.largeF) : null) },
    { key: "crew", label: "Rakodók száma", unit: "fő", per: 1, kind: "num", get: (j) => crew(j, c) },
  ];
  (fields || []).forEach((f) =>
    d.push({
      key: "cf_" + f.id,
      label: f.name,
      unit: f.unit || "egység",
      per: 1,
      kind: f.type,
      when: "ha igen",
      yes: "ilyen",
      get: (j) => (f.type === "bool" ? tri((j.cf || {})[f.id]) : has((j.cf || {})[f.id]) ? num(j.cf[f.id]) : null),
    }),
  );
  d.forEach((x) => {
    x.perLbl = x.per === 1 ? x.unit : x.per + " " + x.unit;
  });
  return d;
}
export function ols(pts) {
  const n = pts.length;
  if (n < 2) return null;
  const mx = mean(pts.map((p) => p.x)),
    my = mean(pts.map((p) => p.y));
  let sxy = 0,
    sxx = 0,
    syy = 0;
  pts.forEach((p) => {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) ** 2;
    syy += (p.y - my) ** 2;
  });
  if (sxx === 0) return null;
  return { b: sxy / sxx, r2: syy ? (sxy * sxy) / (sxx * syy) : 0 };
}
export function gdiff(pts) {
  const a = pts.filter((p) => p.x > 0),
    b = pts.filter((p) => !(p.x > 0));
  if (a.length < 2 || b.length < 2) return null;
  const ma = mean(a.map((p) => p.y)),
    mb = mean(b.map((p) => p.y)),
    m = mean(pts.map((p) => p.y));
  const sst = pts.reduce((s, p) => s + (p.y - m) ** 2, 0);
  return { d: ma - mb, r2: sst ? (a.length * (ma - m) ** 2 + b.length * (mb - m) ** 2) / sst : 0, na: a.length, nb: b.length };
}
export function mlr(X, y, lam) {
  const k = X[0].length,
    A = Array.from({ length: k }, () => Array(k + 1).fill(0));
  X.forEach((x, i) => {
    for (let a = 0; a < k; a++) {
      A[a][k] += x[a] * y[i];
      for (let b = 0; b < k; b++) A[a][b] += x[a] * x[b];
    }
  });
  for (let a = 1; a < k; a++) A[a][a] += lam;
  for (let i = 0; i < k; i++) {
    let p = i;
    for (let r = i + 1; r < k; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
    [A[i], A[p]] = [A[p], A[i]];
    if (Math.abs(A[i][i]) < 1e-9) return null;
    for (let r = 0; r < k; r++)
      if (r !== i) {
        const f = A[r][i] / A[i][i];
        for (let c2 = i; c2 <= k; c2++) A[r][c2] -= f * A[i][c2];
      }
  }
  return A.map((r, i) => r[k] / r[i]);
}
export function uni(d, use) {
  const q = (u) => {
      const v = d.get(u.m);
      return d.kind === "bool" ? (v ? 1 : 0) : v;
    },
    set = use.filter((u) => d.get(u.m) != null),
    r = { d, n: set.length, ok: false };
  if (set.length >= MIN && new Set(set.map(q)).size >= 2) {
    if (d.kind === "bool") {
      const g = gdiff(set.map((u) => ({ x: q(u), y: u.y })));
      if (g) Object.assign(r, { ok: true, v: g.d, r2: g.r2, na: g.na, nb: g.nb });
    } else {
      const o = ols(set.map((u) => ({ x: q(u), y: u.y })));
      if (o) Object.assign(r, { ok: true, v: o.b, r2: o.r2 });
    }
  }
  if (d.key === "boxes") r.ranged = set.filter((u) => has(u.m.boxMin) && has(u.m.boxMax) && num(u.m.boxMax) > num(u.m.boxMin)).length;
  return r;
}
export function timeModel(db) {
  const c = curVer(db).config,
    bpAll = db.moves.filter((m) => (m.loc || "bp") === "bp"),
    all = bpAll,
    use = [];
  all.forEach((m) => {
    const w = workMin(m);
    if (w != null) use.push({ m, y: w });
  });
  const rows = timeDefs(activeFields(db), c).map((d) => uni(d, use));
  let mv = null;
  const cand = rows.filter((r) => r.ok);
  if (cand.length) {
    const cc = use.filter((u) => cand.every((r) => r.d.get(u.m) != null));
    if (cc.length >= cand.length + 5) {
      const X = cc.map((u) =>
          [1].concat(
            cand.map((r) => {
              const v = r.d.get(u.m);
              return r.d.kind === "bool" ? (v ? 1 : 0) : v;
            }),
          ),
        ),
        y = cc.map((u) => u.y),
        w = mlr(X, y, 0.001);
      if (w) {
        const pr = X.map((x) => x.reduce((a, v, i) => a + v * w[i], 0)),
          my = mean(y),
          sst = y.reduce((a, v) => a + (v - my) ** 2, 0),
          sse = y.reduce((a, v, i) => a + (v - pr[i]) ** 2, 0);
        mv = { n: cc.length, base: w[0], r2: sst ? 1 - sse / sst : 0, mae: med(y.map((v, i) => Math.abs(v - pr[i]))) };
        cand.forEach((r, i) => {
          r.v = w[i + 1];
          r.mv = true;
        });
      }
    }
  }
  rows.forEach((r) => {
    if (!r.ok) return;
    const r2 = r.mv ? mv.r2 : r.r2;
    let l = r.n >= 15 && r2 >= 0.4 ? 3 : r.n >= 8 && r2 >= 0.15 ? 2 : 1;
    if (r.d.key === "boxes" && r.ranged > r.n / 2 && l > 1) l--;
    r.lvl = l;
  });
  const tr = all.map(trMin).filter((v) => v != null);
  return {
    c,
    total: all.length,
    use,
    rows,
    mv,
    medWork: use.length >= 3 ? med(use.map((u) => u.y)) : null,
    medTravel: tr.length >= 3 ? med(tr) : null,
    nTr: tr.length,
  };
}

export const nn = (v) => (has(v) ? num(v) : null),
  s = (v) => (v == null ? "" : String(v)),
  lb = (v) => (v === true || v === false ? v : null);
export function moveToRow(m) {
  return {
    id: m.id,
    source: m.source === "old" ? "old" : "new",
    move_date: m.date || null,
    location: m.loc || "bp",
    distance_km: nn(m.km),
    package_id: m.pkg || null,
    package_note: m.pkg === "other" && m.pkgOther ? m.pkgOther : null,
    workers: nn(m.workers),
    hours: nn(m.hours),
    from_floor: nn(m.fromFloor),
    from_lift: lb(m.fromLift),
    total_min: has(m.totalMin) ? num(m.totalMin) : null,
    travel_min: has(m.travelMin) ? num(m.travelMin) : null,
    box_min: nn(m.boxMin),
    box_max: nn(m.boxMax),
    small_furniture: nn(m.smallF),
    large_furniture: nn(m.largeF),
    to_floor: nn(m.toFloor),
    to_lift: lb(m.toLift),
    boxes: nn(m.boxes),
    furniture: nn(m.furniture),
    heavy: nn(m.heavy),
    heavy_note: m.heavyNote || null,
    extras: m.extras || null,
    unusual: m.unusual || null,
    final_price: nn(m.price),
    price_type: m.priceType === "brutto" ? "brutto" : "netto",
    custom_values: m.cf || {},
    note: m.note || null,
    pricing_version_id: m.snapshot ? m.snapshot.versionId : null,
    pricing_snapshot: m.snapshot || null,
    legacy_id: m.legacyId || null,
    updated_at: new Date().toISOString(),
  };
}
export function rowToMove(r) {
  return {
    id: r.id,
    source: r.source,
    date: r.move_date || "",
    loc: r.location || "bp",
    km: s(r.distance_km),
    pkg: r.package_id || "",
    pkgOther: r.package_note || "",
    workers: s(r.workers),
    hours: s(r.hours),
    fromFloor: s(r.from_floor),
    fromLift: lb(r.from_lift),
    totalMin: r.total_min ?? null,
    travelMin: r.travel_min ?? null,
    boxMin: s(r.box_min),
    boxMax: s(r.box_max),
    smallF: s(r.small_furniture),
    largeF: s(r.large_furniture),
    toFloor: s(r.to_floor),
    toLift: lb(r.to_lift),
    boxes: s(r.boxes),
    furniture: s(r.furniture),
    heavy: s(r.heavy),
    heavyNote: r.heavy_note || "",
    extras: r.extras || "",
    unusual: r.unusual || "",
    price: s(r.final_price),
    priceType: r.price_type || "netto",
    cf: r.custom_values || {},
    note: r.note || "",
    snapshot: r.pricing_snapshot || null,
    legacyId: r.legacy_id || null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class LocalStore {
  rd() {
    try {
      return JSON.parse(localStorage.getItem(LKEY) || "null");
    } catch (e) {
      return null;
    }
  }
  wr(d) {
    localStorage.setItem(LKEY, JSON.stringify(d));
  }
  async loadAll() {
    let d = this.rd();
    if (!d) d = { versions: [], changes: [], fields: [], moves: [], decisions: [] };
    if (!d.versions.length) {
      d.versions.push({ id: newId(), no: 1, at: new Date().toISOString(), config: defaultConfig() });
      this.wr(d);
    }
    d.versions.sort((a, b) => a.no - b.no);

    if (d.moves.some((m) => m.example || m.demo)) {
      d.moves = d.moves.filter((m) => !m.example && !m.demo);
      this.wr(d);
    }
    return clone(d);
  }
  async upsertMove(m) {
    const d = this.rd();
    const now = new Date().toISOString();
    const i = d.moves.findIndex((x) => x.id === m.id);
    const r = Object.assign({}, m, { updatedAt: now, createdAt: m.createdAt || now });
    if (i >= 0) d.moves[i] = r;
    else d.moves.unshift(r);
    this.wr(d);
  }
  async deleteMove(id) {
    const d = this.rd();
    d.moves = d.moves.filter((x) => x.id !== id);
    this.wr(d);
  }
  async addField(f) {
    const d = this.rd();
    d.fields.push(f);
    this.wr(d);
  }
  async archiveField(id) {
    const d = this.rd();
    const f = d.fields.find((x) => x.id === id);
    if (f) f.archived = true;
    this.wr(d);
  }
  async addVersion(v, changes) {
    const d = this.rd();
    if (d.versions.some((x) => x.no === v.no)) throw new Error("Közben valaki módosította az árakat. Frissíts és próbáld újra.");
    const nv = { id: newId(), no: v.no, at: new Date().toISOString(), config: v.config };
    d.versions.push(nv);
    d.changes = d.changes || [];
    changes.forEach((c) => d.changes.unshift({ id: newId(), versionId: nv.id, item: c.item, from: c.from, to: c.to, at: nv.at }));
    this.wr(d);
  }
  async importMoves(moves) {
    const d = this.rd();
    const lm = new Set(d.moves.map((m) => m.legacyId).filter(Boolean));
    const now = new Date().toISOString();
    moves.forEach((m) => {
      if (!lm.has(m.legacyId)) d.moves.unshift(Object.assign({}, m, { createdAt: now, updatedAt: now }));
    });
    this.wr(d);
  }
}
export class SbStore {
  constructor(c) {
    this.c = c;
  }
  async q(p) {
    const { data, error } = await p;
    if (error) throw new Error(error.message);
    return data;
  }
  async loadAll() {
    const c = this.c;
    const [mv, fl, vs] = await Promise.all([
      this.q(c.from("moves").select("*").order("created_at", { ascending: false })),
      this.q(c.from("custom_fields").select("*").order("created_at")),
      this.q(c.from("pricing_versions").select("*").order("version_no")),
    ]);
    let versions = vs.map((r) => ({ id: r.id, no: r.version_no, at: r.created_at, config: r.config }));
    if (!versions.length) {
      try {
        const r = await this.q(c.from("pricing_versions").insert({ version_no: 1, config: defaultConfig() }).select().single());
        versions = [{ id: r.id, no: r.version_no, at: r.created_at, config: r.config }];
      } catch (e) {
        versions = (await this.q(c.from("pricing_versions").select("*").order("version_no"))).map((r) => ({
          id: r.id,
          no: r.version_no,
          at: r.created_at,
          config: r.config,
        }));
      }
    }
    return {
      moves: mv.filter((r) => !r.is_demo && !r.is_example).map(rowToMove),
      fields: fl.map((r) => ({ id: r.id, name: r.name, type: r.field_type, unit: r.unit || "", archived: r.archived })),
      versions,
    };
  }
  async upsertMove(m) {
    await this.q(this.c.from("moves").upsert(moveToRow(m)));
  }
  async deleteMove(id) {
    await this.q(this.c.from("moves").delete().eq("id", id));
  }
  async addField(f) {
    await this.q(this.c.from("custom_fields").insert({ id: f.id, name: f.name, field_type: f.type, unit: f.unit || null }));
  }
  async archiveField(id) {
    await this.q(this.c.from("custom_fields").update({ archived: true }).eq("id", id));
  }
  async addVersion(v, changes) {
    const r = await this.q(this.c.from("pricing_versions").insert({ version_no: v.no, config: v.config }).select().single());
    if (changes.length)
      await this.q(
        this.c.from("pricing_changes").insert(changes.map((x) => ({ version_id: r.id, item: x.item, old_value: x.from, new_value: x.to }))),
      );
  }
  async importMoves(moves) {
    if (moves.length) await this.q(this.c.from("moves").upsert(moves.map(moveToRow), { onConflict: "legacy_id", ignoreDuplicates: true }));
  }
}
export async function pbkdf(pw, salt) {
  const e = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", e.encode(pw), "PBKDF2", false, ["deriveBits"]);
  const b = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: e.encode(salt), iterations: 150000, hash: "SHA-256" }, k, 256);
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export const nrm = (v) =>
  String(v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
export const colL = (i) => {
  let s = "";
  i++;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
};
export const YN = ["Igen", "Nem", "Nincs adat"];
export function templateCols(c, fields) {
  const P = c.packages.map((p) => p.name);
  const cols = [
    ["Munka dátuma (ÉÉÉÉ-HH-NN)", "date", 22, "date"],
    ["Helyszín", "loc", 12, "loc", ["Budapest"]],
    ["Csomag", "pkg", 20, "pkg", P],
    ["Rakodók száma", "workers", 14, "int"],
    ["Indulási emelet", "fromFloor", 15, "int"],
    ["Lift az indulási címen", "fromLift", 20, "yn", YN],
    ["Érkezési emelet", "toFloor", 15, "int"],
    ["Lift az érkezési címen", "toLift", 20, "yn", YN],
    ["Dobozok és zsákok – minimum (becslés)", "boxMin", 24, "int"],
    ["Dobozok és zsákok – maximum (becslés)", "boxMax", 24, "int"],
    ["Kis bútorok száma", "smallF", 16, "int"],
    ["Nagy bútorok száma", "largeF", 16, "int"],
    ["Nehéz, különleges tárgyak (db)", "heavy", 24, "int"],
    ["Különleges tárgyak leírása", "heavyNote", 26, "text"],
    ["Extra munka, szolgáltatás", "extras", 26, "text"],
    ["Szokatlan körülmények", "unusual", 26, "text"],
    ["Át-út ideje (óra)", "trH", 14, "int"],
    ["Át-út ideje (perc)", "trM", 14, "int"],
    ["Teljes eltelt idő (óra)", "totH", 18, "int", ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]],
    ["Teljes eltelt idő (perc)", "totM", 18, "int", ["0", "10", "20", "30", "40", "50", "60"]],
    ["Megjegyzés", "note", 30, "text"],
  ];
  fields.forEach((f) =>
    cols.push([
      f.name + (f.type === "num" && f.unit ? " (" + f.unit + ")" : ""),
      "cf:" + f.id,
      20,
      f.type === "bool" ? "yn" : "num",
      f.type === "bool" ? YN : null,
    ]),
  );
  return cols.map(([h, key, w, t, list]) => ({ h, key, w, t, list }));
}
export function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36) + str.length.toString(36);
}
export function parseRows(aoa, c, fields) {
  const cols = templateCols(c, fields),
    hdr = (aoa[0] || []).map(nrm),
    map = {};
  hdr.forEach((h, i) => {
    if (!h) return;
    const col =
      cols.find((cl) => nrm(cl.h) === h && map[cl.key] == null) ||
      cols.find((cl) => {
        const b = nrm(cl.h.split("(")[0]);
        return map[cl.key] == null && b.length > 3 && h.startsWith(b);
      });
    if (col) map[col.key] = i;
  });
  if (map.totH == null && map.pkg == null && map.date == null)
    return { error: "Nem találtam a minta oszlopait. Kérjük, az új Excel-mintát használd." };
  const out = [];
  for (let r = 1; r < aoa.length; r++) {
    const row = aoa[r] || [];
    if (!row.some((v) => String(v ?? "").trim() !== "")) continue;
    const errs = [],
      f = emptyJob(),
      cf = {};
    f.date = "";
    cols.forEach((col) => {
      const idx = map[col.key];
      const raw = idx == null ? "" : row[idx];
      const str = raw instanceof Date ? "" : String(raw ?? "").trim();
      const n = nrm(str);
      let val;
      switch (col.t) {
        case "date":
          if (raw instanceof Date && !isNaN(raw)) val = ymd(new Date(raw.getTime() + 12 * 3600e3));
          else if (typeof raw === "number" && window.XLSX) {
            const d = XLSX.SSF.parse_date_code(raw);
            val = d ? d.y + "-" + String(d.m).padStart(2, "0") + "-" + String(d.d).padStart(2, "0") : "";
          } else if (!str) val = "";
          else {
            const x = str.match(/^(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
            if (x) val = x[1] + "-" + x[2].padStart(2, "0") + "-" + x[3].padStart(2, "0");
            else {
              errs.push("Érvénytelen dátum: „" + str + "”");
              val = "";
            }
          }
          break;
        case "loc":
          val = "bp";
          if (n && n !== "bp" && !n.startsWith("budapest")) errs.push("Jelenleg csak budapesti munka rögzíthető („" + str + "”)");
          break;
        case "pkg":
          if (!n) val = "";
          else {
            const p = c.packages.find((p) => nrm(p.name) === n);
            val = p ? p.id : (errs.push("Ismeretlen csomag: „" + str + "” – csak a négy Move-ON csomag választható"), "");
          }
          break;
        case "yn":
          val =
            !n || ["nincsadat", "nemtudom", "ismeretlen", "na", "nincsinfo"].includes(n)
              ? null
              : ["igen", "i", "van", "yes", "1", "true", "x"].includes(n)
                ? true
                : ["nem", "n", "nincs", "no", "0", "false"].includes(n)
                  ? false
                  : (errs.push(col.h + ": „" + str + "” (Igen / Nem / Nincs adat)"), null);
          break;
        case "num":
        case "int":
          if (typeof raw === "number") val = raw < 0 ? (errs.push(col.h + ": negatív szám"), "") : String(raw);
          else if (!str) val = "";
          else {
            const t = str.replace(/\s|ft|db|perc|ora|óra/gi, "").replace(",", ".");
            if (/^\d+(\.\d+)?$/.test(t)) val = String(parseFloat(t));
            else {
              errs.push(col.h + ": „" + str + "” nem szám");
              val = "";
            }
          }
          if (col.t === "int" && val !== "" && !Number.isInteger(num(val))) {
            errs.push(col.h + ": egész szám kell");
            val = "";
          }
          break;
        default:
          val = str;
      }
      if (col.key.startsWith("cf:")) {
        if (col.t === "yn" ? val != null : val !== "") cf[col.key.slice(3)] = val;
      } else f[col.key] = val;
    });
    f.cf = cf;
    const N = normJob(f, c);
    N.errs.forEach((x) => {
      if (!errs.includes(x)) errs.push(x);
    });
    const m = Object.assign({}, N.m, { id: newId() });
    const sig = Object.assign({}, m);
    delete sig.id;
    m.legacyId = "xls:" + hashStr(JSON.stringify(sig));
    out.push({ row: r + 1, m, errs });
  }
  return { rows: out };
}
