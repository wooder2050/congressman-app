import { apiFetch } from '@/api/client';
import type { Vote, VoteSummary, VoteWithMemberVotes } from '@/types';

export async function getVotes(params: {
  termId?: number;
  resultCode?: string;
  search?: string;
  month?: string;
  page?: number;
  limit?: number;
}): Promise<{ votes: Vote[]; total: number }> {
  const searchParams = new URLSearchParams();
  if (params.termId) searchParams.set('termId', String(params.termId));
  if (params.resultCode) searchParams.set('resultCode', params.resultCode);
  if (params.month) searchParams.set('month', params.month);
  if (params.search) searchParams.set('search', params.search);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  return apiFetch(`/api/votes?${searchParams.toString()}`);
}
Object.defineProperty(getVotes, 'queryKey', { value: 'votes' });

export async function getVoteSummary(termId: number): Promise<VoteSummary> {
  return apiFetch(`/api/votes/summary?termId=${termId}`);
}
Object.defineProperty(getVoteSummary, 'queryKey', { value: 'voteSummary' });

export async function getVoteMemberVotes(
  voteId: string
): Promise<VoteWithMemberVotes | null> {
  return apiFetch(`/api/votes/${voteId}/member-votes`);
}
Object.defineProperty(getVoteMemberVotes, 'queryKey', { value: 'voteMemberVotes' });
