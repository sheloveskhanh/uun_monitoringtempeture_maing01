//@@viewOn:imports
import { createVisualComponent, Utils, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:helpers
function LocationRow({ location, onEdit, onDelete, pendingId }) {
  const isPending = pendingId === location.id;
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600 }}>{location.name}</div>
      </td>
      <td className="col-hide-sm" style={{ color: location.description ? "#444" : "#aaa", fontSize: 13 }}>
        {location.description || "—"}
      </td>
      <td>
        <div className="action-cell">
          <button className="icon-btn" title="Edit" disabled={isPending} onClick={() => onEdit(location)}>
            <Uu5Elements.Icon icon="mdi-pencil-outline" style={{ fontSize: 16 }} />
          </button>
          <button className="icon-btn danger" title="Delete" disabled={isPending} onClick={() => onDelete(location)}>
            <Uu5Elements.Icon icon="mdi-trash-can-outline" style={{ fontSize: 16 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function EditRow({ location, onSave, onCancel, pendingId }) {
  const [form, setForm] = useState({ name: location.name, description: location.description || "" });
  return (
    <tr className="row-edit">
      <td>
        <label className="inline-field">
          <span className="inline-field-label">Name</span>
          <input
            className="inline-input"
            style={{ width: 220 }}
            value={form.name}
            autoFocus
            onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
          />
        </label>
      </td>
      <td className="col-hide-sm">
        <label className="inline-field">
          <span className="inline-field-label">Description</span>
          <input
            className="inline-input"
            style={{ width: 260 }}
            placeholder="Optional"
            value={form.description}
            onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
          />
        </label>
      </td>
      <td>
        <div className="action-cell">
          <Uu5Elements.Button
            className="btn-primary btn-sm"
            significance="highlighted"
            colorScheme="primary"
            size="s"
            disabled={pendingId === location.id}
            onClick={() => onSave(location.id, form)}
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

let Locations = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "Locations",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    const [locations, setLocations] = useState([]);
    const [loadState, setLoadState] = useState("loading");

    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", description: "" });

    const [editingId, setEditingId] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [pendingId, setPendingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
      Calls.listLocations({})
        .then((res) => {
          setLocations((res.itemList ?? []).filter(Boolean));
          setLoadState("ready");
        })
        .catch(() => setLoadState("ready"));
    }, []);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    async function reload() {
      const res = await Calls.listLocations({});
      setLocations((res.itemList ?? []).filter(Boolean));
    }

    async function handleCreate() {
      if (!createForm.name.trim()) { setToast("Name is required."); return; }
      setPendingId("new");
      try {
        const dtoIn = { name: createForm.name.trim() };
        if (createForm.description.trim()) dtoIn.description = createForm.description.trim();
        await Calls.createLocation(dtoIn);
        await reload();
        setShowCreate(false);
        setCreateForm({ name: "", description: "" });
        setToast("Location created.");
      } catch (e) {
        console.error("Create failed:", e);
        setToast("Failed to create location.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleUpdate(id, form) {
      setPendingId(id);
      try {
        const dtoIn = { id, name: form.name.trim() };
        if (form.description.trim()) dtoIn.description = form.description.trim();
        await Calls.updateLocation(dtoIn);
        await reload();
        setEditingId(null);
        setToast("Location updated.");
      } catch (e) {
        console.error("Update failed:", e);
        setToast("Failed to update location.");
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
        await Calls.deleteLocation({ id });
        await reload();
        setToast("Location deleted.");
      } catch (e) {
        console.error("Delete failed:", e);
        setToast("Failed to delete location.");
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
              <h1 className="page-title">Locations</h1>
              <p className="page-subtitle">
                Define physical locations (rooms, warehouses, zones) and assign devices to them.
              </p>
            </div>
            <div className="page-header-actions">
              <button
                className="btn-primary"
                onClick={() => { setShowCreate(true); setEditingId(null); }}
                disabled={showCreate}
              >
                <Uu5Elements.Icon icon="mdi-plus" style={{ fontSize: 16 }} /> Add Location
              </button>
            </div>
          </header>

          {loadState === "loading" ? (
            <Uu5Elements.Pending />
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th style={{ width: 320 }} className="col-hide-sm">Description</th>
                    <th style={{ width: 110 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>

                  {/* Create row */}
                  {showCreate && (
                    <tr className="row-create">
                      <td>
                        <label className="inline-field">
                          <span className="inline-field-label">Name *</span>
                          <input
                            className="inline-input"
                            style={{ width: 220 }}
                            placeholder="e.g. Cold Storage A"
                            value={createForm.name}
                            autoFocus
                            onChange={(e) => setCreateForm((v) => ({ ...v, name: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setShowCreate(false); setCreateForm({ name: "", description: "" }); }}}
                          />
                        </label>
                      </td>
                      <td className="col-hide-sm">
                        <label className="inline-field">
                          <span className="inline-field-label">Description</span>
                          <input
                            className="inline-input"
                            style={{ width: 260 }}
                            placeholder="Optional"
                            value={createForm.description}
                            onChange={(e) => setCreateForm((v) => ({ ...v, description: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") { setShowCreate(false); setCreateForm({ name: "", description: "" }); }}}
                          />
                        </label>
                      </td>
                      <td>
                        <div className="action-cell">
                          <button
                            className="btn-primary btn-sm"
                            disabled={pendingId === "new"}
                            onClick={handleCreate}
                          >
                            <Uu5Elements.Icon icon="mdi-check" style={{ fontSize: 14 }} /> Create
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => { setShowCreate(false); setCreateForm({ name: "", description: "" }); }}
                          >
                            <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 14 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Empty state */}
                  {locations.length === 0 && !showCreate && (
                    <tr>
                      <td colSpan={3}>
                        <div className="empty-note" style={{ padding: "48px 0" }}>
                          <Uu5Elements.Icon icon="mdi-map-marker-outline" style={{ fontSize: 28, color: "#bbb" }} />
                          <div style={{ marginTop: 8, color: "#666", fontWeight: 600 }}>No locations yet</div>
                          <div style={{ fontSize: 12, color: "#999" }}>
                            Add a location to organize your devices by physical area.
                          </div>
                          <button
                            className="btn-primary"
                            onClick={() => { setShowCreate(true); setEditingId(null); }}
                            style={{ marginTop: 14 }}
                          >
                            <Uu5Elements.Icon icon="mdi-plus" style={{ fontSize: 14 }} /> Add your first location
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Location rows */}
                  {locations.map((loc) =>
                    editingId === loc.id ? (
                      <EditRow
                        key={loc.id}
                        location={loc}
                        pendingId={pendingId}
                        onSave={handleUpdate}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <LocationRow
                        key={loc.id}
                        location={loc}
                        pendingId={pendingId}
                        onEdit={(l) => { setEditingId(l.id); setShowCreate(false); }}
                        onDelete={(l) => setConfirmDelete(l)}
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
                <h3 className="modal-title">Delete location</h3>
                <button className="icon-btn" onClick={() => setConfirmDelete(null)}>
                  <Uu5Elements.Icon icon="mdi-close" style={{ fontSize: 16 }} />
                </button>
              </header>
              <div className="modal-body">
                <p style={{ margin: 0 }}>
                  Permanently delete <strong>{confirmDelete.name}</strong>?
                </p>
                <p style={{ marginTop: 10, color: "#888", fontSize: 13 }}>
                  Devices assigned to this location will not be deleted, but will no longer have a location set.
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

Locations = withRoute(Locations, { authenticated: true });

//@@viewOn:exports
export { Locations };
export default Locations;
//@@viewOff:exports
