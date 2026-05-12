//@@viewOn:imports
import { createVisualComponent, Lsi, useRoute } from "uu5g05";
import Plus4U5App from "uu_plus4u5g02-app";

import Config from "./config/config.js";
import importLsi from "../lsi/import-lsi.js";
//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

//@@viewOn:css
//@@viewOff:css

//@@viewOn:helpers
//@@viewOff:helpers

const RouteBar = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "RouteBar",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    ...Plus4U5App.PositionBar.propTypes,
  },
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOn:private
    const [, setRoute] = useRoute();

    const actionList = [
      {
        children: <Lsi import={importLsi} path={["Menu", "dashboard"]} />,
        onClick: () => setRoute("dashboard"),
      },
      {
        children: <Lsi import={importLsi} path={["Menu", "readings"]} />,
        onClick: () => setRoute("readings"),
      },
      {
        children: <Lsi import={importLsi} path={["Menu", "rules"]} />,
        onClick: () => setRoute("rules"),
      },
      {
        children: <Lsi import={importLsi} path={["Menu", "home"]} />,
        onClick: () => setRoute("home"),
        collapsed: true,
      },
    ];
    //@@viewOff:private

    //@@viewOn:render
    return <Plus4U5App.PositionBar actionList={actionList} {...props} />;
    //@@viewOff:render
  },
});

//@@viewOn:exports
export { RouteBar };
export default RouteBar;
//@@viewOff:exports
