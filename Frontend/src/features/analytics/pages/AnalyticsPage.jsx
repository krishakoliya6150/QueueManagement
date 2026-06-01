import { useEffect } from "react";
import { useDashboard } from "../../dashboard/dashboard.context";
import { useQueues } from "../../queue/queue.context";
import { QueueSelector } from "../../dashboard/components/QueueSelector";
import { ActivityLineChart } from "../components/ActivityLineChart";
import { HourlyBarChart } from "../components/HourlyBarChart";
import { JoinLeaveBarChart } from "../components/JoinLeaveBarChart";
import { useAnalyticsScope } from "../analytics.context";
import { useAnalyticsCharts } from "../hooks/useAnalyticsCharts";

function formatPeakHour(hour) {
  if (hour === null || hour === undefined) return "—";
  const h = Number(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:00 ${ampm}`;
}

export function AnalyticsPage() {
  const { selectedQueueId, setSelectedQueueId } = useDashboard();
  const { queues, loading: queuesLoading, listVersion } = useQueues();
  const { revision } = useAnalyticsScope();

  const { activitySeries, joinLeaveSeries, hourlySeries, loading, error, peak } =
    useAnalyticsCharts(selectedQueueId, listVersion + revision);

  useEffect(() => {
    if (!selectedQueueId && queues.length > 0) {
      setSelectedQueueId(queues[0]._id);
    }
  }, [queues, selectedQueueId, setSelectedQueueId]);

  return (
    <>
      <header className="page-header">
        <h2>Analytics</h2>
        <p>Visualize traffic patterns and queue depth from historical logs.</p>
      </header>

      <div className="panel">
        <QueueSelector label="Queue for charts" />
      </div>

      {queuesLoading ? (
        <p className="inline-msg inline-msg--muted">Loading queues…</p>
      ) : null}

      {!selectedQueueId ? (
        <p className="inline-msg inline-msg--muted">Pick a queue to view charts.</p>
      ) : null}

      {error ? <p className="inline-msg inline-msg--error">{error}</p> : null}
      {loading && selectedQueueId ? (
        <p className="inline-msg inline-msg--muted">Loading chart data…</p>
      ) : null}

      {selectedQueueId && peak && !loading ? (
        <div className="panel">
          <p className="inline-msg inline-msg--muted" style={{ margin: 0 }}>
            Peak hour snapshot: <strong>{formatPeakHour(peak.peakHour)}</strong>
            {peak.activityCount ? ` · ${peak.activityCount} logged events` : ""}
          </p>
        </div>
      ) : null}

      {selectedQueueId ? (
        <>
          <ActivityLineChart data={activitySeries} />
          <JoinLeaveBarChart data={joinLeaveSeries} />
          <HourlyBarChart data={hourlySeries} />
        </>
      ) : null}
    </>
  );
}
