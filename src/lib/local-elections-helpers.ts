import type { LocalElectionRaceSummary } from '@/types';

export interface PartyChip {
  key: string;
  color: string;
  label: string;
}

export interface PartyChipsResult {
  chips: PartyChip[];
  /**
   * Backend가 partyGroups를 안 채워서 topCandidates(top 3)에서 dedupe한 fallback 여부.
   * true면 정당 전체 명단이 아니라 일부 정당만 보이는 것이라 호출자가 "일부 정당" 톤으로 표시해야 한다.
   */
  isFallback: boolean;
  /** fallback 상태에서 더 많은 정당이 있을 수 있다는 hint (chips로 못 잡은 정당이 더 있을 가능성) */
  hasMoreParties: boolean;
}

/**
 * 비례 race의 정당별 chip 목록을 derive.
 *
 * - partyGroups가 있으면 정당별 인원수까지 정확히 표시 (isFallback=false)
 * - 없으면 topCandidates(top 3)를 partyId 기준 dedupe (isFallback=true)
 *   — 전체 정당의 일부만 보이는 상황이라 호출자가 "일부 정당 · 상세에서 명부 확인" 톤 적용
 *
 * TODO: backend getRaces가 비례 race의 partyGroups를 채우면 fallback 로직 제거.
 */
export function derivePartyChips(race: LocalElectionRaceSummary): PartyChipsResult {
  if (race.partyGroups && race.partyGroups.length > 0) {
    return {
      chips: race.partyGroups.map((g) => ({
        key: g.partyId ?? `noparty__${g.partyShortName}`,
        color: g.partyColor,
        label: `${g.partyShortName} ${g.candidateCount}명`,
      })),
      isFallback: false,
      hasMoreParties: false,
    };
  }

  // Fallback: topCandidates를 partyId 기준으로 dedupe — 인원수 모름
  const map = new Map<string, PartyChip>();
  for (const c of race.topCandidates) {
    if (!c.party) continue;
    if (map.has(c.party.id)) continue;
    map.set(c.party.id, {
      key: c.party.id,
      color: c.party.color,
      label: c.party.shortName,
    });
  }
  const chips = Array.from(map.values());

  // topCandidates에서 못 잡은 정당이 더 있을 가능성:
  // - topCandidates는 backend take=3 제한 → 후보가 4명 이상이면 더 있을 수 있음
  // - 또는 같은 정당이 3명을 차지해 정당 다양성이 표시 안 됨
  const hasMoreParties = race.candidateCount > race.topCandidates.length;

  return { chips, isFallback: true, hasMoreParties };
}
