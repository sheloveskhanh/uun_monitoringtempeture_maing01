//@@viewOn:imports
import { createVisualComponent, Utils, useState, useEffect, useMemo } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const PAGE_SIZE = 10;

const ALERT_TYPE_LABEL = {
  tempTooHigh: "Temperature too high",
  tempTooLow: "Temperature too low",
  batteryLow: "Battery low",
};
//@@viewOff:constants

//@@viewOn:helpers
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
//@@viewOff:helpers

let Alerts = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "Alerts",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    const [alerts, setAlerts] = useState([]);
    const [devices, setDevices] = useState([]);
    const [loadState, setLoadState] = useState("loading");

    // Draft filter state
    const [statusF, setStatusF] = useState("open");
    const [sevF, setSevF] = useState("all");
    const [deviceF, setDeviceF] = useState("");
    // Committed filter state
    const [applied, setApplied] = useState({ statusF: "open", sevF: "all", deviceF: "" });

    const [selected, setSelected] = useState(new Set());
    const [page, setPage] = useState(1);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
      Promise.all([Calls.listAlerts({}), Calls.listDevices({})])
        .then(([alertRes, deviceRes]) => {
          setAlerts((alertRes.itemList ?? []).filter(Boolean));
          setDevices((deviceRes.itemList ?? []).filter(Boolean));
          setLoadState("ready");
        })
        .catch(() => setLoadState("ready"));
    }, []);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    async function reloadAlerts() {
      const res = await Calls.listAlerts({});
      setAlerts((res.itemList ?? []).filter(Boolean));
    }

    function handleApply() {
      setApplied({ statusF, sevF, deviceF });
      setSelected(new Set());
      setPage(1);
    }

    function handleReset() {
      setStatusF("open"); setSevF("all"); setDeviceF("");
      setApplied({ statusF: "open", sevF: "all", deviceF: "" });
      setSelected(new Set());
      setPage(1);
    }

    // Client-side filtered list
    const filtered = useMemo(() => {
      let xs = alerts;
      if (applied.statusF !== "all") xs = xs.filter((a) => a.status === applied.statusF);
      if (applied.sevF !== "all")    xs = xs.filter((a) => a.severity === applied.sevF);
      if (applied.deviceF)           xs = xs.filter((a) => a.deviceEui === applied.deviceF);
      return [...xs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [alerts, applied]);

    // Stat counts from the full unfiltered list
    const openCount    = alerts.filter((a) => a.status === "open").length;
    const criticalOpen = alerts.filter((a) => a.status === "open" && a.severity === "critical").length;
    const warningOpen  = alerts.filter((a) => a.status === "open" && a.severity === "warning").length;
    const ackCount     = alerts.filter((a) => a.status === "acknowledged").length;

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const allPageSelected = pageRows.length > 0 && pageRows.every((a) => selected.has(a.id));
    const someSelected = selected.size > 0;

    function toggleRow(id) {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
    }
    function toggleAllOnPage() {
      setSelected((prev) => {
        const next = new Set(prev);
        if (allPageSelected) pageRows.forEach((a) => next.delete(a.id));
        else pageRows.forEach((a) => next.add(a.id));
        return next;
      });
    }

    async function handleAck(id) {
      try {
        await Calls.acknowledgeAlert({ id });
        await reloadAlerts();
        setToast("Alert acknowledged.");
      } catch (e) {
        console.error("Acknowledge failed:", e);
        setToast("Failed to acknowledge alert.");
      }
    }

    async function handleAckBulk() {
      const ids = [...selected].filter((id) => {
        const a = alerts.find((x) => x.id === id);
        return a && a.status === "open";
      });
      for (const id of ids) {
        try { await Calls.acknowledgeAlert({ id }); } catch {}
      }
      await reloadAlerts();
      setSelected(new Set());
      setToast(`${ids.length} alert${ids.length !== 1 ? "s" : ""} acknowledged.`);
    }

    async function doDelete() {
      if (!confirmDelete) return;
      const ids = confirmDelete.ids;
      setConfirmDelete(null);
      for (const id of ids) {
        try { await Calls.deleteAlert({ id }); } catch {}
      }
      await reloadAlerts();
      setSelected((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setToast(`${ids.length} alert${ids.length !== 1 ? "s" : ""} deleted.`);
    }

    // Filter chips
    const chips = [];
    if (applied.statusF === "all")
      chips.push({ key: "status", label: "Status: all", clear: () => { setStatusF("open"); setApplied((a) => ({ ...a, statusF: "open" })); } });
    else if (applied.statusF !== "open")
      chips.push({ key: "status", label: "Status: " + applied.statusF, clear: () => { setStatusF("open"); setApplied((a) => ({ ...a, statusF: "open" })); } });
    if (applied.sevF !== "all")
      chips.push({ key: "sev", label: "Severity: " + applied.sevF, clear: () => { setSevF("all"); setApplied((a) => ({ ...a, sevF: "all" })); } });
    if (applied.deviceF) {
      const dev = devices.find((d) => d.deviceEui === applied.deviceF);
      chips.push({ key: "dev", label: "Device: " + (dev ? dev.name : applied.deviceF), clear: () => { setDeviceF(""); setApplied((a) => ({ ...a, deviceF: "" })); } });
    }
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    return (
      <div {...attrs}>
        {toast && (
          <div className="toast">
            <span className="toast-dot"></span>
            {toast}
          </div>
        )}

        <RouteBar />

        <div className="page-shell">
          <header className="page-header">
            <div>
              <h1 className="page-title">Alerts</h1>
              <p className="page-subtitle">
                Review, acknowledge and clear alerts from temperature &amp; battery rules.
              </p>
            </div>
          </header>

          {/* Stat strip */}
          <div className="alert-stat-strip">
            <div
              className={"alert-stat" + (applied.statusF === "open" && applied.sevF === "all" && !applied.deviceF ? " active" : "")}
              onClick={() => { setStatusF("open"); setSevF("all"); setApplied({ statusF: "open", sevF: "all", deviceF: applied.deviceF }); setPage(1); setSelected(new Set()); }}
            >
              <div className="alert-stat-label">Open</div>
              <div className="alert-stat-value">{openCount}</div>
            </div>
            <div
              className={"alert-stat critical" + (applied.statusF === "open" && applied.sevF === "critical" ? " active" : "")}
              onClick={() => { setStatusF("open"); setSevF("critical"); setApplied({ statusF: "open", sevF: "critical", deviceF: applied.deviceF }); setPage(1); setSelected(new Set()); }}
            >
              <div className="alert-stat-label">
                <span className="sub-dot red"></span> Critical (open)
              </div>
              <div className="alert-stat-value">{criticalOpen}</div>
            </div>
            <div
              className={"alert-stat warning" + (applied.statusF === "open" && applied.sevF === "warning" ? " active" : "")}
              onClick={() => { setStatusF("open"); setSevF("warning"); setApplied({ statusF: "open", sevF: "warning", deviceF: applied.deviceF }); setPage(1); setSelected(new Set()); }}
            >
              <div className="alert-stat-label">
                <span className="sub-dot orange"></span> Warning (open)
              </div>
              <div className="alert-stat-value">{warningOpen}</div>
            </div>
            <div
              className={"alert-stat" + (applied.statusF === "acknowledged" ? " active" : "")}
              onClick={() => { setStatusF("acknowledged"); setSevF("all"); setApplied({ statusF: "acknowledged", sevF: "all", deviceF: applied.deviceF }); setPage(1); setSelected(new Set()); }}
            >
              <div className="alert-stat-label">Acknowledged</div>
              <div className="alert-stat-value">{ackCount}</div>
            </div>
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            <div className="filter-field">
              <span className="filter-label">Status</span>
              <select className="filter-select" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="all">All</option>
              </select>
            </div>
            <div className="filter-field">
              <span className="filter-label">Severity</span>
              <select className="filter-select" value={sevF} onChange={(e) => setSevF(e.target.value)}>
                <option value="all">All</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div className="filter-field" style={{ minWidth: 240 }}>
              <span className="filter-label">Device</span>
              <select className="filter-select" value={deviceF} onChange={(e) => setDeviceF(e.target.value)} style={{ minWidth: 240 }}>
                <option value="">All devices</option>
                {devices.map((d) => (
                  <option key={d.deviceEui} value={d.deviceEui}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button className="btn-primary" onClick={handleApply}>
                <Uu5Elements.Icon icon="mdi-filter-variant" style={{ fontSize: 16 }} /> Apply
              </button>
              <button className="btn-reset" onClick={handleReset}>Reset</button>
            </div>
          </div>

          {/* Results row + chips */}
          <div className="results-row">
            <div className="results-count">
              Showing <strong>{pageRows.length}</strong> of <strong>{filtered.length}</strong> alert{filtered.length !== 1 ? "s" : ""}
            </div>
            {chips.length > 0 && (
              <div className="chip-row">
                {chips.map((c) => (
                  <span key={c.key} className="chip">
                    {c.label}
                    <button className="chip-x" onClick={c.clear}>
                      <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 12 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bulk-action bar */}
          {someSelected && (
            <div className="bulk-bar">
              <span className="bulk-bar-count">{selected.size} selected</span>
              <div style={{ flex: 1 }} />
              <button className="btn-secondary btn-sm" onClick={handleAckBulk}>
                <Uu5Elements.Icon icon="mdi-check" style={{ fontSize: 14 }} /> Acknowledge selected
              </button>
              <button className="btn-danger btn-sm" onClick={() => setConfirmDelete({ ids: [...selected], multi: true })}>
                <Uu5Elements.Icon icon="mdi-trash-can-outline" style={{ fontSize: 14 }} /> Delete selected
              </button>
              <button className="btn-reset" onClick={() => setSelected(new Set())}>Clear</button>
            </div>
          )}

          {/* Table */}
          {loadState === "loading" ? (
            <Uu5Elements.Pending />
          ) : (
            <div className="data-table-wrap">
              <table className="data-table alerts-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        className="row-check"
                        checked={allPageSelected}
                        ref={(el) => { if (el) el.indeterminate = !allPageSelected && pageRows.some((a) => selected.has(a.id)); }}
                        onChange={toggleAllOnPage}
                      />
                    </th>
                    <th style={{ width: 92 }}>Severity</th>
                    <th>Alert</th>
                    <th style={{ width: 220 }}>Device</th>
                    <th style={{ width: 160 }}>Raised</th>
                    <th style={{ width: 120 }}>Status</th>
                    <th style={{ width: 90 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="empty-note" style={{ padding: "48px 0" }}>
                          <Uu5Elements.Icon icon="mdi-check-circle-outline" style={{ fontSize: 28, color: "#43a047" }} />
                          <div style={{ marginTop: 8, color: "#2e7d32", fontWeight: 600 }}>All clear</div>
                          <div style={{ fontSize: 12, color: "#999" }}>No alerts match these filters.</div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {pageRows.map((alert) => {
                    const dev = devices.find((d) => d.deviceEui === alert.deviceEui);
                    const isSel = selected.has(alert.id);
                    return (
                      <tr key={alert.id} className={isSel ? "row-selected" : ""}>
                        <td>
                          <input
                            type="checkbox"
                            className="row-check"
                            checked={isSel}
                            onChange={() => toggleRow(alert.id)}
                          />
                        </td>
                        <td>
                          <span className={"severity-badge " + alert.severity}>{alert.severity}</span>
                        </td>
                        <td>
                          <div className="alert-cell-type">{ALERT_TYPE_LABEL[alert.type] || alert.type}</div>
                          <div className="alert-cell-msg">{alert.message}</div>
                        </td>
                        <td>
                          <div className="device-pill">
                            <div>
                              <div className="device-pill-name">{dev ? dev.name : "—"}</div>
                              <div className="device-pill-eui">{alert.deviceEui}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{fmtDate(alert.createdAt)}</div>
                          <div style={{ color: "#aaa", fontSize: 11, marginTop: 2 }}>{timeAgo(alert.createdAt)}</div>
                        </td>
                        <td>
                          {alert.status === "open" ? (
                            <span className="badge initial"><span className="badge-dot" />open</span>
                          ) : (
                            <div>
                              <span className="badge active"><span className="badge-dot" />ack'd</span>
                              {alert.acknowledgedAt && (
                                <div style={{ color: "#aaa", fontSize: 11, marginTop: 3 }}>
                                  {timeAgo(alert.acknowledgedAt)}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="action-cell">
                            {alert.status === "open" && (
                              <button className="icon-btn" title="Acknowledge" onClick={() => handleAck(alert.id)}>
                                <Uu5Elements.Icon icon="mdi-check" style={{ fontSize: 16 }} />
                              </button>
                            )}
                            <button
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => setConfirmDelete({ ids: [alert.id], multi: false, alert })}
                            >
                              <Uu5Elements.Icon icon="mdi-trash-can-outline" style={{ fontSize: 16 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {filtered.length > 0 && (
                <div className="panel-footer">
                  <div>
                    Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="icon-btn"
                      disabled={page <= 1}
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); setSelected(new Set()); }}
                    >
                      <Uu5Elements.Icon icon="mdi-chevron-left" style={{ fontSize: 16 }} />
                    </button>
                    <button
                      className="icon-btn"
                      disabled={page >= totalPages}
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); setSelected(new Set()); }}
                    >
                      <Uu5Elements.Icon icon="mdi-chevron-right" style={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirm delete modal */}
        {confirmDelete && (
          <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-head">
                <h3 className="modal-title">Delete {confirmDelete.multi ? "alerts" : "alert"}</h3>
                <button className="icon-btn" onClick={() => setConfirmDelete(null)}>
                  <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 16 }} />
                </button>
              </header>
              <div className="modal-body">
                {confirmDelete.multi ? (
                  <p style={{ margin: 0 }}>
                    Permanently delete <strong>{confirmDelete.ids.length}</strong> alerts? This cannot be undone.
                  </p>
                ) : (
                  <>
                    <p style={{ margin: 0 }}>Permanently delete this alert?</p>
                    <p style={{ marginTop: 10, color: "#888", fontSize: 13 }}>
                      {ALERT_TYPE_LABEL[confirmDelete.alert.type] || confirmDelete.alert.type} — {confirmDelete.alert.message}
                    </p>
                  </>
                )}
              </div>
              <footer className="modal-foot">
                <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="btn-danger" onClick={doDelete}>Delete</button>
              </footer>
            </div>
          </div>
        )}
      </div>
    );
    //@@viewOff:render
  },
});

Alerts = withRoute(Alerts, { authenticated: true });

//@@viewOn:exports
export { Alerts };
export default Alerts;
//@@viewOff:exports
