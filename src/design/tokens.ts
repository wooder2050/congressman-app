/**
 * Design tokens for lawmake app (v1.2 UX/UI overhaul)
 *
 * 원칙:
 * - 화면별로 hex나 raw 숫자를 직접 쓰지 말고 이 토큰을 사용
 * - 변경은 여기서만 — 전체 앱에 즉시 반영
 * - tailwind.config.js와 1:1 동기화
 */

// ====== 색상 ======

export const colors = {
  // 브랜드
  primary: {
    DEFAULT: '#2563EB',
    light: 'rgba(37, 99, 235, 0.1)',
    dark: '#1D4ED8',
  },

  // 그레이스케일 (배경/텍스트)
  neutral: {
    50: '#FAFAFA', // page background
    100: '#F5F5F5', // card divider, hairline
    200: '#E5E5E5', // border default
    300: '#D4D4D4', // border emphasis
    400: '#A3A3A3', // disabled text
    500: '#737373', // secondary text
    600: '#525252', // body text secondary
    700: '#404040', // body text
    800: '#262626', // heading
    900: '#171717', // primary text
    950: '#0A0A0A',
  },

  // semantic
  success: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#15803D' },
  warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#B45309' },
  error: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#B91C1C' },
  info: { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#1D4ED8' },

  // 정당
  party: {
    democratic: '#1B56DB',
    ppp: '#E61E2B',
    rebuilding: '#003DA5',
    reform: '#F37924',
    independent: '#999999',
  },

  // 표면 (iOS HIG 영감)
  surface: {
    primary: '#FFFFFF', // 카드, 시트
    secondary: '#FAFAFA', // 페이지 배경
    tertiary: '#F5F5F5', // grouped list 섹션
    overlay: 'rgba(0, 0, 0, 0.4)', // modal backdrop
  },
} as const;

// ====== 타이포그래피 (iOS HIG 기반) ======

/**
 * Apple HIG 타이포 스케일을 한글에 맞게 약간 조정.
 * - body 17pt: iOS 표준
 * - 본문 최소 14pt 이상 권장 (한글 가독성)
 */
export const typography = {
  largeTitle: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title1: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  title2: { fontSize: 19, lineHeight: 24, fontWeight: '700' as const },
  title3: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  headline: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  callout: { fontSize: 14, lineHeight: 19, fontWeight: '400' as const },
  subhead: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  footnote: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  caption: { fontSize: 11, lineHeight: 14, fontWeight: '400' as const },
} as const;

export type TypographyVariant = keyof typeof typography;

// ====== 간격 (4의 배수) ======

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16, // 기본 화면 padding
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// ====== 모서리 ======

/**
 * iOS는 카드 12 이하 권장.
 * 큰 시트나 모달은 16~24.
 */
export const radius = {
  none: 0,
  sm: 6,
  md: 10, // 기본 버튼·badge
  lg: 12, // 기본 카드
  xl: 16,
  xxl: 20,
  full: 9999,
} as const;

// ====== 그림자 (iOS는 hairline border + subtle shadow 권장) ======

export const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  // 정적 카드 (기본)
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  // 살짝 떠있는 sheet, 시트형 popup
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

// ====== 터치 타겟 (Apple HIG 최소 44pt) ======

export const touchTarget = {
  min: 44,
} as const;

// ====== 애니메이션 ======

export const motion = {
  duration: { fast: 150, normal: 250, slow: 400 },
} as const;
