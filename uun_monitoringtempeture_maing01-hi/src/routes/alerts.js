//@@viewOn:imports
import { createVisualComponent, Utils, useDataList, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const SEVERITY_COLOR = { critical: "#d32f2f", warning: "#f57c00" };
const ALERT_TYPE_LABEL = { tempTooHigh: "Temp Too High", tempTooLow: "Temp Too Low", batteryLow: "Battery Low" };
const STATUS_COLOR = { open: "#e53935", acknowledged: "#43a047" };
//@@viewOff:constants

//@@viewOn:css
const Css = {
  root: () =>
    Config.Css.css({
      padding: "0 24px 32px",
      maxWidth: 1100,
      margin: "0 auto",
    }),
  filterBar: () =>
    Config.Css.css({
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
      alignItems: "flex-end",
      margin: "16px 0",
      padding: "16px",
      background: "#f9f9f9",
      borderRadius: 8,
      border: "1px solid #e0e0e0",
    }),
  filterGroup: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }),
  filterLabel: () =>
    Config.Css.css({
      fontSize: 12,
      color: "#666",
      fontWeight: 500,
    }),
  filterSelect: () =>
    Config.Css.css({
      padding: "6px 10px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      background: "#fff",
      outline: "none",
      minWidth: 140,
    }),
  filterInput: () =>
    Config.Css.css({
      padding: "6px 10px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      outline: "none",
      minWidth: 180,
    }),
  rowCount: () =>
    Config.Css.css({
      fontSize: 13,
      color: "#888",
      margin: "0 0 8px",
    }),
  table: () =>
    Config.Css.css({
      width: "100%",
      borderCollapse: "collapse",
      background: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      overflow: "hidden",
    }),
  th: () =>
    Config.Css.css({
      background: "#f5f5f5",
      padding: "10px 16px",
      textAlign: "left",
      fontSize: 13,
      fontWeight: 600,
      color: "#555",
      borderBottom: "1px solid #e0e0e0",
    }),
  td: () =>
    Config.Css.css({
      padding: "10px 16px",
      fontSize: 14,
      borderBottom: "1px solid #f0f0f0",
      color: "#333",
      verticalAlign: "middle",
    }),
  badge: (color) =>
    Config.Css.css({
      background: color || "#888",
      color: "#fff",
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      display: "inline-block",
    }),
  actionCell: () =>
    Config.Css.css({
      display: "flex",
      gap: 8,
    }),
  emptyNote: () =>
    Config.Css.css({
      color: "#999",
      fontSize: 14,
      padding: "24px 0",
      textAlign: "center",
    }),
  toast: () =>
    Config.Css.css({
      position: "fixed",
      top: 20,
      right: 24,
      background: "#323232",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 8,
      fontSize: 14,
      zIndex: 9999,
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    }),
};
//@@viewOff:css

//@@viewOn:helpers
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
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
    const [status, setStatus] = useState("open");
    const [severity, setSeverity] = useState("");
    const [deviceEui, setDeviceEui] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [pendingId, setPendingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    const alertDataList = useDataList({
      handlerMap: { load: Calls.listAlerts },
      initialDtoIn: { status: "open" },
    });

    function buildDtoIn() {
      const dtoIn = {};
      if (status) dtoIn.status = status;
      if (severity) dtoIn.severity = severity;
      if (deviceEui.trim()) dtoIn.deviceEui = deviceEui.trim();
      if (from) dtoIn.from = new Date(from).toISOString();
      if (to) dtoIn.to = new Date(to + "T23:59:59").toISOString();
      return dtoIn;
    }

    function handleApply() {
      alertDataList.handlerMap.load(buildDtoIn());
    }

    function handleReset() {
      setStatus("open");
      setSeverity("");
      setDeviceEui("");
      setFrom("");
      setTo("");
      alertDataList.handlerMap.load({ status: "open" });
    }

    async function handleAcknowledge(id) {
      setPendingId(id);
      try {
        await Calls.acknowledgeAlert({ id });
        await alertDataList.handlerMap.load(buildDtoIn());
        setToast("Alert acknowledged.");
      } catch (e) {
        console.error("Acknowledge failed:", e);
        setToast("Failed to acknowledge alert.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleDelete(id) {
      setPendingId(id);
      try {
        await Calls.deleteAlert({ id });
        await alertDataList.handlerMap.load(buildDtoIn());
        setToast("Alert deleted.");
      } catch (e) {
        console.error("Delete failed:", e);
        setToast("Failed to delete alert.");
      } finally {
        setPendingId(null);
      }
    }

    const isLoading = alertDataList.state === "pendingNoData";
    const alerts = (alertDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    return (
      <div {...attrs}>
        {toast && <div className={Css.toast()}>{toast}</div>}
        <RouteBar />
        <div className={Css.root()}>
          <div className={Css.filterBar()}>
            <div className={Css.filterGroup()}>
              <span className={Css.filterLabel()}>Status</span>
              <select className={Css.filterSelect()} value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All</option>
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
              </select>
            </div>
            <div className={Css.filterGroup()}>
              <span className={Css.filterLabel()}>Severity</span>
              <select className={Css.filterSelect()} value={severity} onChange={(e) => setSeverity(e.target.value)}>
                <option value="">All</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            <div className={Css.filterGroup()}>
              <span className={Css.filterLabel()}>Device EUI</span>
              <input
                className={Css.filterInput()}
                type="text"
                placeholder="e.g. 24c4c981ad293382"
                value={deviceEui}
                onChange={(e) => setDeviceEui(e.target.value)}
              />
            </div>
            <div className={Css.filterGroup()}>
              <span className={Css.filterLabel()}>From</span>
              <input
                className={Css.filterInput()}
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </div>
            <div className={Css.filterGroup()}>
              <span className={Css.filterLabel()}>To</span>
              <input
                className={Css.filterInput()}
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <Uu5Elements.Button onClick={handleApply} significance="highlighted" colorScheme="primary">
              Apply
            </Uu5Elements.Button>
            <Uu5Elements.Button onClick={handleReset} significance="subdued">
              Reset
            </Uu5Elements.Button>
          </div>

          {isLoading ? (
            <Uu5Elements.Pending />
          ) : (
            <>
              <div className={Css.rowCount()}>
                Showing {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
              </div>
              {alerts.length === 0 ? (
                <div className={Css.emptyNote()}>No alerts found for the selected filters.</div>
              ) : (
                <table className={Css.table()}>
                  <thead>
                    <tr>
                      <th className={Css.th()}>Severity</th>
                      <th className={Css.th()}>Type</th>
                      <th className={Css.th()}>Message</th>
                      <th className={Css.th()}>Device</th>
                      <th className={Css.th()}>Created</th>
                      <th className={Css.th()}>Acknowledged</th>
                      <th className={Css.th()}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td className={Css.td()}>
                          <span className={Css.badge(SEVERITY_COLOR[alert.severity])}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className={Css.td()}>{ALERT_TYPE_LABEL[alert.type] || alert.type}</td>
                        <td className={Css.td()}>{alert.message}</td>
                        <td className={Css.td()}>{alert.deviceEui}</td>
                        <td className={Css.td()}>{formatDate(alert.createdAt)}</td>
                        <td className={Css.td()}>
                          {alert.status === "acknowledged" ? (
                            <span className={Css.badge(STATUS_COLOR.acknowledged)}>acknowledged</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className={Css.td()}>
                          <div className={Css.actionCell()}>
                            {alert.status === "open" && (
                              <Uu5Elements.Button
                                onClick={() => handleAcknowledge(alert.id)}
                                disabled={pendingId === alert.id}
                                significance="subdued"
                                size="s"
                              >
                                Acknowledge
                              </Uu5Elements.Button>
                            )}
                            <Uu5Elements.Button
                              onClick={() => handleDelete(alert.id)}
                              disabled={pendingId === alert.id}
                              colorScheme="negative"
                              significance="subdued"
                              size="s"
                            >
                              Delete
                            </Uu5Elements.Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
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
