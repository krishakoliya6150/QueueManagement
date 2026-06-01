import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../auth/auth.context";

const titles = {
  "/dashboard": "Dashboard",
  "/queues": "Queue management",
  "/analytics": "Analytics",
};

export function TopNav() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const title = useMemo(() => titles[pathname] || "QueueSense", [pathname]);

  return (
    <header className="top-nav">
      <h1 className="top-nav__title">{title}</h1>
      <div className="top-nav__actions">
        {user ? (
          <span className="top-nav__user">
            {user.name}
            {user.email ? ` · ${user.email}` : ""}
          </span>
        ) : null}
        <button type="button" className="btn btn--ghost" onClick={() => logout()}>
          Sign out
        </button>
      </div>
    </header>
  );
}
