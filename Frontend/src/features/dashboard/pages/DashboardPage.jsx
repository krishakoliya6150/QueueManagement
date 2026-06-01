import { useEffect } from "react";
import { useDashboard } from "../dashboard.context";
import { useQueues } from "../../queue/queue.context";
import { useAnalyticsScope } from "../../analytics/analytics.context";
import { QueueSelector } from "../components/QueueSelector";
import { StatCard } from "../components/StatCard";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";

export function DashboardPage() {
  const { selectedQueueId, setSelectedQueueId } = useDashboard();
  const { queues, loading: queuesLoading, listVersion } = useQueues();
  const { revision } = useAnalyticsScope();

  const revisionCombined = listVersion + revision;
  const { cards, loading, error } = useDashboardMetrics(
    selectedQueueId,
    revisionCombined
  );

  useEffect(() => {
    if (!selectedQueueId && queues.length > 0) {
      setSelectedQueueId(queues[0]._id);
    }
  }, [queues, selectedQueueId, setSelectedQueueId]);

  return (
    <>
      <header className="page-header">
        <h2>Overview</h2>
        <p>Wait-time insights and queue health for the queue you select.</p>
      </header>

      <div className="panel">
        <QueueSelector />
      </div>

      {queuesLoading ? (
        <p className="inline-msg inline-msg--muted">Loading queues…</p>
      ) : null}

      {!queuesLoading && queues.length === 0 ? (
        <p className="inline-msg inline-msg--muted">
          No queues yet. Create one under <strong>Queues</strong>.
        </p>
      ) : null}

      {error ? <p className="inline-msg inline-msg--error">{error}</p> : null}

      {loading && selectedQueueId ? (
        <p className="inline-msg inline-msg--muted">Refreshing metrics…</p>
      ) : null}

      {cards ? (
        <div className="stat-grid">
          <StatCard label="Total joins" value={String(cards.totalJoins)} />
          <StatCard label="Total leaves" value={String(cards.totalLeaves)} />
          <StatCard
            label="Avg queue length"
            value={String(cards.avgQueueLength)}
            hint="Historical average from logs"
          />
          <StatCard
            label="Peak hour"
            value={cards.peakHour}
            hint={cards.peakCount ? `${cards.peakCount} events` : "No activity yet"}
          />
          <StatCard
            label="Current wait time"
            value={`${cards.waitMinutes} min`}
            hint={`Service rate ${cards.serviceRate}/min`}
          />
          <StatCard
            label="Smart predicted wait"
            value={`${cards.predictedWaitMinutes} min`}
            hint={`Prediction trend: ${cards.predictionTrend}`}
          />
          <StatCard label="Queue trend" value={cards.trend} hint="Recent vs prior window" />
        </div>
      ) : null}
    </>
  );
}
