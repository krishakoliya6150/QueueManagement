import { createContext, useContext, useMemo, useState, useCallback } from "react";

const AnalyticsContext = createContext(undefined);

/**
 * Lightweight analytics scope: bump revision when queue logs change
 * so charts refetch after join/leave from elsewhere in the app.
 */
export function AnalyticsProvider({ children }) {
  const [revision, setRevision] = useState(0);

  const bumpRevision = useCallback(() => {
    setRevision((r) => r + 1);
  }, []);

  const value = useMemo(() => ({ revision, bumpRevision }), [revision, bumpRevision]);

  return (
    <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalyticsScope() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalyticsScope requires AnalyticsProvider");
  return ctx;
}
