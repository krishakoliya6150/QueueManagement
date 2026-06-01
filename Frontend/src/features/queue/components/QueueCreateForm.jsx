import { useState } from "react";
import { createQueueRequest } from "../services/queue.service";

export function QueueCreateForm({ onCreated }) {
  const [name, setName] = useState("");
  const [serviceRate, setServiceRate] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const trimmed = name.trim();
    const rate = Number(serviceRate);

    if (!trimmed) {
      setError("Queue name is required.");
      return;
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      setError("Service rate must be a positive number (people per minute).");
      return;
    }

    setPending(true);
    try {
      const queue = await createQueueRequest({ name: trimmed, serviceRate: rate });
      setName("");
      setServiceRate("");
      onCreated?.(queue);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not create queue.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="panel">
      <h3 className="panel__title">Create queue</h3>
      <form className="form-row" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning lobby"
          />
        </label>
        <label>
          Service rate (/min)
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={serviceRate}
            onChange={(e) => setServiceRate(e.target.value)}
            placeholder="2"
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={pending}>
          {pending ? "Creating…" : "Create"}
        </button>
      </form>
      {error ? <p className="inline-msg inline-msg--error">{error}</p> : null}
    </div>
  );
}
