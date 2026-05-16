/**
 * parseMemberDistrict / findMatchingSigungu 검증 스크립트.
 *
 * 실행: `npm run verify:parse-district` 또는 `npx tsx scripts/verify-parse-member-district.ts`
 *
 * jest 인프라가 들어오기 전까지 가벼운 assertion 형태로 동작 검증.
 * codex 리뷰(PR #25 2차)에서 "unit test를 붙이라"고 권고된 함수.
 */

import {
  findMatchingSigungu,
  parseMemberDistrict,
} from '../src/constants/local-elections';

let failed = 0;
let passed = 0;

function expect<T>(actual: T, expected: T, label: string) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✔ ${label}`);
  } else {
    failed++;
    console.log(`  ✖ ${label}`);
    console.log(`      expected: ${JSON.stringify(expected)}`);
    console.log(`      actual:   ${JSON.stringify(actual)}`);
  }
}

console.log('\n=== parseMemberDistrict ===\n');

// 기본 케이스
{
  const r = parseMemberDistrict('경기 성남시 분당구갑');
  console.log('input: "경기 성남시 분당구갑"');
  expect(r.sido, '경기도', 'sido를 풀네임으로 정규화');
  // 후보군에 "성남시", "성남시분당구"(suffix 제거 형태), "분당구"가 포함되어야 함
  expect(r.sigunguCandidates.includes('성남시'), true, '"성남시" 후보 포함');
  expect(r.sigunguCandidates.includes('성남시분당구'), true, '"성남시분당구" suffix 제거 후보 포함');
  expect(r.sigunguCandidates.includes('분당구'), true, '"분당구" 후보 포함');
}

console.log('');

// 갑/을 suffix 단독
{
  const r = parseMemberDistrict('서울 강남구갑');
  console.log('input: "서울 강남구갑"');
  expect(r.sido, '서울특별시', 'sido 정규화');
  expect(r.sigunguCandidates.includes('강남구'), true, 'suffix 제거 후 "강남구"');
  expect(r.sigunguCandidates.includes('강남구갑'), true, '원본 "강남구갑"도 후보 (정확한 매칭 대비)');
}

console.log('');

// 시 단위 단독
{
  const r = parseMemberDistrict('경기 수원시갑');
  console.log('input: "경기 수원시갑"');
  expect(r.sido, '경기도', 'sido 정규화');
  expect(r.sigunguCandidates.includes('수원시'), true, '"수원시" 후보 포함');
}

console.log('');

// 시도 풀네임으로 시작하는 경우
{
  const r = parseMemberDistrict('충청북도 청주시');
  console.log('input: "충청북도 청주시"');
  expect(r.sido, '충청북도', 'sido를 그대로 유지 (이미 풀네임)');
  expect(r.sigunguCandidates.includes('청주시'), true, '"청주시" 포함');
}

console.log('');

// 빈/이상 입력
{
  const r = parseMemberDistrict('');
  console.log('input: ""');
  expect(r.sigunguCandidates, [], '빈 입력은 빈 candidates');
}

{
  const r = parseMemberDistrict('   ');
  console.log('input: "   " (whitespace only)');
  expect(r.sigunguCandidates, [], 'whitespace는 빈 candidates');
}

console.log('\n=== findMatchingSigungu ===\n');

// 광역의원 sigungu 목록 예시 (실제 backend 응답 기반)
const gyeonggiSigungu = [
  '가평군',
  '고양시덕양구',
  '고양시일산동구',
  '성남시분당구',
  '성남시수정구',
  '성남시중원구',
  '수원시팔달구',
  '용인시기흥구',
];

{
  const parsed = parseMemberDistrict('경기 성남시 분당구갑');
  const r = findMatchingSigungu(gyeonggiSigungu, parsed.sigunguCandidates);
  console.log('input: "경기 성남시 분당구갑" against gyeonggi sigungu list');
  // "성남시분당구"(suffix 제거 후 longest) 가 가장 정확하지만,
  // parseMemberDistrict는 후보군 길이 기준으로 가장 긴 것부터 시도하므로
  // "성남시분당구"(7자)가 "성남시"(3자)보다 우선
  expect(r.primary, '성남시분당구', 'primary는 가장 정확한 longest 매칭');
  expect(
    r.allMatched.sort(),
    ['성남시분당구'].sort(),
    'allMatched는 정확한 매칭 + 일반 prefix는 더 일반적인 매칭이 있으면 보강 안함',
  );
}

console.log('');

// 시 단위만 알 때 (구가 없는 케이스)
{
  const parsed = parseMemberDistrict('경기 수원시갑');
  const r = findMatchingSigungu(gyeonggiSigungu, parsed.sigunguCandidates);
  console.log('input: "경기 수원시갑" → "수원시" candidate');
  expect(r.primary, '수원시', '"수원시"가 primary');
  expect(r.allMatched.includes('수원시팔달구'), true, 'prefix 매칭으로 수원시팔달구 포함');
}

console.log('');

// 매칭 없는 케이스
{
  const parsed = parseMemberDistrict('서울 강남구갑');
  const r = findMatchingSigungu(gyeonggiSigungu, parsed.sigunguCandidates);
  console.log('input: "서울 강남구갑" against gyeonggi (no match)');
  expect(r.primary, undefined, 'primary undefined');
  expect(r.allMatched, [], 'allMatched 빈 배열');
}

console.log('\n---');
console.log(`Passed: ${passed}, Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
}
process.exit(0);
