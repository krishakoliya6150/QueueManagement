import { http } from "../../auth/services/http";

export async function fetchQueues() {
  const { data } = await http.get("/api/queue/list");
  return data.data;
}

export async function createQueueRequest(payload) {
  const { data } = await http.post("/api/queue/create", payload);
  return data.data;
}

export async function getQueueStatusRequest(queueId) {
  const { data } = await http.get(`/api/queue/${queueId}`);
  return data.data;
}

export async function joinQueueRequest(queueId) {
  const { data } = await http.post(`/api/queue/join/${queueId}`);
  return data.data;
}

export async function leaveQueueRequest(queueId) {
  const { data } = await http.post(`/api/queue/leave/${queueId}`);
  return data.data;
}
