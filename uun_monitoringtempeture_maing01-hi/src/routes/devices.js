//@@viewOn:imports
import { createVisualComponent, Utils, useState, useEffect, useMemo, useRef } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const STATES = ["initial", "active", "suspended", "closed", "cancelled"];

const TRANSITIONS = {
  initial:   ["active", "cancelled"],
  active:    ["suspended", "closed"],
  suspended: ["active", "closed"],
  closed:    [],
  cancelled: [],
};

const EMPTY_CREATE_FORM = {
  name: "", deviceEui: "", description: "",
  addRule: true,
  minC: "2", maxC: "8", batteryLowV: "3.2",
};
//@@viewOff:constants

//@@viewOn:helpers
function DeviceRow({ device, rules, onEdit, onDelete, onSetState, pendingId, openMenuId, menuPos, onPillClick }) {
  const pillRef = useRef(null);
  const hasRule = rules.some((r) => r.deviceEui === device.deviceEui);
  const allowed = TRANSITIONS[device.state] || [];
  const isTerminal = allowed.length === 0;
  const isPending = pendingId === device.id;
  const menuOpen = openMenuId === device.id;

  function handlePillClick() {
    if (pillRef.current) {
      const rect = pillRef.current.getBoundingClientRect();
      onPillClick(menuOpen ? null : device.id, rect);
    }
  }

  return (
    <tr>
      <td>
        <div className="device-pill">
          <div>
            <div className="device-pill-name">{device.name}</div>
            <div className="device-pill-eui">{device.deviceEui}</div>
          </div>
          {hasRule ? (
            <span className="rule-pill has" title="Rule configured">
              <Uu5Elements.Icon icon="mdi-tune-variant" style={{ fontSize: 11 }} /> rule
            </span>
          ) : (
            <span className="rule-pill missing" title="No rule — won't generate alerts">
              <Uu5Elements.Icon icon="mdi-tune-variant" style={{ fontSize: 11 }} /> no rule
            </span>
          )}
        </div>
      </td>
      <td style={{ color: device.description ? "#444" : "#aaa", fontSize: 13 }}>
        {device.description || "—"}
      </td>
      <td>
        <span style={{ color: "#aaa", fontSize: 12 }}>no readings</span>
      </td>
      <td>
        <div className="state-cell" onClick={(e) => e.stopPropagation()}>
          <button
            ref={pillRef}
            className={"state-pill " + device.state}
            disabled={isTerminal || isPending}
            title={isTerminal ? "Terminal state" : "Change state"}
            onClick={handlePillClick}
          >
            <span className={"badge-dot inline-dot " + device.state}></span>
            {device.state}
            {!isTerminal && (
              <Uu5Elements.Icon
                icon="mdi-chevron-down"
                style={{ fontSize: 12, marginLeft: 2 }}
              />
            )}
          </button>
          {menuOpen && allowed.length > 0 && (
            <div className="state-menu" style={{ position: "fixed", top: menuPos.top, left: menuPos.left }}>
              <div className="state-menu-label">Transition to…</div>
              {allowed.map((s) => (
                <button
                  key={s}
                  className="state-menu-item"
                  onClick={() => {
                    onPillClick(null, null);
                    onSetState(device.id, s);
                  }}
                >
                  <span className={"badge-dot inline-dot " + s}></span>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td>
        <div className="action-cell">
          <button
            className="icon-btn"
            title="Edit"
            disabled={isPending}
            onClick={() => onEdit(device)}
          >
            <Uu5Elements.Icon icon="mdi-pencil-outline" style={{ fontSize: 16 }} />
          </button>
          <button
            className="icon-btn danger"
            title="Delete"
            disabled={isPending}
            onClick={() => onDelete(device)}
          >
            <Uu5Elements.Icon icon="mdi-trash-can-outline" style={{ fontSize: 16 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function EditRow({ device, onSave, onCancel, pendingId }) {
  const [form, setForm] = useState({ name: device.name, description: device.description || "" });

  return (
    <tr className="row-edit">
      <td>
        <div className="inline-fields" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
          <label className="inline-field" style={{ width: "100%" }}>
            <span className="inline-field-label">Name</span>
            <input
              className="inline-input"
              style={{ width: 220 }}
              value={form.name}
              autoFocus
              onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
            />
          </label>
          <div className="device-pill-eui" style={{ marginTop: 2 }}>{device.deviceEui}</div>
        </div>
      </td>
      <td>
        <label className="inline-field">
          <span className="inline-field-label">Description</span>
          <input
            className="inline-input"
            style={{ width: 220 }}
            placeholder="Optional"
            value={form.description}
            onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
          />
        </label>
      </td>
      <td><span style={{ color: "#aaa", fontSize: 12 }}>no readings</span></td>
      <td>
        <span className={"state-pill " + device.state} style={{ pointerEvents: "none" }}>
          <span className={"badge-dot inline-dot " + device.state}></span>
          {device.state}
        </span>
      </td>
      <td>
        <div className="action-cell">
          <Uu5Elements.Button
            className="btn-primary btn-sm"
            significance="highlighted"
            colorScheme="primary"
            size="s"
            disabled={pendingId === device.id}
            onClick={() => onSave(device.id, form)}
          >
            <Uu5Elements.Icon icon="mdi-check" style={{ fontSize: 14 }} /> Save
          </Uu5Elements.Button>
          <button className="icon-btn" onClick={onCancel}>
            <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 14 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}
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
    const [devices, setDevices] = useState([]);
    const [rules, setRules] = useState([]);
    const [loadState, setLoadState] = useState("loading");

    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);

    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

    const [search, setSearch] = useState("");
    const [stateFilter, setStateFilter] = useState("all");
    const [toast, setToast] = useState(null);

    useEffect(() => {
      Promise.all([Calls.listDevices({}), Calls.listRules({})])
        .then(([devRes, ruleRes]) => {
          setDevices((devRes.itemList ?? []).filter(Boolean));
          setRules((ruleRes.itemList ?? []).filter(Boolean));
          setLoadState("ready");
        })
        .catch(() => setLoadState("ready"));
    }, []);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    useEffect(() => {
      if (!openMenuId) return;
      const close = () => setOpenMenuId(null);
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }, [openMenuId]);

    function handlePillClick(id, rect) {
      if (id === null) {
        setOpenMenuId(null);
      } else {
        setMenuPos({ top: rect.bottom + 6, left: rect.left });
        setOpenMenuId(id);
      }
    }

    const counts = useMemo(() => {
      const c = { all: devices.length };
      STATES.forEach((s) => { c[s] = devices.filter((d) => d.state === s).length; });
      return c;
    }, [devices]);

    const visibleDevices = useMemo(() => {
      let xs = devices;
      if (stateFilter !== "all") xs = xs.filter((d) => d.state === stateFilter);
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        xs = xs.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.deviceEui.toLowerCase().includes(q) ||
            (d.description || "").toLowerCase().includes(q)
        );
      }
      return xs;
    }, [devices, stateFilter, search]);

    async function reloadAll() {
      const [devRes, ruleRes] = await Promise.all([Calls.listDevices({}), Calls.listRules({})]);
      setDevices((devRes.itemList ?? []).filter(Boolean));
      setRules((ruleRes.itemList ?? []).filter(Boolean));
    }

    async function handleCreate() {
      if (!createForm.name.trim()) { setToast("Name is required."); return; }
      if (!createForm.deviceEui.trim()) { setToast("Device EUI is required."); return; }
      if (devices.some((d) => d.deviceEui === createForm.deviceEui.trim())) {
        setToast("A device with this EUI already exists."); return;
      }
      if (createForm.addRule) {
        const minC = parseFloat(createForm.minC);
        const maxC = parseFloat(createForm.maxC);
        const bat = parseFloat(createForm.batteryLowV);
        if ([minC, maxC, bat].some(Number.isNaN)) { setToast("Rule fields must be numbers."); return; }
        if (minC >= maxC) { setToast("Min must be lower than max."); return; }
      }

      setPendingId("new");
      try {
        const dtoIn = { name: createForm.name.trim(), deviceEui: createForm.deviceEui.trim() };
        if (createForm.description.trim()) dtoIn.description = createForm.description.trim();
        const newDevice = await Calls.createDevice(dtoIn);

        if (createForm.addRule) {
          // Auto-activate so rule creation is allowed, then create the rule.
          await Calls.setDeviceState({ id: newDevice.id, state: "active" });
          await Calls.createRule({
            deviceEui: createForm.deviceEui.trim(),
            minC: parseFloat(createForm.minC),
            maxC: parseFloat(createForm.maxC),
            batteryLowV: parseFloat(createForm.batteryLowV),
          });
          setToast("Device & rule created.");
        } else {
          setToast("Device created.");
        }

        await reloadAll();
        setShowCreate(false);
        setCreateForm(EMPTY_CREATE_FORM);
      } catch (e) {
        console.error("Create failed:", e);
        setToast("Failed to create device.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleUpdate(id, form) {
      setPendingId(id);
      try {
        const dtoIn = { id, name: form.name.trim() };
        if (form.description.trim()) dtoIn.description = form.description.trim();
        await Calls.updateDevice(dtoIn);
        await reloadAll();
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
        await reloadAll();
        setToast(`Device set to ${state}.`);
      } catch (e) {
        console.error("SetState failed:", e);
        setToast("Failed to update device state.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleDelete() {
      if (!confirmDelete) return;
      const id = confirmDelete.id;
      setConfirmDelete(null);
      setPendingId(id);
      try {
        await Calls.deleteDevice({ id });
        await reloadAll();
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
              <h1 className="page-title">Devices</h1>
              <p className="page-subtitle">
                Register sensors, manage their lifecycle state, and review last-seen telemetry.
              </p>
            </div>
            <div className="page-header-actions">
              <button className="btn-primary" onClick={() => { setShowCreate(true); setEditingId(null); }} disabled={showCreate}>
                <Uu5Elements.Icon icon="mdi-plus" style={{ fontSize: 16 }} /> Add Device
              </button>
            </div>
          </header>

          {/* State filter tabs + search */}
          <div className="state-tabs">
            <button
              className={"state-tab" + (stateFilter === "all" ? " active" : "")}
              onClick={() => setStateFilter("all")}
            >
              All <span className="state-tab-count">{counts.all}</span>
            </button>
            {STATES.map((s) => (
              <button
                key={s}
                className={"state-tab" + (stateFilter === s ? " active" : "")}
                onClick={() => setStateFilter(s)}
              >
                <span className={"badge-dot inline-dot " + s}></span>
                {s} <span className="state-tab-count">{counts[s]}</span>
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div className="search-box">
              <Uu5Elements.Icon icon="mdi-magnify" style={{ fontSize: 14, color: "#888" }} />
              <input
                className="search-input"
                placeholder="Search name, EUI, description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")}>
                  <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 12 }} />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loadState === "loading" ? (
            <Uu5Elements.Pending />
          ) : (
            <div className="data-table-wrap">
              <table className="data-table devices-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th style={{ width: 240 }}>Description</th>
                    <th style={{ width: 200 }}>Last Reading</th>
                    <th style={{ width: 200 }}>State</th>
                    <th style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>

                  {/* Create row */}
                  {showCreate && (
                    <tr className="row-create">
                      <td colSpan={5} className="create-cell">
                        <div className="create-form">
                          <div className="create-form-grid">

                            {/* Left: Device fields */}
                            <div className="create-form-section">
                              <div className="create-form-section-head">
                                <Uu5Elements.Icon icon="mdi-router-wireless" style={{ fontSize: 16, color: "#1976d2" }} />
                                Device
                              </div>
                              <div className="create-form-fields">
                                <label className="inline-field">
                                  <span className="inline-field-label">Name *</span>
                                  <input
                                    className="inline-input"
                                    style={{ width: 240 }}
                                    placeholder="e.g. Cold Storage A"
                                    value={createForm.name}
                                    autoFocus
                                    onChange={(e) => setCreateForm((v) => ({ ...v, name: e.target.value }))}
                                  />
                                </label>
                                <label className="inline-field">
                                  <span className="inline-field-label">Device EUI *</span>
                                  <input
                                    className="inline-input text-mono"
                                    style={{ width: 240 }}
                                    placeholder="24c4c981ad293382"
                                    value={createForm.deviceEui}
                                    onChange={(e) => setCreateForm((v) => ({ ...v, deviceEui: e.target.value }))}
                                  />
                                </label>
                                <label className="inline-field">
                                  <span className="inline-field-label">Description</span>
                                  <input
                                    className="inline-input"
                                    style={{ width: 240 }}
                                    placeholder="Optional"
                                    value={createForm.description}
                                    onChange={(e) => setCreateForm((v) => ({ ...v, description: e.target.value }))}
                                  />
                                </label>
                              </div>
                            </div>

                            <div className="create-form-divider" />

                            {/* Right: Rule (toggleable) */}
                            <div className={"create-form-section" + (createForm.addRule ? "" : " is-off")}>
                              <div className="create-form-section-head">
                                <label className="create-form-toggle">
                                  <input
                                    type="checkbox"
                                    checked={createForm.addRule}
                                    onChange={(e) => setCreateForm((v) => ({ ...v, addRule: e.target.checked }))}
                                  />
                                  <span className="create-form-toggle-track">
                                    <span className="create-form-toggle-thumb" />
                                  </span>
                                </label>
                                <Uu5Elements.Icon
                                  icon="mdi-tune-variant"
                                  style={{ fontSize: 16, color: createForm.addRule ? "#1976d2" : "#aaa" }}
                                />
                                <span>Initial rule</span>
                                <span className="create-form-section-hint">
                                  {createForm.addRule
                                    ? "alerts will fire when readings fall outside these bounds"
                                    : "no rule — add one later from the Rules page"}
                                </span>
                              </div>
                              {createForm.addRule && (
                                <div className="create-form-fields">
                                  <label className="inline-field">
                                    <span className="inline-field-label">Min °C</span>
                                    <input
                                      className="inline-input"
                                      value={createForm.minC}
                                      onChange={(e) => setCreateForm((v) => ({ ...v, minC: e.target.value }))}
                                    />
                                  </label>
                                  <label className="inline-field">
                                    <span className="inline-field-label">Max °C</span>
                                    <input
                                      className="inline-input"
                                      value={createForm.maxC}
                                      onChange={(e) => setCreateForm((v) => ({ ...v, maxC: e.target.value }))}
                                    />
                                  </label>
                                  <label className="inline-field">
                                    <span className="inline-field-label">Battery low (V)</span>
                                    <input
                                      className="inline-input"
                                      value={createForm.batteryLowV}
                                      onChange={(e) => setCreateForm((v) => ({ ...v, batteryLowV: e.target.value }))}
                                    />
                                  </label>
                                  <div className="create-form-presets">
                                    <span className="create-form-presets-label">Presets:</span>
                                    <button
                                      className="preset-chip"
                                      onClick={() => setCreateForm((v) => ({ ...v, minC: "2", maxC: "8", batteryLowV: "3.2" }))}
                                    >
                                      Fridge (2–8°C)
                                    </button>
                                    <button
                                      className="preset-chip"
                                      onClick={() => setCreateForm((v) => ({ ...v, minC: "-25", maxC: "-15", batteryLowV: "3.2" }))}
                                    >
                                      Freezer (−25–−15°C)
                                    </button>
                                    <button
                                      className="preset-chip"
                                      onClick={() => setCreateForm((v) => ({ ...v, minC: "15", maxC: "25", batteryLowV: "3.2" }))}
                                    >
                                      Ambient (15–25°C)
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                          </div>

                          <div className="create-form-foot">
                            <span className="create-form-state-note">
                              <span className="badge initial"><span className="badge-dot" />initial</span>
                              <span style={{ color: "#888", fontSize: 12 }}>
                                {createForm.addRule
                                  ? <>New devices are <strong>activated automatically</strong> when a rule is configured.</>
                                  : <>New devices start in <strong>initial</strong>. Move to <strong>active</strong> after the sensor is online.</>}
                              </span>
                            </span>
                            <div style={{ flex: 1 }} />
                            <button
                              className="btn-secondary"
                              onClick={() => { setShowCreate(false); setCreateForm(EMPTY_CREATE_FORM); }}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn-primary"
                              disabled={pendingId === "new"}
                              onClick={handleCreate}
                            >
                              <Uu5Elements.Icon icon="mdi-check" style={{ fontSize: 14 }} />
                              {createForm.addRule ? "Create device & rule" : "Create device"}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Empty state */}
                  {visibleDevices.length === 0 && !showCreate && (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-note" style={{ padding: "48px 0" }}>
                          <Uu5Elements.Icon icon="mdi-router-wireless" style={{ fontSize: 28, color: "#bbb" }} />
                          <div style={{ marginTop: 8, color: "#666", fontWeight: 600 }}>
                            {devices.length === 0 ? "No devices registered" : "No devices match these filters"}
                          </div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            {devices.length === 0
                              ? "Add a device to start receiving readings."
                              : "Try clearing the state filter or search."}
                          </div>
                          {devices.length === 0 ? (
                            <button
                              className="btn-primary"
                              onClick={() => { setShowCreate(true); setEditingId(null); }}
                              style={{ marginTop: 14 }}
                            >
                              <Uu5Elements.Icon icon="mdi-plus" style={{ fontSize: 14 }} /> Add your first device
                            </button>
                          ) : (
                            <button
                              className="btn-link blue"
                              onClick={() => { setStateFilter("all"); setSearch(""); }}
                              style={{ marginTop: 10 }}
                            >
                              Reset filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Device rows */}
                  {visibleDevices.map((device) =>
                    editingId === device.id ? (
                      <EditRow
                        key={device.id}
                        device={device}
                        pendingId={pendingId}
                        onSave={handleUpdate}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <DeviceRow
                        key={device.id}
                        device={device}
                        rules={rules}
                        pendingId={pendingId}
                        openMenuId={openMenuId}
                        menuPos={menuPos}
                        onPillClick={handlePillClick}
                        onEdit={(d) => { setEditingId(d.id); setShowCreate(false); setOpenMenuId(null); }}
                        onDelete={(d) => { setConfirmDelete(d); setOpenMenuId(null); }}
                        onSetState={handleSetState}
                      />
                    )
                  )}

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
                <h3 className="modal-title">Delete device</h3>
                <button className="icon-btn" onClick={() => setConfirmDelete(null)}>
                  <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 16 }} />
                </button>
              </header>
              <div className="modal-body">
                <p style={{ margin: 0 }}>
                  Permanently delete <strong>{confirmDelete.name}</strong>?
                </p>
                <p style={{ marginTop: 10, color: "#888", fontSize: 13 }}>
                  Existing readings and alerts will remain. The associated rule will need to be removed manually.
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

Devices = withRoute(Devices, { authenticated: true });

//@@viewOn:exports
export { Devices };
export default Devices;
//@@viewOff:exports
