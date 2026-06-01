import { Navigate, Route, Routes } from "react-router-dom";
import { GuestRoute } from "./features/auth/components/GuestRoute";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RegisterPage } from "./features/auth/pages/RegisterPage";
import { AnalyticsPage } from "./features/analytics/pages/AnalyticsPage";
import { AppLayout } from "./features/dashboard/components/AppLayout";
import { DashboardPage } from "./features/dashboard/pages/DashboardPage";
import { QueuePage } from "./features/queue/pages/QueuePage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/queues" element={<QueuePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
