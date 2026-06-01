import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth.context";

export function GuestRoute() {
  const { token, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="page-loading">
        <span className="page-loading__dot" />
        <p>Loading…</p>
      </div>
    );
  }

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
