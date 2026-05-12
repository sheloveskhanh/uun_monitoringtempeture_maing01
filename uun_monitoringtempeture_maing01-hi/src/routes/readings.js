//@@viewOn:imports
import { createVisualComponent, Utils, useDataList, useState } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
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
  filterInput: () =>
    Config.Css.css({
      padding: "6px 10px",
      border: "1px solid #ccc",
      borderRadius: 6,
      fontSize: 14,
      outline: "none",
      minWidth: 160,
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
    }),
  emptyNote: () =>
    Config.Css.css({
      color: "#999",
      fontSize: 14,
      padding: "24px 0",
      textAlign: "center",
    }),
};
//@@viewOff:css

//@@viewOn:helpers
function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
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
    const [deviceEui, setDeviceEui] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const readingDataList = useDataList({
      handlerMap: { load: Calls.listReadings },
      initialDtoIn: {},
    });

    function handleApply() {
      const dtoIn = {};
      if (deviceEui.trim()) dtoIn.deviceEui = deviceEui.trim();
      if (from) dtoIn.from = new Date(from).toISOString();
      if (to) dtoIn.to = new Date(to + "T23:59:59").toISOString();
      readingDataList.handlerMap.load(dtoIn);
    }

    function handleReset() {
      setDeviceEui("");
      setFrom("");
      setTo("");
      readingDataList.handlerMap.load({});
    }

    const isLoading = readingDataList.state === "pendingNoData" || readingDataList.state === "pending";

    const readings = (readingDataList.data ?? [])
      .filter(Boolean)
      .map((d) => d.data)
      .filter(Boolean)
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt));
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    return (
      <div {...attrs}>
        <RouteBar />
        <div className={Css.root()}>
          <div className={Css.filterBar()}>
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
              <div className={Css.rowCount()}>Showing {readings.length} reading{readings.length !== 1 ? "s" : ""}</div>
              {readings.length === 0 ? (
                <div className={Css.emptyNote()}>No readings found for the selected filters.</div>
              ) : (
                <table className={Css.table()}>
                  <thead>
                    <tr>
                      <th className={Css.th()}>Time</th>
                      <th className={Css.th()}>Device EUI</th>
                      <th className={Css.th()}>Temperature (°C)</th>
                      <th className={Css.th()}>Battery (V)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((r) => (
                      <tr key={r.id}>
                        <td className={Css.td()}>{formatDate(r.processedAt)}</td>
                        <td className={Css.td()}>{r.deviceEui}</td>
                        <td className={Css.td()}>{r.temperature}</td>
                        <td className={Css.td()}>{r.voltageRest}</td>
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

Readings = withRoute(Readings, { authenticated: true });

//@@viewOn:exports
export { Readings };
export default Readings;
//@@viewOff:exports
