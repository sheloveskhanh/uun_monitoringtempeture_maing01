//@@viewOn:imports
import { createVisualComponent, Utils, useDataList, useState, useEffect, useRoute } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import Config from "./config/config.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const ALERT_TYPE_LABEL = {
  tempTooHigh: "Temperature too high",
  tempTooLow: "Temperature too low",
  batteryLow: "Battery low",
};
//@@viewOff:constants

//@@viewOn:helpers
function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Spark({ values, color = "#d32f2f", w = 64, h = 22 }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const d = values
    .map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function SevBadge({ severity }) {
  return <span className={`severity-badge ${severity}`}>{severity}</span>;
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
    const [, setRoute] = useRoute();
    const [pendingId, setPendingId] = useState(null);
    const [toast, setToast] = useState(null);
    const [selectedEui, setSelectedEui] = useState(null);
    const [chartRange, setChartRange] = useState("1d");
    const [deviceReadings, setDeviceReadings] = useState([]);
    const [deviceReadingsLoading, setDeviceReadingsLoading] = useState(false);
    const [rule, setRule] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 2400);
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

    const devices = (deviceDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);
    const activeAlerts = (alertDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);

    useEffect(() => {
      if (devices.length > 0 && !selectedEui) {
        const first = devices.find((d) => d.state === "active") || devices[0];
        setSelectedEui(first.deviceEui);
      }
    }, [devices.length]);

    useEffect(() => {
      if (!selectedEui) return;
      let cancelled = false;
      setDeviceReadingsLoading(true);

      async function fetchReadings() {
        let readings;
        const days = chartRange === "5d" ? 5 : 1;
        const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        const all = [];
        let pageIndex = 0;
        while (true) {
          const res = await Calls.listReadings({ deviceEui: selectedEui, from, pageInfo: { pageSize: 100, pageIndex } });
          const items = (res.itemList ?? []).filter(Boolean);
          all.push(...items);
          if (items.length < 100 || all.length >= (res.pageInfo?.total ?? 0)) break;
          pageIndex++;
        }
        readings = all;
        return readings;
      }

      Promise.all([fetchReadings(), Calls.listRules({ deviceEui: selectedEui })])
        .then(([readings, ruleRes]) => {
          if (cancelled) return;
          setDeviceReadings(readings);
          setRule(((ruleRes.itemList ?? []).filter(Boolean))[0] ?? null);
        })
        .catch(() => {
          if (!cancelled) { setDeviceReadings([]); setRule(null); }
        })
        .finally(() => { if (!cancelled) setDeviceReadingsLoading(false); });

      return () => { cancelled = true; };
    }, [selectedEui, chartRange, refreshKey]);

    const chartData = [...deviceReadings]
      .sort((a, b) => new Date(a.processedAt) - new Date(b.processedAt))
      .map((r) => ({
        time: fmtDate(r.processedAt),
        temperature: parseFloat(r.temperature),
        battery: parseFloat(r.voltageRest),
      }));

    const xTicks = chartData.length <= 5
      ? chartData.map((d) => d.time)
      : [0, 1, 2, 3, 4].map((i) => chartData[Math.round(i * (chartData.length - 1) / 4)].time);

    const recentReadings = [...deviceReadings]
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt))
      .slice(0, 6);

    const sparkVals = [...deviceReadings]
      .sort((a, b) => new Date(a.processedAt) - new Date(b.processedAt))
      .slice(-12)
      .map((r) => parseFloat(r.temperature));

    const deviceAlerts = activeAlerts.filter((a) => a.deviceEui === selectedEui);

    const activeDevices = devices.filter((d) => d.state === "active").length;
    const suspendedDevices = devices.filter((d) => d.state === "suspended").length;
    const critical = deviceAlerts.filter((a) => a.severity === "critical").length;
    const warning = deviceAlerts.filter((a) => a.severity === "warning").length;

    const latestReading = recentReadings[0];
    const lastTemp = latestReading ? parseFloat(latestReading.temperature) : null;
    const inBounds = rule && lastTemp !== null ? lastTemp >= rule.minC && lastTemp <= rule.maxC : null;

    const selectedDevice = devices.find((d) => d.deviceEui === selectedEui);

    const isLoading =
      deviceDataList.state === "pendingNoData" || alertDataList.state === "pendingNoData";

    async function handleAcknowledge(id) {
      setPendingId(id);
      try {
        await Calls.acknowledgeAlert({ id });
        await alertDataList.handlerMap.load({ status: "open" });
        setToast("Alert acknowledged");
      } catch {
        setToast("Failed to acknowledge.");
      } finally {
        setPendingId(null);
      }
    }

    function handleRefresh() {
      deviceDataList.handlerMap.load({});
      alertDataList.handlerMap.load({ status: "open" });
      setRefreshKey((k) => k + 1);
    }
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    if (isLoading) return <Uu5Elements.Pending />;

    return (
      <div {...attrs}>
        <div className="page-shell">

          {/* Page header */}
          <header className="page-header">
            <div>
              <h1 className="page-title">Dashboard</h1>
              <p className="page-subtitle">Live overview of sensors, readings &amp; alerts across all sites.</p>
            </div>
            <div className="page-header-actions">
              <button className="btn-secondary" onClick={handleRefresh}>
                <Uu5Elements.Icon icon="mdi-refresh" />
                Refresh
              </button>
            </div>
          </header>

          {/* Stat cards */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-card-icon red">
                <Uu5Elements.Icon icon="mdi-thermometer" style={{ fontSize: 22 }} />
              </div>
              <div className="stat-card-body">
                <div className="stat-card-label">Last Temperature</div>
                <div className="stat-card-value">
                  {lastTemp !== null ? lastTemp.toFixed(2) : "—"}
                  {lastTemp !== null && <span className="unit">°C</span>}
                </div>
                {rule && lastTemp !== null && (
                  <div className="stat-card-sub">
                    <span className={"sub-dot " + (inBounds ? "green" : "red")} />
                    {inBounds
                      ? `Within bounds (${rule.minC}–${rule.maxC}°C)`
                      : `Out of bounds (${rule.minC}–${rule.maxC}°C)`}
                  </div>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon blue">
                <Uu5Elements.Icon icon="mdi-devices" style={{ fontSize: 22 }} />
              </div>
              <div className="stat-card-body">
                <div className="stat-card-label">Total Devices</div>
                <div className="stat-card-value">{devices.length}</div>
                <div className="stat-card-sub">
                  <span className="sub-dot green" />
                  {activeDevices} active · {suspendedDevices} suspended
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className={"stat-card-icon " + (deviceAlerts.length ? "red" : "green")}>
                <Uu5Elements.Icon icon="mdi-bell-outline" style={{ fontSize: 22 }} />
              </div>
              <div className="stat-card-body">
                <div className="stat-card-label">Active Alerts</div>
                <div className="stat-card-value">{deviceAlerts.length}</div>
                <div className="stat-card-sub">
                  {critical > 0 && (
                    <>
                      <span className="sub-dot red" />
                      {critical} critical
                    </>
                  )}
                  {critical > 0 && warning > 0 && (
                    <span style={{ color: "#d0d0d0" }}>·</span>
                  )}
                  {warning > 0 && (
                    <>
                      <span className="sub-dot orange" />
                      {warning} warning
                    </>
                  )}
                  {critical === 0 && warning === 0 && (
                    <>
                      <span className="sub-dot green" />
                      All clear
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chart card */}
          <section className="card" style={{ marginBottom: 16 }}>
              <header className="card-header">
                <div>
                  <h2 className="card-title">Temperature &amp; Battery</h2>
                  <div className="card-sub">
                    {chartRange === "5d" ? "Last 5 days" : "Last 1 day"} · newest on right
                  </div>
                </div>
                <div className="chart-toolbar">
                  <div className="range-toggle">
                    <button
                      className={"range-toggle-btn" + (chartRange === "1d" ? " active" : "")}
                      onClick={() => setChartRange("1d")}
                    >
                      1 day
                    </button>
                    <button
                      className={"range-toggle-btn" + (chartRange === "5d" ? " active" : "")}
                      onClick={() => setChartRange("5d")}
                    >
                      5 days
                    </button>
                  </div>
                  <select
                    className="filter-select"
                    value={selectedEui || ""}
                    onChange={(e) => setSelectedEui(e.target.value)}
                  >
                    {devices.map((d) => (
                      <option key={d.deviceEui} value={d.deviceEui}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </header>
              <div className="card-body flush">
                {deviceReadingsLoading ? (
                  <div style={{ padding: 40, textAlign: "center" }}>
                    <Uu5Elements.Pending />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="empty-note">No readings for this device yet.</div>
                ) : (
                  <div style={{ padding: "12px 8px 4px" }}>
                    <ResponsiveContainer width="100%" height={260}>
                      <ComposedChart data={chartData} margin={{ top: 4, right: 44, left: 0, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="time"
                          tick={{ fontSize: 11 }}
                          ticks={xTicks}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="temp"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          unit="°C"
                        />
                        <YAxis
                          yAxisId="bat"
                          orientation="right"
                          tick={{ fontSize: 11 }}
                          tickLine={false}
                          unit="V"
                        />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e8e8e8" }}
                          formatter={(value, name) =>
                            name === "Temperature (°C)"
                              ? [`${value.toFixed(2)} °C`, name]
                              : [`${value.toFixed(3)} V`, name]
                          }
                        />
                        {rule && (
                          <ReferenceLine
                            yAxisId="temp"
                            y={rule.maxC}
                            stroke="#ff9800"
                            strokeDasharray="5 4"
                            strokeWidth={1.5}
                            label={{ value: `max ${rule.maxC}°C`, position: "insideTopRight", fontSize: 10, fill: "#e65100" }}
                          />
                        )}
                        {rule && (
                          <ReferenceLine
                            yAxisId="temp"
                            y={rule.minC}
                            stroke="#ff9800"
                            strokeDasharray="5 4"
                            strokeWidth={1.5}
                            label={{ value: `min ${rule.minC}°C`, position: "insideBottomRight", fontSize: 10, fill: "#e65100" }}
                          />
                        )}
                        <Area
                          yAxisId="temp"
                          type="monotone"
                          dataKey="temperature"
                          stroke="#d32f2f"
                          strokeWidth={2}
                          fill="#d32f2f"
                          fillOpacity={0.08}
                          dot={false}
                          name="Temperature (°C)"
                        />
                        <Line
                          yAxisId="bat"
                          type="monotone"
                          dataKey="battery"
                          stroke="#2e7d32"
                          strokeWidth={1.8}
                          dot={false}
                          name="Battery (V)"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <div className="chart-legend">
                <div className="chart-legend-item">
                  <span className="chart-legend-swatch" style={{ background: "#d32f2f" }} />
                  Temperature (°C)
                </div>
                <div className="chart-legend-item">
                  <span className="chart-legend-swatch" style={{ background: "#2e7d32" }} />
                  Battery (V)
                </div>
                {rule && (
                  <div className="chart-legend-item" style={{ color: "#e65100" }}>
                    <span className="chart-legend-swatch dashed" style={{ color: "#ff9800" }} />
                    Rule bounds
                  </div>
                )}
              </div>
            </section>

          {/* Recent readings */}
          <section className="card" style={{ marginBottom: 16 }}>
            <header className="card-header">
              <div>
                <h2 className="card-title">Recent Readings</h2>
                <div className="card-sub">
                  {selectedDevice ? selectedDevice.name : ""}
                  {selectedEui && (
                    <span className="text-mono" style={{ marginLeft: 6, fontSize: 11 }}>
                      {selectedEui}
                    </span>
                  )}
                </div>
              </div>
              <button className="btn-link blue" onClick={() => setRoute("readings")}>
                Open Readings →
              </button>
            </header>
            <div className="card-body flush">
              {recentReadings.length === 0 ? (
                <div className="empty-note">No readings yet.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Temperature</th>
                      <th>Battery</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentReadings.map((r, i) => {
                      const temp = parseFloat(r.temperature);
                      const bat = parseFloat(r.voltageRest);
                      const out = rule
                        ? temp < rule.minC || temp > rule.maxC
                        : false;
                      const lowBat = rule ? bat < rule.batteryLowV : false;
                      const tempClass = out
                        ? temp > (rule?.maxC ?? Infinity) ? "high" : "low"
                        : "";
                      return (
                        <tr key={r.id || r._id}>
                          <td>
                            {fmtDate(r.processedAt)}{" "}
                            <span style={{ color: "#aaa", fontSize: 12 }}>
                              {timeAgo(r.processedAt)}
                            </span>
                          </td>
                          <td className={`num temp-cell ${tempClass}`}>
                            {temp.toFixed(2)} °C
                            {i === 0 && <Spark values={sparkVals} />}
                          </td>
                          <td className="num bat-cell">{bat.toFixed(3)} V</td>
                          <td>
                            {out ? (
                              <SevBadge severity={temp > (rule?.maxC ?? Infinity) ? "critical" : "warning"} />
                            ) : lowBat ? (
                              <SevBadge severity="warning" />
                            ) : (
                              <span className="badge active">
                                <span className="badge-dot" />
                                ok
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* Alerts panel */}
          <section className="card" style={{ marginBottom: 24 }}>
            <header className="card-header">
              <div>
                <h2 className="card-title">Active Alerts</h2>
                <div className="card-sub">
                  {deviceAlerts.length} open · acknowledge to clear
                </div>
              </div>
              <button className="btn-link blue" onClick={() => setRoute("alerts")}>
                View all →
              </button>
            </header>
            <div className="alert-list">
              {deviceAlerts.length === 0 ? (
                <div className="empty-note" style={{ padding: "36px 0" }}>
                  <Uu5Elements.Icon
                    icon="mdi-check-circle-outline"
                    style={{ fontSize: 32, color: "#43a047" }}
                  />
                  <div style={{ marginTop: 8, color: "#2e7d32", fontWeight: 600 }}>All clear</div>
                  <div style={{ fontSize: 12, color: "#999" }}>No open alerts right now.</div>
                </div>
              ) : (
                deviceAlerts.slice(0, 5).map((a) => {
                  const dev = devices.find((d) => d.deviceEui === a.deviceEui);
                  return (
                    <div key={a.id} className="alert-item">
                      <div className={"alert-item-marker " + a.severity} />
                      <div className="alert-item-body">
                        <div className="alert-item-head">
                          <span className="alert-item-type">
                            {ALERT_TYPE_LABEL[a.type] || a.type}
                          </span>
                          <SevBadge severity={a.severity} />
                        </div>
                        <div className="alert-item-msg">{a.message}</div>
                        <div className="alert-item-meta">
                          <span>{dev ? dev.name : a.deviceEui}</span>
                          <span className="meta-sep">·</span>
                          <span className="text-mono" style={{ fontSize: 11 }}>
                            {a.deviceEui.slice(0, 10)}…
                          </span>
                          <span className="meta-sep">·</span>
                          <span>{timeAgo(a.createdAt)}</span>
                        </div>
                      </div>
                      <div className="alert-item-actions">
                        <button
                          className="icon-btn"
                          title="Acknowledge"
                          disabled={pendingId === a.id}
                          onClick={() => handleAcknowledge(a.id)}
                        >
                          <Uu5Elements.Icon icon="mdi-check" style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {deviceAlerts.length > 5 && (
              <div className="panel-footer">
                <span>{deviceAlerts.length - 5} older alerts hidden</span>
                <button className="btn-link blue" onClick={() => setRoute("alerts")}>
                  View all {deviceAlerts.length} →
                </button>
              </div>
            )}
          </section>

        </div>

        {toast && (
          <div className="toast">
            <span className="toast-dot" />
            {toast}
          </div>
        )}
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
