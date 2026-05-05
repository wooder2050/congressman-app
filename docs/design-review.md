# Design Review Checklist (v1.2 UX/UI Overhaul)

이 문서는 v1.2 UX/UI 개편 PR들이 만족해야 할 **공통 디자인 기준**입니다.
모든 화면 PR은 머지 전 이 체크리스트를 통과해야 하고, codex AI 디자인 리뷰도
이 기준으로 진행합니다.

> 톤: **신문사 editorial이 아닌 데이터 리서치 앱.**
> 흰 배경, 낮은 채도, 강한 hierarchy, 큰 제목, 명확한 리스트, 필요한 곳에만 색상.

---

## 1. Layout & Hierarchy

- [ ] 화면 진입 시 사용자가 가장 먼저 봐야 할 정보가 가장 큰 폰트로 표시
- [ ] 한 화면에 카드를 3단계 이상 중첩하지 않음 (Card 안의 Card 안의 Card 금지)
- [ ] 정보 밀도 — 한 화면당 핵심 액션 1개를 명확히 분간 가능
- [ ] iOS Large Title 패턴 — 메인 화면(홈, 의원, 법안 등)은 헤더 large title 사용

## 2. Typography

- [ ] 모든 텍스트는 `tokens.ts`의 typography 변형 또는 그에 매핑된 NativeWind class 사용
- [ ] **본문 최소 14pt** (callout, 한글 가독성 기준)
- [ ] caption (11pt)은 메타데이터·날짜·라벨에만
- [ ] 화면 타이틀은 `largeTitle (28)` 또는 `title1 (22)`
- [ ] 섹션 타이틀은 `title2 (19)` (Section.tsx 사용)
- [ ] `text-[10px]`, `text-xs`, `text-[11px]` 등 ad-hoc 사이즈 금지

## 3. Color

- [ ] hex 값을 직접 쓰지 않고 `tokens.ts` 또는 NativeWind class 사용
- [ ] 브랜드 색상 (primary)은 **강조에만** 사용 (전체 칠하기 금지)
- [ ] semantic 색상 명확:
  - 가결/성공/통과: `success`
  - 폐기/부결/위험: `error`
  - 계류/대기/주의: `warning`
  - 정보/안내: `info` 또는 `primary`
- [ ] 정당 색상은 `party.{democratic|ppp|...}` 사용, 절대 hex 직접 X
- [ ] 다크모드는 v1.2 범위 밖 (v1.3 이후)

## 4. Spacing & Radius

- [ ] 모든 padding/margin은 4의 배수 (`spacing` 토큰만 사용)
- [ ] 화면 좌우 padding은 기본 `lawmake-lg` (16px)
- [ ] 카드 padding 기본 `lawmake-lg`
- [ ] 카드 radius 기본 `lawmake-lg` (12px), 시트나 큰 모달만 `xl` 이상
- [ ] 버튼/배지 radius `lawmake-md` (10px)

## 5. Touch & Interaction

- [ ] 모든 터치 가능 요소는 **최소 44pt** 높이/너비
- [ ] `Pressable`은 `active:` 상태 명시 (시각적 피드백)
- [ ] 작은 터치 영역(아이콘만 있는 버튼)은 `hitSlop={8}` 또는 `padding`으로 영역 확장
- [ ] 사용자가 진행 상태 인지 가능 (스피너, disabled 상태)

## 6. Components

- [ ] 새 화면은 `Screen` wrapper 사용 (safe area 자동 처리)
- [ ] 헤더는 `Header` 컴포넌트 사용 (largeTitle 가능)
- [ ] 섹션은 `Section` 컴포넌트 사용 (title + 더보기)
- [ ] 리스트는 `ListRow` 사용 또는 `Card` + 내부 row 패턴
- [ ] 통계 표시는 `MetricCard` (아이콘 + 라벨 + 큰 숫자)
- [ ] 상태 표시는 `StatusBadge` (semantic tone)
- [ ] 일반 분류 라벨은 `Badge` (단순 텍스트)
- [ ] 탭 전환은 `SegmentedControl` (3개 이하) 또는 `FilterChip` (4개 이상)

## 7. States

- [ ] **Loading** — 스피너 또는 skeleton (LoadingSpinner 사용)
- [ ] **Empty** — EmptyState 사용 (왜 비었는지 + 다음 액션 안내)
- [ ] **Error** — ErrorState 사용 (재시도 버튼)
- [ ] 인증 필요 화면은 비로그인 시 친절한 안내 + 로그인 진입

## 8. Lists

- [ ] FlatList 사용 (성능, RN 권장)
- [ ] 항목 사이 구분선은 `border-b border-neutral-100` 또는 자연스러운 spacing
- [ ] 항목별 무거운 prefetch 금지 (예: 즐겨찾기 목록에서 100개 의원을 모두 한 번에 fetch X — paginate)
- [ ] 빈 목록은 EmptyState

## 9. Forms

- [ ] 인풋은 SearchInput 또는 표준 컴포넌트 (label + helper text + error)
- [ ] 키보드 dismiss 자동 (`keyboardShouldPersistTaps`)
- [ ] iOS는 `returnKeyType` 명시 (search/done/next 등)

## 10. Accessibility (기본)

- [ ] Pressable에 `accessibilityLabel` (lucide 아이콘만 있는 버튼 등)
- [ ] 색상에만 의존한 정보 전달 금지 (텍스트 라벨 병행)
- [ ] Dynamic Type — 본문 텍스트는 가능한 시스템 사이즈에 반응하도록
- [ ] 충분한 명도 대비 (WCAG AA, 본문 4.5:1 이상)

---

## Codex 리뷰 요청 형식 (PR마다)

PR description에 다음을 포함:

```markdown
## Design Review

### Before
[기존 화면 스크린샷]

### After
[새 화면 스크린샷]

### Checklist
- [x] Layout & Hierarchy
- [x] Typography
- ... (모든 10개 카테고리)

### 트레이드오프
- (있다면 작성)
```

이후 codex(gpt-5.5)에게 `design-review.md`와 PR을 함께 주고 리뷰 의뢰.

---

## 변경 절차

이 문서는 PR로만 수정. v1.2 진행 도중 추가 기준이 필요하면 별도 PR로 추가하고
이후 PR들에 반영.
