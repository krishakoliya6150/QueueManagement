import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth.context";

export function ProtectedRoute() {
  const { token, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="page-loading">
        <span className="page-loading__dot" />
        <p>Signing you in…</p>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
