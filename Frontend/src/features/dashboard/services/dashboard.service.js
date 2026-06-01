import { fetchPeakHours, fetchQueueSummary } from "../../analytics/services/analytics.service";
import { getQueueStatusRequest } from "../../queue/services/queue.service";
import { fetchPredictedWaitTime } from "./predict.service";

export async function fetchDashboardBundle(queueId) {
  const [status, summary, peak, predictedWaitTime] = await Promise.all([
    getQueueStatusRequest(queueId),
    fetchQueueSummary(queueId),
    fetchPeakHours(queueId),
    fetchPredictedWaitTime(queueId),
  ]);

  return { status, summary, peak, predictedWaitTime };
}
