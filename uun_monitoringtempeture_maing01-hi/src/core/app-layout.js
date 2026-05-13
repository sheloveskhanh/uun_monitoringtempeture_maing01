//@@viewOn:imports
import { createVisualComponent, useRoute, useRef, useEffect, useSession, useState } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:constants
const NAV_ITEMS = [
  { route: "dashboard", icon: "mdi-view-dashboard", label: "Dashboard" },
  { route: "readings", icon: "mdi-format-list-bulleted", label: "Readings" },
  { route: "rules", icon: "mdi-tune-variant", label: "Rules" },
  { route: "alerts", icon: "mdi-bell-outline", label: "Alerts" },
  { route: "devices", icon: "mdi-cog-outline", label: "Devices" },
];
//@@viewOff:constants

//@@viewOn:helpers
const ROLE_MAP = [
  { profile: "Authorities",   label: "Administrator" },
  { profile: "Executives",    label: "Executive" },
  { profile: "StandardUsers", label: "User" },
];

function resolveRole(profiles = []) {
  const match = ROLE_MAP.find((r) => profiles.includes(r.profile));
  return match ? match.label : "Member";
}
//@@viewOff:helpers

let AppLayout = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "AppLayout",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render({ children }) {
    //@@viewOn:private
    const [route, setRoute] = useRoute();
    const currentRoute = typeof route === "string" ? route : (route?.uu5Route || "dashboard");

    const { identity } = useSession();
    const [profiles, setProfiles] = useState([]);

    useEffect(() => {
      Calls.getWorkspace()
        .then((res) => setProfiles(res?.authorizedProfileList ?? []))
        .catch(() => {});
    }, []);

    const displayName = identity?.name ?? "—";
    const initials = displayName !== "—"
      ? displayName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
      : "?";
    const role = resolveRole(profiles);

    const sidebarRef = useRef(null);
    useEffect(() => {
      const NAVBAR_HEIGHT = 56;
      const update = () => {
        if (sidebarRef.current) {
          const scrollY = Math.max(0, window.scrollY);
          const padding = Math.max(0, NAVBAR_HEIGHT - scrollY);
          sidebarRef.current.style.paddingTop = padding + "px";
        }
      };
      update();
      window.addEventListener("scroll", update, { passive: true });
      return () => window.removeEventListener("scroll", update);
    }, []);
    //@@viewOff:private

    //@@viewOn:render
    return (
      <div className="app-layout">
        <div className="app-sidebar" ref={sidebarRef}>
          {/* Navigation */}
          <nav className="app-sidebar-nav">
            {NAV_ITEMS.map(({ route: r, icon, label }) => (
              <div
                key={r}
                className={`app-nav-item${currentRoute === r ? " active" : ""}`}
                onClick={() => setRoute(r)}
              >
                <Uu5Elements.Icon icon={icon} className="app-nav-icon" />
                {label}
              </div>
            ))}
          </nav>

          {/* User footer */}
          <div className="app-sidebar-foot">
            <div className="app-sidebar-avatar">{initials}</div>
            <div className="app-sidebar-user">
              <span className="app-sidebar-user-name">{displayName}</span>
              <span className="app-sidebar-user-role">{role}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="app-main">{children}</div>
      </div>
    );
    //@@viewOff:render
  },
});

//@@viewOn:exports
export { AppLayout };
export default AppLayout;
//@@viewOff:exports
