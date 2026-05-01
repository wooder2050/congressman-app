import { apiFetch } from '@/api/client';
import type { MemberScorecard, ScorecardRankingResponse } from '@/types';

export async function getMemberScorecard(params: {
  memberId: string;
  termId: number;
}): Promise<MemberScorecard | null> {
  return apiFetch(
    `/api/members/${params.memberId}/scorecard?termId=${params.termId}`
  );
}
Object.defineProperty(getMemberScorecard, 'queryKey', { value: 'memberScorecard' });

export async function getScorecardRanking(
  termId: number
): Promise<ScorecardRankingResponse> {
  return apiFetch(`/api/stats/scorecard-ranking?termId=${termId}`);
}
Object.defineProperty(getScorecardRanking, 'queryKey', { value: 'scorecardRanking' });
