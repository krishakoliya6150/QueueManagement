import { useDashboard } from "../../dashboard/dashboard.context";
import { useAnalyticsScope } from "../../analytics/analytics.context";
import { useQueues } from "../queue.context";
import { QueueCreateForm } from "../components/QueueCreateForm";
import { QueueCard } from "../components/QueueCard";

export function QueuePage() {
  const { refresh, queues, loading, error } = useQueues();
  const { bumpRevision } = useAnalyticsScope();
  const { selectedQueueId, setSelectedQueueId } = useDashboard();

  function handleMutate() {
    refresh();
    bumpRevision();
  }

  function handleCreated(queue) {
    handleMutate();
    if (queue?._id) setSelectedQueueId(queue._id);
  }

  return (
    <>
      <header className="page-header">
        <h2>Queues</h2>
        <p>Create queues, join or leave, and sync predictions with analytics.</p>
      </header>

      <QueueCreateForm onCreated={handleCreated} />

      {loading ? <p className="inline-msg inline-msg--muted">Loading queues…</p> : null}
      {error ? <p className="inline-msg inline-msg--error">{error}</p> : null}

      {!loading && queues.length === 0 ? (
        <p className="inline-msg inline-msg--muted">No queues yet. Create one above.</p>
      ) : null}

      <div className="queue-grid">
        {queues.map((q) => (
          <QueueCard
            key={q._id}
            queue={q}
            activeId={selectedQueueId}
            onMutate={handleMutate}
            onSelectAsActive={setSelectedQueueId}
          />
        ))}
      </div>
    </>
  );
}
