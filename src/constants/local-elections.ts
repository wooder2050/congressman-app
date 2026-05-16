import type { LocalElectionType } from '@/types';

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

/**
 * 의원 지역구 문자열에서 sido/시군구 추정.
 * my-district 데이터(국회의원 지역구)는 "경기 성남시 분당구갑" 같은 형식.
 * 지방선거 sigungu("성남시분당구")와 prefix 매칭으로 연결.
 */
export function parseMemberDistrict(district: string): { sido?: string; sigungu?: string } {
  const trimmed = district.trim();
  // 첫 토큰이 시도 약칭 또는 풀네임
  const sidoShortMap: Record<string, string> = {
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
  const parts = trimmed.split(/\s+/);
  if (parts.length === 0) return {};
  const sido = sidoShortMap[parts[0]] ?? parts[0];
  // 두번째 토큰 = 시군구의 city level (예: "성남시", "수원시", "종로구")
  const sigungu = parts[1];
  return { sido, sigungu };
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

export function sidoToShort(id: string): string {
  return SIDO_LIST.find((s) => s.id === id)?.short ?? id.slice(0, 2);
}
