//@@viewOn:imports
import { createVisualComponent, Utils, useDataList, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const SEVERITY_COLOR = { critical: "#d32f2f", warning: "#f57c00" };
const ALERT_TYPE_LABEL = { tempTooHigh: "Temp Too High", tempTooLow: "Temp Too Low", batteryLow: "Battery Low" };
//@@viewOff:constants

//@@viewOn:css
const Css = {
  root: () =>
    Config.Css.css({
      padding: "0 24px 32px",
      maxWidth: 1000,
      margin: "0 auto",
    }),
  statRow: () =>
    Config.Css.css({
      display: "flex",
      gap: 16,
      flexWrap: "wrap",
      marginTop: 16,
    }),
  statCard: () =>
    Config.Css.css({
      background: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: 10,
      padding: "20px 28px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      flex: "1 1 180px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    }),
  statIcon: (color) =>
    Config.Css.css({
      fontSize: 36,
      color: color || "#555",
    }),
  statLabel: () =>
    Config.Css.css({
      fontSize: 12,
      color: "#888",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }),
  statValue: () =>
    Config.Css.css({
      fontSize: 26,
      fontWeight: 700,
      color: "#222",
      lineHeight: 1.2,
    }),
  sectionTitle: () =>
    Config.Css.css({
      fontSize: 18,
      fontWeight: 600,
      margin: "28px 0 12px",
      color: "#333",
    }),
  deviceBar: () =>
    Config.Css.css({
      display: "flex",
      alignItems: "center",
      gap: 12,
      margin: "24px 0 16px",
    }),
  deviceLabel: () =>
    Config.Css.css({
      fontSize: 14,
      color: "#555",
      fontWeight: 500,
    }),
  deviceSelect: () =>
    Config.Css.css({
      padding: "7px 12px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      background: "#fff",
      outline: "none",
      minWidth: 220,
    }),
  chartCard: () =>
    Config.Css.css({
      background: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: 10,
      padding: "20px 16px 8px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
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
    }),
  alertRow: () =>
    Config.Css.css({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      background: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      marginBottom: 8,
    }),
  severityBadge: (color) =>
    Config.Css.css({
      background: color || "#888",
      color: "#fff",
      borderRadius: 4,
      padding: "3px 10px",
      fontSize: 11,
      fontWeight: 700,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }),
  alertInfo: () =>
    Config.Css.css({ flex: 1 }),
  alertMessage: () =>
    Config.Css.css({ fontSize: 14, color: "#333" }),
  alertMeta: () =>
    Config.Css.css({ fontSize: 12, color: "#888", marginTop: 3 }),
  emptyNote: () =>
    Config.Css.css({ color: "#999", fontSize: 14, padding: "12px 0" }),
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

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ icon, label, value, iconColor }) {
  return (
    <div className={Css.statCard()}>
      <Uu5Elements.Icon icon={icon} className={Css.statIcon(iconColor)} />
      <div>
        <div className={Css.statLabel()}>{label}</div>
        <div className={Css.statValue()}>{value}</div>
      </div>
    </div>
  );
}
//@@viewOff:helpers

let Dashboard = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "Dashboard",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    const [pendingId, setPendingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [selectedEui, setSelectedEui] = useState(null);
    const [deviceReadings, setDeviceReadings] = useState([]);
    const [deviceReadingsLoading, setDeviceReadingsLoading] = useState(false);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    const deviceDataList = useDataList({
      handlerMap: { load: Calls.listDevices },
      initialDtoIn: {},
    });

    const alertDataList = useDataList({
      handlerMap: { load: Calls.listAlerts },
      initialDtoIn: { status: "open" },
    });

    const readingDataList = useDataList({
      handlerMap: { load: Calls.listReadings },
      initialDtoIn: { pageInfo: { pageSize: 1 } },
    });

    const devices = (deviceDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);
    const activeAlerts = (alertDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);
    const allReadings = (readingDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);
    const latestReading = allReadings[0];

    // Auto-select first active device
    useEffect(() => {
      if (devices.length > 0 && !selectedEui) {
        const firstActive = devices.find((d) => d.state === "active") || devices[0];
        setSelectedEui(firstActive.deviceEui);
      }
    }, [devices.length]);

    // Load readings for selected device
    useEffect(() => {
      if (!selectedEui) return;
      setDeviceReadingsLoading(true);
      Calls.listReadings({ deviceEui: selectedEui, pageInfo: { pageSize: 50 } })
        .then((res) => {
          const items = (res.itemList ?? []).filter(Boolean);
          setDeviceReadings(items);
        })
        .catch(() => setDeviceReadings([]))
        .finally(() => setDeviceReadingsLoading(false));
    }, [selectedEui]);

    const chartData = [...deviceReadings]
      .sort((a, b) => new Date(a.processedAt) - new Date(b.processedAt))
      .map((r) => ({
        time: formatTime(r.processedAt),
        temperature: parseFloat(r.temperature),
        battery: parseFloat(r.voltageRest),
      }));

    const recentReadings = [...deviceReadings]
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt))
      .slice(0, 5);

    const isLoading =
      deviceDataList.state === "pendingNoData" ||
      alertDataList.state === "pendingNoData" ||
      readingDataList.state === "pendingNoData";

    async function handleAcknowledge(id) {
      setPendingId(id);
      try {
        await Calls.acknowledgeAlert({ id });
        await alertDataList.handlerMap.load({ status: "open" });
        setToast("Alert acknowledged.");
      } catch (e) {
        setToast("Failed to acknowledge alert.");
      } finally {
        setPendingId(null);
      }
    }
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    if (isLoading) return <Uu5Elements.Pending />;

    return (
      <div {...attrs}>
        {toast && <div className={Css.toast()}>{toast}</div>}
        <RouteBar />
        <div className={Css.root()}>

          {/* Global stat cards */}
          <div className={Css.statRow()}>
            <StatCard
              icon="mdi-thermometer"
              label="Last Temperature"
              value={latestReading ? `${latestReading.temperature} °C` : "—"}
              iconColor="#e53935"
            />
            <StatCard
              icon="mdi-devices"
              label="Total Devices"
              value={String(devices.length)}
              iconColor="#1976d2"
            />
            <StatCard
              icon="mdi-bell-alert"
              label="Active Alerts"
              value={String(activeAlerts.length)}
              iconColor={activeAlerts.length > 0 ? "#e53935" : "#43a047"}
            />
          </div>

          {/* Per-device section */}
          <div className={Css.deviceBar()}>
            <span className={Css.deviceLabel()}>Device:</span>
            <select
              className={Css.deviceSelect()}
              value={selectedEui || ""}
              onChange={(e) => setSelectedEui(e.target.value)}
            >
              {devices.map((d) => (
                <option key={d.deviceEui} value={d.deviceEui}>
                  {d.name} ({d.deviceEui})
                </option>
              ))}
            </select>
          </div>

          {/* Temperature chart */}
          <div className={Css.sectionTitle()}>Temperature Over Time</div>
          <div className={Css.chartCard()}>
            {deviceReadingsLoading ? (
              <Uu5Elements.Pending />
            ) : chartData.length === 0 ? (
              <div className={Css.emptyNote()}>No readings for this device yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                    tickLine={false}
                  />
                  <YAxis yAxisId="temp" tick={{ fontSize: 11 }} tickLine={false} unit="°C" />
                  <YAxis yAxisId="bat" orientation="right" tick={{ fontSize: 11 }} tickLine={false} unit="V" />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#e53935"
                    dot={false}
                    strokeWidth={2}
                    name="Temperature (°C)"
                  />
                  <Line
                    yAxisId="bat"
                    type="monotone"
                    dataKey="battery"
                    stroke="#43a047"
                    dot={false}
                    strokeWidth={2}
                    name="Battery (V)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent readings table */}
          <div className={Css.sectionTitle()}>Recent Readings</div>
          {recentReadings.length === 0 ? (
            <div className={Css.emptyNote()}>No readings yet.</div>
          ) : (
            <table className={Css.table()}>
              <thead>
                <tr>
                  <th className={Css.th()}>Time</th>
                  <th className={Css.th()}>Temperature (°C)</th>
                  <th className={Css.th()}>Battery (V)</th>
                </tr>
              </thead>
              <tbody>
                {recentReadings.map((r) => (
                  <tr key={r.id}>
                    <td className={Css.td()}>{formatDate(r.processedAt)}</td>
                    <td className={Css.td()}>{r.temperature}</td>
                    <td className={Css.td()}>{r.voltageRest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Active alerts */}
          <div className={Css.sectionTitle()}>Active Alerts</div>
          {activeAlerts.length === 0 ? (
            <div className={Css.emptyNote()}>No active alerts.</div>
          ) : (
            activeAlerts.map((alert) => (
              <div key={alert.id} className={Css.alertRow()}>
                <span className={Css.severityBadge(SEVERITY_COLOR[alert.severity])}>
                  {alert.severity}
                </span>
                <div className={Css.alertInfo()}>
                  <div className={Css.alertMessage()}>
                    {ALERT_TYPE_LABEL[alert.type] || alert.type} — {alert.message}
                  </div>
                  <div className={Css.alertMeta()}>
                    Device: {alert.deviceEui} · {formatDate(alert.createdAt)}
                  </div>
                </div>
                <Uu5Elements.Button
                  onClick={() => handleAcknowledge(alert.id)}
                  disabled={pendingId === alert.id}
                  size="s"
                  significance="subdued"
                >
                  Acknowledge
                </Uu5Elements.Button>
              </div>
            ))
          )}
        </div>
      </div>
    );
    //@@viewOff:render
  },
});

Dashboard = withRoute(Dashboard, { authenticated: true });

//@@viewOn:exports
export { Dashboard };
export default Dashboard;
//@@viewOff:exports
