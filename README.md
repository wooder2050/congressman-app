# lawmake 앱

제22대 대한민국 국회 의정활동을 한눈에 볼 수 있는 모바일 앱입니다.

웹 버전: [lawmake.kr](https://lawmake.kr)

## 주요 기능

- **홈** — 의원 수, 발의 법안, 표결 수, 평균 출석률 등 국회 현황 대시보드
- **의원** — 300명 의원 검색, 정당별 필터, 개별 의원 상세(출석, 발의 법안, 표결 기록)
- **법안** — 발의 법안 목록, 상태별 필터, AI 요약, 심사 경과
- **표결** — 본회의 표결 현황, 의원별 투표 결과
- **주간뉴스** — 매주 국회 핵심 소식 정리 (주요 법안, 하이라이트, 분석)
- **위원회** — 17개 상임위원회 현황, 회의록
- **일정** — 본회의·위원회 일정
- **의원 비교** — 최대 4명 의원 비교

## 기술 스택

- **Framework**: [Expo](https://expo.dev) (SDK 55) + [React Native](https://reactnative.dev) 0.83
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (파일 기반 라우팅)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query)
- **Language**: TypeScript
- **Backend API**: [api.lawmake.kr](https://api.lawmake.kr)

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm

### 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
```

### 실행

```bash
# Expo 개발 서버 시작
npx expo start

# 웹으로 실행
npx expo start --web

# Development Build (실제 기기)
npx expo start --dev-client
```

## 프로젝트 구조

```
app/
├── (tabs)/              # 탭 네비게이션
│   ├── index.tsx        # 홈
│   ├── members.tsx      # 의원 목록
│   ├── bills.tsx        # 법안 목록
│   ├── votes.tsx        # 표결 목록
│   └── more.tsx         # 더보기
├── members/[id]/        # 의원 상세
├── bills/[id].tsx       # 법안 상세
├── votes/[id].tsx       # 표결 상세
├── weekly/              # 주간뉴스
│   ├── index.tsx        # 목록
│   └── [id]/
│       ├── index.tsx    # 주간 요약
│       └── [slug].tsx   # 개별 기사
├── committees/          # 위원회
├── schedule.tsx         # 일정
├── compare.tsx          # 의원 비교
└── ...
src/
├── api/                 # API 클라이언트
├── components/          # 공통 컴포넌트
├── config/              # 환경변수 설정
├── constants/           # 상수 (정당, 매핑 등)
├── data/weekly/         # 주간뉴스 정적 데이터
├── hooks/               # 커스텀 훅
├── lib/                 # 유틸리티
└── types/               # TypeScript 타입 정의
```

## 스크립트

```bash
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷팅
npm run format:check  # 포맷팅 검사
npm run typecheck     # TypeScript 타입 체크
```

## 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `EXPO_PUBLIC_API_BASE_URL` | 백엔드 API URL | `https://api.lawmake.kr` |

## 빌드

```bash
# iOS 개발 빌드
npx eas build --profile development --platform ios

# Android 개발 빌드
npx eas build --profile development --platform android
```
