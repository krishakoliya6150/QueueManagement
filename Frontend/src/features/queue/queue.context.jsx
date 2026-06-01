import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchQueues } from "./services/queue.service";

const QueueContext = createContext(undefined);

export function QueueProvider({ children }) {
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [listVersion, setListVersion] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const next = await fetchQueues();
      setQueues(next);
      setListVersion((v) => v + 1);
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || "Could not load queues.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      queues,
      loading,
      error,
      listVersion,
      refresh,
    }),
    [queues, loading, error, listVersion, refresh]
  );

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueues() {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error("useQueues must be used within QueueProvider");
  return ctx;
}
