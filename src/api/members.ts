import { apiFetch } from '@/api/client';
import type {
  AssetResponse,
  CommitteeActivity,
  CommitteeBillCount,
  Member,
  MemberTerm,
  MemberVotesResponse,
  MemberWithTerm,
  MonthlyAttendance,
  TermActivity,
} from '@/types';

export async function getMembers(termId: number): Promise<MemberWithTerm[]> {
  return apiFetch(`/api/members?termId=${termId}`);
}
Object.defineProperty(getMembers, 'queryKey', { value: 'members' });

export async function getMember(id: string): Promise<Member | null> {
  return apiFetch(`/api/members/${id}`);
}
Object.defineProperty(getMember, 'queryKey', { value: 'member' });

export async function getMemberTerms(memberId: string): Promise<MemberTerm[]> {
  return apiFetch(`/api/members/${memberId}/terms`);
}
Object.defineProperty(getMemberTerms, 'queryKey', { value: 'memberTerms' });

export async function getMemberHistory(memberId: string): Promise<TermActivity[]> {
  return apiFetch(`/api/members/${memberId}/history`);
}
Object.defineProperty(getMemberHistory, 'queryKey', { value: 'memberHistory' });

export async function getMemberVotes(params: {
  memberId: string;
  termId: number;
  page?: number;
  limit?: number;
  result?: string;
  month?: string;
}): Promise<MemberVotesResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('termId', String(params.termId));
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.result) searchParams.set('result', params.result);
  if (params.month) searchParams.set('month', params.month);
  return apiFetch(`/api/members/${params.memberId}/votes?${searchParams.toString()}`);
}
Object.defineProperty(getMemberVotes, 'queryKey', { value: 'memberVotes' });

export async function getMonthlyAttendance(params: {
  memberId: string;
  termId: number;
}): Promise<MonthlyAttendance[]> {
  return apiFetch(
    `/api/members/${params.memberId}/monthly-attendance?termId=${params.termId}`
  );
}
Object.defineProperty(getMonthlyAttendance, 'queryKey', { value: 'monthlyAttendance' });

export async function getCommitteeBills(params: {
  memberId: string;
  termId: number;
}): Promise<CommitteeBillCount[]> {
  return apiFetch(
    `/api/members/${params.memberId}/committee-bills?termId=${params.termId}`
  );
}
Object.defineProperty(getCommitteeBills, 'queryKey', { value: 'committeeBills' });

export async function getCommitteeActivity(params: {
  memberId: string;
  termId: number;
}): Promise<CommitteeActivity[]> {
  return apiFetch(
    `/api/members/${params.memberId}/committee-activity?termId=${params.termId}`
  );
}
Object.defineProperty(getCommitteeActivity, 'queryKey', { value: 'committeeActivity' });

export async function getAssets(memberId: string): Promise<AssetResponse> {
  return apiFetch(`/api/members/${memberId}/assets`);
}
Object.defineProperty(getAssets, 'queryKey', { value: 'assets' });
