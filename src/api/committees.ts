import { apiFetch } from '@/api/client';
import type { CommitteeDetail, CommitteeMinutesResponse, CommitteeStats } from '@/types';

export async function getCommitteeStats(termId: number): Promise<CommitteeStats[]> {
  return apiFetch(`/api/committees?termId=${termId}`);
}
Object.defineProperty(getCommitteeStats, 'queryKey', { value: 'committeeStats' });

export async function getCommitteeDetail(params: {
  name: string;
  termId: number;
}): Promise<CommitteeDetail> {
  return apiFetch(
    `/api/committees/detail?name=${encodeURIComponent(params.name)}&termId=${params.termId}`
  );
}
Object.defineProperty(getCommitteeDetail, 'queryKey', { value: 'committeeDetail' });

export async function getCommitteeMinutes(params: {
  name: string;
  termId: number;
  page: number;
}): Promise<CommitteeMinutesResponse> {
  return apiFetch(
    `/api/committees/minutes?name=${encodeURIComponent(params.name)}&termId=${params.termId}&page=${params.page}`
  );
}
Object.defineProperty(getCommitteeMinutes, 'queryKey', { value: 'committeeMinutes' });
