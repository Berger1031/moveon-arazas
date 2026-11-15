import { Component } from "react";
import { createClient } from "@supabase/supabase-js";
import JSZip from "jszip";
import View from "./View.jsx";
import { SUPABASE } from "./config.js";
import {
  AKEY,
  SKEY,
  MIN,
  newId,
  num,
  has,
  fq,
  ft,
  clone,
  fdate,
  ymd,
  LOC,
  emptyJob,
  emptyStop,
  WALK,
  walkText,
  stopsOf,
  STOP_KEYS,
  seg,
  floorsNoLift,
  tri,
  curVer,
  activeFields,
  toNet,
  totMin,
  trMin,
  workMin,
  fmin,
  sfmin,
  boxTxt,
  crew,
  billOf,
  learnMissing,
  colL,
  LocalStore,
  SbStore,
  normJob,
  parseRows,
  pbkdf,
  splitMin,
  templateCols,
  timeModel,
} from "./logic.js";

export default class App extends Component {
  state = {
    phase: "loading",
    mode: "local",
    err: "",
    user: "",
    pw: "",
    showPw: false,
    authErr: "",
    busy: false,
    hasPw: false,
    db: null,
    page: "jobs",
    step: 0,
    f: emptyJob(),
    editId: null,
    dateAuto: true,
    nfOpen: false,
    nfName: "",
    nfType: "num",
    nfUnit: "",
    toast: null,
    saving: false,
    imp: null,
    impBusy: false,
    pd: null,
  };
  async componentDidMount() {
    this._focus = () => {
      this.syncDate();
      if (this.state.phase === "app") this.reload(true);
    };
    window.addEventListener("focus", this._focus);
    this._dateTimer = setInterval(() => this.syncDate(), 60000);
    await this.init();
  }
  componentWillUnmount() {
    window.removeEventListener("focus", this._focus);
    clearInterval(this._dateTimer);
    this.unsub();
  }
  unsub() {
    try {
      if (this._ch && this.sb) this.sb.removeChannel(this._ch);
    } catch (e) {}
    this._ch = null;
  }
  toast(text, err) {
    clearTimeout(this._t);
    this.setState({ toast: { text, err } });
    this._t = setTimeout(() => this.setState({ toast: null }), 3200);
  }
  async init() {
    this.unsub();
    this.setState({ phase: "loading", err: "" });
    if (SUPABASE.url && SUPABASE.anonKey) {
      try {
        this.sb = createClient(SUPABASE.url, SUPABASE.anonKey);
        this.store = new SbStore(this.sb);
        this.setState({ mode: "cloud" });
        const { data } = await this.sb.auth.getSession();
        if (data && data.session) await this.enter();
        else this.setState({ phase: "auth" });
      } catch (e) {
        this.setState({ phase: "error", err: "Nem sikerült kapcsolódni: " + (e.message || e) });
      }
    } else {
      this.sb = null;
      this.store = new LocalStore();
      let auth = null;
      try {
        auth = JSON.parse(localStorage.getItem(AKEY) || "null");
      } catch (e) {}
      this.setState({ mode: "local", hasPw: !!auth });
      if (auth && sessionStorage.getItem(SKEY) === auth.hash.slice(0, 24)) await this.enter();
      else this.setState({ phase: "auth" });
    }
  }
  async enter() {
    try {
      const db = await this.store.loadAll();
      this.setState({ phase: "app", db });
      this.subscribe();
    } catch (e) {
      this.setState({ phase: "error", err: "Az adatok betöltése nem sikerült: " + (e.message || e) });
    }
  }
  subscribe() {
    if (this.state.mode !== "cloud" || this._ch || !this.sb) return;
    try {
      this._ch = this.sb
        .channel("moveon-sync")
        .on("postgres_changes", { event: "*", schema: "public" }, () => {
          clearTimeout(this._rt);
          this._rt = setTimeout(() => this.reload(true), 500);
        })
        .subscribe();
    } catch (e) {}
  }
  async reload(quiet) {
    try {
      const db = await this.store.loadAll();
      this.setState({ db });
      return db;
    } catch (e) {
      if (!quiet) this.toast("Frissítés nem sikerült: " + (e.message || e), true);
      return null;
    }
  }
  async run(fn, ok) {
    try {
      await fn();
      await this.reload();
      if (ok) this.toast(ok);
      return true;
    } catch (e) {
      this.toast("A mentés nem sikerült: " + (e.message || e), true);
      return false;
    }
  }
  async auth(e) {
    e && e.preventDefault && e.preventDefault();
    const S = this.state;
    if (S.busy) return;
    this.setState({ busy: true, authErr: "" });
    const u = S.user.trim();
    if (!u || !S.pw) return this.setState({ busy: false, authErr: "Add meg a felhasználónevet és a jelszót." });
    const bad = "Hibás felhasználónév vagy jelszó. Kérjük, próbálja újra.";
    try {
      if (S.mode === "cloud") {
        const dom = SUPABASE.loginDomain;
        const { error } = await this.sb.auth.signInWithPassword({ email: u.includes("@") ? u : u + "@" + dom, password: S.pw });
        if (error)
          return this.setState({
            busy: false,
            authErr: /invalid/i.test(error.message) ? bad : "A bejelentkezés nem sikerült. Ellenőrizze az internetkapcsolatot.",
          });
        this.setState({ busy: false, pw: "", showPw: false });
        return this.enter();
      }
      if (!S.hasPw) {
        if (S.pw.length < 8) return this.setState({ busy: false, authErr: "A jelszó legalább 8 karakter legyen." });
        const salt = newId(),
          hash = await pbkdf(S.pw, salt);
        localStorage.setItem(AKEY, JSON.stringify({ user: u, salt, hash }));
        sessionStorage.setItem(SKEY, hash.slice(0, 24));
        this.setState({ hasPw: true, busy: false, pw: "", showPw: false });
        return this.enter();
      }
      const a = JSON.parse(localStorage.getItem(AKEY));
      const h = await pbkdf(S.pw, a.salt);
      if (h !== a.hash || (a.user && a.user.toLowerCase() !== u.toLowerCase())) return this.setState({ busy: false, authErr: bad });
      sessionStorage.setItem(SKEY, h.slice(0, 24));
      this.setState({ busy: false, pw: "", showPw: false });
      await this.enter();
    } catch (err) {
      this.setState({ busy: false, authErr: "A bejelentkezés nem sikerült: " + (err.message || err) });
    }
  }
  async logout() {
    this.unsub();
    if (this.state.mode === "cloud" && this.sb) {
      try {
        await this.sb.auth.signOut();
      } catch (e) {}
    } else sessionStorage.removeItem(SKEY);
    this.setState({ phase: "auth", db: null, pw: "" });
  }
  // A new job's date follows today's date until the user picks one, even if the page stays open overnight.
  syncDate() {
    this.setState((st) => {
      const today = ymd(new Date());
      return st.dateAuto && !st.editId && st.f.date !== today ? { f: Object.assign({}, st.f, { date: today }) } : null;
    });
  }
  set(k, v) {
    if (k === "date") this.setState({ dateAuto: false });
    this.setState((st) => {
      const f = Object.assign({}, st.f);
      if (k.startsWith("cf.")) f.cf = Object.assign({}, f.cf, { [k.slice(3)]: v });
      else if (k.startsWith("stop.")) {
        const [, i, key] = k.split(".");
        f.stops = f.stops.map((x, n) => (n === +i ? Object.assign({}, x, { [key]: v }) : x));
      } else f[k] = v;
      return { f };
    });
  }
  addStop() {
    this.setState((st) => ({ f: Object.assign({}, st.f, { stops: st.f.stops.concat([emptyStop()]) }) }));
  }
  // Removing an address also drops the journey into it. The journey into the next address would now start
  // from a different place, so it is cleared rather than kept with a stale value.
  removeStop(i) {
    this.setState((st) => {
      if (st.f.stops.length <= 2) return null;
      const stops = st.f.stops.filter((_, n) => n !== i);
      if (stops[i]) stops[i] = Object.assign({}, stops[i], { trH: "", trM: "" });
      return { f: Object.assign({}, st.f, { stops }) };
    });
  }
  goStep(i) {
    this.setState({ step: i });
  }
  async saveJob() {
    const S = this.state,
      db = S.db;
    if (S.saving) return;
    const v = curVer(db),
      f = S.dateAuto && !S.editId ? Object.assign({}, S.f, { date: ymd(new Date()) }) : S.f,
      N = normJob(f, v.config);
    if (N.errs.length) {
      this.setState({ step: 4 });
      return this.toast(N.errs[0], true);
    }
    let m;
    if (S.editId) {
      const old = db.moves.find((x) => x.id === S.editId) || {};
      m = Object.assign({}, old, N.m, {
        id: S.editId,
        snapshot: old.snapshot || null,
        createdAt: old.createdAt,
        legacyId: old.legacyId || null,
      });
    } else
      m = Object.assign({}, N.m, {
        id: newId(),
        snapshot: { versionId: v.id, versionNo: v.no, at: new Date().toISOString(), config: clone(v.config) },
      });
    this.setState({ saving: true });
    const ok = await this.run(() => this.store.upsertMove(m), S.editId ? "Módosítás elmentve" : "Munka elmentve");
    this.setState(ok ? { saving: false, f: emptyJob(), editId: null, step: 0, dateAuto: true } : { saving: false });
  }
  dl(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      URL.revokeObjectURL(a.href);
      a.remove();
    }, 800);
  }
  async buildXlsx(rows, withGuide) {
    const X = window.XLSX;
    const c = curVer(this.state.db).config,
      cols = templateCols(c, activeFields(this.state.db));
    const ws = X.utils.aoa_to_sheet([cols.map((x) => x.h)].concat(rows));
    ws["!cols"] = cols.map((x) => ({ wch: x.w }));
    const wb = X.utils.book_new();
    X.utils.book_append_sheet(wb, ws, "Munkák");
    if (withGuide) {
      const g = X.utils.aoa_to_sheet([
        ["Move-ON – munkák tömeges feltöltése"],
        [""],
        [
          "1. A „Munkák” lapon egy sor = egy cím. Egy költözés annyi sorból áll, ahány címe volt (legalább kettő). Az első sort (oszlopnevek) ne módosítsd.",
        ],
        [
          "2. Az egy költözéshez tartozó sorokba ugyanazt a „Munka sorszáma” értéket írd (1, 2, 3…). A „Cím sorszáma” a címek tényleges sorrendje: 1, 2, 3… Bármennyi cím megadható.",
        ],
        [
          "3. Minden címnek saját Emelet, Lift és „Teherautó és bejárat közötti rakodási távolság” adata van (ez utóbbi a listából választható; ha nem tudod, hagyd üresen). Az „Át-út az előző címtől” az előző címtől idáig tartó út ideje; az 1. címnél hagyd üresen. Az át-utak összegét a rendszer számolja.",
        ],
        [
          "4. A munka többi adatát (dátum, csomag, dobozok, bútorok, teljes eltelt idő stb.) csak egyszer, a munka 1. címének sorába írd. A legfontosabb: Csomag, Teljes eltelt idő (óra + perc) és minden át-út ideje.",
        ],
        [
          "5. A teljes eltelt idő a kezdéstől a befejezésig tart, az összes át-úttal együtt. A végösszeget ebből számolja a rendszer: kiállási díj + teljes idő × óradíj (nettó). Az elemzés a teljes időből levonja az át-utak összegét.",
        ],
        [
          "6. Dobozok és zsákok: a minimum és a maximum BECSLÉS, nem pontos darabszám. Ha pontosan tudod, írd mindkettőbe ugyanazt; ha nem tudod, hagyd üresen.",
        ],
        [
          "7. Emelet: 0 = földszint. Lift: Igen / Nem / Nincs adat. Az üres cella „nincs adat”, nem nulla és nem „Nem”. Számoknál egész számot írj. A dátum formája: 2026-10-05.",
        ],
        [
          "8. Példa – három címes munka: 1. sor: Munka 1, Cím 1; 2. sor: Munka 1, Cím 2, át-út 0 óra 30 perc; 3. sor: Munka 1, Cím 3, át-út 0 óra 30 perc.",
        ],
        ["9. Mentsd el, majd az alkalmazásban: „Kitöltött Excel feltöltése”. Feltöltés előtt ellenőrizheted az adatokat."],
        [
          "10. Ugyanazt a munkát kétszer nem tölti fel a rendszer. A korábbi (egy sor = egy költözés) minta szerint kitöltött fájlok is feltölthetők.",
        ],
      ]);
      g["!cols"] = [{ wch: 110 }];
      X.utils.book_append_sheet(wb, g, "Útmutató");
    }
    let buf = X.write(wb, { type: "array", bookType: "xlsx" });
    {
      try {
        const z = await JSZip.loadAsync(buf),
          p = "xl/worksheets/sheet1.xml";
        let xml = await z.file(p).async("string");
        const esc = (t) => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
        const dvs = cols
          .map((x, i) => {
            const L = colL(i),
              rg = `${L}2:${L}2000`;
            if (x.list)
              return `<dataValidation type="list" allowBlank="1" showErrorMessage="1" errorTitle="Érvénytelen érték" error="Válassz a listából." sqref="${rg}"><formula1>${esc('"' + x.list.join(",") + '"')}</formula1></dataValidation>`;
            if (x.t === "int")
              return `<dataValidation type="whole" operator="greaterThanOrEqual" allowBlank="1" showErrorMessage="1" errorTitle="Érvénytelen érték" error="Ide egész számot írj (0 vagy több)." sqref="${rg}"><formula1>0</formula1></dataValidation>`;
            if (x.t === "num")
              return `<dataValidation type="decimal" operator="greaterThanOrEqual" allowBlank="1" showErrorMessage="1" errorTitle="Érvénytelen érték" error="Ide számot írj (0 vagy több)." sqref="${rg}"><formula1>0</formula1></dataValidation>`;
            return "";
          })
          .filter(Boolean);
        const block = dvs.length ? `<dataValidations count="${dvs.length}">${dvs.join("")}</dataValidations>` : "";
        const anchor = xml.includes("</mergeCells>") ? "</mergeCells>" : "</sheetData>";
        if (block && xml.includes(anchor)) xml = xml.replace(anchor, anchor + block);
        xml = xml.replace(
          /<sheetView workbookViewId="0"\s*\/>/,
          '<sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/></sheetView>',
        );
        z.file(p, xml);
        buf = await z.generateAsync({ type: "uint8array", compression: "DEFLATE" });
      } catch (e) {
        console.warn("xlsx postprocess", e);
      }
    }
    return new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  async downloadTemplate() {
    if (!window.XLSX) return this.toast("Az Excel-modul még töltődik, próbáld újra pár másodperc múlva.", true);
    try {
      this.dl(await this.buildXlsx([], true), "moveon-munkak-minta.xlsx");
      this.toast("Excel-minta letöltve");
    } catch (e) {
      this.toast("A minta létrehozása nem sikerült.", true);
    }
  }
  async exportXlsx() {
    if (!window.XLSX) return this.toast("Az Excel-modul még töltődik.", true);
    const db = this.state.db,
      c = curVer(db).config,
      cols = templateCols(c, activeFields(db));
    const yn = (v) => (v === true ? "Igen" : v === false ? "Nem" : "");
    const rows = db.moves.flatMap((m, n) => {
      const [th, tm] = splitMin(totMin(m)),
        X = Object.assign({}, m, {
          totH: th,
          totM: tm,
          boxMin: has(m.boxMin) ? m.boxMin : m.boxes || "",
          boxMax: has(m.boxMax) ? m.boxMax : m.boxes || "",
          price: m.pkg === "other" ? m.price : "",
        });
      // One sheet row per address; the job-level columns go in the first address's row.
      return stopsOf(m).map((st, i) => {
        const [rh, rm] = i === 0 ? ["", ""] : splitMin(st.travelMin),
          A = { job: n + 1, seq: i + 1, floor: st.floor, lift: tri(st.lift), walk: st.walk, trH: rh, trM: rm };
        return cols.map((col) => {
          const k = col.key,
            own = k === "job" || STOP_KEYS.includes(k);
          if (!own && i > 0) return "";
          if (k.startsWith("cf:")) {
            const v = (m.cf || {})[k.slice(3)];
            return col.t === "yn" ? yn(v) : has(v) ? num(v) : "";
          }
          const v = own ? A[k] : X[k];
          switch (col.t) {
            case "loc":
              return "Budapest";
            case "pkg": {
              const p = c.packages.find((p) => p.id === v);
              return p ? p.name : v === "other" ? "Egyéb / egyedi" : "";
            }
            case "yn":
              return yn(v);
            case "walk":
              return walkText(v) || "";
            case "num":
            case "int":
              return has(v) ? num(v) : "";
            default:
              return v || "";
          }
        });
      });
    });
    try {
      this.dl(await this.buildXlsx(rows, false), `moveon-munkak-${ymd(new Date())}.xlsx`);
      this.toast("Excel letöltve");
    } catch (e) {
      this.toast("Az export nem sikerült.", true);
    }
  }
  async onFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!window.XLSX) return this.toast("Az Excel-modul még töltődik, próbáld újra.", true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });
      const ws = wb.Sheets["Munkák"] || wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });
      const db = this.state.db,
        res = parseRows(aoa, curVer(db).config, activeFields(db));
      if (res.error) return this.toast(res.error, true);
      const have = new Set(db.moves.map((m) => m.legacyId).filter(Boolean)),
        seen = new Set();
      res.rows.forEach((r) => {
        r.dup = have.has(r.m.legacyId) || seen.has(r.m.legacyId);
        seen.add(r.m.legacyId);
      });
      this.setState({ imp: { name: file.name, rows: res.rows } });
    } catch (err) {
      this.toast("A fájl nem olvasható. Kérjük, az Excel-mintát használd.", true);
    }
  }
  async doImport() {
    const S = this.state,
      imp = S.imp;
    if (!imp || S.impBusy) return;
    const v = curVer(S.db);
    const ok = imp.rows
      .filter((r) => !r.errs.length && !r.dup)
      .map((r) =>
        Object.assign({}, r.m, {
          snapshot: { versionId: v.id, versionNo: v.no, at: new Date().toISOString(), config: clone(v.config), imported: true },
        }),
      );
    if (!ok.length) return this.toast("Nincs importálható sor.", true);
    this.setState({ impBusy: true });
    const done = await this.run(() => this.store.importMoves(ok), `${ok.length} munka importálva`);
    this.setState(done ? { impBusy: false, imp: null } : { impBusy: false });
  }

  render() {
    return <View v={this.renderVals()} />;
  }
  renderVals() {
    const S = this.state,
      db = S.db,
      cloud = S.mode === "cloud";
    const out = {
      phaseLoading: S.phase === "loading",
      phaseError: S.phase === "error",
      phaseAuth: S.phase === "auth",
      phaseApp: S.phase === "app" && !!db,
      errText: S.err,
      retry: () => this.init(),
      user: S.user,
      onUser: (e) => this.setState({ user: e.target.value, authErr: "" }),
      pw: S.pw,
      onPw: (e) => this.setState({ pw: e.target.value, authErr: "" }),
      pwType: S.showPw ? "text" : "password",
      eyeIcon: S.showPw ? "icon-eye-off" : "icon-eye",
      eyeLabel: S.showPw ? "Jelszó elrejtése" : "Jelszó megjelenítése",
      togglePw: () => this.setState({ showPw: !S.showPw }),
      fieldBorder: S.authErr ? "oklch(0.75 0.1 27)" : "#D9D6CF",
      authErr: S.authErr,
      hasAuthErr: !!S.authErr,
      onAuthSubmit: (e) => this.auth(e),
      authBtn: S.busy ? "Bejelentkezés…" : "Bejelentkezés",
      hasToast: !!S.toast,
      toastText: S.toast ? S.toast.text : "",
      toastBg: S.toast && S.toast.err ? "oklch(0.5 0.17 27)" : "#18212F",
      impOpen: false,
    };
    if (!out.phaseApp) return out;
    const c = curVer(db).config,
      vat = num(c.vat),
      fields = activeFields(db),
      f = S.f,
      pg = S.page,
      go = (p) => {
        this.setState({ page: p });
        try {
          window.scrollTo(0, 0);
        } catch (e) {}
      };
    Object.assign(out, {
      logout: () => this.logout(),
      isJobs: pg === "jobs",
      isPricing: pg === "pricing",
      tabs: [
        ["jobs", "Munkák rögzítése", "icon-clipboard-plus"],
        ["pricing", "Árazás", "icon-calculator"],
      ].map(([k, l, ic]) => {
        const a = pg === k;
        return {
          label: l,
          icon: ic,
          onClick: () => go(k),
          line: a ? "#5bc1e7" : "transparent",
          fg: a ? "#18212F" : "#5E6673",
          weight: a ? "800" : "600",
          iconColor: a ? "#2A93BD" : "#8A909A",
        };
      }),
    });

    if (S.imp) {
      const R = S.imp.rows,
        bad = R.filter((r) => r.errs.length),
        dup = R.filter((r) => !r.errs.length && r.dup),
        good = R.filter((r) => !r.errs.length && !r.dup),
        miss = good.filter((r) => learnMissing(r.m).length);
      const st = [
        { value: String(R.length), label: "talált munka", bg: "#F7F6F3" },
        { value: String(good.length), label: "érvényes, importálható", bg: "oklch(0.94 0.05 155)" },
        { value: String(miss.length), label: "hiányos adattal (importálható)", bg: "oklch(0.96 0.05 85)" },
        { value: String(bad.length), label: "hibás sor", bg: bad.length ? "oklch(0.95 0.04 27)" : "#F7F6F3" },
      ];
      if (dup.length) st.push({ value: String(dup.length), label: "már korábban feltöltve", bg: "#EEECE7" });
      Object.assign(out, {
        impOpen: true,
        impName: S.imp.name,
        impStats: st,
        hasImpErrors: bad.length > 0,
        impErrors: bad.map((r) => ({ row: r.row + ". sor", reasons: r.errs.join("; ") })),
        impNote:
          "A hiányos munkák is feltölthetők – az időelemzésbe akkor kerülnek be, ha megvan a teljes eltelt idő és minden át-út ideje. A hibás sorokat javítsd az Excelben, és töltsd fel újra; a már feltöltött sorok nem duplázódnak.",
        impBtn: S.impBusy ? "Importálás…" : good.length ? good.length + " munka importálása" : "Nincs importálható sor",
        impBtnBg: good.length ? "#5bc1e7" : "#E6E4DF",
        doImport: () => this.doImport(),
        closeImp: () => this.setState({ imp: null }),
      });
    }

    if (pg === "jobs") {
      const get = (k) => {
        if (k.startsWith("cf.")) return (f.cf || {})[k.slice(3)];
        if (k.startsWith("stop.")) return (f.stops[+k.split(".")[1]] || {})[k.split(".")[2]];
        return f[k];
      };
      const B = {
        isInput: false,
        isSeg: false,
        isArea: false,
        isDual: false,
        isTimeSel: false,
        isSelect: false,
        selOpts: [],
        aOpts: [],
        bOpts: [],
        hasHint: false,
        hint: "",
        hintColor: "#5E6673",
        hintWeight: "400",
        span: "auto",
        removable: false,
        removeLabel: "Tényező eltávolítása",
        isTotal: false,
        totalValue: "",
        totalColor: "#18212F",
        options: [],
        h: "46px",
        fs: "15px",
        fw: "400",
        step: "any",
        border: "#D9D6CF",
      };
      const inp = (k, label, suffix, o = {}) =>
        Object.assign(
          {},
          B,
          {
            label,
            isInput: true,
            suffix: suffix || "",
            type: o.type || "number",
            step: o.step || "any",
            value: get(k) ?? "",
            ph: o.ph || "",
            pad: suffix ? suffix.length * 8 + 20 + "px" : "12px",
            onChange: (e) => this.set(k, e.target.value),
            hint: o.hint || "",
            hasHint: !!o.hint,
            hintColor: o.hc || "#5E6673",
            hintWeight: o.hc ? "700" : "400",
            span: o.wide ? "1 / -1" : "auto",
          },
          o.big ? { h: "56px", fs: "20px", fw: "800" } : {},
        );
      const dual = (label, ak, bk, o = {}) =>
        Object.assign({}, B, {
          label,
          isDual: true,
          aVal: get(ak) ?? "",
          bVal: get(bk) ?? "",
          aOn: (e) => this.set(ak, e.target.value),
          bOn: (e) => this.set(bk, e.target.value),
          aPh: o.aPh || "",
          bPh: o.bPh || "",
          bStep: o.bStep || "1",
          bMax: o.bMax || "",
          aSuf: o.aSuf || "",
          bSuf: o.bSuf || "",
          aPad: o.aSuf ? o.aSuf.length * 8 + 20 + "px" : "12px",
          bPad: o.bSuf ? o.bSuf.length * 8 + 20 + "px" : "12px",
          sep: o.sep || "",
          sepW: o.sep ? "14px" : "0px",
          border: o.err ? "oklch(0.7 0.15 27)" : "#D9D6CF",
          hint: o.hint || "",
          hasHint: !!o.hint,
          hintColor: o.err ? "oklch(0.5 0.17 27)" : "#5E6673",
          hintWeight: o.err ? "700" : "400",
          span: "1 / -1",
        });
      const sg = (label, opts, cur, on) =>
        Object.assign({}, B, { label, isSeg: true, options: opts.map(([val, l]) => seg(cur, val, l, () => on(val))) });
      const area = (k, label, ph) =>
        Object.assign({}, B, {
          label,
          isArea: true,
          value: get(k) ?? "",
          onChange: (e) => this.set(k, e.target.value),
          ph: ph || "",
          span: "1 / -1",
        });
      const lift = [
        [true, "Van"],
        [false, "Nincs"],
        [null, "Nincs adat"],
      ];
      const custom = fields.map((cf) =>
        Object.assign(
          cf.type === "bool"
            ? sg(
                cf.name,
                lift.map(([v, l], i) => [v, ["Igen", "Nem", "Nincs adat"][i]]),
                tri((f.cf || {})[cf.id]),
                (v) => this.set("cf." + cf.id, v),
              )
            : inp("cf." + cf.id, cf.name, cf.unit, { ph: "Nincs adat" }),
          {
            removable: true,
            onRemove: () => {
              if (window.confirm("Eltávolítod a(z) „" + cf.name + "” tényezőt? A már rögzített értékek megmaradnak."))
                this.run(() => this.store.archiveField(cf.id), "Tényező eltávolítva");
            },
          },
        ),
      );
      const pkg = c.packages.find((p) => p.id === f.pkg),
        boxErr = has(f.boxMin) && has(f.boxMax) && num(f.boxMax) < num(f.boxMin);
      const stops = f.stops,
        multi = stops.length > 2,
        trTotal = normJob(f, c).m.travelMin;
      const STEPS = [
        ["Alapadatok", "Dátum – minden rögzített munka budapesti, befejezett munka."],
        ["Csomag és munka", "A csomag óradíja egyben a kiállási díj is (0. óra)."],
        [
          "Indulás és érkezés",
          "Emelet, lift és rakodási távolság címenként, az útvonal sorrendjében. Amit nem tudtok, hagyjátok „Nincs adat”-on – nem számít „nincs”-nek.",
        ],
        ["Mennyiség és egyéb", "Amennyit tudtok – az üres mező „nincs adat”, nem nulla."],
        ["Végösszeg és ellenőrzés", "A teljes eltelt időből számoljuk a végösszeget, az át-út nélküli időből tanul az elemzés."],
      ];
      const sfields = [
        [inp("date", "Költözés dátuma", "", { type: "date" })],
        [
          inp("workers", "Rakodók száma (amennyiben eltérő)", "fő", {
            step: "1",
            hint: pkg ? "A csomagban: " + pkg.movers + " rakodó" : "Ha eltért a csomagtól",
          }),
        ],
        stops.flatMap((x, i) => [
          Object.assign(
            inp("stop." + i + ".floor", "Cím " + (i + 1) + " – emelet", "em.", { step: "1", ph: "Nincs adat", hint: "0 = földszint" }),
            stops.length > 2
              ? { removable: true, removeLabel: "Cím " + (i + 1) + " eltávolítása", onRemove: () => this.removeStop(i) }
              : {},
          ),
          sg("Cím " + (i + 1) + " – lift", lift, tri(x.lift), (v) => this.set("stop." + i + ".lift", v)),
          Object.assign({}, B, {
            label: "Cím " + (i + 1) + " – teherautó és bejárat közötti rakodási távolság",
            isSelect: true,
            value: x.walk || "",
            onChange: (e) => this.set("stop." + i + ".walk", e.target.value || null),
            selOpts: [{ value: "", label: "Nincs adat" }].concat(WALK.map((w) => ({ value: w.key, label: walkText(w.key) }))),
            span: "1 / -1",
            hasHint: true,
            hint: "A teherautó tényleges parkolási helyétől az épület bejáratáig.",
          }),
        ]),
        [
          dual("Dobozok és zsákok becsült száma", "boxMin", "boxMax", {
            aPh: "Minimum",
            bPh: "Maximum",
            sep: "–",
            aSuf: "db",
            bSuf: "db",
            err: boxErr,
            hint: boxErr
              ? "A maximum nem lehet kisebb a minimumnál."
              : "Becslés – ha pontosan tudod, írd mindkét mezőbe ugyanazt. Ha nem tudod, hagyd üresen.",
          }),
          inp("smallF", "Kis bútor", "db", { step: "1", ph: "Nincs adat" }),
          inp("largeF", "Nagy bútor", "db", { step: "1", ph: "Nincs adat" }),
          inp("heavy", "Nehéz, különleges tárgyak", "db", { step: "1", ph: "Nincs adat" }),
          inp("heavyNote", "Melyek ezek?", "", { type: "text", ph: "pl. zongora, széf" }),
        ]
          .concat(
            stops.slice(1).map((_, n) =>
              dual(
                multi ? "Át-út: Cím " + (n + 1) + " → Cím " + (n + 2) : "Át-út ideje",
                "stop." + (n + 1) + ".trH",
                "stop." + (n + 1) + ".trM",
                {
                  aPh: "0",
                  bPh: "0",
                  aSuf: "óra",
                  bSuf: "perc",
                  hint: multi ? "" : "Az indulási címtől az érkezési címig. Az ügyfél kifizeti, de az elemzés nem számítja munkavégzésnek.",
                },
              ),
            ),
          )
          .concat(
            multi
              ? [
                  Object.assign({}, B, {
                    label: "Összes át-út",
                    isTotal: true,
                    totalValue: trTotal != null ? fmin(trTotal) : "Nincs adat",
                    totalColor: trTotal != null ? "#18212F" : "#9AA0A8",
                    span: "1 / -1",
                    hasHint: true,
                    hint:
                      "Az egyes át-utak összege" +
                      (trTotal != null ? "" : " – akkor számolható, ha minden át-út ki van töltve") +
                      ". Az ügyfél kifizeti, de az elemzés nem számítja munkavégzésnek.",
                  }),
                ]
              : [],
          )
          .concat([
            inp("extras", "Extra munka, szolgáltatás", "", {
              type: "text",
              wide: true,
              ph: "pl. bútorszerelés, csomagolás",
              hint: "Csak tájékoztató megjegyzés – nem számít bele sem a végösszegbe, sem az időelemzésbe.",
            }),
            area("unusual", "Szokatlan körülmények", "pl. szűk lépcsőház, messze kellett parkolni"),
          ])
          .concat(custom),
        [
          Object.assign(dual("Teljes eltelt idő – kezdéstől befejezésig", "totH", "totM", { hint: "Az át-út idejét is tartalmazza." }), {
            isDual: false,
            isTimeSel: true,
            aOpts: [{ value: "", label: "–" }].concat(
              Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
            ),
            bOpts: [].concat([0, 10, 20, 30, 40, 50].map((v) => ({ value: String(v), label: String(v) }))),
          }),
        ]
          .concat(f.pkg === "other" ? [inp("price", "Végösszeg (nettó) – egyedi csomag", "Ft", { big: true, wide: true })] : [])
          .concat([area("note", "Megjegyzés (nem kötelező)", "")]),
      ];
      const st = S.step,
        N = normJob(f, c),
        bl = billOf(N.m, c),
        tot = N.m.totalMin,
        tr = N.m.travelMin,
        wk = tot != null && tr != null && tot - tr > 0 ? tot - tr : null;
      const dash = "Nincs adat",
        val = (x, suf) => (has(x) ? fq(num(x)) + (suf ? " " + suf : "") : dash),
        ln = (fl, li) =>
          (has(fl) ? (num(fl) === 0 ? "földszint" : fq(num(fl)) + ". emelet") : "emelet: nincs adat") +
          " · " +
          (li === true ? "van lift" : li === false ? "nincs lift" : "lift: nincs adat"),
        lnw = (x) =>
          has(x.floor) || x.lift != null || x.walk
            ? ln(x.floor, x.lift) + " · " + "rakodási táv: " + (walkText(x.walk) || "nincs adat")
            : dash;
      const it = (label, value) => ({ label, value, color: value === dash ? "#9AA0A8" : "#18212F" });
      const lm = learnMissing(N.m),
        pkgName = pkg ? pkg.name : f.pkg === "other" ? "Egyedi" + (f.pkgOther ? ": " + f.pkgOther : "") : dash;
      const cr = (label, value, hl) => ({
        label,
        value,
        color: value === dash ? "#9AA0A8" : hl ? "#2A6F8A" : "#18212F",
        lc: hl ? "#2A6F8A" : "#3B4350",
        lw: hl ? "800" : "500",
      });
      Object.assign(out, {
        formTitle: S.editId ? "Munka szerkesztése" : "Új munka rögzítése",
        editing: !!S.editId,
        cancelEdit: () => this.setState({ f: emptyJob(), editId: null, step: 0, dateAuto: true }),
        steps: STEPS.map(([l], i) => {
          const a = i === st,
            d = i < st;
          return {
            num: String(i + 1),
            label: l,
            done: d,
            notDone: !d,
            onClick: () => this.goStep(i),
            bg: a ? "#5bc1e7" : d ? "#E8F6FC" : "#FFFFFF",
            border: a || d ? "#5bc1e7" : "#D9D6CF",
            fg: a ? "#0F2733" : d ? "#2A6F8A" : "#8A909A",
            weight: a ? "800" : "600",
            labelColor: a ? "#18212F" : "#5E6673",
            line: i <= st ? "#5bc1e7" : "#E6E4DF",
            lineDisplay: i === 0 ? "none" : "block",
          };
        }),
        stepNo: st + 1 + ". lépés",
        stepTitle: STEPS[st][0],
        stepHint: STEPS[st][1],
        stepCount: st + 1 + " / 5",
        isStep1: st === 0,
        isStep2: st === 1,
        isStep3: st === 2,
        addStop: () => this.addStop(),
        isStep4: st === 3,
        isStep5: st === 4,
        pkgCards: c.packages
          .map((p) => [p.id, p.name, ft(num(p.rate)) + " nettó / óra"])
          .map(([id, n, pr]) => {
            const a = f.pkg === id;
            return {
              name: n,
              price: pr,
              onClick: () => this.set("pkg", a ? "" : id),
              border: a ? "#5bc1e7" : "#E6E4DF",
              bg: a ? "#F2FAFD" : "#FFFFFF",
            };
          }),
        stepFields: sfields[st],
        isOtherPkg: false,
        pkgOther: f.pkgOther || "",
        onPkgOther: (e) => this.set("pkgOther", e.target.value),
        pkgNote: pkg
          ? "Kiállási díj: " +
            ft(num(pkg.rate) * num(c.callout ?? 1)) +
            " + " +
            ft(num(pkg.rate)) +
            " / óra a teljes eltelt időre, percre arányosan. Budapesten belül nincs km-díj."
          : "A csomag óradíja egyben a kiállási díj is. Budapesten belül nincs km-díj.",
        nfOpen: S.nfOpen,
        nfIcon: S.nfOpen ? "icon-chevron-up" : "icon-plus",
        toggleNf: () => this.setState({ nfOpen: !S.nfOpen }),
        nfName: S.nfName,
        nfType: S.nfType,
        nfUnit: S.nfUnit,
        nfIsNum: S.nfType === "num",
        onNfName: (e) => this.setState({ nfName: e.target.value }),
        onNfType: (e) => this.setState({ nfType: e.target.value }),
        onNfUnit: (e) => this.setState({ nfUnit: e.target.value }),
        addField: async () => {
          const n = S.nfName.trim();
          if (!n) return this.toast("Adj nevet a tényezőnek.", true);
          if (
            await this.run(
              () =>
                this.store.addField({
                  id: newId(),
                  name: n,
                  type: S.nfType,
                  unit: S.nfType === "num" ? S.nfUnit.trim() || "db" : "",
                  archived: false,
                }),
              "Új tényező hozzáadva",
            )
          )
            this.setState({ nfName: "", nfUnit: "", nfOpen: false });
        },
        calcRows: [
          cr("Kiválasztott csomag", pkgName),
          cr("Kiállási díj", bl ? ft(bl.callout) : dash),
          cr("Óradíj", bl ? ft(bl.rate) + " / óra" : dash),
          cr("Teljes számlázott idő", tot != null ? fmin(tot) : dash),
          cr(multi ? "Ebből át-út (összesen)" : "Ebből át-út", tr != null ? fmin(tr) : dash),
          cr("Tényleges munkavégzési idő (elemzéshez)", wk != null ? fmin(wk) : dash, true),
        ],
        calcTotal: bl ? ft(bl.total) : "–",
        calcFormula: bl
          ? ft(bl.callout) + " kiállás + " + fq(Math.round(bl.hours * 10000) / 10000) + " óra × " + ft(bl.rate) + " (percre arányosan)"
          : false
            ? ""
            : "A számításhoz csomag és teljes eltelt idő kell.",
        hasErrs: N.errs.length > 0,
        errTxt: N.errs.join(" · "),
        hasMissing: lm.length > 0 && !N.errs.length,
        missingTxt: "A munka így is elmenthető, de az időelemzésbe csak akkor kerül be, ha ez is megvan: " + lm.join(", ") + ".",
        summary: [
          {
            title: "Alapadatok",
            onEdit: () => this.goStep(0),
            items: [it("Munka típusa", "Új, befejezett munka"), it("Dátum", f.date ? fdate(f.date) : dash), it("Helyszín", "Budapest")],
          },
          {
            title: "Csomag és munka",
            onEdit: () => this.goStep(1),
            items: [
              it("Csomag", pkgName),
              it("Rakodók", has(f.workers) ? fq(num(f.workers)) + " fő" : crew(f, c) != null ? crew(f, c) + " fő (csomag alapján)" : dash),
            ],
          },
          {
            title: "Indulás és érkezés",
            onEdit: () => this.goStep(2),
            items: stops.map((x, i) => it("Cím " + (i + 1), lnw(x))),
          },
          {
            title: "Mennyiség és egyéb",
            onEdit: () => this.goStep(3),
            items: [
              it("Dobozok, zsákok", boxTxt(f) || dash),
              it("Kis bútor", val(f.smallF, "db")),
              it("Nagy bútor", val(f.largeF, "db")),
              it(
                "Nehéz tárgyak",
                has(f.heavy) ? fq(num(f.heavy)) + " db" + (f.heavyNote ? " (" + f.heavyNote + ")" : "") : f.heavyNote || dash,
              ),
            ]
              .concat(
                multi
                  ? N.m.stops
                      .slice(1)
                      .map((x, n) => it("Át-út: Cím " + (n + 1) + " → Cím " + (n + 2), x.travelMin != null ? fmin(x.travelMin) : dash))
                      .concat([it("Összes át-út", tr != null ? fmin(tr) : dash)])
                  : [it("Át-út ideje", tr != null ? fmin(tr) : dash)],
              )
              .concat([it("Extra munka", f.extras || dash), it("Szokatlan körülmények", f.unusual || dash)])
              .concat(
                fields.map((cf) => {
                  const v = (f.cf || {})[cf.id];
                  return it(cf.name, cf.type === "bool" ? (v === true ? "Igen" : v === false ? "Nem" : dash) : val(v, cf.unit));
                }),
              ),
          },
        ],
        back: () => this.setState({ step: Math.max(0, st - 1) }),
        backVis: st > 0 ? "visible" : "hidden",
        next: () => (st < 4 ? this.goStep(st + 1) : this.saveJob()),
        nextLabel: st < 4 ? "Tovább" : S.saving ? "Mentés…" : S.editId ? "Módosítás mentése" : "Munka mentése",
        nextIcon: st < 4 ? "icon-arrow-right" : "icon-save",
        downloadTemplate: () => this.downloadTemplate(),
        onFile: (e) => this.onFile(e),
        exportXlsx: () => this.exportXlsx(),
        jobCount: String(db.moves.length),
        empty: db.moves.length === 0,
        rows: db.moves.map((j) => {
          const p = c.packages.find((x) => x.id === j.pkg),
            m = learnMissing(j),
            fn = floorsNoLift(j),
            t = totMin(j),
            r = trMin(j),
            w = workMin(j),
            bt = boxTxt(j);
          return {
            title: [
              j.date ? fdate(j.date) : "Dátum nélkül",
              LOC[j.loc] || "Budapest",
              p ? p.name : j.pkg === "other" ? (j.pkgOther ? "Egyedi: " + j.pkgOther : "Egyedi") : "",
            ]
              .filter(Boolean)
              .join(" · "),
            sub:
              [
                crew(j, c) != null ? crew(j, c) + " rakodó" : "",
                stopsOf(j).length > 2 ? stopsOf(j).length + " cím" : "",
                t != null ? fmin(t) + " összesen" : "",
                r != null ? "át-út " + fmin(r) : "",
                w != null ? "munka " + fmin(w) : "",
                fn != null ? fn + " em. lift nélkül" : "",
                bt ? bt.replace(" (becslés)", "") + " doboz" : "",
                has(j.smallF) ? num(j.smallF) + " kis bútor" : "",
                has(j.largeF) ? num(j.largeF) + " nagy bútor" : "",
                has(j.furniture) && !has(j.smallF) && !has(j.largeF) ? num(j.furniture) + " bútor" : "",
                has(j.heavy) ? num(j.heavy) + " nehéz tárgy" : "",
              ]
                .filter(Boolean)
                .join(" · ") || "—",
            price: has(j.price) ? ft(toNet(j.price, j.priceType, vat)) + " nettó" : "Ár nélkül",
            src: j.source === "old" ? "Emlékből (régi)" : "Befejezett",
            srcBg: j.source === "old" ? "#EEECE7" : "#E8F6FC",
            use: m.length ? "Elemzéshez hiányzik: " + m.join(", ") : "Elemzésben használva",
            useBg: m.length ? "oklch(0.96 0.05 85)" : "oklch(0.94 0.05 155)",
            onEdit: () => {
              let [th, tm] = splitMin(t);
              if (!has(tm)) tm = "0";
              if (num(tm) % 10 !== 0) tm = String(Math.round(num(tm) / 10) * 10);
              // The minute picker stops at 50: a rounded-up 60 becomes the next full hour.
              if (num(tm) >= 60) {
                if (num(th) < 10) [th, tm] = [String(num(th) + 1), "0"];
                else tm = "50";
              }
              const e = Object.assign(emptyJob(), clone(j), {
                totH: th,
                totM: tm,
                stops: stopsOf(j).map((x, i) => {
                  const [rh, rm] = i === 0 ? ["", ""] : splitMin(x.travelMin);
                  return { floor: x.floor ?? "", lift: tri(x.lift), walk: x.walk || null, trH: rh, trM: rm };
                }),
              });
              if (!has(e.boxMin) && !has(e.boxMax) && has(j.boxes)) {
                e.boxMin = j.boxes;
                e.boxMax = j.boxes;
              }
              this.setState({ f: e, editId: j.id, step: 0, dateAuto: false });
              try {
                window.scrollTo(0, 0);
              } catch (x) {}
            },
            onDelete: () => {
              if (window.confirm("Biztosan törlöd ezt a munkát? Ez nem vonható vissza."))
                this.run(() => this.store.deleteMove(j.id), "Munka törölve");
            },
          };
        }),
      });
    }

    if (pg === "pricing") {
      const T = timeModel(db);
      const relName = ["", "Gyenge", "Közepes", "Erős"],
        relBg = ["#EEECE7", "#EEECE7", "oklch(0.94 0.06 85)", "oklch(0.93 0.06 155)"],
        relCol = ["#C9C5BD", "oklch(0.72 0.14 75)", "oklch(0.72 0.14 75)", "oklch(0.6 0.13 155)"];
      const vTxt = (r) => (r.d.kind === "bool" ? sfmin(r.v) + " " + r.d.when : sfmin(r.v * r.d.per) + " / " + r.d.perLbl);
      Object.assign(out, {
        stats: [
          { label: "Rögzített munka", value: String(T.total), sub: "Budapest, összesen", dot: "#18212F" },
          {
            label: "Elemzésben használva",
            value: String(T.use.length),
            sub: "ismert a teljes idő és az át-út",
            dot: "oklch(0.6 0.13 155)",
          },
          {
            label: "Tipikus munkavégzési idő",
            value: T.medWork != null ? fmin(T.medWork) : "Kevés adat",
            sub: T.medWork != null ? "át-út nélkül, medián" : "legalább 3 munka kell",
            dot: "#5bc1e7",
          },
          {
            label: "Tipikus át-út",
            value: T.medTravel != null ? fmin(T.medTravel) : "Kevés adat",
            sub: T.nTr + " munka alapján",
            dot: "#C9C5BD",
          },
        ],
        pkgRows: c.packages.map((p) => ({
          name: p.name,
          rate: ft(num(p.rate)) + " / óra",
          n: "Kiállási díj: " + ft(num(p.rate) * num(c.callout ?? 1)),
        })),
        hasBase: !!T.mv,
        baseTxt: T.mv ? fmin(T.mv.base) : "",
        baseSub: T.mv ? T.mv.n + " teljes adatú munka" : "",
        noEst: !T.rows.some((r) => r.ok),
        estLines: T.rows
          .filter((r) => r.ok)
          .map((r) => ({ label: r.d.label, value: vTxt(r), rel: relName[r.lvl] + " · " + r.n + " munka", relBg: relBg[r.lvl] })),
        hasFit: !!T.mv,
        fitTxt: T.mv
          ? "Ellenőrzés " +
            T.mv.n +
            " munkán: a becsült munkavégzési idő tipikusan ±" +
            fmin(T.mv.mae) +
            " eltéréssel adja vissza a tényleges időt."
          : "",
        factorRows: T.rows.map((r) => {
          const l = r.ok ? r.lvl : 0;
          const how = r.mv
            ? "a többi tényezővel együtt vizsgálva (átfedések kiszűrve)"
            : "egyenként vizsgálva – a tényezők átfedhetnek, amíg kevés a teljes adatú munka";
          const ex = r.ok
            ? (r.d.kind === "bool"
                ? r.na + " " + r.d.yes + " és " + r.nb + " másik munka tényleges munkaidejének különbsége, " + how + "."
                : r.n + " munka alapján, " + how + ". Csak a munkavégzési idő számít, az át-út nélkül.") +
              (r.d.key === "walk"
                ? " Címenként fokozat: 0 = közvetlenül a bejáratnál, 1 = közel, 2 = közepes távolság, 3 = messze, 4 = nagyon messze; a címek fokozatait összeadjuk."
                : "") +
              (r.d.key === "boxes"
                ? " A dobozszám a megadott tartomány közepe" +
                  (r.ranged ? "; " + r.ranged + " munkánál csak becsült tartomány ismert" : "") +
                  "."
                : "")
            : r.n < MIN
              ? "Eddig " + r.n + " összevethető munka, legalább " + MIN + " kell."
              : "Még nincs elég eltérő érték az összevetéshez.";
          return {
            label: r.d.label,
            ok: r.ok,
            notOk: !r.ok,
            value: r.ok ? vTxt(r) : "",
            explain: ex,
            nTxt: r.n + " munka",
            rel: r.ok ? relName[l] : "Nincs elég adat",
            b1: l >= 1 ? relCol[l] : "#E6E4DF",
            b2: l >= 2 ? relCol[l] : "#E6E4DF",
            b3: l >= 3 ? relCol[l] : "#E6E4DF",
          };
        }),
      });
    }
    return out;
  }
}
