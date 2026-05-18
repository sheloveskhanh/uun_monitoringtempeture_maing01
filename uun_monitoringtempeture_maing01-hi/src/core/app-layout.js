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

    const { identity, logout } = useSession();
    const [profiles, setProfiles] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const avatarRef = useRef(null);

    useEffect(() => {
      if (!userMenuOpen) return;
      const handler = (e) => {
        if (avatarRef.current && !avatarRef.current.contains(e.target)) {
          setUserMenuOpen(false);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [userMenuOpen]);

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
        {/* Mobile top bar */}
        <div className="app-topbar">
          <button className="app-topbar-burger" onClick={() => setSidebarOpen(true)}>
            <Uu5Elements.Icon icon="mdi-menu" />
          </button>
          <div className="app-topbar-brand">
            <span className="app-topbar-title">uuMonitor</span>
          </div>
          <div className="app-topbar-avatar-wrap" ref={avatarRef}>
            <button className="app-topbar-avatar" onClick={() => setUserMenuOpen((v) => !v)}>
              {initials}
            </button>
            {userMenuOpen && (
              <div className="app-topbar-user-menu">
                <div className="app-topbar-user-menu-name">{displayName}</div>
                <div className="app-topbar-user-menu-role">{role}</div>
                <hr className="app-topbar-user-menu-divider" />
                <button
                  className="app-topbar-user-menu-logout"
                  onClick={() => { logout(); setUserMenuOpen(false); }}
                >
                  <Uu5Elements.Icon icon="mdi-logout" style={{ fontSize: 15 }} />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar backdrop (mobile only) */}
        <div
          className={`app-sidebar-backdrop${sidebarOpen ? " is-open" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />

        <div className={`app-sidebar${sidebarOpen ? " is-open" : ""}`} ref={sidebarRef}>
          {/* Navigation */}
          <nav className="app-sidebar-nav">
            <button className="app-sidebar-close" onClick={() => setSidebarOpen(false)}>
              <Uu5Elements.Icon icon="mdi-close" />
            </button>
            {NAV_ITEMS.map(({ route: r, icon, label }) => (
              <div
                key={r}
                className={`app-nav-item${currentRoute === r ? " active" : ""}`}
                onClick={() => { setRoute(r); setSidebarOpen(false); }}
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
