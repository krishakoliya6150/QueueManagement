import { http } from "../../auth/services/http";

export async function fetchPredictedWaitTime(queueId) {
  const { data } = await http.get(`/api/predict/${queueId}`);
  return data.data?.predictedWaitTime ?? 0;
}

