//@@viewOn:imports
import { createVisualComponent, Utils, useDataList, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const EMPTY_FORM = { name: "", deviceEui: "", description: "", minC: "", maxC: "", batteryLowV: "3.2" };
const STATE_COLOR = {
  initial: "#888",
  active: "#43a047",
  suspended: "#f57c00",
  closed: "#555",
  cancelled: "#d32f2f",
};
const STATES = ["initial", "active", "suspended", "closed", "cancelled"];
//@@viewOff:constants

//@@viewOn:css
const Css = {
  root: () =>
    Config.Css.css({
      padding: "0 24px 32px",
      maxWidth: 900,
      margin: "0 auto",
    }),
  toolbar: () =>
    Config.Css.css({
      display: "flex",
      justifyContent: "flex-end",
      margin: "16px 0 12px",
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
  input: () =>
    Config.Css.css({
      padding: "5px 8px",
      border: "1px solid #ccc",
      borderRadius: 5,
      fontSize: 14,
      width: 130,
      outline: "none",
    }),
  inputWide: () =>
    Config.Css.css({
      padding: "5px 8px",
      border: "1px solid #ccc",
      borderRadius: 5,
      fontSize: 14,
      width: 200,
      outline: "none",
    }),
  select: () =>
    Config.Css.css({
      padding: "5px 8px",
      border: "1px solid #ccc",
      borderRadius: 5,
      fontSize: 14,
      outline: "none",
      background: "#fff",
    }),
  actionCell: () =>
    Config.Css.css({
      display: "flex",
      gap: 8,
      alignItems: "center",
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
//@@viewOff:helpers

let Devices = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "Devices",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    const deviceDataList = useDataList({
      handlerMap: { load: Calls.listDevices },
      initialDtoIn: {},
    });

    const [showCreate, setShowCreate] = useState(false);
    const [createValues, setCreateValues] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [pendingId, setPendingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    const devices = (deviceDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);

    async function handleCreate() {
      setPendingId("new");
      try {
        const dtoIn = { name: createValues.name, deviceEui: createValues.deviceEui };
        if (createValues.description.trim()) dtoIn.description = createValues.description.trim();
        await Calls.createDevice(dtoIn);

        const minC = parseFloat(createValues.minC);
        const maxC = parseFloat(createValues.maxC);
        const bat  = parseFloat(createValues.batteryLowV);
        const hasRule = createValues.minC.trim() && createValues.maxC.trim();
        if (hasRule) {
          if (Number.isNaN(minC) || Number.isNaN(maxC) || Number.isNaN(bat)) {
            setToast("Device created. Rule skipped: fields must be numbers.");
          } else if (minC >= maxC) {
            setToast("Device created. Rule skipped: min must be lower than max.");
          } else {
            try {
              await Calls.createRule({
                deviceEui: createValues.deviceEui,
                minC: String(createValues.minC),
                maxC: String(createValues.maxC),
                batteryLowV: String(createValues.batteryLowV),
              });
              setToast("Device and rule created.");
            } catch (re) {
              setToast("Device created. Rule failed: " + (re?.message ?? "unknown error"));
            }
          }
        } else {
          setToast("Device created.");
        }

        await deviceDataList.handlerMap.load({});
        setShowCreate(false);
        setCreateValues(EMPTY_FORM);
      } catch (e) {
        console.error("Create failed:", e);
        setToast("Failed to create device.");
      } finally {
        setPendingId(null);
      }
    }

    function startEdit(device) {
      setEditingId(device.id);
      setEditValues({ name: device.name, description: device.description || "" });
    }

    function cancelEdit() {
      setEditingId(null);
      setEditValues({});
    }

    async function handleUpdate(id) {
      setPendingId(id);
      try {
        const dtoIn = { id, name: editValues.name };
        if (editValues.description.trim()) dtoIn.description = editValues.description.trim();
        await Calls.updateDevice(dtoIn);
        await deviceDataList.handlerMap.load({});
        setEditingId(null);
        setToast("Device updated.");
      } catch (e) {
        console.error("Update failed:", e);
        setToast("Failed to update device.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleSetState(id, state) {
      setPendingId(id);
      try {
        await Calls.setDeviceState({ id, state });
        await deviceDataList.handlerMap.load({});
        setToast(`Device set to ${state}.`);
      } catch (e) {
        console.error("SetState failed:", e);
        setToast("Failed to update device state.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleDelete(id) {
      setPendingId(id);
      try {
        await Calls.deleteDevice({ id });
        await deviceDataList.handlerMap.load({});
        setToast("Device deleted.");
      } catch (e) {
        console.error("Delete failed:", e);
        setToast("Failed to delete device.");
      } finally {
        setPendingId(null);
      }
    }
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);
    const isLoading = deviceDataList.state === "pendingNoData";

    return (
      <div {...attrs}>
        {toast && <div className={Css.toast()}>{toast}</div>}
        <RouteBar />
        <div className={Css.root()}>
          <div className={Css.toolbar()}>
            <Uu5Elements.Button
              onClick={() => { setShowCreate(true); }}
              significance="highlighted"
              colorScheme="primary"
            >
              + Add Device
            </Uu5Elements.Button>
          </div>

          {isLoading ? (
            <Uu5Elements.Pending />
          ) : (
            <table className={Css.table()}>
              <thead>
                <tr>
                  <th className={Css.th()}>Name</th>
                  <th className={Css.th()}>Device EUI</th>
                  <th className={Css.th()}>Description</th>
                  <th className={Css.th()}>State</th>
                  <th className={Css.th()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {showCreate && (
                  <>
                    <tr>
                      <td className={Css.td()}>
                        <input
                          className={Css.input()}
                          placeholder="Name"
                          value={createValues.name}
                          onChange={(e) => setCreateValues((v) => ({ ...v, name: e.target.value }))}
                        />
                      </td>
                      <td className={Css.td()}>
                        <input
                          className={Css.inputWide()}
                          placeholder="e.g. 24c4c981ad293382"
                          value={createValues.deviceEui}
                          onChange={(e) => setCreateValues((v) => ({ ...v, deviceEui: e.target.value }))}
                        />
                      </td>
                      <td className={Css.td()}>
                        <input
                          className={Css.inputWide()}
                          placeholder="Optional"
                          value={createValues.description}
                          onChange={(e) => setCreateValues((v) => ({ ...v, description: e.target.value }))}
                        />
                      </td>
                      <td className={Css.td()}>
                        <span className={Css.badge(STATE_COLOR.initial)}>initial</span>
                      </td>
                      <td className={Css.td()}>
                        <div className={Css.actionCell()}>
                          <Uu5Elements.Button
                            onClick={handleCreate}
                            disabled={pendingId === "new"}
                            significance="highlighted"
                            colorScheme="primary"
                            size="s"
                          >
                            Save
                          </Uu5Elements.Button>
                          <Uu5Elements.Button
                            onClick={() => { setShowCreate(false); setCreateValues(EMPTY_FORM); }}
                            significance="subdued"
                            size="s"
                          >
                            Cancel
                          </Uu5Elements.Button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={5} style={{ background: "#f6faff", borderBottom: "1px solid #dce7f4", padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#1976d2", textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>
                            Rule (optional)
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Min °C</span>
                              <input
                                className={Css.input()}
                                placeholder="e.g. 2"
                                value={createValues.minC}
                                onChange={(e) => setCreateValues((v) => ({ ...v, minC: e.target.value }))}
                                style={{ width: 80 }}
                              />
                            </label>
                            <span style={{ color: "#aaa", fontSize: 12, marginTop: 14 }}>to</span>
                            <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                              <span style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Max °C</span>
                              <input
                                className={Css.input()}
                                placeholder="e.g. 8"
                                value={createValues.maxC}
                                onChange={(e) => setCreateValues((v) => ({ ...v, maxC: e.target.value }))}
                                style={{ width: 80 }}
                              />
                            </label>
                          </div>
                          <label style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" }}>Battery Low (V)</span>
                            <input
                              className={Css.input()}
                              placeholder="3.2"
                              value={createValues.batteryLowV}
                              onChange={(e) => setCreateValues((v) => ({ ...v, batteryLowV: e.target.value }))}
                              style={{ width: 80 }}
                            />
                          </label>
                          <span style={{ fontSize: 12, color: "#aaa" }}>Leave Min/Max blank to skip rule creation.</span>
                        </div>
                      </td>
                    </tr>
                  </>
                )}

                {devices.length === 0 && !showCreate ? (
                  <tr>
                    <td colSpan={5} className={Css.emptyNote()}>
                      No devices registered. Click "+ Add Device" to create one.
                    </td>
                  </tr>
                ) : (
                  devices.map((device) =>
                    editingId === device.id ? (
                      <tr key={device.id}>
                        <td className={Css.td()}>
                          <input
                            className={Css.input()}
                            value={editValues.name}
                            onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                          />
                        </td>
                        <td className={Css.td()}>{device.deviceEui}</td>
                        <td className={Css.td()}>
                          <input
                            className={Css.inputWide()}
                            placeholder="Optional"
                            value={editValues.description}
                            onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
                          />
                        </td>
                        <td className={Css.td()}>
                          <span className={Css.badge(STATE_COLOR[device.state])}>{device.state}</span>
                        </td>
                        <td className={Css.td()}>
                          <div className={Css.actionCell()}>
                            <Uu5Elements.Button
                              onClick={() => handleUpdate(device.id)}
                              disabled={pendingId === device.id}
                              significance="highlighted"
                              colorScheme="primary"
                              size="s"
                            >
                              Save
                            </Uu5Elements.Button>
                            <Uu5Elements.Button
                              onClick={cancelEdit}
                              significance="subdued"
                              size="s"
                            >
                              Cancel
                            </Uu5Elements.Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={device.id}>
                        <td className={Css.td()}>{device.name}</td>
                        <td className={Css.td()}>{device.deviceEui}</td>
                        <td className={Css.td()}>{device.description || "—"}</td>
                        <td className={Css.td()}>
                          <span className={Css.badge(STATE_COLOR[device.state])}>{device.state}</span>
                        </td>
                        <td className={Css.td()}>
                          <div className={Css.actionCell()}>
                            <select
                              className={Css.select()}
                              value={device.state}
                              disabled={pendingId === device.id}
                              onChange={(e) => handleSetState(device.id, e.target.value)}
                            >
                              {STATES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <Uu5Elements.Button
                              onClick={() => startEdit(device)}
                              significance="subdued"
                              size="s"
                            >
                              Edit
                            </Uu5Elements.Button>
                            <Uu5Elements.Button
                              onClick={() => handleDelete(device.id)}
                              disabled={pendingId === device.id}
                              colorScheme="negative"
                              significance="subdued"
                              size="s"
                            >
                              Delete
                            </Uu5Elements.Button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
    //@@viewOff:render
  },
});

Devices = withRoute(Devices, { authenticated: true });

//@@viewOn:exports
export { Devices };
export default Devices;
//@@viewOff:exports
