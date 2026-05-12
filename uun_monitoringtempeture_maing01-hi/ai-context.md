# AI Context — uuMonitor Frontend

Use this at the start of every AI session for generating frontend components.

---

## Stack

- **Framework**: uu5g05 (Plus4U / UU5 v5), React-based
- **Component libs**: `uu5g05`, `uu5g05-elements`, `uu5g05-forms`, `uu_plus4u5g02`, `uu_plus4u5g02-app`, `uu_plus4u5g02-elements`
- **Routing**: `withRoute` from `uu_plus4u5g02-app`, route keys in `spa.js`
- **Styling**: `Config.Css.css(...)` (emotion-based, inline via `createVisualComponent`)
- **i18n**: LSI system — `<Lsi import={importLsi} path={["Section", "key"]} />`, strings in `src/lsi/en.json`
- **API calls**: `Plus4U5.Utils.AppClient.cmdGet/cmdPost` via `Calls.js`

---

## File conventions

Every component follows this structure:

```js
//@@viewOn:imports
import { createVisualComponent, Utils } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Config from "../config/config.js";  // adjust path
//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

//@@viewOn:css
const Css = {
  root: () => Config.Css.css({ /* styles */ }),
};
//@@viewOff:css

//@@viewOn:helpers
//@@viewOff:helpers

let MyComponent = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "MyComponent",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    //@@viewOff:private

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);
    return (
      <div {...attrs}>
        {/* content */}
      </div>
    );
    //@@viewOff:render
  },
});

// For route-level components only:
// MyComponent = withRoute(MyComponent, { authenticated: true });

//@@viewOn:exports
export { MyComponent };
export default MyComponent;
//@@viewOff:exports
```

---

## Routing (spa.js)

Routes are defined as keys in `ROUTE_MAP` in `src/core/spa.js`:

```js
const ROUTE_MAP = {
  "": { redirect: "home" },
  home: (props) => <Home {...props} />,
  dashboard: (props) => <Dashboard {...props} />,   // ← add new routes here
  // ...
};
```

Navigate with `useRoute`:
```js
const [, setRoute] = useRoute();
setRoute("dashboard");
setRoute("readings", { deviceEui: "24c4c981ad293382" }); // with params
```

---

## Navigation bar (route-bar.js)

Add menu items in `src/core/route-bar.js` inside `actionList`:

```js
const actionList = [
  { children: "Dashboard", onClick: () => setRoute("dashboard") },
  { children: "Devices",   onClick: () => setRoute("devices"), collapsed: true },
];
```

---

## API calls (calls.js)

Pattern for adding a new call:

```js
// In src/calls.js:
listReadings(dtoIn) {
  const commandUri = Calls.getCommandUri("reading/list");
  return Calls.call("cmdGet", commandUri, dtoIn);
},

createAlert(dtoIn) {
  const commandUri = Calls.getCommandUri("alert/create");
  return Calls.call("cmdPost", commandUri, dtoIn);
},
```

---

## Backend API reference

Base URL: `https://uuapp-dev.plus4u.net/uun-monitoringtempeture-maing01/{AWID}`

### reading/list (GET)
```
dtoIn:  { deviceEui?: string, from?: ISO8601, to?: ISO8601 }
dtoOut: { itemList: [{ _id, deviceEui, value, batteryV, createdAt }] }
```
- `value` = temperature in °C (number)
- `batteryV` = battery voltage (number)

### device/list (GET)
```
dtoOut: { itemList: [{ _id, name, deviceEui, state, createdAt }] }
```
- `state`: "active" | "closed"

### gateway/list (GET)
```
dtoOut: { itemList: [{ _id, name, uuIdentity, state, createdAt }] }
```

### rule/list (GET)
```
dtoOut: { itemList: [{ _id, deviceEui, minC, maxC, batteryLowV }] }
```
- all threshold values are strings (e.g. "18", "30", "3.3")

### alert/list (GET)
```
dtoIn:  { deviceEui?: string, status?: "active"|"acknowledged", severity?: "warning"|"critical" }
dtoOut: { itemList: [{ _id, deviceEui, type, severity, status, message, createdAt, acknowledgedAt? }] }
```
- `type`: "tempHigh" | "tempLow" | "batteryLow"

### alert/acknowledge (POST)
```
dtoIn:  { id: string }
dtoOut: { ...alert, status: "acknowledged", acknowledgedAt: ISO8601 }
```

### rule/create (POST)
```
dtoIn:  { deviceEui: string, minC: string, maxC: string, batteryLowV: string }
```

### rule/update (POST)
```
dtoIn:  { id: string, minC?: string, maxC?: string, batteryLowV?: string }
```

---

## Known device & gateway

- **Device**: "CHESTER Clime", `deviceEui: "24c4c981ad293382"`, state: active
- **Gateway**: "MikroTik RBM33G", state: active
- Readings arrive approximately every 1 hour

---

## Planned pages (Phase 2)

1. **Dashboard** — latest reading per device, active alert count, quick status
2. **Readings** — table/chart of readings with deviceEui + date range filter
3. **Alerts** — list of alerts, acknowledge button, filter by status/severity
4. **Devices** — list of devices + state badge
5. **Rules** — view/edit thresholds per device

---

## Example: complete route component

```js
// src/routes/readings.js
//@@viewOn:imports
import { createVisualComponent, Utils, useDataList } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "../calls.js";
//@@viewOff:imports

let Readings = createVisualComponent({
  uu5Tag: Config.TAG + "Readings",
  propTypes: {},
  defaultProps: {},

  render(props) {
    const dataListResult = useDataList({
      handlerMap: { load: Calls.listReadings },
      initialDtoIn: {},
    });

    const attrs = Utils.VisualComponent.getAttrs(props);

    if (dataListResult.state === "pendingNoData") {
      return <Uu5Elements.Pending />;
    }

    return (
      <div {...attrs}>
        <RouteBar />
        {/* table or chart here */}
      </div>
    );
  },
});

Readings = withRoute(Readings, { authenticated: true });

export { Readings };
export default Readings;
```
