import { apiFetch } from '@/api/client';
import type { ByElectionSummary, ByElectionDetail } from '@/types';

export async function getElections(): Promise<ByElectionSummary[]> {
  return apiFetch('/api/elections');
}
Object.defineProperty(getElections, 'queryKey', { value: 'elections' });

export async function getElection(
  id: string
): Promise<ByElectionDetail | null> {
  return apiFetch(`/api/elections/${id}`);
}
Object.defineProperty(getElection, 'queryKey', { value: 'election' });
