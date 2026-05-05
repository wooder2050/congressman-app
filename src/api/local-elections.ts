import { apiFetch } from '@/api/client';
import type {
  LocalElectionSummary,
  LocalElectionOverview,
  LocalElectionRaceSummary,
  LocalElectionRaceDetail,
  LocalElectionRegionSummary,
  LocalElectionRegionDetail,
  LocalElectionStats,
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
