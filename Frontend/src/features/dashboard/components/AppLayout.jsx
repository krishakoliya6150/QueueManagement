import { Outlet } from "react-router-dom";
import { AnalyticsProvider } from "../../analytics/analytics.context";
import { QueueProvider } from "../../queue/queue.context";
import { DashboardProvider } from "../dashboard.context";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export function AppLayout() {
  return (
    <DashboardProvider>
      <QueueProvider>
        <AnalyticsProvider>
          <div className="app-shell">
            <Sidebar />
            <div className="app-shell__main">
              <TopNav />
              <div className="app-shell__content">
                <Outlet />
              </div>
            </div>
          </div>
        </AnalyticsProvider>
      </QueueProvider>
    </DashboardProvider>
  );
}
