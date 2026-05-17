import { apiFetch } from '@/api/client';
import type {
  LocalElectionOverview,
  LocalElectionRaceDetail,
  LocalElectionRaceSummary,
  LocalElectionRegionDetail,
  LocalElectionRegionSummary,
  LocalElectionStats,
  LocalElectionSummary,
  LocalElectionType,
} from '@/types';

export async function getLocalElections(): Promise<LocalElectionSummary[]> {
  return apiFetch('/api/local-elections');
}
Object.defineProperty(getLocalElections, 'queryKey', { value: 'localElections' });

export async function getLocalElection(id: string): Promise<LocalElectionOverview | null> {
  return apiFetch(`/api/local-elections/${id}`);
}
Object.defineProperty(getLocalElection, 'queryKey', { value: 'localElection' });

export async function getLocalElectionRaces(params: {
  id: string;
  type?: LocalElectionType;
  sido?: string;
  sigungu?: string;
  q?: string;
  page?: number;
  limit?: number;
}): Promise<{ races: LocalElectionRaceSummary[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.type) searchParams.set('type', params.type);
  if (params.sido) searchParams.set('sido', params.sido);
  if (params.sigungu) searchParams.set('sigungu', params.sigungu);
  if (params.q) searchParams.set('q', params.q);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  const qs = searchParams.toString();
  return apiFetch(`/api/local-elections/${params.id}/races${qs ? `?${qs}` : ''}`);
}
Object.defineProperty(getLocalElectionRaces, 'queryKey', { value: 'localElectionRaces' });

/**
 * Backend가 `limit`을 max 100으로 clamp하므로,
 * 단일 시도+종류 전체 race를 받으려면 페이지를 합쳐야 함.
 * 종류 페이지(`/regions/[sido]/[type]`)에서 사용.
 */
export async function getLocalElectionRacesAll(params: {
  id: string;
  type?: LocalElectionType;
  sido?: string;
  sigungu?: string;
  q?: string;
}): Promise<{ races: LocalElectionRaceSummary[]; total: number }> {
  const PAGE_SIZE = 100;
  const first = await getLocalElectionRaces({ ...params, page: 1, limit: PAGE_SIZE });
  if (first.races.length >= first.total) return first;

  const totalPages = Math.ceil(first.total / PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, i) =>
      getLocalElectionRaces({ ...params, page: i + 2, limit: PAGE_SIZE }),
    ),
  );
  return {
    races: [first, ...rest].flatMap((r) => r.races),
    total: first.total,
  };
}
Object.defineProperty(getLocalElectionRacesAll, 'queryKey', { value: 'localElectionRacesAll' });

export async function getLocalElectionRace(params: {
  id: string;
  raceId: number;
}): Promise<LocalElectionRaceDetail | null> {
  return apiFetch(`/api/local-elections/${params.id}/races/${params.raceId}`);
}
Object.defineProperty(getLocalElectionRace, 'queryKey', { value: 'localElectionRace' });

export async function getLocalElectionRegions(
  id: string,
): Promise<LocalElectionRegionSummary[]> {
  return apiFetch(`/api/local-elections/${id}/regions`);
}
Object.defineProperty(getLocalElectionRegions, 'queryKey', { value: 'localElectionRegions' });

export async function getLocalElectionRegion(params: {
  id: string;
  sido: string;
}): Promise<LocalElectionRegionDetail> {
  return apiFetch(
    `/api/local-elections/${params.id}/regions/${encodeURIComponent(params.sido)}`,
  );
}
Object.defineProperty(getLocalElectionRegion, 'queryKey', { value: 'localElectionRegion' });

export async function getLocalElectionStats(id: string): Promise<LocalElectionStats> {
  return apiFetch(`/api/local-elections/${id}/stats`);
}
Object.defineProperty(getLocalElectionStats, 'queryKey', { value: 'localElectionStats' });
