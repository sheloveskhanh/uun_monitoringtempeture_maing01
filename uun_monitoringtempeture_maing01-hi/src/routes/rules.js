//@@viewOn:imports
import { createVisualComponent, Utils, useDataList, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const EMPTY_FORM = { deviceEui: "", minC: "", maxC: "", batteryLowV: "3.2" };
const SCALE_MIN = -10, SCALE_MAX = 40;
//@@viewOff:constants

//@@viewOn:helpers
function RangeBar({ minC, maxC }) {
  const span = SCALE_MAX - SCALE_MIN;
  const left  = Math.max(0, Math.min(100, ((minC - SCALE_MIN) / span) * 100));
  const right = Math.max(0, Math.min(100, ((maxC - SCALE_MIN) / span) * 100));
  const width = Math.max(2, right - left);
  return (
    <div className="range-bar">
      <div className="range-bar-track">
        <div className="range-bar-fill" style={{ left: `${left}%`, width: `${width}%` }} />
        <div className="range-bar-tick" style={{ left: "20%" }} title="0°C" />
      </div>
    </div>
  );
}

function BatteryGauge({ v }) {
  const pct = Math.max(0, Math.min(100, ((v - 2.5) / (4.2 - 2.5)) * 100));
  const color = v >= 3.2 ? "#ff9800" : "#43a047";
  return (
    <span className="battery-gauge" title={`Alert below ${Number(v).toFixed(2)}V`}>
      <span className="battery-gauge-bar">
        <span className="battery-gauge-fill" style={{ width: `${pct}%`, background: color }} />
      </span>
      <span className="battery-gauge-value">{Number(v).toFixed(2)} V</span>
    </span>
  );
}

function StateBadge({ state }) {
  if (!state) return null;
  return (
    <span className={`badge ${state}`}>
      <span className="badge-dot" />
      {state}
    </span>
  );
}
//@@viewOff:helpers

let Rules = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "Rules",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    const ruleDataList = useDataList({
      handlerMap: { load: Calls.listRules },
      initialDtoIn: {},
    });

    const deviceDataList = useDataList({
      handlerMap: { load: Calls.listDevices },
      initialDtoIn: {},
    });

    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [showCreate, setShowCreate] = useState(false);
    const [createValues, setCreateValues] = useState(EMPTY_FORM);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 2400);
      return () => clearTimeout(t);
    }, [toast]);

    const rules = (ruleDataList.data ?? []).filter(Boolean).map(d => d.data).filter(Boolean);
    const devices = (deviceDataList.data ?? []).filter(Boolean).map(d => d.data).filter(Boolean);

    const devicesByEui = {};
    devices.forEach(d => { devicesByEui[d.deviceEui] = d; });

    const devicesWithoutRule = devices.filter(
      d => d.state === "active" && !rules.some(r => r.deviceEui === d.deviceEui)
    );

    function startCreate() {
      setShowCreate(true);
      setCreateValues({ ...EMPTY_FORM, deviceEui: devicesWithoutRule[0]?.deviceEui ?? "" });
      setEditingId(null);
    }

    function startEdit(rule) {
      setEditingId(rule.id);
      setEditValues({ minC: String(rule.minC), maxC: String(rule.maxC), batteryLowV: String(rule.batteryLowV) });
      setShowCreate(false);
    }

    function cancelEdit() {
      setEditingId(null);
      setEditValues({});
    }

    function validate(vals) {
      const minC = parseFloat(vals.minC);
      const maxC = parseFloat(vals.maxC);
      const bat  = parseFloat(vals.batteryLowV);
      if (Number.isNaN(minC) || Number.isNaN(maxC) || Number.isNaN(bat)) {
        setToast("All fields must be numbers.");
        return null;
      }
      if (minC >= maxC) {
        setToast("Min must be lower than max.");
        return null;
      }
      return { minC, maxC, batteryLowV: bat };
    }

    async function handleCreate() {
      if (!createValues.deviceEui) { setToast("Select a device."); return; }
      const parsed = validate(createValues);
      if (!parsed) return;
      setPendingId("new");
      try {
        await Calls.createRule({ deviceEui: createValues.deviceEui, ...parsed });
        await ruleDataList.handlerMap.load({});
        setShowCreate(false);
        setCreateValues(EMPTY_FORM);
        setToast("Rule created.");
      } catch (e) {
        setToast(e?.message ?? "Failed to create rule.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleUpdate(id) {
      const parsed = validate(editValues);
      if (!parsed) return;
      setPendingId(id);
      try {
        await Calls.updateRule({ id, ...parsed });
        await ruleDataList.handlerMap.load({});
        setEditingId(null);
        setToast("Rule updated.");
      } catch (e) {
        setToast(e?.message ?? "Failed to update rule.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleDelete() {
      if (!confirmDelete) return;
      const { id } = confirmDelete;
      setConfirmDelete(null);
      setPendingId(id);
      try {
        await Calls.deleteRule({ id });
        await ruleDataList.handlerMap.load({});
        setToast("Rule deleted.");
      } catch (e) {
        setToast(e?.message ?? "Failed to delete rule.");
      } finally {
        setPendingId(null);
      }
    }
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);
    const isLoading = ruleDataList.state === "pendingNoData";

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
              <h1 className="page-title">Rules</h1>
              <p className="page-subtitle">Set temperature bounds and battery thresholds per device.</p>
            </div>
            <div className="page-header-actions">
              <button
                className="btn-primary"
                onClick={startCreate}
                disabled={showCreate || devicesWithoutRule.length === 0}
              >
                <Uu5Elements.Icon icon="mdi-plus" />
                Add Rule
              </button>
            </div>
          </header>

          {devicesWithoutRule.length === 0 && !showCreate && rules.length > 0 && (
            <div className="info-banner">
              <Uu5Elements.Icon icon="mdi-check-circle" />
              Every active device has a rule. Add or activate a device first to create more rules.
            </div>
          )}

          {isLoading ? (
            <Uu5Elements.Pending />
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Temperature Range</th>
                    <th style={{ width: 200 }}>Battery Threshold</th>
                    <th style={{ width: 110 }}>Device State</th>
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>

                  {/* Create row */}
                  {showCreate && (
                    <tr className="row-edit">
                      <td>
                        <select
                          className="filter-select"
                          value={createValues.deviceEui}
                          onChange={(e) => setCreateValues(v => ({ ...v, deviceEui: e.target.value }))}
                        >
                          {devicesWithoutRule.map(d => (
                            <option key={d.deviceEui} value={d.deviceEui}>{d.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="inline-fields">
                          <label className="inline-field">
                            <span className="inline-field-label">Min °C</span>
                            <input
                              className="inline-input"
                              placeholder="2"
                              value={createValues.minC}
                              onChange={(e) => setCreateValues(v => ({ ...v, minC: e.target.value }))}
                            />
                          </label>
                          <span className="inline-sep">to</span>
                          <label className="inline-field">
                            <span className="inline-field-label">Max °C</span>
                            <input
                              className="inline-input"
                              placeholder="8"
                              value={createValues.maxC}
                              onChange={(e) => setCreateValues(v => ({ ...v, maxC: e.target.value }))}
                            />
                          </label>
                        </div>
                      </td>
                      <td>
                        <label className="inline-field">
                          <span className="inline-field-label">Volts</span>
                          <input
                            className="inline-input"
                            placeholder="3.2"
                            value={createValues.batteryLowV}
                            onChange={(e) => setCreateValues(v => ({ ...v, batteryLowV: e.target.value }))}
                          />
                        </label>
                      </td>
                      <td>
                        <span className="badge initial"><span className="badge-dot" />new</span>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button
                            className="btn-primary btn-sm"
                            onClick={handleCreate}
                            disabled={pendingId === "new"}
                          >
                            <Uu5Elements.Icon icon="mdi-check" /> Save
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => { setShowCreate(false); setCreateValues(EMPTY_FORM); }}
                          >
                            <Uu5Elements.Icon icon="mdi-close" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Empty state */}
                  {rules.length === 0 && !showCreate && (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-note" style={{ padding: "48px 0" }}>
                          <Uu5Elements.Icon icon="mdi-tune-variant" style={{ fontSize: 28, color: "#bbb" }} />
                          <div style={{ marginTop: 8, color: "#666", fontWeight: 600 }}>No rules configured</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            Add a rule to start receiving temperature &amp; battery alerts.
                          </div>
                          <button className="btn-primary" onClick={startCreate} style={{ marginTop: 14 }}>
                            <Uu5Elements.Icon icon="mdi-plus" /> Add your first rule
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Rule rows */}
                  {rules.map(rule => {
                    const dev = devicesByEui[rule.deviceEui];
                    const editing = editingId === rule.id;

                    if (editing) {
                      return (
                        <tr key={rule.id} className="row-edit">
                          <td>
                            <div className="device-pill">
                              <div>
                                <div className="device-pill-name">{dev ? dev.name : "—"}</div>
                                <div className="device-pill-eui">{rule.deviceEui}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="inline-fields">
                              <label className="inline-field">
                                <span className="inline-field-label">Min °C</span>
                                <input
                                  className="inline-input"
                                  value={editValues.minC}
                                  onChange={(e) => setEditValues(v => ({ ...v, minC: e.target.value }))}
                                />
                              </label>
                              <span className="inline-sep">to</span>
                              <label className="inline-field">
                                <span className="inline-field-label">Max °C</span>
                                <input
                                  className="inline-input"
                                  value={editValues.maxC}
                                  onChange={(e) => setEditValues(v => ({ ...v, maxC: e.target.value }))}
                                />
                              </label>
                            </div>
                          </td>
                          <td>
                            <label className="inline-field">
                              <span className="inline-field-label">Volts</span>
                              <input
                                className="inline-input"
                                value={editValues.batteryLowV}
                                onChange={(e) => setEditValues(v => ({ ...v, batteryLowV: e.target.value }))}
                              />
                            </label>
                          </td>
                          <td><StateBadge state={dev?.state} /></td>
                          <td>
                            <div className="action-cell">
                              <button
                                className="btn-primary btn-sm"
                                onClick={() => handleUpdate(rule.id)}
                                disabled={pendingId === rule.id}
                              >
                                <Uu5Elements.Icon icon="mdi-check" /> Save
                              </button>
                              <button className="icon-btn" onClick={cancelEdit}>
                                <Uu5Elements.Icon icon="mdi-close" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={rule.id}>
                        <td>
                          <div className="device-pill">
                            <div>
                              <div className="device-pill-name">{dev ? dev.name : "—"}</div>
                              <div className="device-pill-eui">{rule.deviceEui}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="range-cell">
                            <span className="range-cell-text">
                              <span className="range-cell-val">{rule.minC}°</span>
                              <span className="range-cell-sep">to</span>
                              <span className="range-cell-val">{rule.maxC}°C</span>
                            </span>
                            <RangeBar minC={rule.minC} maxC={rule.maxC} />
                          </div>
                        </td>
                        <td>
                          <BatteryGauge v={rule.batteryLowV} />
                        </td>
                        <td><StateBadge state={dev?.state} /></td>
                        <td>
                          <div className="action-cell">
                            <button
                              className="icon-btn"
                              title="Edit"
                              onClick={() => startEdit(rule)}
                              disabled={!!pendingId}
                            >
                              <Uu5Elements.Icon icon="mdi-pencil-outline" />
                            </button>
                            <button
                              className="icon-btn danger"
                              title="Delete"
                              onClick={() => setConfirmDelete(rule)}
                              disabled={!!pendingId}
                            >
                              <Uu5Elements.Icon icon="mdi-trash-can-outline" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Confirm delete modal */}
        {confirmDelete && (
          <div className="modal-backdrop" onClick={() => setConfirmDelete(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <header className="modal-head">
                <h3 className="modal-title">Delete rule</h3>
                <button className="icon-btn" onClick={() => setConfirmDelete(null)}>
                  <Uu5Elements.Icon icon="mdi-close" />
                </button>
              </header>
              <div className="modal-body">
                <p style={{ margin: 0 }}>
                  Delete the rule for{" "}
                  <strong>{devicesByEui[confirmDelete.deviceEui]?.name ?? confirmDelete.deviceEui}</strong>?
                </p>
                <p style={{ marginTop: 10, color: "#888", fontSize: 13 }}>
                  The device will stop generating temperature and battery alerts until a new rule is created.
                </p>
              </div>
              <footer className="modal-foot">
                <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
                <button className="btn-danger" onClick={handleDelete}>Delete</button>
              </footer>
            </div>
          </div>
        )}

      </div>
    );
    //@@viewOff:render
  },
});

Rules = withRoute(Rules, { authenticated: true });

//@@viewOn:exports
export { Rules };
export default Rules;
//@@viewOff:exports
