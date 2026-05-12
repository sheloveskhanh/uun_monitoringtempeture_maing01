//@@viewOn:imports
import { createVisualComponent, Utils, useDataList } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const SEVERITY_COLOR = { critical: "#d32f2f", warning: "#f57c00" };
const ALERT_TYPE_LABEL = { tempHigh: "Temp High", tempLow: "Temp Low", batteryLow: "Battery Low" };
//@@viewOff:constants

//@@viewOn:css
const Css = {
  root: () =>
    Config.Css.css({
      padding: "0 24px 32px",
      maxWidth: 960,
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
    Config.Css.css({
      flex: 1,
    }),
  alertMessage: () =>
    Config.Css.css({
      fontSize: 14,
      color: "#333",
    }),
  alertMeta: () =>
    Config.Css.css({
      fontSize: 12,
      color: "#888",
      marginTop: 3,
    }),
  emptyNote: () =>
    Config.Css.css({
      color: "#999",
      fontSize: 14,
      padding: "12px 0",
    }),
};
//@@viewOff:css

//@@viewOn:helpers
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
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
    const readingDataList = useDataList({
      handlerMap: { load: Calls.listReadings },
      initialDtoIn: {},
    });

    const alertDataList = useDataList({
      handlerMap: { load: Calls.listAlerts },
      itemHandlerMap: {
        acknowledge: (item) => Calls.acknowledgeAlert({ id: item.data._id }),
      },
      initialDtoIn: { status: "active" },
    });

    const isLoading = readingDataList.state === "pendingNoData" || alertDataList.state === "pendingNoData";

    const readings = readingDataList.data?.map((d) => d.data) ?? [];
    const sortedReadings = [...readings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const latestReading = sortedReadings[0];
    const recentReadings = sortedReadings.slice(0, 5);

    const activeAlerts = (alertDataList.data ?? []).filter((item) => item.data?.status !== "acknowledged");
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    if (isLoading) {
      return <Uu5Elements.Pending />;
    }

    return (
      <div {...attrs}>
        <RouteBar />
        <div className={Css.root()}>
          <div className={Css.statRow()}>
            <StatCard
              icon="mdi-thermometer"
              label="Last Temperature"
              value={latestReading ? `${latestReading.value} °C` : "—"}
              iconColor="#e53935"
            />
            <StatCard
              icon="mdi-battery"
              label="Battery Voltage"
              value={latestReading ? `${latestReading.batteryV} V` : "—"}
              iconColor="#43a047"
            />
            <StatCard
              icon="mdi-bell-alert"
              label="Active Alerts"
              value={String(activeAlerts.length)}
              iconColor={activeAlerts.length > 0 ? "#e53935" : "#43a047"}
            />
          </div>

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
                  <tr key={r._id}>
                    <td className={Css.td()}>{formatDate(r.createdAt)}</td>
                    <td className={Css.td()}>{r.value}</td>
                    <td className={Css.td()}>{r.batteryV}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className={Css.sectionTitle()}>Active Alerts</div>
          {activeAlerts.length === 0 ? (
            <div className={Css.emptyNote()}>No active alerts.</div>
          ) : (
            activeAlerts.map((item) => (
              <div key={item.data._id} className={Css.alertRow()}>
                <span className={Css.severityBadge(SEVERITY_COLOR[item.data.severity])}>
                  {item.data.severity}
                </span>
                <div className={Css.alertInfo()}>
                  <div className={Css.alertMessage()}>
                    {ALERT_TYPE_LABEL[item.data.type] || item.data.type} — {item.data.message}
                  </div>
                  <div className={Css.alertMeta()}>
                    Device: {item.data.deviceEui} · {formatDate(item.data.createdAt)}
                  </div>
                </div>
                <Uu5Elements.Button
                  onClick={() => item.handlerMap.acknowledge()}
                  disabled={item.state === "pending"}
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
