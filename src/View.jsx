// View layer for the Move-ON pricing app. `v` is the view-model built by App.renderVals().
import { Fragment } from "react";
import logo from "./assets/moveon-logo.png";

export default function View({ v }) {
  return (
    <>
      <div style={{ minHeight: "100vh", background: "#F5F5F2" }}>
        {v.phaseLoading && (
          <>
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "14px",
                color: "#5E6673",
                fontSize: "15px",
              }}
            >
              <img src={logo} alt="Move ON" style={{ width: "56px", height: "56px" }} />
              <span>Betöltés…</span>
            </div>
          </>
        )}
        {v.phaseError && (
          <>
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <div
                style={{
                  width: "100%",
                  maxWidth: "460px",
                  background: "#FFFFFF",
                  border: "1px solid #E6E4DF",
                  borderRadius: "20px",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <img src={logo} alt="Move ON" style={{ width: "56px", height: "56px" }} />
                <div style={{ fontSize: "18px", fontWeight: "800" }}>Nem sikerült elérni az adatokat</div>
                <div style={{ fontSize: "14px", color: "#3B4350", lineHeight: "1.5" }}>{v.errText}</div>
                <button
                  onClick={v.retry}
                  style={{
                    alignSelf: "flex-start",
                    height: "46px",
                    padding: "0 18px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#5bc1e7",
                    color: "#0F2733",
                    fontSize: "15px",
                    fontWeight: "800",
                    cursor: "pointer",
                  }}
                >
                  Újrapróbálás
                </button>
              </div>
            </div>
          </>
        )}
        {v.phaseAuth && (
          <>
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              <div
                style={{ width: "100%", maxWidth: "440px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}
              >
                <form
                  onSubmit={v.onAuthSubmit}
                  style={{
                    width: "100%",
                    background: "#FFFFFF",
                    border: "1px solid #E6E4DF",
                    borderTop: "4px solid #5bc1e7",
                    borderRadius: "20px",
                    padding: "36px 32px 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "22px",
                    boxShadow: "0 12px 32px rgba(20,30,45,.06)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
                    <img src={logo} alt="Move ON" style={{ height: "76px", width: "76px", display: "block" }} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <div style={{ fontSize: "26px", fontWeight: "800", letterSpacing: "-0.02em" }}>Üdvözöljük!</div>
                      <div style={{ fontSize: "15px", fontWeight: "600", color: "#5E6673" }}>Move-ON árképzési rendszer</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#3B4350" }}>Felhasználónév</span>
                      <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <i
                          className="icon-user"
                          style={{ position: "absolute", left: "14px", fontSize: "17px", color: "#8A909A", pointerEvents: "none" }}
                        />
                        <input
                          className="fx-focus"
                          type="text"
                          value={v.user}
                          onChange={v.onUser}
                          autoComplete="username"
                          autoCapitalize="none"
                          spellCheck="false"
                          style={{
                            width: "100%",
                            height: "50px",
                            border: `1px solid ${v.fieldBorder}`,
                            borderRadius: "12px",
                            padding: "0 14px 0 42px",
                            fontSize: "16px",
                            color: "#18212F",
                            background: "#FFFFFF",
                            outline: "none",
                          }}
                        />
                      </span>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "#3B4350" }}>Jelszó</span>
                      <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
                        <i
                          className="icon-lock"
                          style={{ position: "absolute", left: "14px", fontSize: "17px", color: "#8A909A", pointerEvents: "none" }}
                        />
                        <input
                          className="fx-focus"
                          type={v.pwType}
                          value={v.pw}
                          onChange={v.onPw}
                          autoComplete="current-password"
                          style={{
                            width: "100%",
                            height: "50px",
                            border: `1px solid ${v.fieldBorder}`,
                            borderRadius: "12px",
                            padding: "0 50px 0 42px",
                            fontSize: "16px",
                            color: "#18212F",
                            background: "#FFFFFF",
                            outline: "none",
                          }}
                        />
                        <button
                          className="fx-hover-soft"
                          type="button"
                          onClick={v.togglePw}
                          aria-label={v.eyeLabel}
                          title={v.eyeLabel}
                          style={{
                            position: "absolute",
                            right: "4px",
                            width: "44px",
                            height: "44px",
                            border: "none",
                            background: "transparent",
                            borderRadius: "10px",
                            cursor: "pointer",
                            color: "#5E6673",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <i className={v.eyeIcon} style={{ fontSize: "18px" }} />
                        </button>
                      </span>
                    </label>
                  </div>
                  <div style={{ minHeight: "46px", display: "flex" }}>
                    {v.hasAuthErr && (
                      <>
                        <div
                          role="alert"
                          style={{
                            flex: "1",
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                            background: "oklch(0.96 0.03 27)",
                            border: "1px solid oklch(0.88 0.06 27)",
                            borderRadius: "12px",
                            padding: "12px 14px",
                            fontSize: "14px",
                            lineHeight: "1.45",
                            color: "oklch(0.42 0.15 27)",
                            fontWeight: "600",
                          }}
                        >
                          <i className="icon-circle-alert" style={{ fontSize: "17px", marginTop: "1px" }} />
                          <span>{v.authErr}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    className="fx-hover-primary"
                    type="submit"
                    style={{
                      height: "52px",
                      borderRadius: "12px",
                      border: "none",
                      background: "#5bc1e7",
                      color: "#0F2733",
                      fontSize: "16px",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="icon-log-in" style={{ fontSize: "18px" }} />
                    {v.authBtn}
                  </button>
                </form>
                <div style={{ fontSize: "12px", color: "#5E6673" }}>Belső használatra · közös céges fiók</div>
              </div>
            </div>
          </>
        )}
        {v.phaseApp && (
          <>
            <header style={{ background: "#FFFFFF", borderBottom: "1px solid #E6E4DF" }}>
              <div
                style={{ maxWidth: "1200px", margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div style={{ flex: "1", display: "flex", alignItems: "center", gap: "12px", minWidth: "0" }}>
                  <img src={logo} alt="Move ON" style={{ height: "44px", width: "44px", display: "block" }} />
                  <span
                    style={{ fontSize: "14px", fontWeight: "700", color: "#5E6673", paddingLeft: "12px", borderLeft: "1px solid #E6E4DF" }}
                  >
                    Árképzés
                  </span>
                </div>
                <button
                  onClick={v.logout}
                  style={{
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    border: "1px solid #E6E4DF",
                    background: "#FFFFFF",
                    color: "#3B4350",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Kilépés
                </button>
              </div>
              <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px", display: "flex", gap: "4px", overflowX: "auto" }}>
                {v.tabs.map((t, i) => (
                  <Fragment key={i}>
                    <button
                      onClick={t.onClick}
                      style={{
                        height: "48px",
                        padding: "0 16px",
                        border: "none",
                        borderBottom: `3px solid ${t.line}`,
                        background: "transparent",
                        color: t.fg,
                        fontSize: "15px",
                        fontWeight: t.weight,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        whiteSpace: "nowrap",
                        flexShrink: "0",
                      }}
                    >
                      <i className={t.icon} style={{ fontSize: "18px", color: t.iconColor }} />
                      <span>{t.label}</span>
                    </button>
                  </Fragment>
                ))}
              </div>
            </header>
            <main
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "28px 20px 96px",
                display: "flex",
                flexDirection: "column",
                gap: "22px",
              }}
            >
              {v.isJobs && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "760px" }}>
                    <div style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Munkák rögzítése</div>
                    <div style={{ fontSize: "15px", color: "#5E6673", lineHeight: "1.55" }}>
                      Rögzítsétek a befejezett munkákat. A legfontosabb a csomag, a teljes eltelt idő és az át-út ideje – ezekből számoljuk
                      a végösszeget és a tényleges munkaidőt. Minden más mező elhagyható.
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E6E4DF",
                      borderRadius: "16px",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "14px 18px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "#E8F6FC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: "0",
                      }}
                    >
                      <i className="icon-file-spreadsheet" style={{ fontSize: "22px", color: "#2A93BD" }} />
                    </div>
                    <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                      <span style={{ fontSize: "16px", fontWeight: "800" }}>Tömeges feltöltés Excelből</span>
                      <span style={{ fontSize: "13px", color: "#5E6673", lineHeight: "1.45" }}>
                        Több munka egyszerre: töltsd le a mintát (egy sor = egy cím, így több címes munka is megadható), majd töltsd fel
                        kitöltve.
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        className="fx-hover-soft"
                        onClick={v.downloadTemplate}
                        style={{
                          height: "44px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: "1px solid #D9D6CF",
                          background: "#FFFFFF",
                          color: "#18212F",
                          fontSize: "14px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <i className="icon-download" style={{ fontSize: "16px" }} />
                        Excel-minta letöltése
                      </button>
                      <label
                        className="fx-hover-tint"
                        style={{
                          height: "44px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: "1px solid #5bc1e7",
                          background: "#F2FAFD",
                          color: "#0F2733",
                          fontSize: "14px",
                          fontWeight: "800",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <i className="icon-upload" style={{ fontSize: "16px" }} />
                        Kitöltött Excel feltöltése
                        <input type="file" accept=".xlsx,.xls,.csv" onChange={v.onFile} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" }}>
                    <div
                      style={{
                        flex: "1.5 1 520px",
                        minWidth: "0",
                        background: "#FFFFFF",
                        border: "1px solid #E6E4DF",
                        borderRadius: "18px",
                        padding: "22px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                      }}
                    >
                      <div
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}
                      >
                        <div style={{ fontSize: "18px", fontWeight: "800" }}>{v.formTitle}</div>
                        {v.editing && (
                          <>
                            <button
                              onClick={v.cancelEdit}
                              style={{
                                height: "36px",
                                padding: "0 12px",
                                borderRadius: "9px",
                                border: "1px solid #D9D6CF",
                                background: "#FFFFFF",
                                color: "#18212F",
                                fontSize: "13px",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              Szerkesztés megszakítása
                            </button>
                          </>
                        )}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))" }}>
                        {v.steps.map((s, i) => (
                          <Fragment key={i}>
                            <button
                              onClick={s.onClick}
                              style={{
                                position: "relative",
                                background: "none",
                                border: "none",
                                padding: "0",
                                cursor: "pointer",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "6px",
                                minWidth: "0",
                              }}
                            >
                              <span
                                style={{
                                  position: "absolute",
                                  top: "15px",
                                  right: "calc(50% + 20px)",
                                  width: "calc(100% - 40px)",
                                  height: "2px",
                                  borderRadius: "1px",
                                  background: s.line,
                                  display: s.lineDisplay,
                                }}
                              />
                              <span
                                style={{
                                  position: "relative",
                                  zIndex: "1",
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "16px",
                                  background: s.bg,
                                  border: `2px solid ${s.border}`,
                                  color: s.fg,
                                  fontSize: "13px",
                                  fontWeight: "800",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {s.done && (
                                  <>
                                    <i className="icon-check" style={{ fontSize: "15px" }} />
                                  </>
                                )}
                                {s.notDone && <>{s.num}</>}
                              </span>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: s.weight,
                                  color: s.labelColor,
                                  textAlign: "center",
                                  lineHeight: "1.25",
                                  padding: "0 2px",
                                }}
                              >
                                {s.label}
                              </span>
                            </button>
                          </Fragment>
                        ))}
                      </div>
                      <div
                        style={{ display: "flex", flexDirection: "column", gap: "2px", borderTop: "1px solid #F0EEE9", paddingTop: "18px" }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            color: "#2A93BD",
                            letterSpacing: ".05em",
                            textTransform: "uppercase",
                          }}
                        >
                          {v.stepNo}
                        </div>
                        <div style={{ fontSize: "20px", fontWeight: "800" }}>{v.stepTitle}</div>
                        <div style={{ fontSize: "13px", color: "#5E6673", lineHeight: "1.45" }}>{v.stepHint}</div>
                      </div>
                      {v.isStep1 && (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "10px 14px",
                                  borderRadius: "12px",
                                  background: "#F2FAFD",
                                  border: "1px solid #5bc1e7",
                                  fontSize: "14px",
                                  fontWeight: "700",
                                }}
                              >
                                <i className="icon-circle-check" style={{ fontSize: "17px", color: "#2A93BD" }} />
                                Új, befejezett munka
                              </span>
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "10px 14px",
                                  borderRadius: "12px",
                                  background: "#F2FAFD",
                                  border: "1px solid #5bc1e7",
                                  fontSize: "14px",
                                  fontWeight: "700",
                                }}
                              >
                                <i className="icon-map-pin" style={{ fontSize: "17px", color: "#2A93BD" }} />
                                Budapest
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#5E6673" }}>
                              Jelenleg csak budapesti, befejezett munkák rögzíthetők.
                            </div>
                          </div>
                        </>
                      )}
                      {v.isStep2 && (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ fontSize: "13px", fontWeight: "600", color: "#3B4350" }}>Csomag</div>
                            <div
                              style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,180px),1fr))", gap: "8px" }}
                            >
                              {v.pkgCards.map((p, i) => (
                                <Fragment key={i}>
                                  <button
                                    onClick={p.onClick}
                                    style={{
                                      textAlign: "left",
                                      padding: "12px 14px",
                                      borderRadius: "12px",
                                      border: `2px solid ${p.border}`,
                                      background: p.bg,
                                      cursor: "pointer",
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "3px",
                                      color: "#18212F",
                                    }}
                                  >
                                    <span style={{ fontSize: "14px", fontWeight: "800" }}>{p.name}</span>
                                    <span style={{ fontSize: "13px", color: "#3B4350" }}>{p.price}</span>
                                  </button>
                                </Fragment>
                              ))}
                            </div>
                            {v.isOtherPkg && (
                              <>
                                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#3B4350" }}>
                                    Milyen csomag vagy szolgáltatás volt?
                                  </span>
                                  <input
                                    className="fx-focus-ring"
                                    type="text"
                                    value={v.pkgOther}
                                    onChange={v.onPkgOther}
                                    placeholder="pl. két autó + 4 rakodó, csak bútorszállítás"
                                    autoFocus={true}
                                    style={{
                                      width: "100%",
                                      height: "46px",
                                      border: "1px solid #5bc1e7",
                                      borderRadius: "10px",
                                      padding: "0 12px",
                                      fontSize: "15px",
                                      color: "#18212F",
                                      background: "#FFFFFF",
                                      outline: "none",
                                    }}
                                  />
                                </label>
                              </>
                            )}
                            <div style={{ fontSize: "12px", color: "#5E6673", lineHeight: "1.45" }}>{v.pkgNote}</div>
                          </div>
                        </>
                      )}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,220px),1fr))", gap: "16px" }}>
                        {v.stepFields.map((f, i) => (
                          <Fragment key={i}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "0", gridColumn: f.span }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", alignItems: "center" }}>
                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#3B4350" }}>{f.label}</span>
                                {f.removable && (
                                  <>
                                    <button
                                      onClick={f.onRemove}
                                      aria-label={f.removeLabel}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        padding: "0",
                                        color: "#9AA0A8",
                                        cursor: "pointer",
                                        display: "flex",
                                      }}
                                    >
                                      <i className="icon-x" style={{ fontSize: "14px" }} />
                                    </button>
                                  </>
                                )}
                              </div>
                              {f.isInput && (
                                <>
                                  <span style={{ position: "relative", display: "flex", alignItems: "center" }}>
                                    <input
                                      className="fx-focus"
                                      type={f.type}
                                      min="0"
                                      step={f.step}
                                      value={f.value}
                                      onChange={f.onChange}
                                      placeholder={f.ph}
                                      style={{
                                        width: "100%",
                                        height: f.h,
                                        border: "1px solid #D9D6CF",
                                        borderRadius: "10px",
                                        padding: `0 ${f.pad} 0 12px`,
                                        fontSize: f.fs,
                                        fontWeight: f.fw,
                                        color: "#18212F",
                                        background: "#FFFFFF",
                                        outline: "none",
                                      }}
                                    />
                                    <span
                                      style={{
                                        position: "absolute",
                                        right: "12px",
                                        fontSize: "13px",
                                        color: "#5E6673",
                                        pointerEvents: "none",
                                      }}
                                    >
                                      {f.suffix}
                                    </span>
                                  </span>
                                </>
                              )}
                              {f.isDual && (
                                <>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "440px" }}>
                                    <span style={{ position: "relative", flex: "1", display: "flex", alignItems: "center" }}>
                                      <input
                                        className="fx-focus"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={f.aVal}
                                        onChange={f.aOn}
                                        placeholder={f.aPh}
                                        style={{
                                          width: "100%",
                                          height: "46px",
                                          border: `1px solid ${f.border}`,
                                          borderRadius: "10px",
                                          padding: `0 ${f.aPad} 0 12px`,
                                          fontSize: "15px",
                                          color: "#18212F",
                                          background: "#FFFFFF",
                                          outline: "none",
                                        }}
                                      />
                                      <span
                                        style={{
                                          position: "absolute",
                                          right: "12px",
                                          fontSize: "13px",
                                          color: "#5E6673",
                                          pointerEvents: "none",
                                        }}
                                      >
                                        {f.aSuf}
                                      </span>
                                    </span>
                                    <span
                                      style={{
                                        fontSize: "18px",
                                        fontWeight: "700",
                                        color: "#5E6673",
                                        minWidth: f.sepW,
                                        textAlign: "center",
                                      }}
                                    >
                                      {f.sep}
                                    </span>
                                    <span style={{ position: "relative", flex: "1", display: "flex", alignItems: "center" }}>
                                      <input
                                        className="fx-focus"
                                        type="number"
                                        min="0"
                                        max={f.bMax}
                                        step={f.bStep}
                                        value={f.bVal}
                                        onChange={f.bOn}
                                        placeholder={f.bPh}
                                        style={{
                                          width: "100%",
                                          height: "46px",
                                          border: `1px solid ${f.border}`,
                                          borderRadius: "10px",
                                          padding: `0 ${f.bPad} 0 12px`,
                                          fontSize: "15px",
                                          color: "#18212F",
                                          background: "#FFFFFF",
                                          outline: "none",
                                        }}
                                      />
                                      <span
                                        style={{
                                          position: "absolute",
                                          right: "12px",
                                          fontSize: "13px",
                                          color: "#5E6673",
                                          pointerEvents: "none",
                                        }}
                                      >
                                        {f.bSuf}
                                      </span>
                                    </span>
                                  </div>
                                </>
                              )}
                              {f.isTimeSel && (
                                <>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", maxWidth: "440px" }}>
                                    <span style={{ position: "relative", flex: "1", display: "flex", alignItems: "center" }}>
                                      <select
                                        value={f.aVal}
                                        onChange={f.aOn}
                                        aria-label="Óra"
                                        style={{
                                          width: "100%",
                                          height: "46px",
                                          border: `1px solid ${f.border}`,
                                          borderRadius: "10px",
                                          padding: "0 48px 0 12px",
                                          fontSize: "15px",
                                          color: "#18212F",
                                          background: "#FFFFFF",
                                          cursor: "pointer",
                                          outline: "none",
                                        }}
                                      >
                                        {f.aOpts.map((o, i) => (
                                          <Fragment key={i}>
                                            <option value={o.value}>{o.label}</option>
                                          </Fragment>
                                        ))}
                                      </select>
                                      <span
                                        style={{
                                          position: "absolute",
                                          right: "30px",
                                          fontSize: "13px",
                                          color: "#5E6673",
                                          pointerEvents: "none",
                                        }}
                                      >
                                        óra
                                      </span>
                                    </span>
                                    <span style={{ position: "relative", flex: "1", display: "flex", alignItems: "center" }}>
                                      <select
                                        value={f.bVal}
                                        onChange={f.bOn}
                                        aria-label="Perc"
                                        style={{
                                          width: "100%",
                                          height: "46px",
                                          border: `1px solid ${f.border}`,
                                          borderRadius: "10px",
                                          padding: "0 54px 0 12px",
                                          fontSize: "15px",
                                          color: "#18212F",
                                          background: "#FFFFFF",
                                          cursor: "pointer",
                                          outline: "none",
                                        }}
                                      >
                                        {f.bOpts.map((o, i) => (
                                          <Fragment key={i}>
                                            <option value={o.value}>{o.label}</option>
                                          </Fragment>
                                        ))}
                                      </select>
                                      <span
                                        style={{
                                          position: "absolute",
                                          right: "30px",
                                          fontSize: "13px",
                                          color: "#5E6673",
                                          pointerEvents: "none",
                                        }}
                                      >
                                        perc
                                      </span>
                                    </span>
                                  </div>
                                </>
                              )}
                              {f.isSeg && (
                                <>
                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "3px",
                                      background: "#F1EFEA",
                                      padding: "3px",
                                      borderRadius: "10px",
                                      minHeight: "46px",
                                    }}
                                  >
                                    {f.options.map((o, i) => (
                                      <Fragment key={i}>
                                        <button
                                          onClick={o.onClick}
                                          style={{
                                            flex: "1 1 0",
                                            minWidth: "0",
                                            padding: "0 4px",
                                            borderRadius: "8px",
                                            border: "none",
                                            background: o.bg,
                                            color: o.fg,
                                            fontSize: "14px",
                                            fontWeight: o.weight,
                                            boxShadow: o.shadow,
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          {o.label}
                                        </button>
                                      </Fragment>
                                    ))}
                                  </div>
                                </>
                              )}
                              {f.isTotal && (
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    gap: "12px",
                                    maxWidth: "440px",
                                    minHeight: "46px",
                                    padding: "0 14px",
                                    borderRadius: "10px",
                                    background: "#F7F6F3",
                                    fontSize: "15px",
                                  }}
                                >
                                  <span style={{ color: "#3B4350", fontWeight: "600" }}>Összesen</span>
                                  <span style={{ fontSize: "17px", fontWeight: "800", color: f.totalColor }}>{f.totalValue}</span>
                                </div>
                              )}
                              {f.isArea && (
                                <>
                                  <textarea
                                    className="fx-focus"
                                    rows="2"
                                    value={f.value}
                                    onChange={f.onChange}
                                    placeholder={f.ph}
                                    style={{
                                      width: "100%",
                                      border: "1px solid #D9D6CF",
                                      borderRadius: "10px",
                                      padding: "10px 12px",
                                      fontSize: "15px",
                                      color: "#18212F",
                                      outline: "none",
                                      resize: "vertical",
                                      lineHeight: "1.45",
                                    }}
                                  />
                                </>
                              )}
                              {f.hasHint && (
                                <>
                                  <span style={{ fontSize: "12px", color: f.hintColor, fontWeight: f.hintWeight, lineHeight: "1.4" }}>
                                    {f.hint}
                                  </span>
                                </>
                              )}
                            </div>
                          </Fragment>
                        ))}
                      </div>
                      {v.isStep3 && (
                        <button
                          className="fx-hover-tint"
                          onClick={v.addStop}
                          style={{
                            alignSelf: "flex-start",
                            height: "44px",
                            padding: "0 14px",
                            borderRadius: "10px",
                            border: "1px solid #5bc1e7",
                            background: "#F2FAFD",
                            color: "#0F2733",
                            fontSize: "14px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <i className="icon-plus" style={{ fontSize: "16px" }} />
                          Új cím hozzáadása
                        </button>
                      )}
                      {v.isStep4 && (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button
                              onClick={v.toggleNf}
                              style={{
                                alignSelf: "flex-start",
                                background: "none",
                                border: "none",
                                padding: "0",
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#18212F",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <i className={v.nfIcon} style={{ fontSize: "14px" }} />
                              Hiányzik egy tényező? Új tényező hozzáadása
                            </button>
                            {v.nfOpen && (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    background: "#F7F6F3",
                                    borderRadius: "12px",
                                    padding: "14px",
                                  }}
                                >
                                  <div style={{ fontSize: "12px", color: "#5E6673", lineHeight: "1.45" }}>
                                    pl. bútorszerelés (db), zongora (igen/nem), gyaloglás a kocsiig (méter). Minden munkánál és az
                                    Excel-mintában is megjelenik, és az árazás is vizsgálja.
                                  </div>
                                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <input
                                      type="text"
                                      value={v.nfName}
                                      onChange={v.onNfName}
                                      placeholder="Tényező neve"
                                      style={{
                                        flex: "2 1 160px",
                                        height: "44px",
                                        border: "1px solid #D9D6CF",
                                        borderRadius: "10px",
                                        padding: "0 12px",
                                        fontSize: "15px",
                                        outline: "none",
                                        background: "#FFFFFF",
                                      }}
                                    />
                                    <select
                                      value={v.nfType}
                                      onChange={v.onNfType}
                                      style={{
                                        flex: "1 1 120px",
                                        height: "44px",
                                        border: "1px solid #D9D6CF",
                                        borderRadius: "10px",
                                        padding: "0 10px",
                                        fontSize: "14px",
                                        background: "#FFFFFF",
                                      }}
                                    >
                                      <option value="num">Szám</option>
                                      <option value="bool">Igen / nem</option>
                                    </select>
                                    {v.nfIsNum && (
                                      <>
                                        <input
                                          type="text"
                                          value={v.nfUnit}
                                          onChange={v.onNfUnit}
                                          placeholder="Egység (db, m…)"
                                          style={{
                                            flex: "1 1 110px",
                                            height: "44px",
                                            border: "1px solid #D9D6CF",
                                            borderRadius: "10px",
                                            padding: "0 12px",
                                            fontSize: "15px",
                                            outline: "none",
                                            background: "#FFFFFF",
                                          }}
                                        />
                                      </>
                                    )}
                                    <button
                                      onClick={v.addField}
                                      style={{
                                        height: "44px",
                                        padding: "0 16px",
                                        borderRadius: "10px",
                                        border: "none",
                                        background: "#5bc1e7",
                                        color: "#0F2733",
                                        fontSize: "14px",
                                        fontWeight: "800",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                      }}
                                    >
                                      <i className="icon-plus" style={{ fontSize: "15px" }} />
                                      Hozzáadás
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      )}
                      {v.isStep5 && (
                        <>
                          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div
                              style={{
                                border: "2px solid #5bc1e7",
                                borderRadius: "14px",
                                padding: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                              }}
                            >
                              <div style={{ fontSize: "15px", fontWeight: "800", marginBottom: "6px" }}>Számítás</div>
                              {v.calcRows.map((c, i) => (
                                <Fragment key={i}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      gap: "12px",
                                      fontSize: "14px",
                                      padding: "7px 0",
                                      borderBottom: "1px dashed #F0EEE9",
                                    }}
                                  >
                                    <span style={{ color: c.lc, fontWeight: c.lw }}>{c.label}</span>
                                    <span style={{ fontWeight: "700", color: c.color, textAlign: "right" }}>{c.value}</span>
                                  </div>
                                </Fragment>
                              ))}
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "baseline",
                                  gap: "12px",
                                  paddingTop: "10px",
                                  flexWrap: "wrap",
                                }}
                              >
                                <span style={{ fontSize: "15px", fontWeight: "800" }}>Számított végösszeg (nettó)</span>
                                <span style={{ fontSize: "24px", fontWeight: "800" }}>{v.calcTotal}</span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#5E6673", textAlign: "right" }}>{v.calcFormula}</div>
                            </div>
                            {v.hasErrs && (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "flex-start",
                                    background: "oklch(0.96 0.03 27)",
                                    border: "1px solid oklch(0.88 0.06 27)",
                                    borderRadius: "12px",
                                    padding: "12px 14px",
                                    fontSize: "13px",
                                    lineHeight: "1.45",
                                    color: "oklch(0.42 0.15 27)",
                                    fontWeight: "600",
                                  }}
                                >
                                  <i className="icon-circle-alert" style={{ fontSize: "16px", marginTop: "1px" }} />
                                  <span>{v.errTxt}</span>
                                </div>
                              </>
                            )}
                            {v.hasMissing && (
                              <>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "10px",
                                    alignItems: "flex-start",
                                    background: "oklch(0.96 0.05 85)",
                                    borderRadius: "12px",
                                    padding: "12px 14px",
                                    fontSize: "13px",
                                    lineHeight: "1.45",
                                    color: "#3B3014",
                                  }}
                                >
                                  <i className="icon-info" style={{ fontSize: "16px", marginTop: "1px" }} />
                                  <span>{v.missingTxt}</span>
                                </div>
                              </>
                            )}
                            <div style={{ fontSize: "15px", fontWeight: "800" }}>Összegzés</div>
                            {v.summary.map((g, i) => (
                              <Fragment key={i}>
                                <div
                                  style={{
                                    border: "1px solid #E6E4DF",
                                    borderRadius: "12px",
                                    padding: "12px 14px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                  }}
                                >
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "800" }}>{g.title}</span>
                                    <button
                                      onClick={g.onEdit}
                                      style={{
                                        background: "none",
                                        border: "none",
                                        padding: "0",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        color: "#2A6F8A",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <i className="icon-pencil" style={{ fontSize: "12px" }} />
                                      Módosítás
                                    </button>
                                  </div>
                                  <div
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,200px),1fr))",
                                      gap: "4px 16px",
                                    }}
                                  >
                                    {g.items.map((it, i) => (
                                      <Fragment key={i}>
                                        <div
                                          style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: "8px",
                                            fontSize: "13px",
                                            padding: "3px 0",
                                            borderBottom: "1px dashed #F0EEE9",
                                          }}
                                        >
                                          <span style={{ color: "#5E6673" }}>{it.label}</span>
                                          <span style={{ fontWeight: "700", color: it.color, textAlign: "right" }}>{it.value}</span>
                                        </div>
                                      </Fragment>
                                    ))}
                                  </div>
                                </div>
                              </Fragment>
                            ))}
                          </div>
                        </>
                      )}
                      <div
                        style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid #F0EEE9", paddingTop: "16px" }}
                      >
                        <button
                          onClick={v.back}
                          style={{
                            height: "48px",
                            padding: "0 16px",
                            borderRadius: "12px",
                            border: "1px solid #D9D6CF",
                            background: "#FFFFFF",
                            color: "#18212F",
                            fontSize: "15px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            visibility: v.backVis,
                          }}
                        >
                          <i className="icon-arrow-left" style={{ fontSize: "16px" }} />
                          Vissza
                        </button>
                        <span style={{ flex: "1", textAlign: "center", fontSize: "13px", color: "#5E6673" }}>{v.stepCount}</span>
                        <button
                          className="fx-hover-primary"
                          onClick={v.next}
                          style={{
                            height: "48px",
                            padding: "0 22px",
                            borderRadius: "12px",
                            border: "none",
                            background: "#5bc1e7",
                            color: "#0F2733",
                            fontSize: "15px",
                            fontWeight: "800",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {v.nextLabel}
                          <i className={v.nextIcon} style={{ fontSize: "16px" }} />
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        flex: "1 1 340px",
                        minWidth: "0",
                        background: "#FFFFFF",
                        border: "1px solid #E6E4DF",
                        borderRadius: "18px",
                        padding: "20px 22px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap",
                          marginBottom: "6px",
                        }}
                      >
                        <div style={{ fontSize: "18px", fontWeight: "800" }}>Rögzített munkák ({v.jobCount})</div>
                        <button
                          onClick={v.exportXlsx}
                          style={{
                            height: "36px",
                            padding: "0 12px",
                            borderRadius: "9px",
                            border: "1px solid #D9D6CF",
                            background: "#FFFFFF",
                            color: "#18212F",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <i className="icon-download" style={{ fontSize: "14px" }} />
                          Excel
                        </button>
                      </div>
                      {v.empty && (
                        <>
                          <div style={{ padding: "14px 0", color: "#5E6673", fontSize: "14px", lineHeight: "1.5" }}>
                            Még nincs rögzített munka. Kezdjétek a legutóbbi néhány költözéssel, amire emlékeztek.
                          </div>
                        </>
                      )}
                      {v.rows.map((r, i) => (
                        <Fragment key={i}>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "6px",
                              padding: "12px 0",
                              borderTop: "1px solid #F0EEE9",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                              <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                                <span style={{ fontSize: "14px", fontWeight: "700" }}>{r.title}</span>
                                <span style={{ fontSize: "12px", color: "#5E6673", lineHeight: "1.4" }}>{r.sub}</span>
                              </div>
                              <span style={{ fontSize: "15px", fontWeight: "800", whiteSpace: "nowrap" }}>{r.price}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 7px",
                                  borderRadius: "5px",
                                  background: r.srcBg,
                                  color: "#18212F",
                                }}
                              >
                                {r.src}
                              </span>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  padding: "3px 7px",
                                  borderRadius: "5px",
                                  background: r.useBg,
                                  color: "#18212F",
                                }}
                              >
                                {r.use}
                              </span>
                              <span style={{ flex: "1" }} />
                              <button
                                onClick={r.onEdit}
                                aria-label="Szerkesztés"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "9px",
                                  border: "1px solid #D9D6CF",
                                  background: "#FFFFFF",
                                  cursor: "pointer",
                                  color: "#18212F",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <i className="icon-pencil" style={{ fontSize: "14px" }} />
                              </button>
                              <button
                                onClick={r.onDelete}
                                aria-label="Törlés"
                                style={{
                                  width: "34px",
                                  height: "34px",
                                  borderRadius: "9px",
                                  border: "1px solid #D9D6CF",
                                  background: "#FFFFFF",
                                  cursor: "pointer",
                                  color: "oklch(0.5 0.17 27)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <i className="icon-trash-2" style={{ fontSize: "14px" }} />
                              </button>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                </>
              )}
              {v.isPricing && (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "780px" }}>
                    <div style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.02em" }}>Árazás</div>
                    <div style={{ fontSize: "16px", color: "#3B4350", lineHeight: "1.5", fontWeight: "600" }}>
                      Mennyi munkaidőt jelentenek az egyes tényezők a rögzített munkák alapján – és ebből hogyan áll össze az ár?
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "stretch" }}>
                    {v.stats.map((s, i) => (
                      <Fragment key={i}>
                        <div
                          style={{
                            flex: "1 1 170px",
                            background: "#FFFFFF",
                            border: "1px solid #E6E4DF",
                            borderRadius: "14px",
                            padding: "14px 16px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "#5E6673",
                            }}
                          >
                            <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.dot }} />
                            {s.label}
                          </span>
                          <span style={{ fontSize: "24px", fontWeight: "800" }}>{s.value}</span>
                          <span style={{ fontSize: "12px", color: "#5E6673", lineHeight: "1.35" }}>{s.sub}</span>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "2px solid #5bc1e7",
                      borderRadius: "18px",
                      padding: "22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ fontSize: "18px", fontWeight: "800" }}>Árstruktúra</div>
                      <div style={{ fontSize: "13px", color: "#5E6673" }}>
                        Az ügyfél a teljes eltelt időt fizeti, az át-úttal együtt. Minden összeg nettó.
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        background: "#F7F6F3",
                        borderRadius: "12px",
                        padding: "12px 14px",
                      }}
                    >
                      <div style={{ fontSize: "15px", fontWeight: "800" }}>Végösszeg = kiállási díj + teljes eltelt idő × óradíj</div>
                      <div style={{ fontSize: "13px", color: "#3B4350" }}>Teljes eltelt idő = becsült munkavégzési idő + át-út ideje</div>
                      <div style={{ fontSize: "12px", color: "#5E6673" }}>
                        A kiállási díj a csomag óradíja (0. óra). Budapesten belül nincs km-díj.
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#5E6673",
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        1. Move-ON csomagok
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,230px),1fr))", gap: "8px" }}>
                        {v.pkgRows.map((p, i) => (
                          <Fragment key={i}>
                            <div
                              style={{
                                background: "#F7F6F3",
                                borderRadius: "12px",
                                padding: "12px 14px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "2px",
                              }}
                            >
                              <span style={{ fontSize: "14px", fontWeight: "700" }}>{p.name}</span>
                              <span style={{ fontSize: "17px", fontWeight: "800" }}>{p.rate}</span>
                              <span style={{ fontSize: "12px", color: "#5E6673" }}>{p.n}</span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <div
                      style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid #F0EEE9", paddingTop: "14px" }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#5E6673",
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                        }}
                      >
                        2. Becsült munkavégzési idő (át-út nélkül)
                      </div>
                      {v.hasBase && (
                        <>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px 14px",
                              flexWrap: "wrap",
                              padding: "8px 0",
                              borderBottom: "1px dashed #F0EEE9",
                            }}
                          >
                            <span style={{ flex: "1 1 200px", fontSize: "14px", fontWeight: "700" }}>Alap munkaidő</span>
                            <span style={{ fontSize: "16px", fontWeight: "800", whiteSpace: "nowrap" }}>{v.baseTxt}</span>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "3px 8px",
                                borderRadius: "5px",
                                background: "#EEECE7",
                                color: "#18212F",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {v.baseSub}
                            </span>
                          </div>
                        </>
                      )}
                      {v.noEst && (
                        <>
                          <div
                            style={{
                              fontSize: "14px",
                              color: "#3B4350",
                              lineHeight: "1.5",
                              background: "#F7F6F3",
                              borderRadius: "12px",
                              padding: "12px 14px",
                            }}
                          >
                            Jelenleg nincs elegendő adat megbízható időbecslés készítéséhez. Egy tényező akkor kerül ide, ha legalább 5
                            munkánál ismert a teljes idő, az át-út ideje és a tényező értéke.
                          </div>
                        </>
                      )}
                      {v.estLines.map((e, i) => (
                        <Fragment key={i}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px 14px",
                              flexWrap: "wrap",
                              padding: "8px 0",
                              borderBottom: "1px dashed #F0EEE9",
                            }}
                          >
                            <span style={{ flex: "1 1 200px", fontSize: "14px", fontWeight: "600" }}>{e.label}</span>
                            <span style={{ fontSize: "16px", fontWeight: "800", whiteSpace: "nowrap" }}>{e.value}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    {v.hasFit && (
                      <>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-start",
                            background: "#E8F6FC",
                            borderRadius: "12px",
                            padding: "12px 14px",
                            fontSize: "13px",
                            lineHeight: "1.5",
                            color: "#18212F",
                          }}
                        >
                          <i className="icon-target" style={{ fontSize: "16px", color: "#2A93BD", marginTop: "1px" }} />
                          <span>{v.fitTxt}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #E6E4DF",
                      borderRadius: "18px",
                      padding: "20px 22px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "6px" }}>Tényezők időhatása részletesen</div>
                    {v.factorRows.map((r, i) => (
                      <Fragment key={i}>
                        <div
                          style={{
                            display: "flex",
                            gap: "10px 18px",
                            alignItems: "center",
                            flexWrap: "wrap",
                            padding: "14px 0",
                            borderTop: "1px solid #F0EEE9",
                          }}
                        >
                          <div style={{ flex: "2 1 260px", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                            <span style={{ fontSize: "15px", fontWeight: "700" }}>{r.label}</span>
                            <span style={{ fontSize: "12px", color: "#5E6673", lineHeight: "1.45" }}>{r.explain}</span>
                          </div>
                          <div style={{ flex: "1 1 180px", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                            {r.ok && (
                              <>
                                <span style={{ fontSize: "18px", fontWeight: "800" }}>{r.value}</span>
                              </>
                            )}
                            {r.notOk && (
                              <>
                                <span style={{ fontSize: "13px", color: "#5E6673", lineHeight: "1.4" }}>
                                  Jelenleg nincs elegendő adat megbízható időbecslés készítéséhez.
                                </span>
                              </>
                            )}
                          </div>
                          <div style={{ flex: "0 0 150px", display: "flex", flexDirection: "column", gap: "5px" }}>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "#3B4350" }}>{r.nTxt}</span>
                          </div>
                        </div>
                      </Fragment>
                    ))}
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#5E6673",
                        lineHeight: "1.55",
                        background: "#F7F6F3",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        marginTop: "8px",
                      }}
                    >
                      Hogyan számol: minden munkánál a tényleges munkavégzési időt nézzük (teljes eltelt idő − át-út ideje); az át-út ideje
                      egyik tényezőhöz sem számít bele. Ha elég teljes adatú munka van, a tényezőket együtt vizsgáljuk, így az átfedéseik
                      kiszűrődnek; addig egyenként. A dobozszám a megadott minimum–maximum tartomány közepe, ezért becslés. A „nincs adat”
                      értékek nem számítanak bele. Ezek a rögzített munkákban látható összefüggések, nem bizonyított ok-okozati hatások.
                    </div>
                  </div>
                </>
              )}
            </main>
          </>
        )}
        {v.impOpen && (
          <>
            <div
              style={{
                position: "fixed",
                inset: "0",
                zIndex: "50",
                background: "rgba(20,28,40,.45)",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                padding: "32px 16px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "580px",
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ fontSize: "20px", fontWeight: "800" }}>Excel feltöltés ellenőrzése</div>
                  <div style={{ fontSize: "13px", color: "#5E6673" }}>{v.impName}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "8px" }}>
                  {v.impStats.map((s, i) => (
                    <Fragment key={i}>
                      <div
                        style={{
                          background: s.bg,
                          borderRadius: "12px",
                          padding: "12px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        <span style={{ fontSize: "22px", fontWeight: "800" }}>{s.value}</span>
                        <span style={{ fontSize: "12px", color: "#3B4350", lineHeight: "1.3" }}>{s.label}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                {v.hasImpErrors && (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ fontSize: "14px", fontWeight: "800" }}>Javítandó sorok</div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          maxHeight: "220px",
                          overflowY: "auto",
                          border: "1px solid oklch(0.88 0.06 27)",
                          borderRadius: "12px",
                          padding: "0 12px",
                        }}
                      >
                        {v.impErrors.map((e, i) => (
                          <Fragment key={i}>
                            <div
                              style={{
                                display: "flex",
                                gap: "10px",
                                padding: "8px 0",
                                borderBottom: "1px solid #F0EEE9",
                                fontSize: "13px",
                                lineHeight: "1.45",
                              }}
                            >
                              <b style={{ whiteSpace: "nowrap", color: "oklch(0.45 0.15 27)" }}>{e.row}</b>
                              <span>{e.reasons}</span>
                            </div>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                <div style={{ fontSize: "12px", color: "#5E6673", lineHeight: "1.5" }}>{v.impNote}</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={v.doImport}
                    style={{
                      height: "46px",
                      padding: "0 18px",
                      borderRadius: "12px",
                      border: "none",
                      background: v.impBtnBg,
                      color: "#0F2733",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {v.impBtn}
                  </button>
                  <button
                    onClick={v.closeImp}
                    style={{
                      height: "46px",
                      padding: "0 16px",
                      borderRadius: "12px",
                      border: "1px solid #D9D6CF",
                      background: "#FFFFFF",
                      color: "#18212F",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Mégse
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        {v.hasToast && (
          <>
            <div
              style={{
                position: "fixed",
                left: "50%",
                bottom: "24px",
                transform: "translateX(-50%)",
                zIndex: "60",
                background: v.toastBg,
                color: "#FFFFFF",
                borderRadius: "12px",
                padding: "12px 18px",
                fontSize: "14px",
                fontWeight: "700",
                boxShadow: "0 8px 24px rgba(20,30,45,.25)",
                maxWidth: "calc(100vw - 32px)",
              }}
            >
              {v.toastText}
            </div>
          </>
        )}
      </div>
    </>
  );
}
