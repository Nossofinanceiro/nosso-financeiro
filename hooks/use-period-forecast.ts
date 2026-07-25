"use client";

import { useQuery } from "@tanstack/react-query";
import { PeriodForecastService } from "@/lib/services/period-forecast.service";
import { PeriodForecastRequest } from "@/lib/schemas";

const periodForecastService = new PeriodForecastService();

export function usePeriodForecast(request: PeriodForecastRequest) {
  return useQuery({
    queryKey: ["period-forecast", request],
    queryFn: () => periodForecastService.getForecast(request),
  });
}
