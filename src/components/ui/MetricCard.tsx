import { Text, View } from 'react-native';

type MetricCardProps = {
  /** 메트릭 라벨 (예: "총 의원") */
  label: string;
  /** 큰 숫자/값 */
  value: string | number;
  /** 부가 정보 (단위, 변화량 등) */
  hint?: string;
  /** 아이콘 (좌상단, 선택) */
  icon?: React.ReactNode;
  /** 강조색 (label/icon 색) */
  accentColor?: string;
  className?: string;
};

/**
 * 큰 숫자를 강조하는 메트릭 카드.
 * - 라벨: caption (11pt, neutral-500)
 * - 값: title1 (22pt, bold) — Toss/금융 앱 패턴 차용
 * - hint: footnote (12pt)
 *
 * 홈 화면 통계 그리드에서 사용.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon,
  accentColor = '#737373',
  className,
}: MetricCardProps) {
  return (
    <View
      className={`rounded-lawmake-lg border border-neutral-100 bg-surface-primary p-lawmake-lg ${className ?? ''}`}
    >
      <View className="flex-row items-center gap-lawmake-sm">
        {icon}
        <Text
          className="text-lawmake-caption font-medium uppercase tracking-wide"
          style={{ color: accentColor }}
        >
          {label}
        </Text>
      </View>
      <Text className="mt-lawmake-sm text-lawmake-title1 text-neutral-900">{value}</Text>
      {hint && (
        <Text className="mt-lawmake-xs text-lawmake-footnote text-neutral-500">{hint}</Text>
      )}
    </View>
  );
}
