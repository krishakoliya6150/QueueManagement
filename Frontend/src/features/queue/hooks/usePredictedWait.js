import { useMemo } from "react";

export function usePredictedWait(currentLength, serviceRate) {
  return useMemo(() => {
    const rate = Number(serviceRate);
    if (!Number.isFinite(rate) || rate <= 0) return 0;
    const len = Number(currentLength) || 0;
    return Math.round((len / rate) * 100) / 100;
  }, [currentLength, serviceRate]);
}
