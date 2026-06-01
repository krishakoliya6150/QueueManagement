import { http } from "../../auth/services/http";

export async function fetchQueueLogs(queueId) {
  const { data } = await http.get(`/api/analytics/logs/${queueId}`);
  return data.data;
}

export async function fetchQueueSummary(queueId) {
  const { data } = await http.get(`/api/analytics/summary/${queueId}`);
  return data.data;
}

export async function fetchPeakHours(queueId) {
  const { data } = await http.get(`/api/analytics/peak-hours/${queueId}`);
  return data.data;
}
