import type { LocalElectionType } from '@/types';

export const TYPE_LABELS: Record<LocalElectionType, string> = {
  governor: '광역단체장',
  mayor: '기초단체장',
  superintendent: '교육감',
  'metro-council': '광역의원',
  'metro-proportional': '광역의원 비례',
  'local-council': '기초의원',
  'local-proportional': '기초의원 비례',
};

/**
 * 6·3 지방선거 투표용지 7장 순서.
 * 한국 유권자가 투표소에서 받는 종이 순서와 동일.
 * kind: 'person' 인물투표, 'party' 정당투표(비례), 'non-partisan' 정당·기호 없음(교육감)
 */
export const BALLOT_ORDER: {
  number: number;
  type: LocalElectionType;
  label: string;
  kind: 'person' | 'party' | 'non-partisan';
}[] = [
  { number: 1, type: 'governor', label: '광역단체장', kind: 'person' },
  { number: 2, type: 'superintendent', label: '교육감', kind: 'non-partisan' },
  { number: 3, type: 'metro-council', label: '광역의원', kind: 'person' },
  { number: 4, type: 'metro-proportional', label: '광역의원 비례', kind: 'party' },
  { number: 5, type: 'mayor', label: '기초단체장', kind: 'person' },
  { number: 6, type: 'local-council', label: '기초의원', kind: 'person' },
  { number: 7, type: 'local-proportional', label: '기초의원 비례', kind: 'party' },
];

export function ballotInfoFor(type: LocalElectionType) {
  return BALLOT_ORDER.find((b) => b.type === type);
}

/** 시군구 단위로 좁혀지는 선거 — 시군구 필터의 영향을 받음 */
export const SIGUNGU_SCOPED_TYPES = new Set<LocalElectionType>([
  'mayor',
  'metro-council',
  'local-council',
  'local-proportional',
]);

/** 시도 전체 공통 선거 — 시군구 필터와 무관하게 항상 노출 */
export const SIDO_WIDE_TYPES = new Set<LocalElectionType>([
  'governor',
  'superintendent',
  'metro-proportional',
]);

const SIDO_SHORT_MAP: Record<string, string> = {
  서울: '서울특별시',
  부산: '부산광역시',
  대구: '대구광역시',
  인천: '인천광역시',
  광주: '광주광역시',
  대전: '대전광역시',
  울산: '울산광역시',
  세종: '세종특별자치시',
  경기: '경기도',
  강원: '강원특별자치도',
  충북: '충청북도',
  충남: '충청남도',
  전북: '전북특별자치도',
  전남: '전라남도',
  경북: '경상북도',
  경남: '경상남도',
  제주: '제주특별자치도',
};

/**
 * 의원 지역구 문자열에서 sido + 시군구 토큰 후보군 추출.
 *
 * 국회의원 지역구 표기는 다양함:
 *  - 단일 토큰: "성남시", "수원시" → 지방선거 sigungu("성남시분당구")의 prefix
 *  - 갑/을/병/정 suffix: "강남구갑", "분당구갑" → suffix 제거 후 매칭
 *  - 복합: "경기 성남시 분당구갑" → "성남시"·"성남시분당구" 두 후보를 다 검사해야
 *
 * 반환: longest-prefix 매칭에 쓸 수 있는 candidate 배열(긴 토큰부터).
 */
export function parseMemberDistrict(district: string): {
  sido?: string;
  sigunguCandidates: string[];
} {
  const trimmed = district.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { sigunguCandidates: [] };

  const sido = SIDO_SHORT_MAP[parts[0]] ?? parts[0];
  const rest = parts.slice(1);

  // 갑/을/병/정 suffix 제거 (한 토큰 내에서만 — "분당구갑" → "분당구")
  const stripJamo = (s: string) => s.replace(/[갑을병정]$/, '');

  const candidates: string[] = [];
  // 모든 부분 결합 시도 — longest first
  for (let len = rest.length; len >= 1; len--) {
    for (let start = 0; start + len <= rest.length; start++) {
      const slice = rest.slice(start, start + len);
      // suffix 제거 버전과 원본 둘 다 후보로 등록
      const joinedRaw = slice.join('');
      const joinedStripped = slice.map(stripJamo).join('');
      if (joinedRaw && !candidates.includes(joinedRaw)) candidates.push(joinedRaw);
      if (joinedStripped && !candidates.includes(joinedStripped))
        candidates.push(joinedStripped);
    }
  }
  // longest first 정렬
  candidates.sort((a, b) => b.length - a.length);
  return { sido, sigunguCandidates: candidates };
}

/**
 * sigungu 목록(자치구 단위 포함)에서 my-district candidates와 prefix 매칭되는 항목 추출.
 * longest candidate 우선으로 매칭해 "분당구"보다 "성남시분당구"를 먼저 잡는다.
 */
export function findMatchingSigungu(
  sigunguList: readonly string[],
  candidates: readonly string[],
): { primary: string | undefined; allMatched: string[] } {
  const matched = new Set<string>();
  let primary: string | undefined;
  for (const cand of candidates) {
    const hits = sigunguList.filter((s) => s.startsWith(cand) || s.endsWith(cand));
    if (hits.length > 0 && primary === undefined) primary = cand;
    for (const h of hits) matched.add(h);
  }
  return { primary, allMatched: Array.from(matched) };
}

export const SIDO_LIST = [
  { id: '서울특별시', short: '서울' },
  { id: '부산광역시', short: '부산' },
  { id: '대구광역시', short: '대구' },
  { id: '인천광역시', short: '인천' },
  { id: '광주광역시', short: '광주' },
  { id: '대전광역시', short: '대전' },
  { id: '울산광역시', short: '울산' },
  { id: '세종특별자치시', short: '세종' },
  { id: '경기도', short: '경기' },
  { id: '강원특별자치도', short: '강원' },
  { id: '충청북도', short: '충북' },
  { id: '충청남도', short: '충남' },
  { id: '전북특별자치도', short: '전북' },
  { id: '전라남도', short: '전남' },
  { id: '경상북도', short: '경북' },
  { id: '경상남도', short: '경남' },
  { id: '제주특별자치도', short: '제주' },
] as const;

/**
 * 시도 id → 2자 약칭 변환.
 *
 * Backend `region.sidoShort`가 "경상남"(3자)처럼 잘못 내려오는 임시 우회.
 * TODO: backend가 정정한 후 본 함수 호출 위치에서 `region.sidoShort`로 되돌릴 것.
 * 추적: web에서도 동일 이슈 — backend PR 별도.
 */
export function sidoToShort(id: string): string {
  return SIDO_LIST.find((s) => s.id === id)?.short ?? id.slice(0, 2);
}
