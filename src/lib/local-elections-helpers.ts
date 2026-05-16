import type { LocalElectionRaceSummary } from '@/types';

export interface PartyChip {
  key: string;
  color: string;
  label: string;
}

/**
 * 비례 race의 정당별 chip 목록을 derive.
 *
 * - partyGroups가 있으면 정당별 인원수까지 정확히 표시
 * - 없으면 topCandidates(top 3)를 partyId 기준 dedupe (fallback)
 *   — 정확한 인원수는 backend 한계상 알 수 없어 정당명만 표시
 *
 * TODO: backend getRaces가 비례 race의 partyGroups를 채우면 fallback 제거.
 */
export function derivePartyChips(race: LocalElectionRaceSummary): PartyChip[] {
  if (race.partyGroups && race.partyGroups.length > 0) {
    return race.partyGroups.map((g) => ({
      key: g.partyId ?? `noparty__${g.partyShortName}`,
      color: g.partyColor,
      label: `${g.partyShortName} ${g.candidateCount}명`,
    }));
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
  return Array.from(map.values());
}
