//@@viewOn:imports
import { createVisualComponent, Utils, useDataList, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const EMPTY_FORM = { deviceEui: "", minC: "", maxC: "", batteryLowV: "" };
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
  input: () =>
    Config.Css.css({
      padding: "5px 8px",
      border: "1px solid #ccc",
      borderRadius: 5,
      fontSize: 14,
      width: 90,
      outline: "none",
    }),
  inputWide: () =>
    Config.Css.css({
      padding: "5px 8px",
      border: "1px solid #ccc",
      borderRadius: 5,
      fontSize: 14,
      width: 160,
      outline: "none",
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

    const [editingId, setEditingId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const [showCreate, setShowCreate] = useState(false);
    const [createValues, setCreateValues] = useState(EMPTY_FORM);
    const [pendingId, setPendingId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
      if (!toast) return;
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }, [toast]);

    const rules = (ruleDataList.data ?? []).filter(Boolean).map((d) => d.data).filter(Boolean);

    function startEdit(rule) {
      setEditingId(rule.id);
      setEditValues({ minC: rule.minC, maxC: rule.maxC, batteryLowV: rule.batteryLowV });
    }

    function cancelEdit() {
      setEditingId(null);
      setEditValues({});
    }

    async function handleUpdate(id) {
      setPendingId(id);
      try {
        await Calls.updateRule({ id, ...editValues });
        await ruleDataList.handlerMap.load({});
        setEditingId(null);
        setToast("Rule updated.");
      } catch (e) {
        console.error("Update failed:", e);
        setToast("Failed to update rule.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleDelete(id) {
      setPendingId(id);
      try {
        await Calls.deleteRule({ id });
        await ruleDataList.handlerMap.load({});
        setToast("Rule deleted.");
      } catch (e) {
        console.error("Delete failed:", e);
        setToast("Failed to delete rule.");
      } finally {
        setPendingId(null);
      }
    }

    async function handleCreate() {
      setPendingId("new");
      try {
        await Calls.createRule(createValues);
        await ruleDataList.handlerMap.load({});
        setShowCreate(false);
        setCreateValues(EMPTY_FORM);
        setToast("Rule created.");
      } catch (e) {
        console.error("Create failed:", e);
        setToast("Failed to create rule.");
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
        {toast && <div className={Css.toast()}>{toast}</div>}
        <RouteBar />
        <div className={Css.root()}>
          <div className={Css.toolbar()}>
            <Uu5Elements.Button
              onClick={() => { setShowCreate(true); setEditingId(null); }}
              significance="highlighted"
              colorScheme="primary"
            >
              + Add Rule
            </Uu5Elements.Button>
          </div>

          {isLoading ? (
            <Uu5Elements.Pending />
          ) : (
            <table className={Css.table()}>
              <thead>
                <tr>
                  <th className={Css.th()}>Device EUI</th>
                  <th className={Css.th()}>Min Temp (°C)</th>
                  <th className={Css.th()}>Max Temp (°C)</th>
                  <th className={Css.th()}>Battery Low (V)</th>
                  <th className={Css.th()}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Create row */}
                {showCreate && (
                  <tr>
                    <td className={Css.td()}>
                      <input
                        className={Css.inputWide()}
                        placeholder="Device EUI"
                        value={createValues.deviceEui}
                        onChange={(e) => setCreateValues((v) => ({ ...v, deviceEui: e.target.value }))}
                      />
                    </td>
                    <td className={Css.td()}>
                      <input
                        className={Css.input()}
                        placeholder="e.g. 5"
                        value={createValues.minC}
                        onChange={(e) => setCreateValues((v) => ({ ...v, minC: e.target.value }))}
                      />
                    </td>
                    <td className={Css.td()}>
                      <input
                        className={Css.input()}
                        placeholder="e.g. 30"
                        value={createValues.maxC}
                        onChange={(e) => setCreateValues((v) => ({ ...v, maxC: e.target.value }))}
                      />
                    </td>
                    <td className={Css.td()}>
                      <input
                        className={Css.input()}
                        placeholder="e.g. 3.2"
                        value={createValues.batteryLowV}
                        onChange={(e) => setCreateValues((v) => ({ ...v, batteryLowV: e.target.value }))}
                      />
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
                )}

                {/* Existing rules */}
                {rules.length === 0 && !showCreate ? (
                  <tr>
                    <td colSpan={5} className={Css.emptyNote()}>
                      No rules configured. Click "+ Add Rule" to create one.
                    </td>
                  </tr>
                ) : (
                  rules.map((rule) =>
                    editingId === rule.id ? (
                      <tr key={rule.id}>
                        <td className={Css.td()}>{rule.deviceEui}</td>
                        <td className={Css.td()}>
                          <input
                            className={Css.input()}
                            value={editValues.minC}
                            onChange={(e) => setEditValues((v) => ({ ...v, minC: e.target.value }))}
                          />
                        </td>
                        <td className={Css.td()}>
                          <input
                            className={Css.input()}
                            value={editValues.maxC}
                            onChange={(e) => setEditValues((v) => ({ ...v, maxC: e.target.value }))}
                          />
                        </td>
                        <td className={Css.td()}>
                          <input
                            className={Css.input()}
                            value={editValues.batteryLowV}
                            onChange={(e) => setEditValues((v) => ({ ...v, batteryLowV: e.target.value }))}
                          />
                        </td>
                        <td className={Css.td()}>
                          <div className={Css.actionCell()}>
                            <Uu5Elements.Button
                              onClick={() => handleUpdate(rule.id)}
                              disabled={pendingId === rule.id}
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
                      <tr key={rule.id}>
                        <td className={Css.td()}>{rule.deviceEui}</td>
                        <td className={Css.td()}>{rule.minC}</td>
                        <td className={Css.td()}>{rule.maxC}</td>
                        <td className={Css.td()}>{rule.batteryLowV}</td>
                        <td className={Css.td()}>
                          <div className={Css.actionCell()}>
                            <Uu5Elements.Button
                              onClick={() => startEdit(rule)}
                              significance="subdued"
                              size="s"
                            >
                              Edit
                            </Uu5Elements.Button>
                            <Uu5Elements.Button
                              onClick={() => handleDelete(rule.id)}
                              disabled={pendingId === rule.id}
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

Rules = withRoute(Rules, { authenticated: true });

//@@viewOn:exports
export { Rules };
export default Rules;
//@@viewOff:exports
