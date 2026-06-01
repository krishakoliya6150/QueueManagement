import { useEffect, useMemo, useState } from "react";
import {
  fetchPeakHours,
  fetchQueueLogs,
  fetchQueueSummary,
} from "../services/analytics.service";

export function useAnalyticsCharts(queueId, revision = 0) {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [peak, setPeak] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!queueId) {
      setLogs([]);
      setSummary(null);
      setPeak(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [nextLogs, nextSummary, nextPeak] = await Promise.all([
          fetchQueueLogs(queueId),
          fetchQueueSummary(queueId),
          fetchPeakHours(queueId),
        ]);
        if (!cancelled) {
          setLogs(nextLogs);
          setSummary(nextSummary);
          setPeak(nextPeak);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err.response?.data?.message || err.message || "Could not load analytics.";
          setError(msg);
          setLogs([]);
          setSummary(null);
          setPeak(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queueId, revision]);

  const activitySeries = useMemo(() => {
    return [...logs]
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .map((log, idx) => ({
        seq: idx + 1,
        label: new Date(log.timestamp).toLocaleString([], {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        length: log.queueLength,
      }));
  }, [logs]);

  const joinLeaveSeries = useMemo(() => {
    if (!summary) return [];
    return [
      { name: "Joins", total: summary.totalJoins ?? 0 },
      { name: "Leaves", total: summary.totalLeaves ?? 0 },
    ];
  }, [summary]);

  const hourlySeries = useMemo(() => {
    const buckets = Array.from({ length: 24 }, (_, hour) => ({
      hourLabel: `${hour}:00`,
      hour,
      events: 0,
    }));
    logs.forEach((log) => {
      const h = new Date(log.timestamp).getHours();
      buckets[h].events += 1;
    });
    return buckets;
  }, [logs]);

  return {
    loading,
    error,
    activitySeries,
    joinLeaveSeries,
    hourlySeries,
    peak,
    summary,
  };
}
