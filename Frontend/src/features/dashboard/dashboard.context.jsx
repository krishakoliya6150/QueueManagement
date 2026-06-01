import { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "queuesense_selected_queue";

const DashboardContext = createContext(undefined);

export function DashboardProvider({ children }) {
  const [selectedQueueId, setSelectedQueueIdState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || ""
  );

  const setSelectedQueueId = useCallback((id) => {
    const next = id || "";
    setSelectedQueueIdState(next);
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({
      selectedQueueId,
      setSelectedQueueId,
    }),
    [selectedQueueId, setSelectedQueueId]
  );

  return (
    <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}
