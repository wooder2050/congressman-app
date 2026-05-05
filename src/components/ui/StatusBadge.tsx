import { Text, View } from 'react-native';

export type StatusTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  /** 텍스트 크기 (default: caption 11pt) */
  size?: 'sm' | 'md';
  className?: string;
};

const toneStyles: Record<StatusTone, { bg: string; text: string }> = {
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-700' },
  primary: { bg: 'bg-primary-light', text: 'text-primary-dark' },
  success: { bg: 'bg-success-light', text: 'text-success-dark' },
  warning: { bg: 'bg-warning-light', text: 'text-warning-dark' },
  error: { bg: 'bg-error-light', text: 'text-error-dark' },
  info: { bg: 'bg-info-light', text: 'text-info-dark' },
};

/**
 * 의미 있는 상태를 표현하는 배지.
 * - 가결/통과: success
 * - 폐기/부결: error
 * - 계류/대기: warning
 * - 기본 분류: neutral
 *
 * 일반 분류용 라벨은 Badge.tsx 사용.
 */
export function StatusBadge({ label, tone = 'neutral', size = 'sm', className }: StatusBadgeProps) {
  const styles = toneStyles[tone];
  const sizeClass = size === 'md' ? 'px-lawmake-md py-1' : 'px-lawmake-sm py-0.5';
  const textClass = size === 'md' ? 'text-lawmake-footnote' : 'text-lawmake-caption';

  return (
    <View className={`self-start rounded-lawmake-md ${styles.bg} ${sizeClass} ${className ?? ''}`}>
      <Text className={`font-semibold ${styles.text} ${textClass}`}>{label}</Text>
    </View>
  );
}
