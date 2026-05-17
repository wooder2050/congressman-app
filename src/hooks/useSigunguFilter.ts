import { useEffect, useMemo, useState } from 'react';

import { findMatchingSigungu, parseMemberDistrict } from '@/constants/local-elections';
import { useUserPreferences } from '@/hooks/useBookmarks';

/** 시군구 필터 상태 — 'mine'은 my-district 매칭, undefined는 전체 */
export type SigunguFilterValue = string | 'mine' | undefined;

interface UseSigunguFilterArgs {
  /** 현재 시도 (사용자가 보고 있는 페이지의 sido) */
  sido: string;
  /** 화면에 노출 가능한 시군구 목록 (race 데이터에서 추출) */
  sigunguList: readonly string[];
  /** 데이터 로딩 끝났는지 — 자동 선택은 데이터가 도착한 후에 한 번만 적용 */
  isReady: boolean;
}

/**
 * 시군구 chip 필터의 공통 hook.
 *
 * - my-district + sigunguList가 모두 도착한 후 1회만 'mine' 자동 선택
 *   (codex 리뷰: useState 초기값으로만 처리하면 비동기 데이터 누락 시 동작 안 함)
 * - 사용자가 명시적으로 chip 탭한 후에는 자동 선택 안 함
 * - 'mine'은 my-district candidates의 longest-prefix 매칭 결과
 */
export function useSigunguFilter({ sido, sigunguList, isReady }: UseSigunguFilterArgs) {
  const { data: prefs } = useUserPreferences();

  const parsed = useMemo(() => {
    if (!prefs?.district) return undefined;
    const result = parseMemberDistrict(prefs.district);
    if (result.sido !== sido) return undefined;
    return result;
  }, [prefs?.district, sido]);

  const myDistrictLabel = parsed?.sigunguCandidates[0];

  const { primary: myPrimaryCandidate, allMatched: myMatchingSigungu } = useMemo(() => {
    if (!parsed || sigunguList.length === 0)
      return { primary: undefined, allMatched: [] as string[] };
    return findMatchingSigungu(sigunguList, parsed.sigunguCandidates);
  }, [parsed, sigunguList]);

  const [filter, setFilter] = useState<SigunguFilterValue>(undefined);
  const [touched, setTouched] = useState(false);

  // 데이터 도착 후 한 번만 자동 선택
  useEffect(() => {
    if (touched) return;
    if (!isReady) return;
    if (filter !== undefined) return;
    if (myMatchingSigungu.length === 0) return;
    setFilter('mine');
  }, [touched, isReady, filter, myMatchingSigungu.length]);

  // 유효성 보정: 현재 filter 값이 더 이상 유효하지 않으면 'undefined'로 되돌림.
  // - 'mine': myMatchingSigungu가 비었을 때 (prefs 변경, sido 간 route 재사용)
  // - 특정 sigungu: sigunguList에 없을 때 (route 재사용으로 다른 sido 데이터, type 화면 전환)
  // touched와 무관하게 항상 적용 — 사용자 선택이라도 무효해진 상태는 정리해야 안전.
  // 특히 type 화면은 stale 값을 backend `sigungu` 쿼리로 보낼 위험이 있어 방어 필요.
  useEffect(() => {
    if (!isReady) return;
    if (filter === undefined) return;
    if (filter === 'mine') {
      if (myMatchingSigungu.length > 0) return;
    } else {
      if (sigunguList.includes(filter)) return;
    }
    setFilter(undefined);
  }, [isReady, filter, myMatchingSigungu.length, sigunguList]);

  const setFilterByUser = (next: SigunguFilterValue) => {
    setTouched(true);
    setFilter(next);
  };

  // 'mine' 상태에서 매칭되는 sigungu 집합 — 카드 필터링에 사용
  const matchedSigunguSet = useMemo(() => {
    if (filter === 'mine') return new Set(myMatchingSigungu);
    if (filter && filter !== 'mine') return new Set([filter]);
    return null;
  }, [filter, myMatchingSigungu]);

  return {
    filter,
    setFilter: setFilterByUser,
    /** 매칭된 sigungu 집합. null이면 전체. */
    matchedSigunguSet,
    /** my-district 매칭 후보가 있는지 */
    hasMine: myMatchingSigungu.length > 0,
    /** "내 시군구 (성남시)" chip 라벨용 */
    myDistrictLabel: myPrimaryCandidate ?? myDistrictLabel,
  };
}
