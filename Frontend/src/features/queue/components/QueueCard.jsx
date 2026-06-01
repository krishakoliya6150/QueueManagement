import { useState } from "react";
import { joinQueueRequest, leaveQueueRequest } from "../services/queue.service";
import { usePredictedWait } from "../hooks/usePredictedWait";

export function QueueCard({
  queue,
  onMutate,
  onSelectAsActive,
  activeId,
}) {
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const predictedWait = usePredictedWait(queue.currentLength, queue.serviceRate);

  async function handleJoin() {
    setBusy(true);
    setFeedback(null);
    try {
      const data = await joinQueueRequest(queue._id);
      setFeedback({ type: "ok", text: `Joined. Estimated wait ${data.estimatedWaitTime}` });
      onMutate?.();
    } catch (err) {
      setFeedback({
        type: "err",
        text: err.response?.data?.message || err.message || "Join failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleLeave() {
    setBusy(true);
    setFeedback(null);
    try {
      const data = await leaveQueueRequest(queue._id);
      setFeedback({ type: "ok", text: `Left queue. Wait now ~ ${data.estimatedWaitTime}` });
      onMutate?.();
    } catch (err) {
      setFeedback({
        type: "err",
        text: err.response?.data?.message || err.message || "Leave failed.",
      });
    } finally {
      setBusy(false);
    }
  }

  const isActive = activeId === queue._id;

  return (
    <article className="queue-card">
      <h3>{queue.name}</h3>
      <p className="queue-card__meta">
        Length: <strong>{queue.currentLength}</strong> · Service rate:{" "}
        <strong>{queue.serviceRate}</strong>/min · Predicted wait:{" "}
        <strong>{predictedWait}</strong> min
      </p>
      {feedback ? (
        <p
          className={`inline-msg ${feedback.type === "err" ? "inline-msg--error" : "inline-msg--success"}`}
        >
          {feedback.text}
        </p>
      ) : null}
      <div className="queue-card__actions">
        <button type="button" className="btn btn--primary" onClick={handleJoin} disabled={busy}>
          Join
        </button>
        <button type="button" className="btn btn--ghost" onClick={handleLeave} disabled={busy}>
          Leave
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => onSelectAsActive?.(queue._id)}
        >
          {isActive ? "Active on dashboard" : "Use on dashboard"}
        </button>
      </div>
    </article>
  );
}
