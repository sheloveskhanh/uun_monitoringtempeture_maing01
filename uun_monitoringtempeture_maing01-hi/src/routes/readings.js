//@@viewOn:imports
import { createVisualComponent, Utils, useState, useEffect, useMemo } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const PAGE_SIZE = 12;
//@@viewOff:constants

//@@viewOn:helpers
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function statusOf(r, rulesByEui) {
  const rule = rulesByEui[r.deviceEui];
  if (!rule) return { kind: "ok", label: "OK" };
  if (parseFloat(r.temperature) > rule.maxC) return { kind: "critical", label: "Too high" };
  if (parseFloat(r.temperature) < rule.minC) return { kind: "critical", label: "Too low" };
  if (parseFloat(r.voltageRest) < rule.batteryLowV) return { kind: "warning", label: "Battery low" };
  return { kind: "ok", label: "OK" };
}
//@@viewOff:helpers

let Readings = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "Readings",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    const [eui, setEui] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [status, setStatus] = useState("all");
    const [applied, setApplied] = useState({ eui: "", from: "", to: "", status: "all" });
    const [sortKey, setSortKey] = useState("processedAt");
    const [sortDir, setSortDir] = useState("desc");
    const [page, setPage] = useState(1);

    const [readings, setReadings] = useState([]);
    const [total, setTotal] = useState(0);
    const [loadState, setLoadState] = useState("pendingNoData");
    const [devices, setDevices] = useState([]);
    const [rulesByEui, setRulesByEui] = useState({});
    const [toast, setToast] = useState(null);
    const [exportModal, setExportModal] = useState(null);

    // Load devices and rules once on mount
    useEffect(() => {
      Calls.listDevices({}).then(dtoOut => {
        setDevices((dtoOut.itemList ?? []).filter(Boolean));
      }).catch(() => {});
      Calls.listRules({}).then(dtoOut => {
        const map = {};
        (dtoOut.itemList ?? []).filter(Boolean).forEach(r => { if (r.deviceEui) map[r.deviceEui] = r; });
        setRulesByEui(map);
      }).catch(() => {});
    }, []);

    // Reload readings when applied filters or page changes
    useEffect(() => {
      let cancelled = false;
      const dtoIn = { pageInfo: { pageSize: PAGE_SIZE, pageIndex: page - 1 } };
      if (applied.eui) dtoIn.deviceEui = applied.eui;
      if (applied.from) dtoIn.from = new Date(applied.from).toISOString();
      if (applied.to) dtoIn.to = new Date(applied.to + "T23:59:59").toISOString();
      Calls.listReadings(dtoIn).then(dtoOut => {
        if (cancelled) return;
        setReadings((dtoOut.itemList ?? []).filter(Boolean));
        setTotal(dtoOut.pageInfo?.total ?? 0);
        setLoadState("ready");
      }).catch(() => {
        if (!cancelled) setLoadState("ready");
      });
      return () => { cancelled = true; };
    }, [applied, page]);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    const pageRows = useMemo(() => {
      let rows = readings;
      if (applied.status !== "all") {
        rows = rows.filter(r => statusOf(r, rulesByEui).kind === applied.status);
      }
      return [...rows].sort((a, b) => {
        let av, bv;
        if (sortKey === "processedAt") {
          av = new Date(a.processedAt).getTime();
          bv = new Date(b.processedAt).getTime();
        } else if (sortKey === "temperature") {
          av = parseFloat(a.temperature);
          bv = parseFloat(b.temperature);
        } else if (sortKey === "voltageRest") {
          av = parseFloat(a.voltageRest);
          bv = parseFloat(b.voltageRest);
        } else if (sortKey === "deviceEui") {
          av = a.deviceEui;
          bv = b.deviceEui;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }, [readings, applied.status, sortKey, sortDir, rulesByEui]);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const chips = [];
    if (applied.eui) {
      const dev = devices.find(d => d.deviceEui === applied.eui);
      chips.push({
        key: "eui",
        label: "Device: " + (dev ? dev.name : applied.eui),
        clear: () => { setEui(""); setApplied(a => ({ ...a, eui: "" })); setPage(1); },
      });
    }
    if (applied.from) chips.push({ key: "from", label: "From: " + applied.from, clear: () => { setFrom(""); setApplied(a => ({ ...a, from: "" })); setPage(1); } });
    if (applied.to) chips.push({ key: "to", label: "To: " + applied.to, clear: () => { setTo(""); setApplied(a => ({ ...a, to: "" })); setPage(1); } });
    if (applied.status !== "all") chips.push({ key: "status", label: "Status: " + applied.status, clear: () => { setStatus("all"); setApplied(a => ({ ...a, status: "all" })); setPage(1); } });

    function handleApply() {
      setApplied({ eui, from, to, status });
      setPage(1);
    }

    function handleReset() {
      setEui(""); setFrom(""); setTo(""); setStatus("all");
      setApplied({ eui: "", from: "", to: "", status: "all" });
      setPage(1);
    }

    function handleDevicePillClick(deviceEui) {
      setEui(deviceEui);
      setApplied(a => ({ ...a, eui: deviceEui }));
      setPage(1);
    }

    async function handleExport() {
      if (!exportModal) return;
      setExportModal(m => ({ ...m, loading: true }));
      try {
        const base = {};
        if (applied.eui) base.deviceEui = applied.eui;
        if (exportModal.from) base.from = new Date(exportModal.from).toISOString();
        if (exportModal.to) base.to = new Date(exportModal.to + "T23:59:59").toISOString();

        const allRows = [];
        let pageIndex = 0;
        const batchSize = 100;
        while (true) {
          const dtoOut = await Calls.listReadings({ ...base, pageInfo: { pageSize: batchSize, pageIndex } });
          const items = (dtoOut.itemList ?? []).filter(Boolean);
          allRows.push(...items);
          const serverTotal = dtoOut.pageInfo?.total ?? 0;
          if (allRows.length >= serverTotal || items.length < batchSize) break;
          pageIndex++;
        }

        const header = "Time,Device EUI,Temperature (°C),Battery (V),Status";
        const lines = allRows.map(r => {
          const s = statusOf(r, rulesByEui);
          return `"${r.processedAt}","${r.deviceEui}","${r.temperature}","${r.voltageRest}","${s.label}"`;
        }).join("\n");
        const blob = new Blob([header + "\n" + lines], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `readings_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportModal(null);
        setToast(`Exported ${allRows.length} readings to CSV`);
      } catch {
        setExportModal(m => ({ ...m, loading: false }));
        setToast("Export failed.");
      }
    }

    function sortBtn(key, label) {
      const isActive = sortKey === key;
      return (
        <button
          className={"th-sort" + (isActive ? " active" : "")}
          onClick={() => {
            if (isActive) setSortDir(d => d === "asc" ? "desc" : "asc");
            else { setSortKey(key); setSortDir(key === "processedAt" ? "desc" : "asc"); }
          }}
        >
          {label}
          <span className="th-sort-caret">{isActive ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
        </button>
      );
    }
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    return (
      <div {...attrs}>
        {toast && (
          <div className="toast">
            <span className="toast-dot" />
            {toast}
          </div>
        )}
        <div className="page-shell">

          <header className="page-header">
            <div>
              <h1 className="page-title">Readings</h1>
              <p className="page-subtitle">Browse and filter sensor readings across all devices.</p>
            </div>
            <div className="page-header-actions">
              <button className="btn-secondary" onClick={() => setExportModal({ from: applied.from, to: applied.to, loading: false })}>
                <Uu5Elements.Icon icon="mdi-download" />
                Export CSV
              </button>
            </div>
          </header>

          <div className="filter-bar">
            <div className="filter-field">
              <span className="filter-label">Device</span>
              <select className="filter-select" value={eui} onChange={(e) => setEui(e.target.value)}>
                <option value="">All devices</option>
                {devices.map(d => (
                  <option key={d.deviceEui} value={d.deviceEui}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-field">
              <span className="filter-label">From</span>
              <input type="date" className="filter-input" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div className="filter-field">
              <span className="filter-label">To</span>
              <input type="date" className="filter-input" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="filter-field">
              <span className="filter-label">Status</span>
              <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">All</option>
                <option value="ok">OK</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="filter-actions">
              <button className="btn-primary" onClick={handleApply}>
                <Uu5Elements.Icon icon="mdi-filter-variant" />
                Apply
              </button>
              <button className="btn-reset" onClick={handleReset}>Reset</button>
            </div>
          </div>

          <div className="results-row">
            <div className="results-count">
              Showing <strong>{pageRows.length}</strong> of <strong>{total}</strong>{" "}
              reading{total !== 1 ? "s" : ""}
            </div>
            {chips.length > 0 && (
              <div className="chip-row">
                {chips.map(c => (
                  <span key={c.key} className="chip">
                    {c.label}
                    <button className="chip-x" onClick={c.clear} aria-label={"Clear " + c.key}>
                      <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 12 }} />
                    </button>
                  </span>
                ))}
                <button className="btn-link blue" onClick={handleReset} style={{ marginLeft: 6 }}>
                  Clear all
                </button>
              </div>
            )}
          </div>

          {loadState === "pendingNoData" ? (
            <Uu5Elements.Pending />
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 220 }}>{sortBtn("processedAt", "Time")}</th>
                    <th>{sortBtn("deviceEui", "Device")}</th>
                    <th style={{ width: 180 }}>{sortBtn("temperature", "Temperature")}</th>
                    <th style={{ width: 140 }}>{sortBtn("voltageRest", "Battery")}</th>
                    <th style={{ width: 120 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-note" style={{ padding: "48px 0" }}>
                          <Uu5Elements.Icon icon="mdi-magnify" style={{ fontSize: 28, color: "#bbb" }} />
                          <div style={{ marginTop: 8, color: "#666", fontWeight: 600 }}>
                            No readings match these filters
                          </div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            Try widening the date range or clearing the device filter.
                          </div>
                          <button className="btn-link blue" onClick={handleReset} style={{ marginTop: 10 }}>
                            Reset filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageRows.map(r => {
                      const dev = devices.find(d => d.deviceEui === r.deviceEui);
                      const s = statusOf(r, rulesByEui);
                      const rule = rulesByEui[r.deviceEui];
                      const tempVal = parseFloat(r.temperature);
                      const tempClass = rule
                        ? tempVal > rule.maxC ? "high" : tempVal < rule.minC ? "low" : ""
                        : "";
                      return (
                        <tr key={r.id}>
                          <td className="num">
                            <div>{formatDate(r.processedAt)}</div>
                            <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>
                              {timeAgo(r.processedAt)}
                            </div>
                          </td>
                          <td>
                            <button
                              className="device-pill device-pill-btn"
                              onClick={() => handleDevicePillClick(r.deviceEui)}
                              title="Filter to this device"
                            >
                              <span className="device-pill-name">{dev ? dev.name : "—"}</span>
                              <span className="device-pill-eui">{r.deviceEui}</span>
                            </button>
                          </td>
                          <td className={"num temp-cell " + tempClass}>
                            {parseFloat(r.temperature).toFixed(2)} °C
                          </td>
                          <td className="num bat-cell">
                            {parseFloat(r.voltageRest).toFixed(3)} V
                          </td>
                          <td>
                            {s.kind === "ok" ? (
                              <span className="badge active">
                                <span className="badge-dot" />
                                ok
                              </span>
                            ) : (
                              <span className={"severity-badge " + s.kind}>{s.label}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {total > 0 && (
                <div className="panel-footer">
                  <div>Page <strong>{page}</strong> of <strong>{totalPages}</strong></div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="icon-btn"
                      disabled={page <= 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                      <Uu5Elements.Icon icon="mdi-chevron-left" />
                    </button>
                    <button
                      className="icon-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    >
                      <Uu5Elements.Icon icon="mdi-chevron-right" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
        {exportModal && (
          <div className="modal-backdrop" onClick={() => !exportModal.loading && setExportModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-head">
                <h3 className="modal-title">Export Readings to CSV</h3>
                <button className="icon-btn" onClick={() => setExportModal(null)} disabled={exportModal.loading}>
                  <Uu5Elements.Icon icon="mdi-close" />
                </button>
              </header>
              <div className="modal-body">
                <p style={{ margin: "0 0 16px", color: "#666", fontSize: 13 }}>
                  Choose the date range to export. Leave blank to export all readings.
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                  <div className="filter-field" style={{ flex: 1 }}>
                    <span className="filter-label">From</span>
                    <input
                      type="date"
                      className="filter-input"
                      value={exportModal.from}
                      onChange={(e) => setExportModal(m => ({ ...m, from: e.target.value }))}
                    />
                  </div>
                  <div className="filter-field" style={{ flex: 1 }}>
                    <span className="filter-label">To</span>
                    <input
                      type="date"
                      className="filter-input"
                      value={exportModal.to}
                      onChange={(e) => setExportModal(m => ({ ...m, to: e.target.value }))}
                    />
                  </div>
                </div>
                {applied.eui && (
                  <div style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
                    Device filter active — export will include only the selected device.
                  </div>
                )}
              </div>
              <footer className="modal-foot">
                <button className="btn-secondary" onClick={() => setExportModal(null)} disabled={exportModal.loading}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={handleExport} disabled={exportModal.loading}>
                  {exportModal.loading ? "Exporting…" : (
                    <>
                      <Uu5Elements.Icon icon="mdi-download" />
                      Export
                    </>
                  )}
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    );
    //@@viewOff:render
  },
});

Readings = withRoute(Readings, { authenticated: true });

//@@viewOn:exports
export { Readings };
export default Readings;
//@@viewOff:exports
