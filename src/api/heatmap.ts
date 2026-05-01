import { apiFetch } from '@/api/client';
import type { ActivityHeatmapDay } from '@/types';

export async function getActivityHeatmap(params: {
  memberId: string;
  termId: number;
  startDate: string;
  endDate: string;
}): Promise<ActivityHeatmapDay[]> {
  return apiFetch(
    `/api/members/${params.memberId}/activity-heatmap?termId=${params.termId}&startDate=${params.startDate}&endDate=${params.endDate}`
  );
}
Object.defineProperty(getActivityHeatmap, 'queryKey', { value: 'activityHeatmap' });
