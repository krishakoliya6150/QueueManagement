import { useDashboard } from "../dashboard.context";
import { useQueues } from "../../queue/queue.context";

export function QueueSelector({ label = "Active queue" }) {
  const { selectedQueueId, setSelectedQueueId } = useDashboard();
  const { queues, loading } = useQueues();

  return (
    <div className="queue-selector">
      <label htmlFor="queue-select">{label}</label>
      <select
        id="queue-select"
        value={selectedQueueId}
        onChange={(e) => setSelectedQueueId(e.target.value)}
        disabled={loading || queues.length === 0}
      >
        <option value="">Select a queue…</option>
        {queues.map((q) => (
          <option key={q._id} value={q._id}>
            {q.name}
          </option>
        ))}
      </select>
    </div>
  );
}
