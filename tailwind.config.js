/** @type {import('tailwindcss').Config} */
// 디자인 토큰은 src/design/tokens.ts와 1:1 동기화. 변경은 양쪽 모두.
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: 'rgba(37, 99, 235, 0.1)',
          dark: '#1D4ED8',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0A0A0A',
        },
        success: { DEFAULT: '#16A34A', light: '#DCFCE7', dark: '#15803D' },
        warning: { DEFAULT: '#F59E0B', light: '#FEF3C7', dark: '#B45309' },
        error: { DEFAULT: '#EF4444', light: '#FEE2E2', dark: '#B91C1C' },
        info: { DEFAULT: '#3B82F6', light: '#DBEAFE', dark: '#1D4ED8' },
        party: {
          democratic: '#1B56DB',
          ppp: '#E61E2B',
          rebuilding: '#003DA5',
          reform: '#F37924',
          independent: '#999999',
        },
        surface: {
          primary: '#FFFFFF',
          secondary: '#FAFAFA',
          tertiary: '#F5F5F5',
        },
      },
      fontFamily: {
        inter: ['Inter'],
      },
      // 타이포 사이즈 — tokens.ts와 동일
      fontSize: {
        // v1.3 PR2: 한글 가독성 향상 — body 15→17, footnote 12→14, caption 11→12
        // PR3: 한글 본문 line-height 1.5x로 확장
        'lawmake-large': ['28px', { lineHeight: '36px', fontWeight: '700' }],
        'lawmake-title1': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'lawmake-title2': ['20px', { lineHeight: '28px', fontWeight: '700' }],
        'lawmake-title3': ['18px', { lineHeight: '26px', fontWeight: '600' }],
        'lawmake-headline': ['17px', { lineHeight: '26px', fontWeight: '600' }],
        'lawmake-body': ['17px', { lineHeight: '28px', fontWeight: '400' }],
        'lawmake-callout': ['16px', { lineHeight: '25px', fontWeight: '400' }],
        'lawmake-subhead': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        'lawmake-footnote': ['14px', { lineHeight: '21px', fontWeight: '400' }],
        'lawmake-caption': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      // 간격 — tokens.ts spacing과 동일
      spacing: {
        'lawmake-xs': '4px',
        'lawmake-sm': '8px',
        'lawmake-md': '12px',
        'lawmake-lg': '16px',
        'lawmake-xl': '20px',
        'lawmake-xxl': '24px',
        'lawmake-xxxl': '32px',
      },
      // radius — tokens.ts와 동일
      borderRadius: {
        'lawmake-sm': '6px',
        'lawmake-md': '10px',
        'lawmake-lg': '12px',
        'lawmake-xl': '16px',
        'lawmake-xxl': '20px',
      },
    },
  },
  plugins: [],
};
