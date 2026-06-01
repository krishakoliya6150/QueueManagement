import { useEffect, useRef, useState } from "react";
import { fetchDashboardBundle } from "../services/dashboard.service";

function formatPeakHour(hour) {
  if (hour === null || hour === undefined) return "—";
  const h = Number(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

function formatTrend(trend) {
  if (!trend) return "—";
  const s = String(trend);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function useDashboardMetrics(queueId, revision = 0) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevPredRef = useRef(null);

  useEffect(() => {
    if (!queueId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const bundle = await fetchDashboardBundle(queueId);
        if (!cancelled) setData(bundle);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err.response?.data?.message || err.message || "Could not load metrics.";
          setError(msg);
          setData(null);
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

  const predictedWait =
    data && typeof data.predictedWaitTime === "number"
      ? data.predictedWaitTime
      : data?.predictedWaitTime != null
        ? Number(data.predictedWaitTime)
        : null;

  let predictionTrend = "—";
  if (typeof predictedWait === "number" && Number.isFinite(predictedWait)) {
    const prev = prevPredRef.current;
    if (typeof prev === "number" && Number.isFinite(prev)) {
      if (predictedWait > prev + 0.05) predictionTrend = "Increasing";
      else if (predictedWait < prev - 0.05) predictionTrend = "Decreasing";
      else predictionTrend = "Stable";
    } else {
      predictionTrend = "Stable";
    }
  }

  useEffect(() => {
    if (typeof predictedWait === "number" && Number.isFinite(predictedWait)) {
      prevPredRef.current = predictedWait;
    }
  }, [predictedWait]);

  const cards = data
    ? {
        totalJoins: data.summary.totalJoins ?? 0,
        totalLeaves: data.summary.totalLeaves ?? 0,
        avgQueueLength: data.summary.avgQueueLength ?? 0,
        peakHour: formatPeakHour(data.peak.peakHour),
        peakCount: data.peak.activityCount ?? 0,
        waitMinutes: data.status.waitTime ?? 0,
        predictedWaitMinutes:
          typeof predictedWait === "number" && Number.isFinite(predictedWait)
            ? predictedWait
            : 0,
        predictionTrend,
        trend: formatTrend(data.summary.trend),
        serviceRate: data.status.serviceRate,
      }
    : null;

  return { cards, loading, error, raw: data };
}
